# Digital Evaluation System 🎓

An AI-powered digital evaluation platform designed for modern academic institutions. This system streamlines the examination process by digitizing answer sheets, facilitating secure instructor grading, and utilizing advanced AI for automated preliminary evaluations and feedback.

## 🚀 Key Features

*   **Role-Based Access Control**: Secure, distinct portals for Administrators and Teachers.
*   **AI-Assisted Evaluation**: Automated preliminary grading and feedback generation for handwritten answer sheets.
*   **Digital Annotation**: Built-in canvas for teachers to add ticks, crosses, and comments directly onto digital answer sheets.
*   **Question Paper Management**: Upload and structure exam papers with dynamic question sections and max marks allocation.
*   **Real-time Dashboard**: Analytics and tracking for grading progress, pending sheets, and teacher assignments.

## 🛠️ Technology Stack

*   **Frontend**: React.js, Vite, TailwindCSS (Responsive UI)
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB Atlas (Mongoose ORM)
*   **Authentication**: JSON Web Tokens (JWT) & bcrypt
*   **AI Integration**: Google Gemini API & Grok API

---

## 🔑 Recruiter / Demo Access

To easily navigate and test the core functionalities of the platform, please use the following pre-configured demo credentials:

> [!TIP]
> **Admin Login** (Full system access, dashboard, and assignments)
> *   **Email**: `admin@gmail.com`
> *   **Password**: `admin123`

> [!TIP]
> **Teacher Login** (Grading portal, answer sheet evaluation)
> *   **Email**: `teacher@gmail.com`
> *   **Password**: `teacher@1234`

---

## 💻 Local Setup & Installation

### Prerequisites
*   Node.js (v16+)
*   MongoDB Atlas Account (or local MongoDB server)

### 1. Clone & Install
```bash
# Install dependencies for both Client and Server concurrently
npm run install:all
```

### 2. Environment Variables
Create a `.env` file inside the `Server` directory with the following variables:
```env
# MongoDB Connection
MONGODB_URI="your_mongodb_connection_string"

# Server Port
PORT=5001

# Authentication Secret
JWT_SECRET="your_secure_jwt_secret"

# AI Integration Keys
GEMINI_API_KEY="your_gemini_api_key"
GROK_API_KEY="your_grok_api_key"
```

### 3. Database Seeding (Optional)
To populate the database with the default Admin and Teacher demo accounts, run:
```bash
cd Server
node seed.js
```

### 4. Run the Application
Start both the React frontend and Node backend simultaneously:
```bash
# Run from the root directory
npm run dev
```

*   **Client** will run on `http://localhost:5174`
*   **Server** will run on `http://localhost:5001`

---
*Developed for efficient, transparent, and intelligent academic evaluation.*
