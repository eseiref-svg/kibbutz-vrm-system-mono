# System Configuration Guide

This document contains all configuration details for the VRM System.

---

## 🌍 Environment Overview

### Development (DEV)
- **Purpose**: Local development and testing
- **Backend**: Local server (http://localhost:5000)
- **Database**: Local PostgreSQL instance
- **Frontend**: Local React dev server (http://localhost:3000)

### Production (PROD)
- **Purpose**: Live system for end users
- **Backend**: Railway (https://truthful-recreation-production.up.railway.app)
- **Database**: Railway PostgreSQL
- **Frontend**: Vercel (https://kibbutz-vrm-system-mono.vercel.app)

---

## 🔧 Backend Configuration (naan-vrm-server)

### Environment Variables

Create a `.env` file in `naan-vrm-server/` directory:

```env
# ================================
# ENVIRONMENT
# ================================
NODE_ENV=development

# ================================
# DATABASE CONFIGURATION - LOCAL DEVELOPMENT
# ================================
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=Zaq1Xsw2
DB_NAME=naan_vrm

# ================================
# DATABASE CONFIGURATION - PRODUCTION (Railway)
# ================================
# In production, Railway provides DATABASE_URL automatically
# Example format:
# DATABASE_URL=postgresql://user:password@host:port/database

# ================================
# JWT SECRET
# ================================
# IMPORTANT: Use a different secret in production!
JWT_SECRET=VRM_Super_Secret_Key_2024_!@#$%^&*()_Naan_Kibbutz_System

# ================================
# SERVER CONFIGURATION
# ================================
PORT=5000
```

### Railway Configuration

**Project**: `truthful-recreation-production`

**Environment Variables** (set in Railway Dashboard):
```
DATABASE_URL=<automatically provided by Railway>
JWT_SECRET=<your-production-secret>
PORT=5000
NODE_ENV=production
```

**Settings**:
- Root Directory: `naan-vrm-server`
- Build Command: `npm install`
- Start Command: `npm start` (runs `node server.js`)
- Auto-Deploy: Enabled on `main` branch

---

## 🎨 Frontend Configuration (naan-vrm-client)

### Environment Variables

#### Local Development (.env)
Create a `.env` file in `naan-vrm-client/` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

#### Production (Vercel)
**Don't commit .env to git!** Instead, configure in Vercel Dashboard:

**Project**: `kibbutz-vrm-system-mono`

**Environment Variables**:
```
REACT_APP_API_URL=https://truthful-recreation-production.up.railway.app/api
```

**Settings**:
- Root Directory: `naan-vrm-client`
- Framework Preset: Create React App
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`
- Node.js Version: 18.x

---

## 🗄️ Database Configuration

### Local PostgreSQL

**Connection Details**:
```
Host: localhost
Port: 5432
Database: naan_vrm
Username: postgres
Password: Zaq1Xsw2
```

**Schema**: See `migrations/` folder for schema structure

### Railway PostgreSQL

**Connection**: Automatically configured via `DATABASE_URL`

**Access**:
- Via Railway Dashboard → Database → Data tab
- Via `psql` with connection string from Railway

**Backup Command**:
```bash
pg_dump -h <railway-host> -U <user> -d <database> > backup.sql
```

---

## 👤 User Roles & Permissions

### permissions_id Reference

| ID | Role | Access Level |
|----|------|-------------|
| 1 | ADMIN | Full system access (all features) |
| 2 | Treasurer (גזבר) | Full system access (all features) |
| 3 | Branch Manager (מנהל ענף) | Branch portal only |

### Default Admin User

**Credentials** (Production):
```
Email: admin@naan.com
Password: 111222333
Role: ADMIN (permissions_id=1)
```

**⚠️ IMPORTANT**: Change this password after first login!

---

## 🔒 Security Configuration

### JWT Token

**Development**:
- Secret: Set in `.env` file
- Expiration: 1 hour

**Production**:
- Secret: Set in Railway environment variables
- Expiration: 1 hour
- **Must be different from DEV secret!**

### Database Connections

**Local**: 
- No SSL required
- Direct PostgreSQL connection

**Railway**:
- SSL required (`rejectUnauthorized: false`)
- Connection via `DATABASE_URL`

### CORS Configuration

**Development**: Allows all origins (for testing)

**Production**: Should be configured to allow only:
- Frontend domain (Vercel)
- Trusted domains

Current configuration in `server.js`:
```javascript
app.use(cors()); // ⚠️ Consider restricting in production
```

---

## 📦 Dependencies

### Backend (naan-vrm-server)

Key dependencies:
```json
{
  "dotenv": "^16.3.1",
  "express": "^5.1.0",
  "pg": "^8.16.3",
  "bcrypt": "^6.0.0",
  "jsonwebtoken": "^9.0.2",
  "cors": "^2.8.5",
  "node-cron": "^4.2.1"
}
```

### Frontend (naan-vrm-client)

Key dependencies:
```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "react-router-dom": "^6.x",
  "axios": "^1.x",
  "jwt-decode": "^4.x"
}
```

---

## 🔍 Health Check Endpoints

### Backend Health
```
GET https://truthful-recreation-production.up.railway.app/health
```

**Response** (Success):
```json
{
  "status": "ok",
  "message": "Server is running and database connected",
  "timestamp": "2025-10-30T..."
}
```

**Response** (Failure):
```json
{
  "status": "error",
  "message": "Database connection failed",
  "error": "...",
  "timestamp": "2025-10-30T..."
}
```

---

## 🚀 Deployment Checklist

### Before Deploying

- [ ] Update version in `package.json`
- [ ] Test locally with production environment variables
- [ ] Update `.env.example` files
- [ ] Review and update `CHANGELOG.md`
- [ ] Commit all changes
- [ ] Create Git tag

### Backend Deployment (Railway)

- [ ] Verify `DATABASE_URL` is set
- [ ] Verify `JWT_SECRET` is set (and different from DEV)
- [ ] Verify `NODE_ENV=production`
- [ ] Check deployment logs
- [ ] Test `/health` endpoint
- [ ] Test API endpoints

### Frontend Deployment (Vercel)

- [ ] Verify `REACT_APP_API_URL` points to Railway backend
- [ ] Clear build cache if needed
- [ ] Check deployment logs
- [ ] Test login functionality
- [ ] Verify all pages load correctly

### Post-Deployment

- [ ] Test full user flow (login → dashboard → features)
- [ ] Verify database connections
- [ ] Monitor error logs
- [ ] Create database backup
- [ ] Update documentation

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue**: Frontend shows "localhost:5000" errors
- **Solution**: Check `REACT_APP_API_URL` in Vercel environment variables
- **Solution**: Clear build cache and redeploy

**Issue**: Database connection failed
- **Solution**: Verify `DATABASE_URL` is correct
- **Solution**: Check Railway database is running
- **Solution**: Verify SSL settings in `db.js`

**Issue**: JWT authentication fails
- **Solution**: Verify `JWT_SECRET` is set in both environments
- **Solution**: Check token expiration (default 1 hour)

**Issue**: ADMIN user can't access features
- **Solution**: Verify `permissions_id=1` in database
- **Solution**: Check `App.js` includes `role_id === 1` in conditions

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)

---

**Last Updated**: 2025-10-30  
**Version**: 1.0.0

