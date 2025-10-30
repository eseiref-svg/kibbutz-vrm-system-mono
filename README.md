# 🏦 VRM System - מערכת מידע פיננסית - קיבוץ נען

> **Version**: 1.0.0  
> **Status**: ✅ Production Ready  
> **Last Updated**: October 30, 2025

## 📋 Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Live URLs](#-live-urls)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Configuration](#-configuration)
- [User Roles](#-user-roles)
- [Documentation](#-documentation)
- [Support](#-support)

---

## 🎯 Overview

**VRM (Vendor Relationship Management)** is a comprehensive financial information system designed for Kibbutz Naan. The system manages supplier relationships, financial transactions, branch operations, and provides detailed reporting capabilities.

### Technology Stack

**Backend**:
- Node.js + Express.js
- PostgreSQL Database
- JWT Authentication
- RESTful API

**Frontend**:
- React 18
- React Router v6
- Axios for API calls
- Tailwind CSS
- JWT-decode

**Infrastructure**:
- Backend: Railway (https://railway.app)
- Database: Railway PostgreSQL
- Frontend: Vercel (https://vercel.com)

---

## ✨ Features

### For Treasurer / Admin
- 📊 **Dashboard**: Real-time financial overview
- 💰 **Payment Monitoring**: Track all transactions and payments
- 🏢 **Supplier Management**: Full CRUD operations for suppliers
- 📈 **Reports**: Annual cash flow and expense analysis
- 🏷️ **Tag Management**: Organize and categorize data
- 👥 **User Management**: Manage system users and permissions
- 🔔 **Notifications**: Real-time alerts and updates

### For Branch Managers
- 🏪 **Branch Portal**: Branch-specific dashboard
- 💳 **Balance Overview**: Current branch balance and limits
- 📦 **Recent Orders**: Track branch transactions
- 🔍 **Supplier Search**: Find and connect with approved suppliers
- ✉️ **Supplier Requests**: Request new supplier approvals

---

## 🏗️ Architecture

```
kibbutz-vrm-system-mono/
├── naan-vrm-server/          # Backend (Node.js + Express)
│   ├── server.js             # Main server file
│   ├── db.js                 # Database configuration
│   ├── middleware/           # Authentication middleware
│   ├── services/             # Business logic services
│   ├── migrations/           # Database migrations
│   └── package.json
│
└── naan-vrm-client/          # Frontend (React)
    ├── src/
    │   ├── api/              # API configuration
    │   ├── components/       # React components
    │   ├── context/          # React context (Auth)
    │   ├── pages/            # Page components
    │   └── App.js            # Main app component
    └── package.json
```

---

## 🌐 Live URLs

### Production Environment

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | https://kibbutz-vrm-system-mono.vercel.app | User interface |
| **Backend API** | https://truthful-recreation-production.up.railway.app/api | RESTful API |
| **Health Check** | https://truthful-recreation-production.up.railway.app/health | Service status |

### Development Environment

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Local React dev server |
| **Backend API** | http://localhost:5000/api | Local Express server |
| **Database** | localhost:5432 | Local PostgreSQL |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 12.x or higher
- npm or yarn
- Git

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/eseiref-svg/kibbutz-vrm-system-mono.git
cd kibbutz-vrm-system-mono
```

#### 2. Setup Backend

```bash
cd naan-vrm-server
npm install

# Create .env file
cp .env.example .env
# Edit .env with your local database credentials

# Start server
npm start
```

#### 3. Setup Frontend

```bash
cd naan-vrm-client
npm install

# Create .env file
cp .env.example .env
# Edit .env with your API URL

# Start development server
npm start
```

#### 4. Access the Application

Open http://localhost:3000 in your browser

**Default Admin Login**:
- Email: `admin@naan.com`
- Password: `111222333`

⚠️ **Change this password after first login!**

---

## 📦 Deployment

### Backend Deployment (Railway)

1. **Create Railway Project**
   ```bash
   railway login
   railway init
   ```

2. **Add PostgreSQL Database**
   - Go to Railway Dashboard
   - Add PostgreSQL service
   - Railway will provide `DATABASE_URL` automatically

3. **Configure Environment Variables**
   ```
   DATABASE_URL=<provided by Railway>
   JWT_SECRET=<your-secure-secret>
   PORT=5000
   NODE_ENV=production
   ```

4. **Set Root Directory**
   - Settings → Build & Deployment
   - Root Directory: `naan-vrm-server`

5. **Deploy**
   ```bash
   git push origin main
   ```

### Frontend Deployment (Vercel)

1. **Import Project to Vercel**
   - Go to vercel.com
   - Import Git repository
   - Select `kibbutz-vrm-system-mono`

2. **Configure Build Settings**
   - Framework Preset: `Create React App`
   - Root Directory: `naan-vrm-client`
   - Build Command: `npm run build`
   - Output Directory: `build`

3. **Set Environment Variables**
   ```
   REACT_APP_API_URL=https://truthful-recreation-production.up.railway.app/api
   ```

4. **Deploy**
   - Vercel will auto-deploy on every push to `main` branch

---

## ⚙️ Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=naan_vrm
JWT_SECRET=your_jwt_secret
PORT=5000
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

For detailed configuration, see [CONFIGURATION.md](./CONFIGURATION.md)

---

## 👥 User Roles

| Role | permissions_id | Access Level |
|------|---------------|--------------|
| **ADMIN** | 1 | Full system access |
| **Treasurer (גזבר)** | 2 | Full system access |
| **Branch Manager (מנהל ענף)** | 3 | Branch portal only |

### Default Credentials

**ADMIN User** (Production):
- Email: `admin@naan.com`
- Password: `111222333`
- **⚠️ Change immediately after first login!**

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [CONFIGURATION.md](./CONFIGURATION.md) | Complete configuration guide |
| [CHANGELOG.md](./CHANGELOG.md) | Version history and changes |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Step-by-step deployment instructions |

---

## 🔧 Development

### Running Tests

```bash
# Backend
cd naan-vrm-server
npm test

# Frontend
cd naan-vrm-client
npm test
```

### Code Style

- ESLint for JavaScript linting
- Prettier for code formatting
- Follow React best practices

### Git Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to origin: `git push origin feature/your-feature`
4. Create Pull Request
5. After review, merge to `main`

---

## 🐛 Troubleshooting

### Common Issues

**1. Frontend can't connect to backend**
- Check `REACT_APP_API_URL` in `.env`
- Verify backend is running
- Check CORS settings in `server.js`

**2. Database connection failed**
- Verify PostgreSQL is running
- Check database credentials in `.env`
- For Railway, verify `DATABASE_URL` is set

**3. Authentication fails**
- Check `JWT_SECRET` is set in both environments
- Verify token hasn't expired (1 hour default)
- Clear localStorage and login again

**4. Build errors**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check Node.js version (18.x required)

For more troubleshooting, see [CONFIGURATION.md](./CONFIGURATION.md#support--troubleshooting)

---

## 📞 Support

For issues, questions, or contributions:
- Create an issue in GitHub
- Contact system administrator
- Check documentation files

---

## 📄 License

This project is proprietary software for Kibbutz Naan.

---

## 🙏 Credits

Developed with ❤️ for Kibbutz Naan

**Development Team**:
- System Architecture & Implementation
- Database Design
- UI/UX Design
- Deployment & DevOps

---

## 🔄 Version History

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

**Latest Release**: v1.0.0 (2025-10-30)
- Initial production deployment
- All core features operational
- Full documentation completed

---

**Happy Coding! 🚀**
