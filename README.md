# HireHelper — On-Demand Task Assistance Platform

A full-stack web application where users can post tasks, find helpers, manage requests, and coordinate task completion with real-time notifications.

---

## 📁 Project Structure

```
hirehelper/
├── backend/                  # Node.js + Express + MongoDB API
│   ├── src/
│   │   ├── app.js            # Main Express server entry point
│   │   ├── config/
│   │   │   └── db.js         # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.js       # User schema
│   │   │   ├── Task.js       # Task schema
│   │   │   ├── Request.js    # Request schema
│   │   │   ├── AcceptedTask.js
│   │   │   └── Notification.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── taskController.js
│   │   │   ├── requestController.js
│   │   │   ├── notificationController.js
│   │   │   └── userController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   ├── requestRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js   # JWT protect middleware
│   │   │   └── uploadMiddleware.js # Multer image uploads
│   │   └── utils/
│   │       └── emailService.js    # Nodemailer OTP emails
│   ├── uploads/               # Uploaded images (auto-created)
│   ├── .env.example
│   └── package.json
│
└── frontend/                 # React + Vite
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx            # Routes setup
    │   ├── index.css          # Global styles
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── services/
    │   │   └── api.js         # Axios API calls
    │   ├── components/
    │   │   └── layout/
    │   │       ├── DashboardLayout.jsx
    │   │       ├── Sidebar.jsx
    │   │       └── PageHeader.jsx
    │   └── pages/
    │       ├── LoginPage.jsx
    │       ├── RegisterPage.jsx
    │       ├── VerifyOTPPage.jsx
    │       ├── FeedPage.jsx
    │       ├── MyTasksPage.jsx
    │       ├── RequestsPage.jsx
    │       ├── MyRequestsPage.jsx
    │       ├── AddTaskPage.jsx
    │       └── SettingsPage.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, React Router v6, Vite   |
| Styling    | Pure CSS (custom, no framework)   |
| HTTP       | Axios                             |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB + Mongoose                |
| Auth       | JWT (jsonwebtoken), bcryptjs      |
| Email/OTP  | Nodemailer (Gmail)                |
| Uploads    | Multer                            |
| Toasts     | react-hot-toast                   |
| Icons      | lucide-react                      |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- Gmail account (for OTP emails)

---

### 1. Clone / Setup Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/hirehelper
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords → Generate one for "Mail".

```bash
npm install
npm run dev   # starts on http://localhost:5000
```

---

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev   # starts on http://localhost:5173
```

The Vite proxy forwards `/api` and `/uploads` to the backend automatically — no CORS issues in development.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| POST   | /api/auth/register        | Register new user    |
| POST   | /api/auth/login           | Login user           |
| POST   | /api/auth/verify-otp      | Verify OTP code      |
| POST   | /api/auth/resend-otp      | Resend OTP email     |
| GET    | /api/auth/me              | Get current user     |

### Tasks
| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| GET    | /api/tasks/feed           | Browse all tasks     |
| GET    | /api/tasks/my-tasks       | Get own tasks        |
| POST   | /api/tasks                | Create new task      |
| PUT    | /api/tasks/:id            | Update task          |
| DELETE | /api/tasks/:id            | Delete task          |

### Requests
| Method | Endpoint                       | Description               |
|--------|--------------------------------|---------------------------|
| POST   | /api/requests                  | Send a request            |
| GET    | /api/requests/received         | Get incoming requests     |
| GET    | /api/requests/my-requests      | Get my sent requests      |
| PUT    | /api/requests/:id/accept       | Accept a request          |
| PUT    | /api/requests/:id/reject       | Reject a request          |

### Notifications
| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| GET    | /api/notifications                | Get all notifications    |
| PUT    | /api/notifications/read-all       | Mark all read            |
| PUT    | /api/notifications/:id/read       | Mark one read            |

### Users
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| PUT    | /api/users/profile              | Update profile           |
| PUT    | /api/users/change-password      | Change password          |
| PUT    | /api/users/remove-picture       | Remove profile picture   |

---

## 🗄️ Database Schema (MongoDB)

### User
```js
{ first_name, last_name, email_id, phone_number, password (hashed),
  profile_picture, bio, is_verified, otp, otp_expires }
```

### Task
```js
{ user_id (→User), title, description, location, start_time,
  end_time, status, category, picture }
```

### Request
```js
{ task_id (→Task), requester_id (→User), message, status }
```

### AcceptedTask
```js
{ user_id (→User), task_id (→Task), status }
```

### Notification
```js
{ user_id (→User), body, is_read, type, reference_id }
```

---

## 🌟 Features

- ✅ Register / Login with JWT authentication
- ✅ Email OTP verification (6-digit with resend & countdown)
- ✅ Browse task feed (excludes own tasks, search by keyword)
- ✅ Post tasks with image upload, category, date/time
- ✅ Send requests with optional message
- ✅ Task owners accept/reject incoming requests
- ✅ Real-time-style notifications (polling every 30s)
- ✅ My Requests page to track request status
- ✅ Update profile picture, name, phone, bio
- ✅ Change password securely
- ✅ Responsive design (mobile hamburger menu)

---

## 🏗️ Production Build

```bash
# Frontend
cd frontend && npm run build

# Serve the dist/ folder with nginx or from Express:
# In backend/src/app.js, add:
# app.use(express.static(path.join(__dirname, '../../frontend/dist')));
```
