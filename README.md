# OpenSchool - Fee Management System

## Quick Start (Local Development with WAMP)

### 1. Database Setup
```sql
-- Open phpMyAdmin or MySQL CLI and run:
SOURCE c:/wamp64/www/openschool/database/schema.sql;
```

### 2. Configure Backend
Edit `api/config/database.php`:
- Set `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`
- Set `APP_URL` to your domain
- **Change `JWT_SECRET`** to a random string (use `bin2hex(random_bytes(32))`)

### 3. Install Frontend Dependencies & Build
```bash
cd c:/wamp64/www/openschool/frontend
npm install
npm run build    # outputs to ../public/
```

### 4. Access the App
- Admin: `http://localhost/openschool/login`
- Default credentials: `admin@openschool.local` / `password`
- Parent QR scan: `http://localhost/openschool/s/{qr_token}`

---

## Shared Hosting Deployment

### Structure on Server
```
public_html/
├── .htaccess          (root rewrite)
├── api/               (PHP backend)
│   ├── .htaccess
│   ├── index.php
│   ├── config/
│   ├── controllers/
│   └── core/
├── uploads/           (student photos, bank slips)
│   ├── photos/
│   └── slips/
├── public/            (built React app)
│   ├── .htaccess
│   ├── index.html
│   └── assets/
└── database/
    └── schema.sql
```

### Steps
1. Build frontend locally: `cd frontend && npm run build`
2. Upload everything EXCEPT `frontend/node_modules/` to your host
3. Import `database/schema.sql` via phpMyAdmin
4. Update `api/config/database.php` with production credentials
5. Ensure `uploads/` is writable: `chmod 755 uploads/`
6. Enable `mod_rewrite` on Apache

### URL Configuration
If deploying to root domain (not `/openschool/`), update:
- `frontend/vite.config.js`: change `base: '/'`
- `frontend/src/main.jsx`: change `basename="/"`
- `frontend/src/api.js`: change `API_BASE`

---

## Folder Structure
```
openschool/
├── api/                    # PHP Backend
│   ├── config/
│   │   └── database.php    # DB config + JWT secret
│   ├── controllers/
│   │   ├── AuthController.php
│   │   ├── StudentController.php
│   │   ├── PaymentController.php
│   │   ├── FeeStructureController.php
│   │   ├── ReportController.php
│   │   └── GraceController.php
│   ├── core/
│   │   ├── Auth.php        # JWT authentication
│   │   ├── Database.php    # PDO singleton
│   │   ├── Router.php      # Simple router
│   │   └── helpers.php     # Response, upload, UUID
│   ├── index.php           # API entry point
│   └── .htaccess
├── frontend/               # React source (dev only)
│   ├── src/
│   │   ├── components/Layout.jsx
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Students.jsx
│   │   │   ├── StudentDetail.jsx  # QR code + payments
│   │   │   ├── StudentForm.jsx
│   │   │   ├── Payments.jsx
│   │   │   ├── FeeStructures.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── PublicProfile.jsx  # Parent QR scan view
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── public/                 # Built frontend (served by Apache)
├── uploads/                # User uploads
├── database/
│   └── schema.sql
└── .htaccess
```

---

## API Endpoints

### Auth
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Current admin info

### Students (Auth required)
- `GET /api/students` - List (search, filter, paginate)
- `POST /api/students` - Create (multipart for photo)
- `GET /api/students/{id}` - Get one
- `PUT /api/students/{id}` - Update
- `DELETE /api/students/{id}` - Delete
- `GET /api/students/grades` - Distinct grades

### Public (No auth)
- `GET /api/public/student/{qr_token}` - Student profile + fees

### Payments (Auth required)
- `GET /api/payments` - All payments
- `POST /api/payments` - Record payment
- `GET /api/payments/student/{id}` - Student fee summary

### Fee Structure (Auth required)
- `GET /api/fees` - List
- `POST /api/fees` - Create/update

### Grace Periods (Auth required)
- `POST /api/grace` - Set grace period

### Reports (Auth required)
- `GET /api/reports/dashboard` - Dashboard stats
- `GET /api/reports/paid-unpaid?fee_type=quarter_1` - Paid vs unpaid

### Biometric (Placeholder)
- `POST /api/biometric/enroll`
- `GET /api/biometric/verify/{card_uid}`

---

## QR Code System

- Each student gets a **UUID token** (`qr_token`) on creation
- Token is permanent — never changes even when data is updated
- QR encodes URL: `https://yourdomain.com/openschool/s/{qr_token}`
- Scanning opens the public profile with real-time fee data
- Print QR from the student detail page for PVC cards

---

## Security

- JWT auth with HMAC-SHA256 signatures
- Prepared statements (PDO) — no SQL injection
- Input sanitization (htmlspecialchars + strip_tags)
- File upload validation (type + size limits)
- UUID tokens in QR URLs (no sequential IDs)
- CORS headers for API
- Password hashing with bcrypt

---

## Future Improvements

1. **SMS Notifications** — Send payment confirmations/reminders via Twilio or Africa's Talking
2. **Mobile Money** — Integrate MTN MoMo / Airtel Money APIs
3. **Offline Support** — Service Worker + IndexedDB for offline payment recording
4. **Biometric Attendance** — Use the `biometric_data` table with fingerprint readers
5. **Receipt Generation** — Auto-generate PDF receipts after payment
6. **Multi-language** — i18n support (French, etc.)
7. **Export** — CSV/PDF export for reports
8. **Bulk Import** — CSV student import
