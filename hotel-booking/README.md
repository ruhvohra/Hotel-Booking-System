# 🏨 LuxeStay — MERN Stack Hotel Booking System

A full-featured, production-grade hotel booking platform built with MongoDB, Express, React, and Node.js. Includes Clerk authentication, admin dashboard, real-time availability checking, booking management, and a polished luxury UI.

---

## ✨ Features

### Guest Features
- 🔍 Search hotels by city, country, or name
- 🎚️ Filter by category, star rating, price range
- 📅 Check room availability for specific dates
- 🏨 View hotel details, amenities, room types, policies
- 📝 Make and manage bookings
- ⭐ Leave reviews with star ratings
- 👤 User profile management
- 📜 View booking history and confirmation details
- ❌ Cancel bookings

### Authentication
- 📧 Email/password registration & login (JWT)
- 🔐 **Clerk authentication** (social login — Google, GitHub, etc.)
- 🔄 Automatic sync between Clerk and MongoDB
- 🛡️ Role-based access control (user / admin)

### Admin Dashboard
- 📊 Analytics: revenue, booking trends, status breakdown
- 📈 Interactive charts (Recharts)
- 🏨 Full hotel CRUD — add, edit, delete hotels
- 🛏️ Manage room types, amenities, policies
- 📋 View and update all bookings and payment statuses
- 👥 Manage users and promote to admin
- 🌱 One-click demo data seeding (8 curated hotels)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
git clone <your-repo>
cd hotel-booking

# Install all dependencies
npm run install:all

# Or manually:
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment Variables

**Backend** — copy and edit `backend/.env.example` → `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/hotel_booking
JWT_SECRET=your_super_secret_key_change_this

# Clerk (optional — for social auth)
CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

PORT=5000
CLIENT_URL=http://localhost:5173
```

**Frontend** — copy and edit `frontend/.env.example` → `frontend/.env`:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx   # optional
VITE_API_URL=http://localhost:5000/api
```

### 3. Create Admin User

Set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` (at least 12 characters) in
`backend/.env`, then run this from the repository root:
```bash
node hotel-booking/scripts/createAdmin.js
```

### 4. Run the Application

```bash
# From the root directory (runs both servers concurrently)
npm install          # installs concurrently
npm run dev

# Or run separately:
npm run dev:backend   # http://localhost:5000
npm run dev:frontend  # http://localhost:5173
```

### 5. Seed Demo Data

1. Login as admin
2. Go to `/admin` → Dashboard
3. Click **"Seed Demo Data"** button
4. 8 curated hotels will be added instantly

---

## 🗂️ Project Structure

```
hotel-booking/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema (supports both JWT & Clerk)
│   │   ├── Hotel.js         # Hotel schema with rooms & reviews
│   │   └── Booking.js       # Booking schema with auto-confirmation #
│   ├── routes/
│   │   ├── auth.js          # Register, login, Clerk sync, profile
│   │   ├── hotels.js        # CRUD, availability check, reviews
│   │   ├── bookings.js      # Create, list, cancel bookings
│   │   ├── admin.js         # Dashboard stats, seed data, user management
│   │   └── webhook.js       # Clerk webhook handler
│   ├── middleware/
│   │   └── auth.js          # JWT, Clerk, flex auth, admin guard
│   └── server.js            # Express app entry point
│
├── frontend/
│   └── src/
│       ├── context/
│       │   └── AuthContext.jsx    # Global auth state (JWT + Clerk)
│       ├── utils/
│       │   └── api.js            # Axios API calls
│       ├── components/
│       │   ├── Navbar.jsx         # Transparent → scrolled navbar
│       │   ├── Footer.jsx
│       │   ├── HotelCard.jsx      # Hotel listing card
│       │   └── SearchBar.jsx      # Full + compact search
│       ├── pages/
│       │   ├── Home.jsx           # Hero, featured hotels, destinations
│       │   ├── Hotels.jsx         # Listing with filters & pagination
│       │   ├── HotelDetail.jsx    # Hotel page + availability + booking
│       │   ├── BookingPage.jsx    # Guest info + price summary
│       │   ├── BookingConfirmation.jsx
│       │   ├── MyBookings.jsx     # User booking history
│       │   ├── Login.jsx          # Email/password login
│       │   ├── Register.jsx
│       │   ├── Profile.jsx
│       │   └── admin/
│       │       ├── AdminLayout.jsx   # Sidebar layout wrapper
│       │       ├── Dashboard.jsx     # Stats, charts, recent data
│       │       ├── Hotels.jsx        # Hotel management table
│       │       ├── AddHotel.jsx      # Create / edit hotel form
│       │       ├── Bookings.jsx      # Booking management
│       │       └── Users.jsx         # User management
│       ├── App.jsx               # Router, Clerk provider, protected routes
│       └── index.css             # Design system & global styles
│
└── scripts/
    └── createAdmin.js            # Admin user setup script
```

---

## 🔐 Clerk Authentication Setup

1. Create an account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your **Publishable Key** and **Secret Key**
4. Add them to your `.env` files
5. In Clerk Dashboard → Webhooks:
   - Add endpoint: `http://your-domain.com/api/webhooks/clerk`
   - Subscribe to: `user.created`, `user.updated`, `user.deleted`
   - Copy the **Webhook Secret** to your backend `.env`

Clerk users are automatically synced to MongoDB on first login.

---

## 🌐 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with email/password |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/clerk-sync` | Sync Clerk user to MongoDB |
| GET  | `/api/auth/me` | Get current user |
| PUT  | `/api/auth/profile` | Update profile |

### Hotels
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hotels` | List hotels (with filters) |
| GET | `/api/hotels/:id` | Get hotel details |
| POST | `/api/hotels/:id/availability` | Check availability |
| POST | `/api/hotels/:id/reviews` | Add review (auth) |
| POST | `/api/hotels` | Create hotel (admin) |
| PUT | `/api/hotels/:id` | Update hotel (admin) |
| DELETE | `/api/hotels/:id` | Delete hotel (admin) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking (auth) |
| GET | `/api/bookings/my-bookings` | Get user bookings (auth) |
| GET | `/api/bookings/:id` | Get booking details (auth) |
| PUT | `/api/bookings/:id/cancel` | Cancel booking (auth) |
| PUT | `/api/bookings/:id/status` | Update status (admin) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/bookings` | All bookings paginated |
| GET | `/api/admin/users` | All users paginated |
| PUT | `/api/admin/users/:id/role` | Change user role |
| POST | `/api/admin/seed` | Seed demo hotel data |

---

## 🎨 Design System

The UI uses a luxury hotel aesthetic:

| Token | Value | Usage |
|-------|-------|-------|
| `--gold` | `#C9A84C` | Primary accent |
| `--charcoal` | `#1C1C1E` | Text, navbar |
| `--cream` | `#FAF8F3` | Page background |
| `--ivory` | `#F5F1E8` | Section background |
| `--font-display` | Cormorant Garamond | Headings, prices |
| `--font-body` | DM Sans | Body, UI elements |

---

## 🚢 Deployment

This project can be deployed as three services: MongoDB Atlas (database), Render
(API), and Vercel (frontend). The repository includes a Render Blueprint in
`render.yaml`.

1. **Create the database.** Create a MongoDB Atlas cluster and database user.
   Copy the Atlas connection string and replace its password placeholder. Allow
   network access from Render; use Render's outbound IP allowlist when available.
   If you must allow `0.0.0.0/0`, use a strong database password and restrict the
   database user's permissions.
2. **Deploy the API.** In Render, create a Blueprint from this repository and
   select `render.yaml` at the repository root. Set `MONGODB_URI` to the Atlas
   connection string. Set `CLIENT_URL` temporarily to `http://localhost:5173`;
   replace it with the Vercel site's origin after step 3 (no trailing slash).
   Render generates `JWT_SECRET`.
3. **Deploy the frontend.** Import the same repository into Vercel and set the
   project root directory to `hotel-booking/frontend`. Set the environment
   variable `VITE_API_URL` to the Render API URL followed by `/api`, for example
   `https://your-api.onrender.com/api`. Add `VITE_CLERK_PUBLISHABLE_KEY` only if
   using Clerk. Deploy, then copy the Vercel site's origin (no trailing slash)
   into Render's `CLIENT_URL` and redeploy the API.
4. **Verify.** Open `https://your-api.onrender.com/api/health` and confirm it
   returns a JSON status of `OK`; then test hotel listing, registration, login,
   and booking from the Vercel site.

Do not commit `.env` files or put secrets in `VITE_*` variables; Vite embeds
those values in public browser code. To create an admin account, set
`ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` of at least 12 characters in your
local `backend/.env` alongside the Atlas `MONGODB_URI`, then run
`node hotel-booking/scripts/createAdmin.js` from the repository root.

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Recharts |
| Auth | JWT, Clerk |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Styling | Custom CSS with design tokens |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Build Tool | Vite |

---

## 🛠️ Extending the App

### Add Stripe Payments
```js
// backend/routes/bookings.js — add after booking creation
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const session = await stripe.checkout.sessions.create({ ... });
```

### Add Email Notifications
Use `nodemailer` or `resend` to send confirmation emails after booking.

### Add Image Upload
Integrate Cloudinary or AWS S3 for hotel image uploads instead of URL strings.

---

## 📄 License
MIT — Free to use and modify.
