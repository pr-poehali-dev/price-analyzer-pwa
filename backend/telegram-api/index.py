"""
API для работы с Telegram Mini App
Управление пользователями, расходами и сравнениями товаров
"""
import json
import os
from datetime import datetime
from decimal import Decimal
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Создание подключения к базе данных"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def decimal_default(obj):
    """Сериализация Decimal для JSON"""
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError

def handler(event: dict, context) -> dict:
    """API endpoint для Telegram Mini App"""
    method = event.get('httpMethod', 'GET')
    
    # CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Telegram-User'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        # Получаем данные пользователя из заголовка
        telegram_user_header = event.get('headers', {}).get('X-Telegram-User', '{}')
        telegram_user = json.loads(telegram_user_header)
        telegram_id = telegram_user.get('id')
        
        if not telegram_id:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unauthorized: Telegram user not found'}),
                'isBase64Encoded': False
            }
        
        path = event.get('pathParams', {}).get('proxy', '')
        
        # Роутинг
        if path == 'user/init':
            return init_user(telegram_user, method)
        elif path == 'expenses':
            return handle_expenses(telegram_id, method, event)
        elif path.startswith('expenses/'):
            expense_id = path.split('/')[-1]
            return handle_expense_delete(telegram_id, expense_id, method)
        elif path == 'comparisons':
            return handle_comparisons(telegram_id, method, event)
        elif path.startswith('comparisons/'):
            comparison_id = path.split('/')[-1]
            return handle_comparison_delete(telegram_id, comparison_id, method)
        else:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Not found'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def init_user(telegram_user: dict, method: str) -> dict:
    """Инициализация или обновление пользователя"""
    if method != 'POST':
        return {'statusCode': 405, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Method not allowed'}), 'isBase64Encoded': False}
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                INSERT INTO users (telegram_id, username, first_name, last_name)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (telegram_id) 
                DO UPDATE SET 
                    username = EXCLUDED.username,
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING id, telegram_id, username, first_name, last_name, created_at
            """, (
                telegram_user.get('id'),
                telegram_user.get('username'),
                telegram_user.get('first_name'),
                telegram_user.get('last_name')
            ))
            user = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(user), default=decimal_default),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def handle_expenses(telegram_id: int, method: str, event: dict) -> dict:
    """Управление расходами"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Получаем user_id по telegram_id
            cur.execute("SELECT id FROM users WHERE telegram_id = %s", (telegram_id,))
            user = cur.fetchone()
            if not user:
                return {'statusCode': 404, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'User not found'})}
            
            user_id = user['id']
            
            if method == 'GET':
                cur.execute("""
                    SELECT id, amount, category, description, date, created_at
                    FROM expenses
                    WHERE user_uuid = %s
                    ORDER BY date DESC
                """, (user_id,))
                expenses = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(e) for e in expenses], default=decimal_default),
                    'isBase64Encoded': False
                }
            
            elif method == 'POST':
                data = json.loads(event.get('body', '{}'))
                cur.execute("""
                    INSERT INTO expenses (user_uuid, amount, category, description, date)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id, amount, category, description, date, created_at
                """, (
                    user_id,
                    data['amount'],
                    data['category'],
                    data.get('description', ''),
                    data.get('date', datetime.now())
                ))
                expense = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(expense), default=decimal_default),
                    'isBase64Encoded': False
                }
            
            else:
                return {'statusCode': 405, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Method not allowed'})}
    finally:
        conn.close()

def handle_expense_delete(telegram_id: int, expense_id: str, method: str) -> dict:
    """Удаление расхода"""
    if method != 'DELETE':
        return {'statusCode': 405, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Method not allowed'}), 'isBase64Encoded': False}
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE telegram_id = %s", (telegram_id,))
            user = cur.fetchone()
            if not user:
                return {'statusCode': 404, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'User not found'}), 'isBase64Encoded': False}
            
            user_id = user[0]
            
            cur.execute("DELETE FROM expenses WHERE id = %s AND user_uuid = %s", (expense_id, user_id))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def handle_comparisons(telegram_id: int, method: str, event: dict) -> dict:
    """Управление сравнениями товаров"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id FROM users WHERE telegram_id = %s", (telegram_id,))
            user = cur.fetchone()
            if not user:
                return {'statusCode': 404, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'User not found'}), 'isBase64Encoded': False}
            
            user_id = user['id']
            
            if method == 'GET':
                cur.execute("""
                    SELECT id, name_x, price_x, weight_x, name_y, price_y, weight_y,
                           price_per_gram_x, price_per_gram_y, better_option, 
                           savings_percent, date, created_at
                    FROM comparisons
                    WHERE user_id = %s
                    ORDER BY date DESC
                """, (user_id,))
                comparisons = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(c) for c in comparisons], default=decimal_default),
                    'isBase64Encoded': False
                }
            
            elif method == 'POST':
                data = json.loads(event.get('body', '{}'))
                cur.execute("""
                    INSERT INTO comparisons (
                        user_id, name_x, price_x, weight_x, name_y, price_y, weight_y,
                        price_per_gram_x, price_per_gram_y, better_option, savings_percent, date
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id, name_x, price_x, weight_x, name_y, price_y, weight_y,
                              price_per_gram_x, price_per_gram_y, better_option, 
                              savings_percent, date, created_at
                """, (
                    user_id,
                    data.get('nameX', 'Товар X'),
                    data['priceX'],
                    data['weightX'],
                    data.get('nameY', 'Товар Y'),
                    data['priceY'],
                    data['weightY'],
                    data['pricePerGramX'],
                    data['pricePerGramY'],
                    data['betterOption'],
                    data['savingsPercent'],
                    data.get('date', datetime.now())
                ))
                comparison = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(comparison), default=decimal_default),
                    'isBase64Encoded': False
                }
            
            else:
                return {'statusCode': 405, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Method not allowed'}), 'isBase64Encoded': False}
    finally:
        conn.close()

def handle_comparison_delete(telegram_id: int, comparison_id: str, method: str) -> dict:
    """Удаление сравнения"""
    if method != 'DELETE':
        return {'statusCode': 405, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Method not allowed'}), 'isBase64Encoded': False}
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE telegram_id = %s", (telegram_id,))
            user = cur.fetchone()
            if not user:
                return {'statusCode': 404, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'User not found'}), 'isBase64Encoded': False}
            
            user_id = user[0]
            
            cur.execute("DELETE FROM comparisons WHERE id = %s AND user_id = %s", (comparison_id, user_id))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
    finally:
        conn.close()