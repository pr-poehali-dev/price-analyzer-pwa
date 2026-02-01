-- Таблица для хранения расходов пользователей
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска расходов по пользователю
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);

-- Индекс для сортировки по дате
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);

-- Индекс для фильтрации по категории
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);