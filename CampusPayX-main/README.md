<div align="center">
  <h1>🚀 CampusPayX</h1>
  <p><strong>A QR-based digital mess payment system for fast, cashless, and transparent campus transactions.</strong></p>
</div>

---

## 📖 Overview

**CampusPayX** is a complete solution designed to modernize campus mess management. By bringing transactions into a unified digital ecosystem, we eliminate the need for physical cash or coupons. Our platform provides real-time tracking, seamless digital payments via QR codes, and designated dashboards for Students, Managers, and Staff.

## ✨ Key Features

- **Role-Based Dashboards**: Tailored experiences for Students, Managers, and Staff.
- **Secure Authentication**: Robust JWT-based authentication system.
- **Cashless Transactions**: Scan & Pay via QR codes with real-time balance reduction.
- **Automated Wallets**: Monthly wallet top-ups with built-in limits and top-up rules.
- **Real-Time Queue Management**: Live updates for food distribution queues using WebSockets.
- **PWA Enabled**: Installable on mobile devices with offline capabilities and a responsive design.
- **Analytics & History**: Comprehensive transaction history, manager analytics suites, and Excel/CSV data exports.
- **Peer-to-Peer Transfers**: Instantly transfer credits between students.

## 🛠️ Tech Stack

**Frontend:**
- React.js (Vite)
- Tailwind CSS
- Context API (State Management)
- Progressive Web App (PWA) Configuration

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- Socket.IO (Real-time updates)
- JSON Web Tokens (JWT) for Authentication
- bcrypt.js (Password Hashing)

## 📂 Project Structure

```
CampusPayX/
├── backend/                  # Express server, MongoDB models, Routes, & Controllers
│   ├── config/               # Database and environment configurations
│   ├── controllers/          # Business logic for routes
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API endpoints
│   └── index.js              # Entry point
└── frontend/                 # React frontend
    ├── public/               # Static assets & PWA manifest
    ├── src/
    │   ├── assets/           # Images & icons
    │   ├── components/       # Reusable UI components
    │   ├── pages/            # Application views/pages
    │   ├── App.jsx           # App routing
    │   └── main.jsx          # React DOM entry
```

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local development machine:
- **Node.js** (v16.x or newer)
- **npm** or **yarn**
- **MongoDB** (Local instance or MongoDB Atlas cluster)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/piyushbxr802123-prog/CampusPayX.git
   cd CampusPayX
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Variables

You need to set up your environment variables. Create a `.env` file in the `backend/` directory and configure the following:

```env
# Backend .env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

*(If your frontend relies on specific VITE variables, create a `.env` in the `frontend/` directory with `VITE_API_URL=http://localhost:5000` or similar.)*

### Running the Application

**Run the backend server:**
```bash
cd backend
npm run dev
```

**Run the frontend server:**
```bash
cd frontend
npm run dev
```

The application should now be running. Navigate to `http://localhost:5173` (or the port specified by Vite) in your browser.

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the application, please fork the repository and submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
