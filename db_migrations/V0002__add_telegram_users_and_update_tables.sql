-- Таблица пользователей Telegram
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска по telegram_id
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);

-- Таблица сравнений товаров
CREATE TABLE IF NOT EXISTS comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    name_x VARCHAR(255),
    price_x DECIMAL(10, 2) NOT NULL,
    weight_x DECIMAL(10, 2) NOT NULL,
    name_y VARCHAR(255),
    price_y DECIMAL(10, 2) NOT NULL,
    weight_y DECIMAL(10, 2) NOT NULL,
    price_per_gram_x DECIMAL(10, 4) NOT NULL,
    price_per_gram_y DECIMAL(10, 4) NOT NULL,
    better_option VARCHAR(1) NOT NULL CHECK (better_option IN ('X', 'Y')),
    savings_percent DECIMAL(5, 2) NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для сравнений
CREATE INDEX IF NOT EXISTS idx_comparisons_user_id ON comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_comparisons_date ON comparisons(date DESC);

-- Добавляем новую колонку user_uuid для связи с таблицей users
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS user_uuid UUID REFERENCES users(id);

-- Создаем индекс для связи расходов с пользователями
CREATE INDEX IF NOT EXISTS idx_expenses_user_uuid ON expenses(user_uuid);