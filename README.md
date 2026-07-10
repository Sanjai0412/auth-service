# Personal JWT Authentication Microservice

A reusable, lightweight authentication microservice built with Node.js, Express, and PostgreSQL. It uses a hybrid JWT architecture with **short-lived Access Tokens and long-lived Refresh Tokens stored as secure HttpOnly cookies**. Email verification is implemented using OTP.

## Diagram

React Client
│
│ HttpOnly Cookies
▼
Auth Service (Node.js)
│
├── PostgreSQL
└── JWT
│
▼
Protected Backend Services

## 🚀 Features

- **Robust Security:** Password hashing using `bcryptjs` and request validation using `zod`.
- **Email Verification (OTP):** Sends a 6-digit verification code using `nodemailer` (Gmail SMTP) during registration.
- **Secure Cookie-Based Authentication:**
  - **Access Token:** Short-lived (15 minutes) JWT stored in an **HttpOnly cookie**.
  - **Refresh Token:** Long-lived (7 days) JWT stored in an **HttpOnly cookie** and persisted in PostgreSQL for session management.

- **Automatic Token Refresh:** Clients can obtain a new access token without exposing JWTs to JavaScript.
- **Stateful Logout:** Revokes the refresh token from the database and clears authentication cookies.
- **Cross-Service Authentication:** Can be integrated with other backend services that validate the access token.

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

-- Refresh Tokens Table
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

Create a `.env` file in the project root:

```env
PORT=3000

# Database
DB_NAME=auth-service
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_db_password

# JWT Secrets
ACCESS_TOKEN_SECRET=your_jwt_access_secret
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret

# Email (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Cookie Configuration
# Set to "production" in production (HTTPS), "development" for local development
SECURE_COOKIE=false
```

**Cookie Configuration**

The `NODE_ENV` environment variable controls the `secure` attribute of authentication cookies.

- `NODE_ENV=development` — Use for local development over HTTP.
- `NODE_ENV=production` — Use in production over HTTPS. Cookies will only be sent over secure connections.

Example:

```javascript
res.cookie("accessToken", accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
});

res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
});
```

---

## 📡 API Endpoints

### 1. Register User

**POST** `/auth/register`

**Request Body**

```json
{
  "username": "tester",
  "email": "test@example.com",
  "password": "securepassword123"
}
```

**Description**

Creates a user with `PENDING` status and sends a 6-digit OTP to the registered email.

---

### 2. Verify Email

**POST** `/auth/verify`

**Request Body**

```json
{
  "userId": "YOUR-USER-UUID",
  "otp": "123456"
}
```

**Description**

Verifies the OTP and activates the user account.

---

### 3. Login

**POST** `/auth/login`

**Request Body**

```json
{
  "email": "test@example.com",
  "password": "securepassword123"
}
```

**Response**

- Returns authenticated user information.
- Sets the following **HttpOnly cookies**:
  - `accessToken`
  - `refreshToken`

> No JWT tokens are returned in the response body.

---

### 4. Refresh Access Token

**POST** `/auth/refresh`

**Description**

Uses the **refreshToken HttpOnly cookie** to generate a new access token.

**Response**

- Issues a new `accessToken` HttpOnly cookie.
- Returns a success response.

> No request body is required.

---

### 5. Logout (Protected)

**POST** `/auth/logout`

**Description**

- Authenticates the user using the `accessToken` cookie.
- Removes the refresh token from the database.
- Clears both authentication cookies.
- Marks the user's status as `OFFLINE`.

> No request body is required.

---

### 6. Get Current User (Protected)

**GET** `/auth/me`

**Description**

Authenticates the user using the `accessToken` HttpOnly cookie and returns the authenticated user's information.

**Response**

```json
{
  "success": true,
  "user": {
    "userId": "...",
    "username": "tester"
  }
}
```

---

## 🔐 Authentication Flow

1. The user logs in with their email and password.
2. The server validates the credentials.
3. Upon successful authentication, the server:
   - Issues an `accessToken` (15-minute expiry) as an **HttpOnly cookie**.
   - Issues a `refreshToken` (7-day expiry) as an **HttpOnly cookie** and stores it in PostgreSQL.

4. The client accesses protected endpoints using the `accessToken` cookie, which is automatically included by the browser.
5. If the `accessToken` expires, the client sends a request to `/auth/refresh`.
6. The server validates the `refreshToken` from the **HttpOnly cookie** against the database. If valid, it issues a new `accessToken` cookie.
7. The client automatically retries the original request using the newly issued `accessToken`.
8. On logout, the server revokes the refresh token from the database and clears both authentication cookies.

## 🌐 Frontend Integration

When using Axios, enable credentials so the browser can send and receive HttpOnly cookies.

```javascript
const apiClient = axios.create({
  baseURL: "http://localhost:3000/auth",
  withCredentials: true,
});
```

For cross-origin requests, ensure your backend enables CORS with `credentials: true`.
