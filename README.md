# Stockify — Inventory Management System

A modern and robust Inventory Management System built with the MERN stack (MongoDB, Express.js, React Vite, Node.js). 

## 🚀 Tech Stack

- **Frontend:** React.js (via Vite), React Router DOM, Axios
- **Backend:** Node.js, Express.js, JWT (Authentication), Bcrypt (Password Hashing)
- **Database:** MongoDB & Mongoose ORM

## 📋 Features

### Role: Staff / User
- 🔐 Login / Register
- 📊 Dashboard stock summary
- 📦 View product list
- ➕ Add, ✏️ Edit, 🗑️ Delete products
- 📥 Stock IN & 📤 Stock OUT operations
- 🔍 Filter products by category
- 📝 Stock transaction history

### Role: Admin
- All Staff features
- 👥 Manage Users
- 🏷️ Manage Categories
- ⚠️ Low stock reporting

## 🗃️ Database Collections & Schema

1. **`users`**: name, email, password, role (admin/staff)
2. **`products`**: name, sku, category, stock, minimumStock, unit, price, description
3. **`categories`**: name, description
4. **`stock_transactions`**: product, type (IN/OUT), quantity, note, createdBy, createdAt

## 🛣️ API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`

### Products
- `GET /api/products`
- `POST /api/products`
- `GET /api/products/:id`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### Categories
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

### Stock Transactions
- `POST /api/stock/in`
- `POST /api/stock/out`
- `GET /api/transactions`

### Dashboard
- `GET /api/dashboard/summary`

## 💻 Frontend Routes

- `/login`
- `/register`
- `/dashboard`
- `/products`
- `/products/create`
- `/products/:id/edit`
- `/categories`
- `/stock-in`
- `/stock-out`
- `/transactions`
- `/users`

## 📁 Project Structure

```text
stockify-mern/
├── backend/
│   ├── src/
│   │   ├── config/      # Database config
│   │   ├── controllers/ # API logic
│   │   ├── middleware/  # Auth & Role guards
│   │   ├── models/      # Mongoose Schemas
│   │   ├── routes/      # API routing mapping
│   │   └── server.js    # Express entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/         # Axios configurations
    │   ├── components/  # Reusable UI components
    │   ├── pages/       # Page views
    │   ├── layouts/     # Dashboard/Auth layouts
    │   ├── context/     # React Context for global state
    │   └── main.jsx
    └── package.json
```

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd stockify-mern
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend/` directory:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_uri
   JWT_SECRET=your_secret_key
   ```
   Run the backend development server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   Open a new terminal, then:
   ```bash
   cd frontend
   npm install
   ```
   Run the frontend development server:
   ```bash
   npm run dev
   ```

---