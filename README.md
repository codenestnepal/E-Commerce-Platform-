# Nile - Full-Stack E-Commerce Platform

A production-ready, full-stack E-Commerce platform built with **Node.js**, **Express**, **MongoDB / Mongoose**, and a responsive frontend with vanilla JS and CSS. Features a multi-role architecture connecting **Customers**, **Vendors**, and **Store Administrators** in a single unified system.

---

## Key Features

### 1. Customer Storefront
- **Dynamic Catalog & Filtering**: Browse products with live category filters, search bar, and sorting (price low-high, high-low, alphabetical, featured).
- **Dedicated Product Details**: View galleries, pricing, stock levels, and instant add-to-cart controls (`product.html`).
- **Persistent Cart & Wishlist**: Real-time navbar badge counters synchronized with `localStorage` and backend API endpoints.
- **Full Checkout Loop**: Multi-step checkout with delivery address capture, coupon discounts, order summary, and payment method selection (Cash on Delivery & Razorpay gateway).
- **Order Tracking & Cancellation**: Customers can track orders through lifecycle stages (Pending, Confirmed, Shipped, Delivered) and cancel pending orders (`orders.html`).
- **Account Recovery**: Forgot password flow with 6-digit recovery code verification (`forgot-password.html`).
- **Engagement**: Working newsletter subscription and customer contact inquiry forms.

### 2. Unified Admin Portal
- **Dashboard Overview**: Real-time sales metrics, order counters, registered users, and recent activity feeds (`/admin`).
- **12 Integrated Modules**:
  1. Overview & Analytics
  2. Products (Add, edit, delete, toggle featured)
  3. Orders (Update status, view shipping details, cancel)
  4. Customers (View, search, suspend/activate)
  5. Vendors (Review applications, approve/reject)
  6. Category Management
  7. Discounts & Promo Coupons (Create promo codes, min spend, expiry)
  8. Reviews & Ratings (Approve, reject, delete)
  9. Flash Sales & Promotional Banners
  10. System Announcements (Broadcast notices to storefront)
  11. Store Settings (Currencies, tax rates, shipping fees, maintenance mode)
  12. Staff Roles & Permissions (Manage Admin, Manager, Support roles)
- **Zero-Crash Dual Mode**: MongoDB persistence with seamless, instant in-memory fallback for local development or demo environments.

### 3. Vendor Portal
- **Vendor Onboarding**: Vendor registration and profile creation (`/vendor`).
- **Product Management**: List products with categories, pricing, stock, and descriptions.

---

## Tech Stack

- **Backend**: Node.js, Express 5, Mongoose 9, JWT, Bcrypt, Multer, Joi, Razorpay SDK, Nodemailer.
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+), FontAwesome 6, Google Fonts (Inter, Poppins, Share Tech).
- **Database**: MongoDB (Atlas or local instance).
- **Deployment**: Docker, Render (`render.yaml`), Railway, Procfile.

---

## Directory Structure

```
E-Commerce-Platform-/
├── backend/
│   ├── config/             # Database connection (db.js)
│   ├── controllers/        # Business logic controllers
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── productController.js
│   │   ├── uploadController.js
│   │   └── ...
│   ├── middleware/         # Auth, admin guard, validation
│   ├── model/              # Mongoose schemas (User, Order, Product, Coupon, etc.)
│   ├── routes/             # REST API routes (/api/v1/...)
│   ├── utils/              # Email & helper functions
│   └── index.js            # Express application entry point
├── frontend/
│   ├── Admin Portal/       # Admin Dashboard UI (admin.html, admin.js, admin.css)
│   ├── Vendor Portal/      # Vendor Portal UI (vendor.html)
│   ├── Images/             # Product and UI image assets
│   ├── index.html          # Storefront homepage
│   ├── shop.html           # Full shopping catalog
│   ├── product.html        # Product details page
│   ├── cart.html           # Shopping cart
│   ├── checkout.html       # Checkout & payment flow
│   ├── orders.html         # Customer order history & tracking
│   ├── order-success.html  # Post-checkout confirmation
│   ├── wishlist.html       # Customer wishlist
│   ├── login.html          # Role-based user login
│   ├── Signup.html         # User registration
│   ├── forgot-password.html# Password recovery & reset
│   ├── categories.html     # Categories directory
│   ├── category-*.html     # Individual category pages (8 categories)
│   ├── contact.html        # Contact inquiry form
│   ├── about.html          # About Nile
│   └── eComjs.js           # Core client store & event handler
├── Dockerfile              # Container deployment
├── render.yaml             # Render 1-click blueprint
├── Procfile                # Heroku / Railway process definition
├── package.json            # Root workspace scripts
└── README.md
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Optional: the app automatically falls back to in-memory mode if offline)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/codenestnepal/E-Commerce-Platform-.git
   cd E-Commerce-Platform-
   ```

2. **Install dependencies**:
   ```bash
   npm run postinstall
   ```
   *(Or navigate into `backend` and run `npm install`)*

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` in the root (or `backend/.env`):
   ```bash
   cp .env.example backend/.env
   ```
   Edit the values as needed:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/nile_ecommerce
   JWT_SECRET=your_jwt_secret_key_here
   ALLOW_ANONYMOUS_ADMIN=true
   RAZORPAY_KEY_ID=
   RAZORPAY_KEY_SECRET=
   ```

4. **Start the Server**:
   ```bash
   npm start
   ```

5. **Open in Browser**:
   - Customer Store: [http://localhost:5000](http://localhost:5000)
   - Product Catalog: [http://localhost:5000/shop](http://localhost:5000/shop)
   - Admin Portal: [http://localhost:5000/admin](http://localhost:5000/admin)
   - Vendor Portal: [http://localhost:5000/vendor](http://localhost:5000/vendor)

---

## Default Demo Credentials

When `ALLOW_ANONYMOUS_ADMIN=true` (default in dev), the Admin Portal is immediately accessible. You can also sign in with pre-seeded accounts:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@nile.com` | `admin123` |
| **Vendor** | `vendor@nile.com` | `vendor123` |
| **Customer** | `user@example.com` | `user123` (or sign up with any email) |

---

## Production Deployment

### 1. Render Deployment (Recommended)
This repository includes a `render.yaml` configuration:
1. Fork or push your repository to GitHub.
2. Sign in to [Render](https://render.com/) and click **New +** > **Blueprint**.
3. Connect your repository. Render will automatically detect `render.yaml` and set up the web service.
4. Set your production `MONGO_URI` (from MongoDB Atlas) in the Render environment variables dashboard.

### 2. Docker Deployment
Build and run the container locally or on any cloud host (AWS ECS, Google Cloud Run, DigitalOcean):
```bash
# Build the Docker image
docker build -t nile-ecommerce .

# Run container on port 5000
docker run -p 5000:5000 \
  -e MONGO_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/nile" \
  -e JWT_SECRET="production_secret_key" \
  -e ALLOW_ANONYMOUS_ADMIN="false" \
  nile-ecommerce
```

### 3. Railway / Heroku
A `Procfile` is included. Simply connect the repository to Railway or Heroku; the `web: node backend/index.js` process type will start automatically.

---

## Core API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `POST` | `/auth/signup` | Register new account |
| `POST` | `/auth/login` | Authenticate and obtain JWT |
| `POST` | `/auth/forgot-password` | Request password reset verification code |
| `POST` | `/auth/reset-password` | Reset password using recovery code |
| `GET` | `/api/v1/products` | Retrieve catalog with search & filters |
| `GET` | `/api/v1/products/:id` | Get specific product details |
| `GET` | `/api/v1/cart` | Get customer cart |
| `POST` | `/api/v1/cart/add` | Add product to cart |
| `POST` | `/api/v1/orders/checkout` | Process order checkout (COD / Online) |
| `GET` | `/api/v1/orders/my-orders` | Retrieve authenticated user's orders |
| `PUT` | `/api/v1/orders/:id/cancel` | Cancel an order |
| `POST` | `/api/v1/payment/create-order`| Create Razorpay order |
| `POST` | `/api/v1/payment/verify` | Verify Razorpay payment signature |
| `POST` | `/api/v1/upload` | Upload image file |
| `GET` | `/api/v1/admin/overview` | Admin dashboard key metrics |
| `GET/POST`| `/api/v1/admin/products` | Manage store products |
| `GET/POST`| `/api/v1/admin/orders` | Manage store orders |
| `GET/POST`| `/api/v1/admin/coupons` | Manage discount promo codes |
| `GET/POST`| `/api/v1/admin/settings` | Storewide configuration |

---

## License

This project is licensed under the ISC License. Developed by Saurav KC for [CodeNestNepal](https://github.com/codenestnepal).
