# 🚀 Deployment Checklist - DEV → PROD

Use this checklist every time you want to deploy changes from DEV to PROD.

---

## Pre-Deployment

### ✅ Code Changes

- [ ] All features tested locally (http://localhost:3000)
- [ ] No console errors in browser DevTools
- [ ] Backend tests pass (if any)
- [ ] Code reviewed (self or peer)
- [ ] Comments added for complex logic
- [ ] Debug `console.log` statements removed

### ✅ Database Changes

- [ ] **Schema changes**: Migration files created in `migrations/`
- [ ] **Data changes**: Export scripts prepared
- [ ] Migrations tested on local DB
- [ ] Backup created of local DB (for rollback)
- [ ] Migration plan documented

### ✅ Environment Variables

- [ ] New ENV vars added to `.env.example`
- [ ] Production ENV vars will be set in Railway/Vercel
- [ ] No hardcoded secrets in code

### ✅ Documentation

- [ ] `README.md` updated (if needed)
- [ ] `CHANGELOG.md` updated with changes
- [ ] API changes documented (if any)

---

## Deployment Steps

### 1️⃣ Commit Code Changes

```bash
# Review changes
git status
git diff

# Commit
git add .
git commit -m "feat: [description of feature]"

# Push to GitHub
git push origin main
```

**⏱️ Wait 2-3 minutes for auto-deploy**

### 2️⃣ Verify Code Deployment

**Backend:**
```
Check: https://truthful-recreation-production.up.railway.app/health
Expected: {"status":"ok", ...}
```

**Frontend:**
```
Check: https://kibbutz-vrm-system-mono.vercel.app
Expected: Site loads without errors
```

### 3️⃣ Apply Database Migrations (if any)

**⚠️ Critical: Backup first!**

```powershell
# 1. Backup Production DB
$env:DATABASE_URL="<from-railway>"
.\naan-vrm-server\backup-railway-db.ps1

# 2. Load Railway DB env vars
# Get from: Railway Dashboard → Database → Variables
$env:DATABASE_URL="postgresql://..."

# 3. Run migrations
.\naan-vrm-server\run-migrations.ps1 -Environment "production"

# OR manually:
psql $env:DATABASE_URL -f migrations/002_new_feature.sql
```

### 4️⃣ Apply Data Changes (if any)

**Option A: Script**
```bash
node naan-vrm-server/scripts/sync-data-to-prod.js
```

**Option B: Manual SQL**
```powershell
psql $env:DATABASE_URL
# Then paste SQL commands
```

**Option C: Import CSV**
```
Railway Dashboard → Database → Data → Import
```

### 5️⃣ Update Environment Variables (if any)

**Backend (Railway):**
```
1. Railway Dashboard → Your Project → Variables
2. Add/Update variable
3. Redeploy if needed
```

**Frontend (Vercel):**
```
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add/Update variable
3. Redeploy (automatic)
```

---

## Post-Deployment Verification

### ✅ Functional Testing

- [ ] Login works with existing users
- [ ] New features are accessible
- [ ] Old features still work
- [ ] No JavaScript errors in console
- [ ] No API errors in Network tab

### ✅ Database Testing

- [ ] Data integrity maintained
- [ ] New tables/columns exist
- [ ] Queries work as expected
- [ ] No foreign key violations

### ✅ Performance Check

- [ ] Pages load within 3 seconds
- [ ] API responses < 1 second
- [ ] No memory leaks
- [ ] Database connections released

### ✅ Security Check

- [ ] No sensitive data in logs
- [ ] Authentication still works
- [ ] Authorization rules enforced
- [ ] No exposed API keys

---

## Rollback Plan (If Something Goes Wrong)

### Code Rollback

```bash
# 1. Find last working commit
git log --oneline

# 2. Revert to that commit
git revert <commit-hash>
git push origin main

# Wait for auto-deploy
```

### Database Rollback

```powershell
# Restore from backup
psql $env:DATABASE_URL < backups/backup_<date>.sql
```

### Emergency Contact

- Check Railway logs: Railway Dashboard → Deployments → Logs
- Check Vercel logs: Vercel Dashboard → Deployments → Logs
- Review `CONFIGURATION.md` for troubleshooting

---

## Version Tagging

After successful deployment:

```bash
# Create version tag
git tag -a v1.1.0 -m "Release v1.1.0: [description]"
git push origin v1.1.0
```

---

## Communication

- [ ] Notify users of new features (if applicable)
- [ ] Update system status (if applicable)
- [ ] Document known issues (if any)

---

## Notes

**Frequency**: Deploy when you have stable, tested changes

**Timing**: Avoid peak hours (if possible)

**Team**: Coordinate with team members

**Backup**: Always backup before major changes

---

**Last Updated**: 2025-10-30  
**Version**: 1.0

