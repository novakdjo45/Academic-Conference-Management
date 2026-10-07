-- ============================================================
-- Academic Conference Paper Submission and Review System
-- Database Schema: conferencedb
-- Target RDBMS: MySQL 8.0+ / 9.x
-- ============================================================

CREATE DATABASE IF NOT EXISTS conferencedb;
USE conferencedb;

-- 1. ROLE
CREATE TABLE IF NOT EXISTS role (
  Role_ID INT PRIMARY KEY,
  Role_Name VARCHAR(50) NOT NULL,
  Description VARCHAR(255)
);

-- 2. AUTHOR
CREATE TABLE IF NOT EXISTS author (
  Author_ID INT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  Email VARCHAR(100) NOT NULL UNIQUE,
  Affiliation VARCHAR(150)
);

-- 3. CONFERENCE
CREATE TABLE IF NOT EXISTS conference (
  Conference_ID INT PRIMARY KEY,
  Conference_Name VARCHAR(150) NOT NULL,
  Start_Date DATE,
  End_Date DATE,
  Location VARCHAR(100)
);

-- 4. REVIEWER
CREATE TABLE IF NOT EXISTS reviewer (
  Reviewer_ID INT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  Email VARCHAR(100) NOT NULL UNIQUE,
  Expertise VARCHAR(150),
  Current_Load INT DEFAULT 0
);

-- 5. USER_ACCOUNT
CREATE TABLE IF NOT EXISTS user_account (
  User_ID INT PRIMARY KEY,
  Username VARCHAR(50) NOT NULL UNIQUE,
  Password VARCHAR(100) NOT NULL,
  Role_ID INT,
  FOREIGN KEY (Role_ID) REFERENCES role(Role_ID) ON DELETE SET NULL
);

-- 6. PAPER
CREATE TABLE IF NOT EXISTS paper (
  Paper_ID INT PRIMARY KEY,
  Title VARCHAR(200) NOT NULL,
  Abstract TEXT,
  Submission_Date DATE,
  Status VARCHAR(30) DEFAULT 'Under Review',
  Conference_ID INT,
  FOREIGN KEY (Conference_ID) REFERENCES conference(Conference_ID) ON DELETE SET NULL
);

-- 7. PAPER_AUTHOR (M:N Junction Table)
CREATE TABLE IF NOT EXISTS paper_author (
  Paper_ID INT,
  Author_ID INT,
  PRIMARY KEY (Paper_ID, Author_ID),
  FOREIGN KEY (Paper_ID) REFERENCES paper(Paper_ID) ON DELETE CASCADE,
  FOREIGN KEY (Author_ID) REFERENCES author(Author_ID) ON DELETE CASCADE
);

-- 8. REVIEW
CREATE TABLE IF NOT EXISTS review (
  Review_ID INT PRIMARY KEY,
  Paper_ID INT,
  Reviewer_ID INT,
  Score INT,
  Comments TEXT,
  Review_Date DATE,
  FOREIGN KEY (Paper_ID) REFERENCES paper(Paper_ID) ON DELETE CASCADE,
  FOREIGN KEY (Reviewer_ID) REFERENCES reviewer(Reviewer_ID) ON DELETE CASCADE
);

-- 9. DECISION (1:1 Relation with Paper)
CREATE TABLE IF NOT EXISTS decision (
  Decision_ID INT PRIMARY KEY,
  Paper_ID INT UNIQUE,
  Outcome VARCHAR(20),
  Decision_Date DATE,
  Remarks VARCHAR(255),
  FOREIGN KEY (Paper_ID) REFERENCES paper(Paper_ID) ON DELETE CASCADE
);

-- 10. NOTIFICATION
CREATE TABLE IF NOT EXISTS notification (
  Notification_ID INT PRIMARY KEY,
  Author_ID INT,
  Paper_ID INT,
  Message VARCHAR(255),
  Notification_Date DATE,
  Status VARCHAR(30) DEFAULT 'Sent',
  FOREIGN KEY (Author_ID) REFERENCES author(Author_ID) ON DELETE CASCADE,
  FOREIGN KEY (Paper_ID) REFERENCES paper(Paper_ID) ON DELETE CASCADE
);

-- ============================================================
-- INITIAL SAMPLE DATA INSERTIONS
-- ============================================================

INSERT IGNORE INTO role VALUES 
(1, 'Admin', 'Manages conference and system operations'),
(2, 'Author', 'Submits and tracks papers'),
(3, 'Reviewer', 'Evaluates assigned academic papers');

INSERT IGNORE INTO author VALUES 
(101, 'Rahul Sharma', 'rahul@email.com', 'Woxsen University'),
(102, 'Priya Reddy', 'priya@email.com', 'IIT Hyderabad'),
(103, 'Arjun Kumar', 'arjun@email.com', 'Osmania University');

INSERT IGNORE INTO conference VALUES 
(1, 'Woxsen AI Conference 2026', '2026-10-20', '2026-10-22', 'Hyderabad');

INSERT IGNORE INTO reviewer VALUES 
(201, 'Dr. Anil Mehta', 'anil@reviewer.com', 'Artificial Intelligence', 2),
(202, 'Dr. Neha Rao', 'neha@reviewer.com', 'Machine Learning', 1);

INSERT IGNORE INTO user_account VALUES 
(301, 'admin01', 'admin123', 1),
(302, 'rahul01', 'rahul123', 2),
(303, 'priya01', 'priya123', 2),
(304, 'anil01', 'anil123', 3);

INSERT IGNORE INTO paper VALUES
(1001, 'AI in Healthcare', 'Application of AI in modern healthcare systems', '2026-09-10', 'Approved', 1),
(1002, 'Secure ML Systems', 'Security techniques for machine learning systems', '2026-09-11', 'Approved', 1),
(1003, 'NLP for Education', 'Using NLP to improve educational systems', '2026-09-12', 'Revise', 1);

INSERT IGNORE INTO paper_author VALUES 
(1001, 101),
(1001, 102),
(1002, 102),
(1003, 103);

INSERT IGNORE INTO review VALUES
(504, 1001, 201, 8, 'Good methodology and implementation.', '2026-09-21'),
(505, 1001, 202, 6, 'Needs improvement in experimental results.', '2026-09-21'),
(506, 1002, 201, 9, 'Excellent research and strong results.', '2026-09-21'),
(507, 1002, 202, 8, 'Well structured and technically sound.', '2026-09-21'),
(508, 1003, 201, 4, 'Major improvements required.', '2026-09-21'),
(509, 1003, 202, 5, 'Results are not sufficiently convincing.', '2026-09-21');
