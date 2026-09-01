# 🚦 QueueLess — Smart Queue Management System

QueueLess is a modern **React + Vite-based smart queue management system** designed to reduce waiting time and improve the overall queue experience.

Instead of standing in long physical queues, users can **join a queue digitally, receive a token, track their position, and get an estimated waiting time**.

The system also provides an **admin dashboard** for managing queues, counters, bookings, and venue information.

---

## ✨ Features

### 👤 User Features

* 🎟️ Digital token generation
* 📊 Real-time queue position tracking
* ⏱️ Estimated waiting-time prediction
* 📅 Online booking
* 🏢 Venue and service selection
* 🔔 Queue status updates
* 📱 Responsive user interface

### 🛠️ Admin Features

* 📊 Admin dashboard
* 👥 Manage users and tokens
* 🎫 Manage queue entries
* 🏪 Manage venues and counters
* 📈 Monitor queue activity
* ⚙️ Manage booking information

### 🤖 Smart Waiting-Time Prediction

QueueLess includes an AI-based waiting-time prediction utility that considers factors such as:

* Number of people ahead
* Active counters
* Average service time
* Peak-time multiplier
* Priority/booking conditions

This helps users understand approximately **how long they may need to wait before receiving the service**.

---

## 🛠️ Tech Stack

| Technology             | Purpose                    |
| ---------------------- | -------------------------- |
| ⚛️ React               | Frontend development       |
| ⚡ Vite                 | Development and build tool |
| 🟨 JavaScript          | Programming language       |
| 🎨 CSS                 | UI styling                 |
| 📦 npm                 | Package management         |
| 🧹 Oxlint              | Code linting               |
| 🤖 JavaScript AI Logic | Waiting-time prediction    |

---

## 📋 Prerequisites

Before running QueueLess, make sure you have installed:

* **Node.js (LTS recommended)**
* **npm**
* **Git**

Check your versions:

```bash
node -v
npm -v
git --version
```

---

## 📥 Installation

Clone the QueueLess repository:

```bash
git clone https://github.com/harsehaj8532beaift24-crypto/Queue_less.git
```

Navigate into the project:

```bash
cd Queue_less
```

Install the required dependencies:

```bash
npm install
```

---

## ▶️ Run the Application

Start the development server:

```bash
npm run dev
```

Vite will provide a local URL, usually:

```text
http://localhost:5173
```

Open the URL in your browser.

---

## 🏗️ Production Build

To create an optimized production build:

```bash
npm run build
```

The production files will be generated inside:

```text
dist/
```

---

## 👀 Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

---

## 🧹 Linting

Run the project's linting configuration:

```bash
npm run lint
```

Oxlint helps identify potential issues and maintain cleaner code.

---

## 📁 Project Structure

```text
Queue_less/
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── Annu/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── BookingModal.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── TokenCard.jsx
│   │   │   ├── VenueCard.jsx
│   │   │   └── VenueModal.jsx
│   │   │
│   │   ├── data/
│   │   │   └── initialData.js
│   │   │
│   │   ├── utils/
│   │   │   ├── aiPredictor.js
│   │   │   └── storage.js
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   └── ...
│
├── assets/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── .gitignore
└── README.md
```

---

## 🔄 How QueueLess Works

```text
User
  │
  ▼
Select Venue / Service
  │
  ▼
Join Queue / Book Slot
  │
  ▼
Generate Digital Token
  │
  ▼
Calculate Estimated Waiting Time
  │
  ▼
Track Queue Position
  │
  ▼
Receive Service
```

---

## 🤖 Waiting-Time Prediction

QueueLess calculates an estimated waiting time using queue information.

A simplified representation is:

```text
Estimated Wait Time
        =
People Ahead
×
Average Service Time
÷
Active Counters
×
Peak-Time Multiplier
```

The system can dynamically adjust the estimate according to the current queue conditions.

---

## 🎯 Objective

The main objective of QueueLess is to:

* Reduce physical waiting lines
* Save users' time
* Improve queue transparency
* Help organizations manage queues efficiently
* Provide estimated waiting times
* Improve the overall customer experience

---

## 🌍 Potential Use Cases

QueueLess can be adapted for:

* 🏥 Hospitals and clinics
* 🏦 Banks
* 🎓 Universities and colleges
* 🏛️ Government offices
* 🍽️ Restaurants
* 🛍️ Retail stores
* 🎟️ Events and service centers

---

## 🚀 Future Improvements

Potential future enhancements include:

* 🤖 Advanced machine-learning-based prediction
* 📲 Mobile application
* 🔔 SMS and push notifications
* 🗺️ Multi-location queue management
* 📈 Advanced analytics and reports
* ☁️ Cloud-based backend
* 🔐 User authentication and role-based access
* 💳 Online payment integration
* 📊 Real-time organizational analytics

---

## 👩‍💻 Development

QueueLess is developed using modern web technologies with a focus on:

* Simple user experience
* Responsive design
* Scalable architecture
* Efficient queue management
* Smart waiting-time estimation

---

## Members
**Harsehaj**
**Avni**
**Anupriya**

---
**QueueLess — Join the queue digitally. Save your time.**
