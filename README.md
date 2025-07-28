# MediMart-Server

MediMart-Server is the backend server for the MediMart application, an online platform for managing medicines, orders, payments, and user roles (admin, seller, buyer). It is built with Node.js and Express, and uses MongoDB for data storage.

## Features

- User authentication and role-based access (admin, seller, buyer)
- Order management and aggregation
- Payment processing (Stripe integration)
- Sales and payment history reports for sellers and admins
- Dashboard statistics for admins, sellers, and buyers

## Project Structure

```
MediMart-Server/
  index.js                # Main server entry point
  routes/                 # API route handlers
    adRoutes.js
    categoriesRoutes.js
    medicinesRoutes.js
    ordersRoutes.js
    paymentsRoutes.js
    stripeRoute.js
    usersRoutes.js
  package.json            # Project dependencies and scripts
  package-lock.json       # Dependency lock file
  vercel.json             # Vercel deployment config
```

## Setup Instructions

1. **Clone the repository:**

   ```bash
   git clone <repo-url>
   cd MediMart-Server
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add your configuration (e.g., MongoDB URI, Stripe keys, etc.).

4. **Run the server:**
   ```bash
   npm start
   ```
   The server will start on the port specified in your environment variables or default to 5000.

## API Endpoints

- `/api/orders/sellers/payment-history` - Seller payment history (protected)
- `/api/orders/sales-report` - Admin sales report (protected)
- `/api/orders/admin-dashboard` - Admin dashboard stats (protected)
- `/api/orders/stats/:email` - Seller dashboard stats (protected)
- `/api/orders/buyer/:email` - Buyer dashboard stats (protected)
- Additional endpoints for users, categories, medicines, payments, and Stripe integration

## Deployment

This project can be deployed on Vercel or any Node.js-compatible hosting. See `vercel.json` for Vercel configuration.

## License

This project is licensed under the MIT License.
