# 🚗 Digital Insurance Claiming System

A mobile-first system that allows **Drivers** to report road accidents and submit insurance claims, while **Insurance Agents** can manage those claims efficiently.

---

## 🧩 Features

### 👤 Authentication (JWT-based)
- Role-based (Driver, Insurance Agent, Admin)
- Secure signup and login
- Password hashing (bcrypt)

### 🚘 Driver Module
- Dashboard with recent activity and claim status
- Report accident (upload photos, location via Google Maps API)
- Add other party & vehicle details
- Submit and track claim history
- View profile

### 🛡️ Insurance Agent Module *(in progress / future scope)*
- View assigned claims
- Approve, deny, or request more info
- Communicate with drivers

---

## 📁 Project Structure

insurance-system/
├── backend/ # Express.js + MongoDB backend
│ ├── models/ # User, Claim schemas
│ ├── routes/ # auth, claims, uploads, etc.
│ ├── controllers/
│ └── server.js
├── frontend/ # React Native Expo App
│ ├── navigation/
│ ├── screens/
│ ├── components/
│ ├── services/ # Axios API config
│ └── App.js


---

## ⚙️ Backend Setup

### 1. Navigate to backend folder:

cd backend

### 2. Install dependencies:
npm install

### 3. Create .env file:
PORT=5000
MONGO_URI=mongodb://localhost:27017/insuranceDB
JWT_SECRET=your_jwt_secret

### 4. Start backend server:
node server.js
You should see: Server running on http://localhost:5000

🌍 Expose Backend API (LocalTunnel or ngrok)
Using LocalTunnel:
npx localtunnel --port 5000

or with ngrok:
npx ngrok http 5000
You’ll get a public URL like:
https://gentle-shirts-invite.loca.lt

🔗 Update Frontend API Links
In frontend/services/api.js:

import axios from 'axios';

export default axios.create({
  baseURL: 'https://gentle-shirts-invite.loca.lt/api'  // Update this every time tunnel changes
});

Also update hardcoded axios.post(...) URLs in:

SignupScreen.js

LoginScreen.js

📱 Frontend Setup (React Native + Expo)
1. Navigate to frontend:
cd frontend

2. Install dependencies:
npm install
npx expo install

3. Start Expo:
npx expo start

Use Expo Go app on mobile to scan QR code.
Or open on emulator if set up.

🔐 Authentication Flow
POST /api/auth/signup → register with role (e.g. driver)

POST /api/auth/login → returns JWT

JWT stored in AsyncStorage and attached to Axios headers

🧪 Sample Flow (Driver)
Login

Dashboard loads

Recent claims and statuses

Click "Report an Incident"

Upload photo(s)

Auto-fetch location (Google Maps API)

Add description, date/time

Input other party & insurance details

Submit

Stored in MongoDB

Status: In Review

Check View Claims

Status history of all past reports


🧰 Technologies Used
Frontend: React Native (Expo), React Navigation, Axios

Backend: Node.js, Express.js, MongoDB, Mongoose

Auth: JWT, bcrypt

Maps API: Google Maps API (planned)

Dev Tools: LocalTunnel / Ngrok for exposing localhost

⚠️ Known Issues / Notes
Tunnel links expire every restart → update api.js, SignupScreen.js, LoginScreen.js.

No admin panel yet.

Role selection during signup is basic — future UI could improve.

Profile editing functionality can be added later.


🧑‍💻 Authors
Mathenge Gitahi 
Anise Kimani

