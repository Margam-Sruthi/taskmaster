# Team Task Manager

A full-stack project management application with role-based access control, allowing teams to collaborate, track projects, and assign tasks.

## 🚀 Features

* **Role-Based Access Control**:
  * **Admin**: Complete control over projects, tasks, and users.
  * **Member**: View assigned tasks, manage task status.
* **Authentication**: JWT-based secure authentication.
* **Dashboard**: Real-time overview of tasks, completed/pending/overdue metrics.
* **Project Management**: Create, edit, and delete projects.
* **Task Management**: Create tasks, assign them to members, set due dates, and update statuses.
* **Modern UI**: Clean, responsive, and glassmorphic UI built with Tailwind CSS.

## 💻 Tech Stack

* **Frontend**: React, Vite, Tailwind CSS, React Router, Axios, Lucide React
* **Backend**: Node.js, Express.js, Mongoose, JSON Web Tokens (JWT), bcryptjs
* **Database**: MongoDB (Atlas)

## 🛠️ Setup Instructions

### Prerequisites
* Node.js (v16+)
* MongoDB (local or Atlas cluster)

### 1. Backend Setup
1. Open terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the provided sample, ensuring you set:
   * `PORT=5000`
   * `MONGO_URI=your_mongodb_connection_string`
   * `JWT_SECRET=your_secret_key`
4. Start the server:
   ```bash
   node server.js
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` folder:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📡 API Documentation

### Auth Routes
* `POST /api/auth/register` - Create new user
* `POST /api/auth/login` - Authenticate user
* `GET /api/auth/me` - Get current user (Auth required)
* `GET /api/auth/users` - Get all users (Admin only)

### Project Routes
* `GET /api/projects` - Get all projects (Auth required)
* `POST /api/projects` - Create project (Admin only)
* `PUT /api/projects/:id` - Update project (Admin only)
* `DELETE /api/projects/:id` - Delete project (Admin only)

### Task Routes
* `GET /api/tasks` - Get all tasks (Auth required)
* `POST /api/tasks` - Create task (Admin only)
* `PUT /api/tasks/:id` - Update task (Admin/Assigned member)
* `DELETE /api/tasks/:id` - Delete task (Admin only)

### Dashboard Routes
* `GET /api/dashboard/stats` - Get metrics (Auth required)

## 🚀 Deployment Guide

### Database (MongoDB Atlas)
1. Create a free cluster on MongoDB Atlas.
2. Under "Database Access", create a new user with a password.
3. Under "Network Access", allow access from anywhere (`0.0.0.0/0`).
4. Copy the connection string and replace `<password>` with your user password.

### Backend (Railway / Render)
1. Create a new Web Service on Railway or Render, connected to your GitHub repository.
2. Set the root directory to `backend`.
3. Add Environment Variables:
   * `MONGO_URI`: Your MongoDB Atlas URI.
   * `JWT_SECRET`: A secure random string.
4. Deploy the service. Copy the live API URL.

### Frontend (Vercel / Netlify)
1. Import your repository into Vercel.
2. Set the Framework Preset to **Vite**.
3. Set the Root Directory to `frontend`.
4. Add Environment Variable:
   * `VITE_API_URL`: Your live Backend API URL (e.g., `https://my-backend.up.railway.app/api`).
5. Click **Deploy**.

---
*Built as a Full-Stack Engineering assessment project.*
