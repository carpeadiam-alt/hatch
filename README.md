# 🐣 Hatch – Event & Hackathon Hosting Platform

**Theme:** SynapHack 3.0 – Event & Hackathon Hosting Platform  
**Goal:** Empower organizers, participants, and judges with smooth workflows, real-time engagement, and end-to-end event lifecycle management.

---

## 🚀 Introduction

Hackathons and events are the backbone of innovation, collaboration, and learning.  
Most existing solutions are either **complex, expensive, or inflexible**.  

**Hatch** solves this by providing a **modern, scalable, and user-friendly event hosting platform** that supports:
- Event creation & management
- Participant & team registration
- Project submission & evaluation
- Real-time communication & announcements
- Automated certificates & dashboards

---

## 📌 Features

### ✅ Core Features
- **Event Creation & Management** – Organizers can configure theme, tracks, rules, timeline, prizes, and sponsors; supports online/offline.
- **Registration & Teaming** – Individual/team registration with secure login (Google + GitHub via Firebase).
- **Project Submission & Evaluation** – Upload documentation, GitHub links, and videos. Judges can review, score, and give feedback across multiple rounds.
- **Communication & Updates** – Real-time announcements and reminders via polling.
- **Role-based Dashboards**:
  - Participants → manage teams & submissions.
  - Organizers → manage events, announcements, and results.
  - Judges → review & score projects.
  - A user can act as both participant and organizer seamlessly.

### 🎁 Additional Features
- **AI-powered plagiarism detection** – validate originality of submissions.  
- **Automated certificate generation** – emailed to participants and winners after results.  
- **Real-time dashboards & analytics** – monitor event progress, scoring, and participation.  
- **Sponsor & Partner showcase** – highlight event partners.  
- **Integrated leaderboard** – live ranking of teams/projects.  

---

## ⚙️ Tech Stack

- **Frontend:** Next.js (TypeScript), hosted on **Vercel**  
- **Backend:** Flask (Python), hosted on **Azure Web App**  
- **Databases:**
  - **Azure PostgreSQL** → structured storage (users, teams, auth, registrations).
  - **MongoDB Atlas** → unstructured storage (submissions, announcements, chats).  
- **Authentication:** Firebase OAuth (Google + GitHub)

---

## 🏗️ System Architecture

```mermaid
%%{init: {'theme':'dark'}}%%
flowchart TD
    A[User] -->|OAuth (Google/GitHub)| B[Firebase Auth]
    A -->|Frontend Requests| C[Next.js Frontend (Vercel)]
    C -->|API Calls| D[Flask Backend (Azure Web App)]
    D -->|Structured Data| E[(Azure PostgreSQL)]
    D -->|Unstructured Data| F[(MongoDB Atlas)]
    D -->|Plagiarism Check| G[AI Service - plagiarism_checker.py]
    D -->|Certificate Generation| H[Certificate Engine - certificate.html]
    H -->|Email Delivery| A
    D -->|Results & Leaderboard| C
