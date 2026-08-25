QueueLess -- Smart Virtual Queue Management System

QueueLess is a smart virtual queue management system built with React
and Vite. It helps users avoid long physical waiting lines by allowing
them to book queue tokens remotely and monitor their queue status in
real time.

The project also provides a Business Admin Dashboard where businesses
such as hospitals, banks, salons, government offices, and cafeterias can
manage counters, monitor tokens, and view queue analytics.

Features

Remote virtual token booking

Live queue monitoring

Business/Admin dashboard

Multiple venue/business support

Queue token management

Walk-in token support

Service counter management

AI-based waiting-time prediction

Local storage for application data

QR-code/token-oriented workflow

Responsive dark-themed UI

JavaScript and React syllabus showcase

Reusable React components

Technology Stack

React

Vite

JavaScript ES6+

HTML5

CSS3

React Hooks

LocalStorage

AI waiting-time prediction utility

QR-code related functionality

Node.js and npm

Project Structure

QueueLess/
│
├── node_modules/
│
├── public/
│
├── queue_less/
│
├── src/
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   │
│   ├── components/
│   │   ├── AdminDashboard.jsx
│   │   ├── BookingModal.jsx
│   │   ├── Footer.jsx
│   │   ├── JSShowcaseModal.jsx
│   │   ├── Navbar.jsx
│   │   ├── TokenCard.jsx
│   │   ├── VenueCard.jsx
│   │   └── VenueModal.jsx
│   │
│   ├── data/
│   │   └── initialData.js
│   │
│   ├── utils/
│   │   ├── aiPredictor.js
│   │   └── storage.js
│   │
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── .oxlintrc.json
├── index.html
├── package-lock.json
├── package.json
├── README.md
└── vite.config.js

File Documentation

1. src/components/AdminDashboard.jsx

This is the main component for the Business Admin Dashboard.

Responsibilities

Displays the Business Admin Portal

Displays business/venue selection

Shows queue statistics

Shows served-today count

Shows currently waiting tokens

Shows average waiting time

Shows business efficiency score

Controls active service counters

Displays the Live Queue Monitor

Provides the Call Next Token functionality

Provides the Add Walk-in Token functionality

Displays token status and priority information

Main Dashboard Sections

Business Admin Portal
        ↓
Queue Control & Business Analytics
        ↓
Business Selector
        ↓
Statistics Cards
        ↓
Active Service Counter Management
        ↓
Live Queue Monitor
        ↓
Queue Token

This file is the primary file responsible for reproducing the Business
Dashboard shown in the project UI.

2. src/components/Navbar.jsx

Creates the main QueueLess navigation bar.

Responsibilities

Displays QueueLess branding

Provides navigation to Explore Venues

Provides My Virtual Tokens navigation

Provides Business Portal navigation

Displays notification controls

Provides theme/UI controls

Maintains consistent navigation across pages

3. src/components/BookingModal.jsx

Provides the booking interface for creating a virtual queue token.

Responsibilities

Opens booking form

Accepts customer booking information

Allows users to select a service/venue

Creates or prepares a queue token

Handles booking confirmation

Connects booking information with application state/storage

4. src/components/Footer.jsx

Creates the QueueLess footer.

Responsibilities

Displays QueueLess description

Displays project features

Displays technology stack

Displays JavaScript syllabus topics

Displays project copyright information

Provides a consistent footer across the application

The footer also highlights the technologies used in the project, such as
React, Vite, JavaScript ES6+, HTML5, CSS3, LocalStorage, and QR-code
functionality.

5. src/components/JSShowcaseModal.jsx

Provides a showcase of JavaScript concepts used in the project.

Purpose

This component can be used to demonstrate JavaScript syllabus concepts
through the QueueLess project.

Concepts demonstrated

Variables

Functions

Arrays

Objects

Array methods

ES6+ syntax

Conditional statements

Event handling

DOM/application interactions

LocalStorage

React state-related JavaScript concepts

6. src/components/TokenCard.jsx

Displays an individual queue token.

Responsibilities

Shows token number

Shows customer name

Shows service type

Shows booking time

Shows priority

Shows queue status

Provides token-related actions where required

Example

QL-OPD-104
General OPD
Priority: Senior Citizen
Rahul Sharma
WAITING
No-Show

This component is reusable for different queue tokens.

7. src/components/VenueCard.jsx

Displays information about a QueueLess venue/business.

Example venues

Apollo Hospital

National Bank

Urban Salon & Spa

Passport Govt Office

Campus Cafeteria

Responsibilities

Displays venue name

Displays venue information

Provides actions for viewing or booking

Connects venue information to the booking flow

8. src/components/VenueModal.jsx

Displays detailed information about a selected venue.

Responsibilities

Shows venue details

Shows available services

Provides booking actions

Allows users to continue to the Booking Modal

Handles venue-specific information

Data Files

9. src/data/initialData.js

Contains the initial QueueLess application data.

Typical data includes

Venues

Services

Queue tokens

Customers

Business statistics

Counter information

Initial queue status

Example dashboard data

Served Today: 128
Currently Waiting: 8
Average Wait Time: 12 mins
Efficiency Score: 93%
Active Counters: 4

Keeping initial data in a separate file makes the React components
easier to maintain.

Utility Files

10. src/utils/aiPredictor.js

Contains the AI-based waiting-time prediction logic.

Purpose

The utility estimates how long a customer may have to wait based on
queue-related information.

Possible inputs

Number of people waiting

Number of active counters

Average service time

Current queue size

Service type

Queue priority

Output

A predicted waiting time can be displayed to the user or business
administrator.

11. src/utils/storage.js

Handles application data stored in the browser.

Responsibilities

Save queue information

Retrieve saved queue information

Update queue data

Remove stored data

Manage LocalStorage operations

Using a separate storage utility keeps browser storage logic away from
the UI components.

Main Application Files

12. src/App.jsx

This is the main React application component.

Responsibilities

Loads the main application UI

Connects pages/components

Controls application-level state where needed

Renders the appropriate QueueLess interface

Connects the Navbar, dashboard, venues, modals, and footer

The application entry flow is:

main.jsx
   ↓
App.jsx
   ↓
Navbar / Pages / Components
   ↓
QueueLess UI

13. src/main.jsx

This is the React entry point.

Responsibilities

Imports React

Imports the root application component

Imports global CSS

Creates the React root

Renders <App /> into the HTML root element

This file starts the React application.

14. src/App.css

Contains component and application-specific styling.

Responsibilities

Dashboard layout

Cards

Buttons

Navigation

Queue cards

Statistics cards

Business selector

Counter controls

Modals

Footer

Responsive layouts

Hover effects

Borders

Shadows

Spacing

Dark dashboard theme

For the Business Admin Dashboard screenshot, this is one of the most
important styling files.

15. src/index.css

Contains global CSS.

Responsibilities

Global font

Body styling

Page background

CSS reset

Box sizing

Global text behavior

General application defaults

index.css should contain styles that apply to the entire application,
while App.css should contain QueueLess-specific component styling.

Configuration Files

16. index.html

The main HTML document used by Vite.

Responsibilities

Provides the HTML structure

Contains the root element where React is rendered

Loads the React application through main.jsx

The important element is:

<div id="root"></div>

17. package.json

Contains project metadata, dependencies, and npm scripts.

Common scripts

npm install
npm run dev
npm run build
npm run preview

Purpose

It defines the libraries required by QueueLess and the commands used to
run the application.

18. package-lock.json

Locks the exact dependency versions installed for the project.

Purpose

Keeps installations consistent

Records dependency versions

Helps team members install the same dependency tree

This file should normally be committed to GitHub.

19. vite.config.js

Contains Vite configuration.

Purpose

Configures the Vite development environment

Controls build behavior

Provides configuration for the React project

20. .gitignore

Specifies files and folders that should not be committed to GitHub.

Usually ignored

node_modules/
dist/
.env

Sensitive environment variables and generated files should not be
committed.

21. .oxlintrc.json

Contains Oxlint configuration for JavaScript/React code quality checks.

Purpose

Helps detect coding problems

Maintains consistent code quality

Provides linting rules for the project

22. README.md

This file.

It contains the complete project documentation, setup instructions,
project structure, file descriptions, features, and technology stack.

How to Run QueueLess

Step 1: Open the project

Open the QueueLess folder in VS Code.

Step 2: Install dependencies

npm install

Step 3: Start the development server

npm run dev

Vite will provide a local development URL in the terminal.

Open that URL in your browser.

Build the Project

To create a production build:

npm run build

To preview the production build:

npm run preview

Business Admin Dashboard

The Business Admin Dashboard is designed for organizations that manage
queues.

Supported example venues

Apollo Hospital
National Bank
Urban Salon & Spa
Passport Govt Office
Campus Cafeteria

Dashboard metrics

Served Today
Currently Waiting
Average Wait Time
Efficiency Score

Queue management

The administrator can monitor:

Active counters

Waiting customers

Queue tokens

Customer priority

Token status

Walk-in tokens

Next customer in line

QueueLess Workflow

User
  ↓
Explore Venue
  ↓
Select Service
  ↓
Book Virtual Token
  ↓
Receive Token
  ↓
Monitor Queue
  ↓
AI Waiting-Time Prediction
  ↓
Receive Turn Notification
  ↓
Visit Service Counter
  ↓
Token Served

Business Admin Workflow

Business Admin
      ↓
Business Portal
      ↓
Select Business
      ↓
View Analytics
      ↓
Manage Active Counters
      ↓
Monitor Live Queue
      ↓
Call Next Token
      ↓
Serve Customer
      ↓
Update Queue

JavaScript Concepts Used

QueueLess can be used to demonstrate the following JavaScript topics:

Variables

let, const

Functions

Arrow functions

Arrays

Objects

Array methods

Destructuring

Spread operator

Template literals

Conditional statements

Loops

Event handling

ES6+ syntax

LocalStorage

JSON

Modules

Asynchronous JavaScript where required

React Concepts Used

Functional components

Props

State

useState

useEffect

Component reuse

Conditional rendering

Event handling

Data-driven UI

Component composition

Team Development

For team development, divide the project according to components instead
of having multiple people edit the same file at the same time.

Example:

Developer 1
├── AdminDashboard.jsx
└── initialData.js

Developer 2
├── Navbar.jsx
├── Footer.jsx
└── TokenCard.jsx

Developer 3
├── VenueCard.jsx
├── VenueModal.jsx
├── BookingModal.jsx
└── JSShowcaseModal.jsx

Shared files such as App.jsx, App.css, and index.css should be
changed carefully and merged through Git.

Git Commands

Clone the repository:

git clone <repository-url>

Check the current branch:

git branch

Create a feature branch:

git checkout -b feature/admin-dashboard

Check changes:

git status

Add files:

git add .

Commit:

git commit -m "Create QueueLess business admin dashboard"

Push the branch:

git push origin feature/admin-dashboard

After review, merge the feature branch into the main branch.

Important Notes

Do not commit node_modules.

Do not commit .env files containing secrets.

Run npm install after cloning the project.

Keep reusable UI elements inside src/components.

Keep initial/static data inside src/data.

Keep helper logic inside src/utils.

Keep global styling inside index.css.

Keep application-specific styling inside App.css.

Test the application with npm run dev before pushing changes.

QueueLess Goal

QueueLess aims to reduce physical waiting times by providing a digital
queue experience.

The system connects customers and businesses through:

Virtual Tokens + Live Queue Monitoring + AI Waiting-Time Prediction +
Business Analytics

This improves customer convenience while helping businesses manage
service counters and customer flow more efficiently.



This project is developed as an academic/project implementation of a
smart virtual queue management system.
