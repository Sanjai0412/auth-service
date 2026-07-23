
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE otps (
	id SERIAL PRIMARY KEY,
	user_id UUID REFERENCES users(id) ON DELETE CASCADE,
	code VARCHAR(6) NOT NULL,
	expires_at TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Search users by username
CREATE INDEX idx_users_username
ON users(username);

-- Fast OTP lookup by user
CREATE INDEX idx_otps_user_id
ON otps(user_id);

-- Fast refresh token lookup by user
CREATE INDEX idx_refresh_tokens_user_id
ON refresh_tokens(user_id);