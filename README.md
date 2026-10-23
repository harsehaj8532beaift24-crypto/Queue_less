# 🚦 QueueLess — Smart Queue Management System
> **Full-Stack MERN Application | Node.js • Express.js • MongoDB Atlas • Socket.IO • React 19 • Vite**  
> *Coursework Project: Back End Engineering & Advanced Web Development*

---

## 📌 1. Project Overview

### ⚠️ The Problem
In modern urban facilities—hospitals, banks, salons, government citizen centers, and university cafeterias—customers waste hours standing in physical waiting lines. Physical queues introduce friction:
* Lack of transparency on queue progress and turn arrival.
* Crowded lobbies leading to frustration, health risks, and wasted time.
* Operational bottlenecks for businesses managing staff and service counters.

### 💡 The Solution
**QueueLess** is an intelligent virtual queue management platform that enables users to **join queues remotely**, receive **instant encrypted digital tokens**, track their **live position in real time**, receive **AI-driven waiting time predictions**, and check in seamlessly using **cryptographic QR codes**.

Businesses gain access to an **Admin Portal** to call tokens, dynamically adjust service counters, verify QR tokens, and inspect **real database analytics** calculated directly through MongoDB aggregation pipelines.

---

## 🏗️ 2. System Architecture

```text
                                    ┌────────────────────────────────────────────────────────┐
                                    │                     QueueLess UI                       │
                                    │        React 19 • Vite • Glassmorphism CSS             │
                                    └───────────────┬────────────────────────┬───────────────┘
                                                    │                        │
                                  REST Requests (JSON / JWT)      WebSocket Events (Bi-directional)
                                                    │                        │
                                                    ▼                        ▼
                                    ┌────────────────────────────────────────────────────────┐
                                    │                Express & Socket.IO Server              │
                                    │             (Node.js 24 • Port 5000)                   │
                                    └───────┬─────────────────┬──────────────────────┬───────┘
                                            │                 │                      │
                                            ▼                 ▼                      ▼
                                     ┌─────────────┐   ┌─────────────┐        ┌─────────────┐
                                     │ Auth (JWT)  │   │ Queue Engine│        │ AI Predictor│
                                     │  & RBAC     │   │  (Atomic)   │        │   Engine    │
                                     └──────┬──────┘   └──────┬──────┘        └──────┬──────┘
                                            │                 │                      │
                                            └──────────────┐  │  ┌───────────────────┘
                                                           ▼  ▼  ▼
                                    ┌────────────────────────────────────────────────────────┐
                                    │                   MongoDB Atlas / Local                │
                                    │             Mongoose ODM • Persistent Storage          │
                                    │   [Users] [Businesses] [Queues] [Tokens] [Analytics]   │
                                    └────────────────────────────────────────────────────────┘
```

---

## 🛠️ 3. Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, JSX, Vite 8 | High-performance SPA with controlled forms, state hooks, and responsive glassmorphism design |
| **Icons & Styling** | Lucide React, Custom CSS | Tailored dark/light mode palette, glassmorphism, micro-animations |
| **Backend** | Node.js 24, Express.js 4 | REST API routing, request validation, centralized error handling |
| **Database** | MongoDB Atlas / Local MongoDB 7+ | Document storage, indexes, atomic updates, aggregation pipelines |
| **ODM** | Mongoose 8 | Schema definitions, validation, virtuals, and lifecycle hooks |
| **Authentication** | JWT (JSON Web Tokens) & bcryptjs | Secure salted password hashing and role-based access control (RBAC) |
| **Real-Time** | Socket.IO 4 | WebSocket rooms for live queue positions, counter updates, and notifications |
| **QR Code Verification**| QRCode | Cryptographic verification payload generation and staff authenticity scanning |

---

## ✨ 4. Core Features

### 👤 Customer Features
* 🔍 **Service & Venue Discovery**: Search and filter hospitals, banks, salons, government offices, and cafeterias.
* 🎟️ **Remote Queue Booking**: Join virtual queues instantly without being physically present.
* 🤖 **Data-Driven AI Wait-Time Prediction**: Dynamic predictions based on eligible people ahead, historical durations from MongoDB, active counters, and peak multipliers.
* 📱 **Digital Token Ticket**: Unique token format (e.g., `QL-OPD-101`) with live position and people-ahead counter.
* 🔐 **Cryptographic QR Code**: Encrypted token check-in payload for physical desk verification.
* 🔔 **Real-Time Turn Alerts**: Instant notification and visual confetti when called to the desk counter.
* ⏱️ **Queue Flexibility**: Option to delay turn ("Push Back +10m") or cancel token.

### 🛠️ Staff & Business Admin Features
* 📊 **Desk Queue Control**: Real-time queue view showing waiting, calling, and serving customers.
* 📢 **Call Next Token**: Advances queue with atomic re-indexing and push notification dispatch.
* 👥 **Desk Walk-in Booking**: Generate on-the-spot tokens for physical visitors.
* 🎛️ **Counter Scaling**: Increment/decrement active service counters in real-time.
* 🔍 **QR Code Verification Scanner**: Instant staff validation of customer QR tickets to prevent fraud and ticket reuse.
* 📈 **Real Database Analytics**:
  * Total tokens issued (historical + active)
  * Current queue length and active service counters
  * Actual measured average wait time and service duration
  * Hourly customer traffic distribution bar chart aggregated from MongoDB records
  * Counter efficiency score percentage

---

## 📋 5. Prerequisites

* **Node.js**: v18.0.0 or higher (`v24+` recommended)
* **npm**: v9.0.0 or higher
* **MongoDB**: Either a local MongoDB instance running on port 27017 or a free cloud cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

Verify your environment:
```bash
node -v
npm -v
```

---

## 🚀 6. Installation & Quick Start

### Step 1: Install Dependencies

1. **Frontend dependencies**:
   ```bash
   npm install
   ```

2. **Backend dependencies**:
   ```bash
   cd server
   npm install
   cd ..
   ```

---

### Step 2: Environment Configuration

Copy the example environment file in `server/`:
```bash
cp server/.env.example server/.env
```

Default configuration in `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/queueless
JWT_SECRET=queueless_super_secret_jwt_key_2026_dev_secure_token
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

#### 🌐 Connecting to MongoDB Atlas (Cloud)
To connect to MongoDB Atlas instead of local MongoDB:
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Create a cluster (M0 Free Tier).
3. Under **Database Access**, create a database user with password.
4. Under **Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere).
5. Click **Connect** -> **Connect your application** -> Copy the connection URI.
6. Replace `MONGODB_URI` in `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/queueless?retryWrites=true&w=majority
   ```

---

### Step 3: Seed Database with Demo Records

Initialize demo users, businesses, departments, queues, and analytics history:
```bash
npm run server:seed
```
*Or from the server folder:*
```bash
node server/seed/seed.js
```

Demo Accounts created:
| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@queueless.com` | `password123` | Remote booking, live token wallet |
| **Staff** | `staff@queueless.com` | `password123` | Desk queue management, call next, QR verifier |
| **Admin** | `admin@queueless.com` | `password123` | Full controls, venue management, analytics |

---

### Step 4: Run the Application

You can run both backend and frontend simultaneously:

**Terminal 1 (Backend Server on Port 5000):**
```bash
npm run dev:server
```
*(Starts Express and Socket.IO on `http://localhost:5000`)*

**Terminal 2 (Frontend Client on Port 5173):**
```bash
npm run dev:client
```
*(Starts Vite development server on `http://localhost:5173`)*

Open your browser at:
```text
http://localhost:5173
```

---

## 🧪 7. Automated Testing & Verification

QueueLess includes a built-in automated test suite verifying all 8 core subsystems:
* MongoDB connection & persistence
* bcrypt password hashing & JWT verification
* Business and service retrieval
* **Atomic queue booking & concurrency race-condition prevention**
* State transitions (`waiting` -> `calling` -> `serving` -> `completed`)
* Cryptographic QR code verification & counterfeit rejection
* Data-driven AI wait-time prediction
* MongoDB aggregation analytics pipeline

Run the test suite:
```bash
npm run server:test
```

**Verification Results:**
```text
======================================================
🧪 Starting QueueLess Backend Automated Verification Test
======================================================
Test 1: MongoDB Database Connection
  ✅ PASS: MongoDB connection is open and active
Test 2: Password Hashing & JWT Verification
  ✅ PASS: Customer demo account exists in database
  ✅ PASS: Password is stored as a secure bcrypt hash
  ✅ PASS: bcrypt compare verifies valid password correctly
  ✅ PASS: bcrypt compare rejects invalid password
  ✅ PASS: JWT encodes and verifies payload securely
Test 3: Business & Service Models
  ✅ PASS: Retrieved 5 businesses from MongoDB
  ✅ PASS: Apollo Hospital found with category "hospital"
  ✅ PASS: Found 4 services for Apollo Hospital
Test 4: Atomic Queue Booking & Concurrency Protection
  ✅ PASS: Found active queue: General OPD Queue
  ✅ PASS: All 3 concurrent booking requests succeeded
  ✅ PASS: All allocated token numbers are unique: QL-OPD-101, QL-OPD-102, QL-OPD-103
  ✅ PASS: Queue tokenSequence incremented atomically
Test 5: Token State Transition & Queue Advancement
  ✅ PASS: Initial token status is "waiting"
  ✅ PASS: Called token status transitioned to "calling"
  ✅ PASS: calledAt timestamp is recorded
  ✅ PASS: Token status transitioned to "serving"
  ✅ PASS: serviceStartedAt timestamp is recorded
  ✅ PASS: Token status transitioned to "completed"
  ✅ PASS: completedAt timestamp is recorded
  ✅ PASS: ServiceHistory record successfully created for completed token
  ✅ PASS: Recorded serviceDurationMins: 1
Test 6: QR Code Verification
  ✅ PASS: Token has a secure cryptographic qrTokenHash
  ✅ PASS: QR hash successfully resolves to genuine token in MongoDB
  ✅ PASS: Counterfeit QR hash is properly rejected
Test 7: AI Waiting Time Prediction Engine
  ✅ PASS: Estimated wait time calculated: 23 mins
  ✅ PASS: Confidence score: 91%
  ✅ PASS: Smart arrival tip generated
Test 8: Database Aggregation Analytics
  ✅ PASS: MongoDB aggregation pipeline executed successfully
  ✅ PASS: Aggregated 61 historical records
======================================================
📊 Test Results: 30 Passed, 0 Failed
======================================================
```

---

## 📡 8. REST API Documentation

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a new account (`name`, `email`, `password`, `role`, `phone`).
* `POST /api/auth/login` — Sign in with credentials, returns JWT token and sanitized user profile.
* `GET /api/auth/me` — *(Protected)* Get currently authenticated user from JWT.
* `GET /api/auth/demo-accounts` — Retrieve demo login credentials for evaluators.

### Businesses & Venues (`/api/businesses`)
* `GET /api/businesses` — Get all businesses with populated departments, active counters, and live queue lengths. Supports `?category=` and `?search=` query filters.
* `GET /api/businesses/:id` — Get single business with services and queues.
* `POST /api/businesses` — *(Admin only)* Create new business.
* `PATCH /api/businesses/:id` — *(Admin/Staff)* Update business details.

### Queues (`/api/queues`)
* `GET /api/queues?businessId=` — Retrieve queues.
* `GET /api/queues/:queueId/status` — Get active tokens and waiting count for a queue.
* `POST /api/queues/:queueId/join` — **Atomic queue booking**. Creates a token, computes initial wait time, and broadcasts live update.
* `POST /api/queues/:queueId/next` — *(Staff/Admin)* Call next token in line.
* `PATCH /api/queues/:queueId/counters` — *(Staff/Admin)* Dynamically adjust active service counters.

### Tokens (`/api/tokens`)
* `GET /api/tokens/my` — Get active and past tokens for current user.
* `GET /api/tokens/business/:businessId` — *(Staff/Admin)* View all tokens for a business.
* `GET /api/tokens/:tokenId` — Get detailed token document.
* `PATCH /api/tokens/:tokenId/cancel` — Cancel a token (authorized by owner or staff).
* `PATCH /api/tokens/:tokenId/pushback` — Delay token turn by +10 minutes.
* `PATCH /api/tokens/:tokenId/status` — *(Staff/Admin)* Update status to `serving`, `completed`, or `cancelled`.
* `POST /api/tokens/verify-qr` — Staff QR verification endpoint validating token authenticity and eligibility.

### Analytics (`/api/analytics`)
* `GET /api/analytics/overview?businessId=` — Real database aggregated metrics: total issued, currently waiting, average wait time, average service duration, efficiency score, and hourly traffic distribution.

### Notifications (`/api/notifications`)
* `GET /api/notifications/my` — Fetch recent in-app notifications.
* `DELETE /api/notifications/clear` — Clear notifications.

---

## 🔒 9. Security & Concurrency Design

### 1. Concurrency-Safe Atomic Token Allocation
A critical challenge in queue management is **race conditions**: when multiple users book at the same millisecond, naive systems assign duplicate token numbers.
QueueLess solves this using MongoDB atomic operators:
```javascript
const queue = await Queue.findOneAndUpdate(
  { _id: queueId, status: 'active' },
  { $inc: { tokenSequence: 1 } },
  { new: true }
);
```
Furthermore, the `Token` schema enforces a **compound unique index**:
```javascript
tokenSchema.index({ queue: 1, sequenceNumber: 1 }, { unique: true });
```
This guarantees mathematical uniqueness even under heavy parallel load.

### 2. State Transition Integrity
Token status follows a strict state-machine flow:
`waiting` ➔ `calling` ➔ `serving` ➔ `completed` (or `cancelled`).
Customers cannot mark their own tokens as served or advance the queue; all sensitive transitions require server-side authorization.

### 3. Password Security & Sanitization
* Passwords are never stored in plain text. Salted hashes are generated using `bcryptjs` with 10 rounds.
* The `User.toJSON()` method automatically deletes `passwordHash` before sending any response.
* Database models set `passwordHash: { select: false }` to prevent accidental inclusion.

### 4. Cryptographic QR Verification
QR codes do not contain sensitive account credentials or reusable JWTs. Instead, each token generates a unique 32-character cryptographic random hash (`qrTokenHash`). The verification scanner queries the database via an indexed lookup to confirm token validity, business ownership, and service eligibility.

---

## 🤖 10. AI Waiting-Time Prediction Model

QueueLess features a data-driven prediction engine that separates measured queue velocity from static assumptions:

$$\text{Estimated Wait Time} = \frac{\text{Eligible People Ahead} \times \text{Average Service Duration}}{\text{Active Service Counters}} \times \text{Peak Multiplier} \times \text{Party Factor} \times \text{Priority Factor}$$

* **Data-Driven Duration**: The prediction engine queries recent completed durations from the `ServiceHistory` collection in MongoDB. If historical records exist, it calculates the actual observed average.
* **Cold-Start Fallback**: If fewer than 3 records exist, it falls back gracefully to the service's default baseline duration (`averageServiceMinutes`).
* **Active Counter Factor**: Dynamic divisor based on currently staffed desk counters.
* **Confidence Metric**: Calculates an AI confidence percentage based on sample volume and queue stability.

---

## 🎓 11. Coursework Syllabus-to-Code Mapping

This project serves as coursework evidence for Back End Engineering. Below is a mapping of core syllabus topics to their exact implementation in the codebase:

| Syllabus Topic | Concepts Demonstrated | Code File & Symbol Reference |
| :--- | :--- | :--- |
| **JavaScript Core** | `const`/`let`, destructuring, spread, template literals | [server/services/queueService.js](file:///server/services/queueService.js#L20-L80) |
| **Higher-Order Functions** | `map`, `filter`, `reduce`, `find`, `some` | [server/controllers/businessController.js](file:///server/controllers/businessController.js#L40-L75), [server/services/predictionService.js](file:///server/services/predictionService.js#L40-L55) |
| **Asynchronous JS** | `Promises`, `async`/`await`, non-blocking I/O | [server/config/db.js](file:///server/config/db.js#L10-L45), [Annu/src/api/client.js](file:///Annu/src/api/client.js#L15-L35) |
| **Node.js Architecture** | HTTP module, event loop, process signals (`SIGINT`/`SIGTERM`) | [server/server.js](file:///server/server.js#L60-L100) |
| **Environment Variables** | `dotenv`, process.env, secure defaults | [server/server.js](file:///server/server.js#L20-L30), [server/.env.example](file:///server/.env.example) |
| **Express.js Routing** | Modular routers, middleware chaining, route parameters | [server/routes/queueRoutes.js](file:///server/routes/queueRoutes.js), [server/routes/tokenRoutes.js](file:///server/routes/tokenRoutes.js) |
| **Middleware & Error Handling** | Centralized error handler, Mongoose error normalization | [server/middleware/errorHandler.js](file:///server/middleware/errorHandler.js#L6-L45) |
| **Authentication & RBAC** | `bcryptjs` hashing, `jsonwebtoken`, Bearer authorization | [server/middleware/auth.js](file:///server/middleware/auth.js#L8-L60), [server/controllers/authController.js](file:///server/controllers/authController.js) |
| **MongoDB Atlas & Mongoose** | Schemas, validations, compound unique indexes, timestamps | [server/models/Token.js](file:///server/models/Token.js), [server/models/Business.js](file:///server/models/Business.js) |
| **Database Concurrency** | Atomic `findOneAndUpdate` sequence increment | [server/services/queueService.js](file:///server/services/queueService.js#L25-L45) |
| **MongoDB Aggregation** | Multi-stage `$match`, `$group`, `$avg`, `$sort` pipelines | [server/controllers/analyticsController.js](file:///server/controllers/analyticsController.js#L25-L95) |
| **WebSockets (Socket.IO)** | Rooms (`queue:id`, `business:id`), bi-directional events | [server/services/socketService.js](file:///server/services/socketService.js#L10-L70) |
| **React 19 & State** | `useState`, `useEffect`, controlled forms, modular components | [Annu/src/App.jsx](file:///Annu/src/App.jsx), [Annu/src/components/AdminDashboard.jsx](file:///Annu/src/components/AdminDashboard.jsx) |

---

## 📁 12. Project Folder Structure

```text
Queue_less/
├── index.html                      # HTML entry point (fonts, title, theme)
├── package.json                    # Root package scripts (dev, build, test, seed)
├── vite.config.js                  # Vite bundler configuration
├── .gitignore                      # Safe ignore list (.env, node_modules, logs)
│
├── server/                         # Node.js + Express + MongoDB Backend
│   ├── config/
│   │   └── db.js                   # Mongoose connection & reconnection manager
│   ├── models/
│   │   ├── User.js                 # User schema with bcrypt & RBAC
│   │   ├── Business.js             # Business schema with text search & virtuals
│   │   ├── Service.js              # Service / department schema
│   │   ├── Queue.js                # Queue schema with counter scaling & sequence
│   │   ├── Token.js                # Token schema with compound unique index & QR hash
│   │   ├── Notification.js         # Real-time alert records
│   │   ├── ServiceHistory.js       # Persistent analytics & ML duration data
│   │   └── index.js                # Centralized model exports
│   ├── middleware/
│   │   ├── auth.js                 # JWT verification & requireRole middleware
│   │   └── errorHandler.js         # Centralized error handler
│   ├── services/
│   │   ├── predictionService.js    # Data-driven AI waiting time calculator
│   │   ├── queueService.js         # Atomic token booking & lifecycle transitions
│   │   └── socketService.js        # Socket.IO rooms & real-time broadcasts
│   ├── controllers/
│   │   ├── authController.js       # Register, login, me, demo accounts
│   │   ├── businessController.js   # Venue discovery & search
│   │   ├── serviceController.js    # Department management
│   │   ├── queueController.js      # Join, next, update counters
│   │   ├── tokenController.js      # User tokens, cancel, pushback, QR verify
│   │   ├── analyticsController.js  # MongoDB aggregation pipelines
│   │   └── notificationController.js # In-app notification management
│   ├── routes/                     # REST API routers
│   ├── seed/
│   │   └── seed.js                 # Demo data population script
│   ├── tests/
│   │   └── verify_system.js        # Automated verification test suite (30 tests)
│   ├── .env.example                # Template configuration
│   ├── .env                        # Local development environment configuration
│   ├── package.json                # Backend dependencies
│   └── server.js                   # HTTP server & Express application entry point
│
├── Annu/                           # React 19 Frontend
│   └── src/
│       ├── api/
│       │   └── client.js           # REST API client & Socket.IO factory
│       ├── components/
│       │   ├── Navbar.jsx          # Top bar with Live DB status & user profile
│       │   ├── AuthModal.jsx       # Register, login, and 1-click demo logins
│       │   ├── VenueCard.jsx       # Business card with live queue preview
│       │   ├── VenueModal.jsx      # Department selection dialog
│       │   ├── BookingModal.jsx    # Remote token booking with AI wait preview
│       │   ├── TokenCard.jsx       # Digital ticket with QR code & turn alerts
│       │   ├── AdminDashboard.jsx  # Desk controls, MongoDB analytics, QR scanner
│       │   ├── JSShowcaseModal.jsx # Coursework syllabus-to-code viewer
│       │   └── Footer.jsx          # Page footer
│       ├── data/
│       │   └── initialData.js      # Category metadata & fallback data
│       ├── utils/
│       │   ├── aiPredictor.js      # Client prediction utility
│       │   └── storage.js          # Resilient storage fallback
│       ├── App.jsx                 # Main application state & real-time listeners
│       ├── App.css                 # Application animations
│       ├── index.css               # Design system, CSS tokens, glassmorphism
│       └── main.jsx                # React root mount
│
└── dist/                           # Production optimized build output
```

---

## 👥 Contributors & Academic Credits
* **Harsehaj**
* **Avni**
* **Anupriya**

*QueueLess — Skip physical lines. Queue remotely from anywhere.*
