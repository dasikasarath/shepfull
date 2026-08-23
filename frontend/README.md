# Sheprenure Frontend

Modern React frontend for the Sheprenure e-commerce backend.

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React icons

## Getting Started

### Prerequisites

- Node.js 18+
- Backend running on `http://localhost:8080`

### Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:5173`.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | Empty (uses Vite dev proxy) |

In development, Vite proxies API requests to `http://localhost:8080` to avoid CORS issues without modifying the backend.

For production, set `VITE_API_BASE_URL` to your backend URL and ensure CORS is handled via a reverse proxy (nginx) or backend configuration.

## API Integration

All frontend features map directly to existing backend endpoints:

### Authentication
- `POST /user/register` — Register
- `POST /login` — Login (returns JWT)
- `POST /logouts` — Logout
- `POST /forgotpassword/generateotp/{name}` — Send OTP
- `POST /forgotpassword/verify` — Verify OTP
- `PATCH /forgotpassword/passwordchange` — Reset password

### User
- `GET /user/me` — Profile
- `PATCH /updateprofile` — Update profile
- `PATCH /rechangepassword` — Change password
- `GET /user/getall` — All products
- `GET /user/products/{pid}` — Product detail
- `GET /user/category/{cateName}` — Filter by category
- `GET /user/search?name=` — Search products
- `POST /user/addtocart` — Add to cart
- `GET /user/cartdb` — Cart summary
- `GET /user/cartitemdb` — Cart items
- `DELETE /user/remcart/{pid}` — Remove item
- `PATCH /user/incrementcart` — Increase quantity
- `PATCH /user/decrementcart` — Decrease quantity
- `POST /user/order` — Place order
- `GET /user/seeorders` — Order history
- `GET /user/orderitems` — Order items

### Admin
- `GET /admin/showusers` — All users
- `GET /admin/products` — All products
- `GET /admin/product/{pid}` — Product detail
- `POST /admin/addproduct` — Add product (multipart)
- `PATCH /admin/updateproduct` — Update product
- `PATCH /admin/updateimage/{pid}` — Update image
- `DELETE /admin/delete/{pid}` — Delete product
- `DELETE /admin/deleteall` — Delete all products
- `GET /admin/orderslist` — All orders
- `GET /admin/orders/{id}` — Order detail

## Build

```bash
npm run build
npm run preview
```

## Notes

- JWT token is stored in `localStorage` and sent as `Authorization: Bearer <token>`
- User role (`USER` / `ADMIN`) is extracted from JWT for route protection
- Admin accounts must exist in the database (registration creates `USER` role only)
