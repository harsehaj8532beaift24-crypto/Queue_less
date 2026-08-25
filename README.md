# QueueLess – Smart Virtual Queue Management System

QueueLess is a **React + Vite** based virtual queue management system that helps users book queue tokens remotely, monitor queues, and reduce physical waiting time.

It also provides a **Business Admin Dashboard** for managing service counters, tokens, customers, and queue analytics.

## 🚀 Features

* 🎟️ Virtual token booking
* 📊 Business/Admin dashboard
* ⏱️ Live queue monitoring
* 🤖 AI-based waiting-time prediction
* 🏢 Multiple venues and services
* 🚶 Walk-in token management
* 💾 LocalStorage data management
* 📱 Responsive dark-themed UI
* ⚛️ Reusable React components
* 📚 JavaScript & React concept showcase

## 🛠️ Tech Stack

* React
* Vite
* JavaScript ES6+
* HTML5 & CSS3
* React Hooks
* LocalStorage
* Node.js & npm

## 📁 Project Structure

```text
src/
├── assets/
├── components/
│   ├── AdminDashboard.jsx
│   ├── BookingModal.jsx
│   ├── Footer.jsx
│   ├── JSShowcaseModal.jsx
│   ├── Navbar.jsx
│   ├── TokenCard.jsx
│   ├── VenueCard.jsx
│   └── VenueModal.jsx
├── data/
│   └── initialData.js
├── utils/
│   ├── aiPredictor.js
│   └── storage.js
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

## ⚙️ Installation

```bash
git clone <repository-url>
cd QueueLess
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## 🔄 How It Works

```text
User
 ↓
Select Venue & Service
 ↓
Book Virtual Token
 ↓
Monitor Queue
 ↓
AI Wait-Time Prediction
 ↓
Get Turn Notification
 ↓
Service Completed
```

### Business Admin

```text
Business Portal
 ↓
Select Business
 ↓
View Analytics
 ↓
Manage Counters
 ↓
Monitor Queue
 ↓
Call Next Token
```

## 📊 Dashboard

The Business Dashboard provides:

* Served Today
* Currently Waiting
* Average Wait Time
* Efficiency Score
* Active Service Counters
* Live Queue Monitor
* Token Priority & Status

## 👥 Team Development

* **Harsehaj:** Admin Dashboard & Data
* **Anupriya:** Navbar, Footer & Token Components
* **Avni:** Venue, Booking & JavaScript Showcase Components

## 🎯 Project Goal

QueueLess aims to make traditional queues **faster, smarter, and more convenient** by combining virtual tokens, live queue tracking, AI waiting-time prediction, and business analytics.

---

**QueueLess – Smart Virtual Queue Management System**
