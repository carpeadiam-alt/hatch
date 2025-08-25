# Hatch 🥚

**Hatch** is a modern web platform for event management and user interactions, built with a scalable microservices architecture. The platform combines a sleek Next.js frontend with a robust Flask backend, providing seamless event creation, management, and user engagement features.

## 🌟 Overview

Hatch empowers users to create, discover, and participate in events with an intuitive interface and powerful backend infrastructure. Whether you're organizing a small meetup or a large conference, Hatch provides the tools you need to manage your events effectively.

## 🚀 Features

### ✅ Currently Implemented
- **🎨 Modern Frontend**
  - Responsive UI built with Next.js and TailwindCSS
  - Seamless integration with backend APIs
  - Mobile-first design approach

- **🔐 Authentication & Security**
  - OAuth integration with Google and GitHub
  - Secure user session management
  - Protected routes and API endpoints

- **📊 Dual Database Architecture**
  - PostgreSQL for relational data (users, authentication)
  - MongoDB for flexible event data and complex structures

- **🌐 Cloud-Native Deployment**
  - Frontend hosted on Vercel for optimal performance
  - Backend deployed on Azure App Services
  - Managed database services for reliability

### 🔮 Planned Features
- Real-time event updates
- Advanced event filtering and search
- User notification system
- Event analytics and insights
- Mobile application

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js, React, TailwindCSS | User interface and client-side logic |
| **Backend** | Flask (Python) | REST API and server-side logic |
| **Authentication** | OAuth (Google, GitHub) | Secure user authentication |
| **Database (Relational)** | Azure PostgreSQL | User data and structured information |
| **Database (Document)** | MongoDB Atlas | Event details and flexible data |
| **Frontend Hosting** | Vercel | Static site deployment and CDN |
| **Backend Hosting** | Azure App Services | Scalable web application hosting |

## 🏗️ System Architecture

```mermaid
flowchart TD
    A[👤 User] -->|OAuth Login| B[🌐 Next.js Frontend]
    B -->|API Requests| C[⚡ Flask Backend]
    C -->|User Data| D[(🐘 Azure PostgreSQL)]
    C -->|Event Data| E[(🍃 MongoDB Atlas)]
    
    B -.->|Hosted on| F[📦 Vercel]
    C -.->|Deployed on| G[☁️ Azure App Services]
    
    H[🔐 OAuth Providers] -->|Google & GitHub| B
    
    style A fill:#4a90e2,stroke:#2c5282,stroke-width:2px,color:#ffffff
    style B fill:#7c3aed,stroke:#5b21b6,stroke-width:2px,color:#ffffff
    style C fill:#059669,stroke:#047857,stroke-width:2px,color:#ffffff
    style D fill:#dc2626,stroke:#b91c1c,stroke-width:2px,color:#ffffff
    style E fill:#16a34a,stroke:#15803d,stroke-width:2px,color:#ffffff
    style F fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#ffffff
    style G fill:#3b82f6,stroke:#2563eb,stroke-width:2px,color:#ffffff
    style H fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#ffffff
```

## 📂 Repository Structure

- **[Frontend Repository](https://github.com/carpeadiam-alt/hatch.git)** - Next.js application with React components and TailwindCSS styling
- **[Backend Repository](https://github.com/carpeadiam/hatchBackend)** - Flask API server with database integrations and authentication

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.8+ and pip
- PostgreSQL database access
- MongoDB Atlas account
- OAuth app credentials (Google & GitHub)

### Quick Start

1. **Clone the repositories:**
   ```bash
   # Frontend
   git clone https://github.com/carpeadiam-alt/hatch.git
   cd hatch
   npm install
   
   # Backend (in a new terminal)
   git clone https://github.com/carpeadiam/hatchBackend.git
   cd hatchBackend
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   - Configure database connections
   - Add OAuth client credentials
   - Set up API keys and secrets

3. **Run the development servers:**
   ```bash
   # Frontend (port 3000)
   npm run dev
   
   # Backend (port 5000)
   python app.py
   ```

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GITHUB_CLIENT_ID=your-github-client-id
```

**Backend (.env):**
```env
DATABASE_URL=postgresql://user:pass@host:port/db
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
GOOGLE_CLIENT_SECRET=your-google-secret
GITHUB_CLIENT_SECRET=your-github-secret
```

## 📊 Database Schema

### PostgreSQL (Relational Data)
- **users** - User authentication and profile information
- **sessions** - User session management
- **user_preferences** - Application settings and preferences

### MongoDB (Event Data)
- **events** - Event details, descriptions, and metadata
- **registrations** - Event participation and attendance
- **analytics** - Usage metrics and insights

## 🚀 Deployment

The application is deployed using modern cloud services for optimal performance and scalability:

- **Frontend**: Automatically deployed to Vercel on push to main branch
- **Backend**: Deployed to Azure App Services with CI/CD integration
- **Databases**: Managed services ensuring high availability and backup

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:
- Code style and standards
- Pull request process
- Issue reporting
- Development workflow

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/carpeadiam-alt/hatch/issues)
- **Discussions**: [GitHub Discussions](https://github.com/carpeadiam-alt/hatch/discussions)
- **Email**: support@hatch-platform.com

## 🙏 Acknowledgments

Built with ❤️ using open-source technologies and modern cloud infrastructure.

---

**Made with 🥚 by the Acharya's Team**
