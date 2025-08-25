# Hatch

Hatch is a web platform with a **Next.js frontend** and a **Flask backend**, designed for event management and user interactions.  
The backend is hosted on **Azure App Services**, with **Azure PostgreSQL** as the relational database, and **MongoDB Atlas** for storing event details.  

---

## 🚀 Features (Implemented)
- **Frontend (Next.js)**
  - Modern UI for user interaction.
  - Integration with backend APIs.
- **Backend (Flask)**
  - REST API endpoints for authentication, event handling, and data persistence.
  - OAuth authentication with **Google** and **GitHub**.
- **Databases**
  - **Azure PostgreSQL** → Stores user authentication and relational data.
  - **MongoDB Atlas** → Stores event-related details and flexible data structures.
- **Hosting**
  - **Frontend** → Vercel (Next.js hosting).
  - **Backend** → Azure App Services.
  - **Databases** → Azure PostgreSQL + MongoDB Atlas.

---

## 🛠️ Tech Stack
- **Frontend:** Next.js, React, TailwindCSS
- **Backend:** Flask (Python)
- **Databases:** Azure PostgreSQL, MongoDB Atlas
- **Auth:** OAuth (Google + GitHub)
- **Hosting:** Vercel (Frontend), Azure (Backend)

---

## 📂 Repositories
- [Frontend (hatch)](https://github.com/carpeadiam-alt/hatch.git)
- [Backend (hatchBackend)](https://github.com/carpeadiam/hatchBackend)

---

## 🏗️ System Architecture

```mermaid
%%{init: {'theme':'dark'}}%%
flowchart TD
    A[👤 User] -->|OAuth Login| B[🌐 Next.js Frontend]
    B -->|API Requests| C[⚡ Flask Backend]
    C -->|User Data| D[(🐘 Azure PostgreSQL)]
    C -->|Event Data| E[(🍃 MongoDB Atlas)]
    
    B -.->|Hosted on| F[📦 Vercel]
    C -.->|Deployed on| G[☁️ Azure App Services]
    
    H[🔐 OAuth Providers] -->|Google & GitHub| B
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#e0f2f1
