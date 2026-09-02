# Nexora HRMS – Frontend

## 📌 Project Overview

Nexora HRMS (Human Resource Management System) is a web-based application designed to streamline and digitalize HR operations within an organization.

This repository contains the **frontend application**, built using **Next.js and TypeScript**, which provides the user interface for managing employees, attendance, leave, training, welfare, and HR-related workflows.

The system is designed to support HR administrators, HR users, and employees through a structured, role-based interface.

---

## 🎯 Purpose of the System

The Nexora HRMS aims to:

- Centralize employee data management
- Automate HR workflows
- Improve transparency in attendance and leave tracking
- Digitally manage employee documents
- Support training and development processes
- Streamline welfare and approval workflows

---

## 👥 Target Users

The system supports multiple user roles:

- **HR Administrator** – Full access to manage employees and system settings
- **HR User** – Manage employee records, documents, attendance, and workflows
- **Employee** – View personal data, request leave, submit documents, and track requests

Access to features is controlled using role-based authorization.

---

## 🧩 Core Functional Modules

### 1️⃣ Employee Management
- Create, update, and manage employee profiles
- Track employee lifecycle events (transfers, resignations, terminations)
- Maintain structured employee records

### 2️⃣ Document Management
- Upload and manage employee documents
- Track document validity
- Maintain document version history
- Download and preview files

### 3️⃣ Attendance Management
- Record and monitor attendance
- View personal and team attendance
- Support attendance verification processes

### 4️⃣ Leave Management
- Submit and review leave requests
- Track leave balances
- Manage approvals and status updates
- Handle special leave categories

### 5️⃣ Training & Development
- Create training plans
- Assign employees to training programs
- Track attendance and confirmations
- Collect feedback

### 6️⃣ Welfare Management
- Submit welfare requests
- Multi-step certification and approval workflow
- Track request status

### 7️⃣ Reports & Analytics
- View HR-related reports
- Monitor employee statistics and trends

---

## 🛠️ Technology Stack

- **Framework:** Next.js (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Form Handling:** React Hook Form + Zod
- **Data Fetching:** TanStack Query
- **HTTP Client:** Axios

---

## 🏗️ Architecture Overview

The frontend communicates with a backend REST API to:

- Authenticate users
- Retrieve and update HR data
- Manage workflows
- Upload and retrieve documents
- Handle approval processes

The system follows a modular structure to ensure scalability and maintainability.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or v20+ recommended)
- **npm** or **yarn**

### Installation & Running Locally

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Nexora_HRMS_frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   
   The application will start on `http://localhost:3000`.
