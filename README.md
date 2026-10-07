# ConferenceDB — Academic Conference Paper Submission and Review System

> **College DBMS Project**  
> **Course:** Database Management Systems (DBMS)  
> **Institution:** Woxsen University  
> **Academic Year:** 2026–2027  
> **RDBMS:** MySQL (Database: `conferencedb`)  
> **Architecture:** Full-Stack Web Application (React + Vite + Tailwind CSS + Node.js Express REST API + MySQL)

---

## 📌 Project Overview

**ConferenceDB** is a full-stack, production-ready Database Management System built for managing academic conference workflows, including:
- **Author paper submissions** and metadata management.
- **Many-to-Many Author-Paper relationships** resolved through junction entities (`paper_author`).
- **Peer review workflows** with quantitative scoring (1–10) and qualitative feedback.
- **Decision recording** (Accept, Reject, Revise) with automatic paper status synchronization.
- **Interactive SQL Query Console** executing safe queries directly against MySQL.
- **Real-Time Dashboard** displaying live statistics retrieved from MySQL (no mock data).

---

## 🏗️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons | Responsive modern administrative dashboard |
| **Backend** | Node.js, Express.js | Modular REST API with parameterized queries |
| **Database** | MySQL 8.0+ / 9.x | Relational schema in Third Normal Form (3NF) |
| **Driver** | `mysql2/promise` | Connection pooling with error handling & transactions |

---

## 🗄️ Database Architecture & Relational Schema

The database consists of **10 normalized tables** enforcing primary keys, foreign keys, unique constraints, and referential integrity.

### Entity Relationship Structure
1. **`ROLE`**: `Role_ID` (PK), `Role_Name`, `Description`
2. **`AUTHOR`**: `Author_ID` (PK), `Name`, `Email` (UNIQUE), `Affiliation`
3. **`CONFERENCE`**: `Conference_ID` (PK), `Conference_Name`, `Start_Date`, `End_Date`, `Location`
4. **`REVIEWER`**: `Reviewer_ID` (PK), `Name`, `Email` (UNIQUE), `Expertise`, `Current_Load`
5. **`USER_ACCOUNT`**: `User_ID` (PK), `Username` (UNIQUE), `Password`, `Role_ID` (FK &rarr; `ROLE`)
6. **`PAPER`**: `Paper_ID` (PK), `Title`, `Abstract`, `Submission_Date`, `Status`, `Conference_ID` (FK &rarr; `CONFERENCE`)
7. **`PAPER_AUTHOR`** *(M:N Junction)*: `(Paper_ID, Author_ID)` (Composite PK & FKs)
8. **`REVIEW`**: `Review_ID` (PK), `Paper_ID` (FK &rarr; `PAPER`), `Reviewer_ID` (FK &rarr; `REVIEWER`), `Score`, `Comments`, `Review_Date`
9. **`DECISION`** *(1:1 Constraint)*: `Decision_ID` (PK), `Paper_ID` (UNIQUE FK &rarr; `PAPER`), `Outcome`, `Decision_Date`, `Remarks`
10. **`NOTIFICATION`**: `Notification_ID` (PK), `Author_ID` (FK &rarr; `AUTHOR`), `Paper_ID` (FK &rarr; `PAPER`), `Message`, `Notification_Date`, `Status`

---

## 🚀 Quick Start Guide

### 1. Database Setup
Ensure MySQL is running on `localhost:3306`.
Import the schema and initial seed data:
```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend Installation & Start
Navigate to `backend`:
```bash
cd backend
npm install
```
Configure `.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=conferencedb
```
Start the backend server:
```bash
npm start
# Server starts on http://localhost:5000
```

### 3. Frontend Installation & Start
Open a separate terminal and navigate to `frontend`:
```bash
cd frontend
npm install
npm run dev
# Frontend starts on http://127.0.0.1:3000
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Live MySQL connection status test |
| `GET` | `/api/dashboard/stats` | Real-time counts, status breakdowns & averages |
| `GET` | `/api/authors` | Retrieve all authors with paper counts |
| `POST` | `/api/authors` | Insert new author into MySQL |
| `DELETE` | `/api/authors/:id` | Delete author (with FK protection) |
| `GET` | `/api/papers` | Multi-table JOIN: papers, authors, conferences |
| `POST` | `/api/papers` | Transactional insert into `paper` & `paper_author` |
| `DELETE` | `/api/papers/:id` | Parameterized paper deletion |
| `GET` | `/api/reviewers` | Retrieve reviewers with completed review counts |
| `POST` | `/api/reviewers` | Insert new reviewer record |
| `DELETE` | `/api/reviewers/:id` | Delete reviewer record |
| `GET` | `/api/reviews` | Retrieve peer reviews joined with paper & reviewer |
| `POST` | `/api/reviews` | Submit a review with score validation (1–10) |
| `DELETE` | `/api/reviews/:id` | Delete peer review |
| `GET` | `/api/conferences` | Retrieve conferences with submission counts |
| `POST` | `/api/conferences` | Create new academic conference |
| `GET` | `/api/decisions` | Retrieve official paper decisions |
| `POST` | `/api/decisions` | Record decision & synchronize paper status |
| `GET` | `/api/query/presets` | Preloaded analytical demo queries |
| `POST` | `/api/query/execute` | Safe SQL query execution returning dynamic tables |

---

## 🎓 5-Minute College Viva Demonstration Script

During your presentation, use the integrated **Viva Demo Guide** in the top navigation:

1. **Step 1 (Dashboard):** Show live MySQL counters (`COUNT(*)` on authors, papers, reviewers, reviews).
2. **Step 2 (Authors):** Show existing author records stored in MySQL.
3. **Step 3 (Live INSERT):** Click `+ Add Author`, insert `Test Author`, `test@example.com`, `Woxsen University`.
4. **Step 4 (Verify UI & DB):** Show the newly created record instantly appearing in the table.
5. **Step 5 (Live DELETE):** Click Delete on `Test Author` and confirm deletion modal.
6. **Step 6 (Verify Persistence):** Click `Refresh` to prove permanent deletion from MySQL.
7. **Step 7 (Papers):** Explain many-to-many relationship resolution via `paper_author`.
8. **Step 8 (SQL Query Console):** Execute the Master Presentation Query:
   ```sql
   SELECT 
       p.Title AS Paper_Title,
       a.Name AS Author_Name,
       r.Score AS Review_Score,
       r.Comments AS Review_Comments,
       p.Status AS Paper_Status
   FROM paper p
   JOIN paper_author pa ON p.Paper_ID = pa.Paper_ID
   JOIN author a ON pa.Author_ID = a.Author_ID
   JOIN review r ON p.Paper_ID = r.Paper_ID
   ORDER BY p.Paper_ID;
   ```
9. **Step 9 (Results):** Display live execution time (ms), row count, and dynamic result set.

---

## 🔒 Security & Data Integrity
- **Prepared Statements / Parameterized Queries:** All user inputs are sanitized against SQL injection.
- **Safe Query Execution:** Web SQL console strictly permits `SELECT`, `SHOW`, `DESCRIBE` and prevents destructive DDL commands.
- **Relational Integrity:** Foreign key constraints prevent orphaned records and protect data consistency.
