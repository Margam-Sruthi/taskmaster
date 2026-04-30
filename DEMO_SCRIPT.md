# Team Task Manager - Demo Script

**Estimated Duration: 3-4 Minutes**

## 1. Introduction (30 seconds)
"Hello everyone, today I'll be demonstrating the Team Task Manager application. This is a full-stack MERN application built to help teams organize projects, assign tasks, and track their progress efficiently. 

It features a robust role-based access control system, ensuring that Admins have full management capabilities, while Members have focused access to the tasks assigned to them."

## 2. Authentication & Onboarding (45 seconds)
*(Show the Login/Register screens)*
"Starting at the authentication layer, the app uses JWT for secure, stateless sessions. Let's register a new user as a 'Member'. I'll fill in the details. Notice the clean, glassmorphic UI built with Tailwind CSS. 
Now, I'll log out and log back in as an 'Admin' so we can see the full capabilities of the platform."

## 3. The Dashboard (30 seconds)
*(Navigate to the Dashboard)*
"Upon logging in as an Admin, we land on the Dashboard. This provides a real-time overview of our operations. We can see the total number of tasks, projects, and users, along with a breakdown of task statuses—how many are in progress, completed, or overdue. 
If I were logged in as a Member, this dashboard would be personalized to only show stats relevant to my assigned tasks."

## 4. Project Management (45 seconds)
*(Navigate to the Projects tab)*
"Moving over to the Projects tab, Admins can create new projects, edit existing ones, or delete them. Let's create a new project called 'Website Redesign'. 
*(Create project)*
As you can see, the UI is highly responsive. We use Axios under the hood to communicate with our Express backend, ensuring smooth RESTful operations. The backend handles the validation and securely saves this to our MongoDB database."

## 5. Task Management (45 seconds)
*(Navigate to the Tasks tab)*
"Now for the core feature: Tasks. Here we can see all tasks across our projects. Let's create a new task under our 'Website Redesign' project. I can assign it directly to a team member and set a due date.
*(Create task)*
The task is now visible in the data table. If a Member logs in, they can view this task, and they have permission to update its status—say, from 'Pending' to 'In Progress'. However, they cannot delete the task or change its assignment. This logic is strictly enforced by custom authorization middleware on our Node.js server."

## 6. Closing & Tech Stack Recap (30 seconds)
"To wrap up, the application is built using React with Vite for a lightning-fast frontend, styled with Tailwind CSS. The backend runs on Node.js and Express, securely connecting to a MongoDB Atlas cluster. 
The backend is deployed on Railway, and the frontend is hosted on Vercel, complete with environment variables mapped to keep our secrets secure.
Thank you for watching the demo!"
