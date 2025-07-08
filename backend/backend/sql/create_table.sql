-- reset

DROP TABLE IF EXISTS users;

-- Creează tabelul pentru utilizatori
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Vezi toate tabelele
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Vezi structura tabelului users
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users';

SELECT * FROM users;

-- Remove a user by ID
DELETE FROM users WHERE id = 2;