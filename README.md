# Personal JWT Authentication Microservice

A reusable, lightweight authentication microservice built with Node.js, Express, and PostgreSQL. It uses a hybrid JWT architecture (stateless Access Tokens and stateful Refresh Tokens in the database) with OTP email verification.

## 🚀 Features

- **Robust Security:** Password hashing using `bcryptjs` and request validation via `zod`.
- **Email Verification (OTP):** Generates and sends a 6-digit verification code using `nodemailer` (Gmail SMTP) on sign-up.
- **Hybrid JWT Flow:**
  - **Access Token:** Stateless, short-lived (15 minutes) for fast verification.
  - **Refresh Token:** Stateful, long-lived (7 days) saved in PostgreSQL to support session rotation.
- **Stateful Logout:** Instantly revokes session tokens in the database on logout.
- **Project Integration:** Ready-to-use authentication middleware to secure your other microservices locally.

---

## 🛠️ Database Setup (PostgreSQL)

Run the following DDL queries to create the required tables:

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- OTP Codes Table
CREATE TABLE otps (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Active Sessions Table
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ⚙️ Environment Variables (`.env`)

Create a `.env` file in the root directory:

```env
PORT=3000

# Database Config
DB_NAME=auth-service
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_db_password

# JWT Secrets
ACCESS_TOKEN_SECRET=your_jwt_access_secret
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret

# Email Config (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

---

## 📡 API Endpoints

### 1. Register User
* **URL:** `POST /auth/register`
* **Body:**
  ```json
  {
    "username": "tester",
    "email": "test@example.com",
    "password": "securepassword123"
  }
  ```
* **Description:** Creates a user in a `PENDING` state and sends a 6-digit OTP code to their email.

### 2. Verify Email (OTP)
* **URL:** `POST /auth/verify`
* **Body:**
  ```json
  {
    "userId": "YOUR-USER-UUID-HERE",
    "otp": "123456"
  }
  ```
* **Description:** Verifies the OTP code. If correct and active, updates user status to `ACTIVE` and deletes the OTP code.

### 3. Login
* **URL:** `POST /auth/login`
* **Body:**
  ```json
  {
    "email": "test@example.com",
    "password": "securepassword123"
  }
  ```
* **Response:** Returns `accessToken`, `refreshToken`, and user metadata.

### 4. Refresh Token
* **URL:** `POST /auth/refresh`
* **Body:**
  ```json
  {
    "refreshToken": "YOUR-REFRESH-TOKEN-HERE"
  }
  ```
* **Response:** Returns a brand new `accessToken` if the refresh token is valid and active in the database.

### 5. Logout (Protected)
* **URL:** `POST /auth/logout`
* **Headers:** `Authorization: Bearer <access_token>`
* **Body:**
  ```json
  {
    "refreshToken": "YOUR-REFRESH-TOKEN-HERE"
  }
  ```
* **Description:** Deletes the refresh token from the database, preventing future token rotations, and marks the user's status as `OFFLINE`.

### 6. Get Logged-In User Profile (Protected)
* **URL:** `GET /auth/me`
* **Headers:** `Authorization: Bearer <access_token>`
* **Response:** Returns the authenticated user's ID and username.

