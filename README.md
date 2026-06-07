# ShopSphere — Full Stack E-Commerce

ShopSphere is a modern MERN Stack e-commerce platform where users can browse products, add items to cart, make secure payments, and track orders. Admins can manage products, inventory, and view sales analytics.

## Features

### Customer
- User authentication (JWT)
- Product browsing with search & filters
- Shopping cart & wishlist
- Order placement & tracking
- Razorpay payment integration

### Shopkeeper (Admin)
- Register as shopkeeper and manage **your own** products & orders
- Upload up to 5 product images per listing
- Sales analytics dashboard (your revenue, orders, low stock)
- Product management (create, edit, delete)
- Order management (only orders for your products)

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Tailwind CSS, Redux Toolkit, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Payments | Razorpay |
| Auth | JWT |

## Project Structure

```
ShopSphere/
├── client/          # React frontend (port 3000)
├── server/          # Express API (port 8000)
└── README.md
```

## Installation

```bash
# Clone and enter project
git clone https://github.com/yourusername/shopsphere.git
cd ShopSphere

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

## Environment Variables

Create `server/.env` from the example:

```bash
cp server/.env.example server/.env
```

```env
PORT=8000
# Always include a database name (e.g. /shopsphere)
MONGO_URI=mongodb://127.0.0.1:27017/shopsphere
JWT_SECRET=your_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CLIENT_URL=http://localhost:3000
```

## Run Project

**Terminal 1 — API & database**

```bash
cd server
npm run data:import   # seed demo users only (no sample products)
npm run dev
```

**Terminal 2 — Frontend**

```bash
cd client
npm start
```

- App: http://localhost:3000
- API: http://localhost:8000/api/health

### Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Shopkeeper (demo) | admin@shopsphere.com | admin123 |
| Customer (demo) | john@example.com | 123456 |

Anyone can register as a **Customer** or **Shopkeeper** on the sign-up page. At sign-in, select the matching account type — shopkeepers are redirected to `/admin`.

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/users` | Register |
| POST | `/api/users/login` | Login |
| GET | `/api/products` | List products (search/filter) |
| GET/POST | `/api/cart` | Cart operations |
| GET/POST | `/api/wishlist` | Wishlist |
| POST | `/api/orders` | Create order |
| GET | `/api/orders/myorders` | User orders |
| GET | `/api/admin/analytics` | Admin dashboard |

## Production Build

```bash
cd client && npm run build
cd ../server
NODE_ENV=production npm start
```

The API serves the built React app from `client/dist` when `NODE_ENV=production`.

## Future Enhancements

- AI product recommendations
- Multi-vendor support
- Chat support system
- Mobile application
