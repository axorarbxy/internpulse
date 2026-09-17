# Smart Internship Management System — Module 1

Complete PostgreSQL + Node.js/Express backend for Module 1.

Features: registration/login, bcrypt password hashing, JWT authentication, RBAC, student/company/institution profiles, internship CRUD, applications and status lifecycle, certificates and verification.

## Setup
1. Create database `smart_internship` in PostgreSQL/pgAdmin.
2. Run `database/schema.sql` inside that database.
3. In `backend`, copy `.env.example` to `.env` and enter your PostgreSQL password and a JWT secret.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open `http://localhost:5000`.

## Auth
POST `/api/auth/register`
```json
{"name":"Test Student","email":"student@test.com","password":"123456","role":"STUDENT"}
```
POST `/api/auth/login`
```json
{"email":"student@test.com","password":"123456"}
```
Use returned token as `Authorization: Bearer <token>` for protected APIs.

## Main APIs
- Profiles: `/api/students/profile`, `/api/companies/profile`, `/api/institutions/profile`
- Internships: `/api/internships`
- Applications: `/api/applications`
- Certificates: `/api/certificates`
