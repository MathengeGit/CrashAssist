# 🚗 CrashAssist - Road Accident Assistance System

CrashAssist is a full-stack web platform designed to help **drivers** and **insurance companies** handle road accidents efficiently by simplifying reporting, evidence collection, communication, and claims processing — all through a modern and responsive interface.

---

## ✨ Features

### 🎯 For Drivers:
- Report road accidents in a few clicks
- Upload photos and videos of the scene
- Log accident details with GPS & timestamps
- Track history of submitted incidents

### 🛡️ For Insurers:
- View and process submitted reports
- Communicate with clients in real time
- Export case reports
- Manage and verify driver data

---

## 🧱 Tech Stack

### Frontend
- **React.js** + **React Router**
- **Tailwind CSS** (modern, responsive styling)
- **Heroicons** for UI icons

### Backend
- **Node.js** + **Express.js**
- **MongoDB** or Firebase (for storing reports)
- **Multer** (if handling file uploads)

---

## 🚀 Installation & Running Locally

### 1. Clone the Repository

```bash
git clone https://github.com/MathengeGit/road-assist-project.git
cd crash-assist-project

2. Frontend Setup:
cd frontend
npm install
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
npm run dev   # or npm start if using CRA

3. Backend Setup:
cd backend
npm install
node app.js   # or nodemon app.js if installed

🔧 Project Structure: 
crash-assist-project/
├── frontend/          # React + Tailwind UI
├── backend/           # Express API
├── README.md

🌈 Design Philosophy
Minimalist + user-first layout

Clear CTAs for reporting and reviewing incidents

Fast loading and mobile-first design

