# AREWA SQUARE — Developer Deployment Guide

> Northern Nigeria's trusted digital marketplace  
> Built by **KAUSANITECH** | Kano, Nigeria | © 2026

---

## 📁 Complete File Structure

```
arewa-square/
│
├── frontend/                    ← All HTML pages
│   ├── index.html               ← Landing page
│   ├── auth.html                ← Register / Login
│   ├── buyer-dashboard.html     ← Buyer dashboard
│   ├── seller-dashboard.html    ← Seller dashboard
│   ├── admin.html               ← Admin control panel
│   ├── admin-payments.html      ← Payment tracking
│   ├── seller-rules.html        ← Seller guidelines
│   ├── privacy.html             ← Privacy policy
│   ├── terms.html               ← Terms of use
│   ├── 404.html                 ← Not found page
│   ├── offline.html             ← PWA offline fallback
│   ├── shared.css               ← Shared stylesheet
│   ├── sw.js                    ← Service worker (PWA)
│   ├── manifest.json            ← PWA manifest
│   ├── robots.txt               ← SEO
│   ├── sitemap.xml              ← SEO
│   └── logo.png                 ← Your logo (add this)
│
├── backend/                     ← Node.js + Express API
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── routes/
│   │   ├── auth.js
│   │   ├── sellers.js
│   │   ├── buyers.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── admin.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Seller.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── middleware/
│   │   ├── auth.js              ← JWT verification
│   │   └── adminOnly.js
│   └── utils/
│       ├── email.js             ← Email notifications (Nodemailer)
│       └── shopNumber.js        ← Auto-assign shop numbers
│
└── README.md
```

---

## 🔧 Backend Setup (Node.js + Express)

### 1. Install dependencies

```bash
mkdir arewa-square-api && cd arewa-square-api
npm init -y
npm install express mongoose bcryptjs jsonwebtoken dotenv cors multer nodemailer
npm install --save-dev nodemon
```

### 2. Environment Variables (.env)

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/arewasquare
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long
JWT_EXPIRES_IN=7d

# Email (for seller approval notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=support@arewasquare.com
EMAIL_PASS=your_app_password

# Frontend URL (for CORS)
FRONTEND_URL=https://arewasquare.com

# Admin email (for login)
ADMIN_EMAIL=admin@arewasquare.com
ADMIN_PASS=your_admin_password_here
```

### 3. Core server.js

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/sellers',  require('./routes/sellers'));
app.use('/api/buyers',   require('./routes/buyers'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/admin',    require('./routes/admin'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 AREWA SQUARE API running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error('MongoDB error:', err));
```

### 4. Key API Endpoints to Build

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register buyer or seller |
| POST | `/api/auth/login` | Login — returns JWT |
| POST | `/api/auth/forgot-password` | Send reset email |
| GET  | `/api/sellers` | Get all verified sellers |
| GET  | `/api/sellers/:id` | Get single seller + products |
| POST | `/api/sellers/apply` | Submit seller application |
| GET  | `/api/products` | Browse all products |
| POST | `/api/products` | Add product (seller only) |
| PUT  | `/api/products/:id` | Edit product |
| DELETE | `/api/products/:id` | Delete product |
| GET  | `/api/orders` | Get seller's orders |
| POST | `/api/orders` | Buyer submits order |
| GET  | `/api/admin/applications` | Pending seller applications |
| PUT  | `/api/admin/applications/:id/approve` | Approve + assign shop number |
| PUT  | `/api/admin/applications/:id/reject` | Reject with reason |
| GET  | `/api/admin/stats` | Platform stats |

---

## 🔗 Connecting Frontend to Backend

### Replace demo login in auth.html

Find the `handleLoginRedirect()` function and replace the demo block:

```javascript
async function handleLoginRedirect() {
  const email    = document.querySelector('#page-login input[type="email"]').value.trim();
  const password = document.querySelector('#page-login input[type="password"]').value;

  if (!validateEmail(email)) { showToast('Enter a valid email', 'error'); return; }
  if (!password) { showToast('Enter your password', 'error'); return; }

  try {
    const res  = await fetch('https://your-api.railway.app/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.message || 'Login failed', 'error'); return; }

    localStorage.setItem('as_token', data.token);
    localStorage.setItem('as_role',  data.role);
    localStorage.setItem('as_user',  JSON.stringify(data.user));

    showToast('Welcome back!', 'success');
    setTimeout(() => {
      const redirects = {
        admin:  'admin.html',
        seller: 'seller-dashboard.html',
        buyer:  'buyer-dashboard.html'
      };
      window.location.href = redirects[data.role] || 'index.html';
    }, 800);
  } catch (err) {
    showToast('Connection error. Try again.', 'error');
  }
}
```

### Add this auth guard to ALL dashboard pages (top of `<script>`)

```javascript
// ── SESSION GUARD — paste at top of every dashboard page script ──
(function checkAuth() {
  const token = localStorage.getItem('as_token');
  const role  = localStorage.getItem('as_role');
  if (!token) { window.location.href = 'auth.html'; return; }

  // Role guards
  const page = window.location.pathname;
  if (page.includes('admin') && role !== 'admin') {
    window.location.href = 'auth.html';
  }
  if (page.includes('seller-dashboard') && role !== 'seller') {
    window.location.href = 'auth.html';
  }
  if (page.includes('buyer-dashboard') && role !== 'buyer') {
    window.location.href = 'auth.html';
  }
})();
```

### Register the Service Worker (add to index.html before `</body>`)

```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('✅ Service Worker registered'))
      .catch(err => console.warn('SW error:', err));
  }
</script>
```

### Add PWA tags to `<head>` of index.html

```html
<link rel="manifest" href="/manifest.json"/>
<meta name="theme-color" content="#c9a84c"/>
<meta name="apple-mobile-web-app-capable" content="yes"/>
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
<link rel="apple-touch-icon" href="/icons/icon-192.png"/>
```

---

## ☁️ Deployment

### Frontend → Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# In your frontend folder
vercel

# Set custom domain
vercel domains add arewasquare.com
```

Add `vercel.json` for 404 redirect:
```json
{
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/404.html" }
  ]
}
```

### Backend → Railway

1. Go to [railway.app](https://railway.app) and create a new project
2. Connect your GitHub repository
3. Add all environment variables from `.env`
4. Railway will auto-detect Node.js and deploy

```bash
# In package.json, add:
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### Database → MongoDB Atlas

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) — free tier
2. Create a cluster (select Africa / closest region)
3. Create a database user
4. Whitelist Railway's IP (or allow all: `0.0.0.0/0`)
5. Copy connection string into `.env` as `MONGODB_URI`

### File Storage (for product/ID photos) → Cloudinary

```bash
npm install cloudinary multer-storage-cloudinary
```

```javascript
// In .env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 📧 Email Notifications to Set Up

| Trigger | Email Sent To | Content |
|---------|--------------|---------|
| Seller applies | Admin | "New application from [name]" |
| Admin approves seller | Seller | "Congratulations! Shop #XXX assigned" |
| Admin rejects seller | Seller | "Application not approved — reason" |
| Buyer places order | Seller | "New order received" |
| Password reset | User | "Reset link (expires 1 hour)" |

---

## 🔒 Security Checklist Before Going Live

- [ ] All passwords hashed with bcrypt (minimum 10 rounds)
- [ ] JWT secret is at least 32 random characters
- [ ] `.env` is in `.gitignore` — never push secrets to GitHub
- [ ] Admin routes protected with `adminOnly` middleware
- [ ] File uploads validated by type and size (max 5MB, images only)
- [ ] Rate limiting on auth endpoints (`express-rate-limit`)
- [ ] CORS restricted to your actual frontend domain
- [ ] HTTPS enforced (Vercel and Railway handle this automatically)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Input sanitisation on all API inputs (`express-validator`)

---

## ✅ Launch Checklist

- [ ] Domain purchased and pointed to Vercel
- [ ] Backend deployed on Railway and responding
- [ ] MongoDB Atlas connected and seeded with admin user
- [ ] Cloudinary configured for image uploads
- [ ] Email notifications tested end-to-end
- [ ] Auth guard working on all dashboard pages
- [ ] Seller application flow tested (apply → approve → shop number assigned)
- [ ] Buyer registration tested
- [ ] Product add/edit/delete tested
- [ ] WhatsApp order flow tested
- [ ] 404 page working for broken links
- [ ] Offline page showing when disconnected
- [ ] PWA installable on Android (test in Chrome)
- [ ] Site tested on mobile (iPhone and Android)
- [ ] Terms.html email typo fixed: `support@arewasquare.com`

---

## 📞 Support

**KAUSANITECH**  
📧 support@arewasquare.com  
📞 07082783618  
💬 [WhatsApp](https://wa.me/message/B5NOLBZXJZ6HA1)

---

*Built by KAUSANITECH — Kano, Nigeria | AREWA SQUARE 2026*
