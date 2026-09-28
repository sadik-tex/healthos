# HealthOS frontend

    npm install
    npm run dev      # http://localhost:5173

Backend must run at the URL in `.env` (`VITE_API_URL=http://localhost:8000/api`).

## IMPORTANT: verify the API mapping
I could not read the backend source, so endpoint paths and field names are ASSUMED.
Compare `src/api/client.js` (`ENDPOINTS`, `LOGIN_AS_FORM`, `normalize*`) with http://localhost:8000/docs
and edit ONLY that file. Nothing else in the app calls the backend.

Assumed: POST /auth/signup, POST /auth/login (JSON {email,password} -> access_token), GET/PUT /users/me,
GET /dashboard, GET /reports, POST /reports/upload (multipart field "file"), GET /reports/{id},
GET /reports/{id}/file, POST /chat {message, report_id}.
