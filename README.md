# MaterCare – Maternal Healthcare Management System

MaterCare is a full-stack maternal healthcare platform designed to support expectant and new mothers through pregnancy tracking, appointment management, health monitoring, and baby care.

The application follows a lifecycle-based care model, separating prenatal and postnatal healthcare workflows to provide a more realistic and organized user experience.

---

# Features

## Pregnancy Phase

- Pregnancy tracking and trimester progress
- Symptom logging
- Medication management
- Prenatal test tracking
- Appointment scheduling
- Smart reminders for medications and appointments
- Doctor directory and hospital information

## Baby Care / Postnatal Phase

- Baby profile management
- Vaccination tracking
- Baby health monitoring
- Postnatal reminders
- Growth summary and baby health metrics

## General Features

- JWT-based authentication
- Dashboard with personalized healthcare overview
- Secure document upload and storage
- SMS reminder integration using Twilio
- Responsive full-stack web application

---

# Lifecycle-Based Care Flow

MaterCare separates maternal healthcare into distinct phases.

## Pregnancy Phase

Users can:

- track pregnancy progress
- manage appointments
- log symptoms
- track medications and prenatal tests

## Baby Care Phase

After pregnancy completion and baby onboarding:

- vaccination tracking becomes available
- baby health records are enabled
- postnatal care features are activated

The dashboard and navigation dynamically adapt based on the user's current healthcare stage.

---

# Tech Stack

## Frontend

- React
- React Router
- Axios
- CSS
- React Icons

## Backend

- Node.js
- Express.js
- MySQL
- JWT Authentication
- bcrypt
- Multer
- node-cron
- Twilio

---

# Project Structure

```bash
matercare/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── cron/
│   ├── scripts/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── api.js
│
└── database/
    ├── matercare.sql
    └── update_schema.sql
```

---

# Installation

## 1. Clone Repository

```bash
git clone https://github.com/arya-mishra-glitch/MaterCare.git
cd MaterCare
```

## 2. Setup Database

Create a MySQL database and import the schema:

```sql
CREATE DATABASE matercare;
```

Import:

```bash
database/matercare.sql
```

---

# Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=matercare
JWT_SECRET=your_secret_key
PORT=5000

TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number
```

Start backend server:

```bash
npm start
```

---

# Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on:

```text
http://localhost:3000
```

Backend runs on:

```text
http://localhost:5000
```

---

# Database Modules

The system includes relational modules for:

- User Management
- Pregnancy Profiles
- Baby Profiles
- Appointment Scheduling
- Doctor Availability
- Hospitals and Healthcare Providers
- Medications and Medication Records
- Symptoms and Health Tracking
- Medical Tests and Test Records
- Vaccination Tracking
- Reminder Scheduling
- Emergency Contacts
- Document Storage
- Audit Logs

---

# Database Tables

- user
- pregnancy_profile
- baby
- appointment
- doctor
- doctor_availability
- hospital
- medication
- medication_record
- reminder
- symptom_log
- medical_test
- test_record
- vaccination
- vaccination_record
- emergency_contact
- document
- audit_log

---

# Automated Reminder System

MaterCare includes scheduled reminder services using `node-cron` and Twilio SMS integration for:

- medication reminders
- appointment reminders
- vaccination reminders

---

# Security Features

- JWT-based authentication
- Password hashing using bcrypt
- Protected API routes
- Input validation
- Secure file uploads

---

# Future Improvements

- Mobile application
- Advanced health analytics
- Multi-language support
- Telemedicine integration
- AI-assisted health insights

---

# Contributors

Developed as a full-stack healthcare management project focused on maternal and postnatal care workflows.

---

# License

This project is licensed under the MIT License.
