# Vercel Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. Database Connection Issues

#### Problem: Health check fails with database connection errors

**Most Common Cause**: Missing or incorrect environment variables in Vercel

#### Solution Steps:

1. **Check Environment Variables in Vercel Dashboard**
   ```bash
   # Go to your Vercel project dashboard
   # Navigate to Settings → Environment Variables
   # Ensure these variables are set:
   ```
   
   Required variables:
   - `DB_URL` - Your Neon PostgreSQL connection string
   - `JWT_SECRET` - Secure random string for JWT signing
   - `NODE_ENV` - Set to "production"

2. **Verify DB_URL Format**
   ```
   Format: postgresql://username:password@hostname:port/database?sslmode=require
   Example: postgresql://neondb_owner:password123@ep-cool-lab-123456.us-east-1.aws.neon.tech:5432/neondb?sslmode=require
   ```

3. **Check Neon Database Status**
   - Log into your Neon console
   - Verify database is active and not suspended
   - Check connection details match your DB_URL

#### Debugging Steps:

1. **Access Vercel Function Logs**
   ```bash
   # In your Vercel dashboard:
   # Go to Functions tab → Click on your function → View logs
   ```

2. **Check Health Endpoint**
   ```bash
   curl https://your-app.vercel.app/health
   ```
   
   Look for detailed error information and troubleshooting suggestions.

3. **Test Database Connection Locally**
   ```bash
   # Use the same DB_URL that you set in Vercel
   export DB_URL="postgresql://..."
   node test-db-connection.js
   ```

### 2. Environment Variable Issues

#### Problem: Variables not available in production

**Solutions:**

1. **Set Variables in Vercel Dashboard**
   - Go to Project Settings → Environment Variables
   - Add variables for all environments (Production, Preview, Development)
   - Use the exact variable names from `.env.example`

2. **Common Variable Issues**
   ```bash
   # ❌ Wrong - using quotes in Vercel UI
   DB_URL="postgresql://..."
   
   # ✅ Correct - no quotes in Vercel UI
   DB_URL=postgresql://...
   ```

3. **Redeploy After Adding Variables**
   ```bash
   # Trigger a new deployment after adding env vars
   git push origin main
   # OR use Vercel CLI
   vercel --prod
   ```

### 3. SSL/TLS Connection Issues

#### Problem: SSL connection errors with Neon

**Solution:** Ensure your DB_URL includes SSL parameters:
```
postgresql://user:pass@host:port/db?sslmode=require
```

Or add these to your connection string:
- `?sslmode=require`
- `?ssl=true`

### 4. Function Timeout Issues

#### Problem: Function times out before connecting to database

**Solutions:**

1. **Optimize Connection Pool** (already configured in `db.js`):
   ```javascript
   max: process.env.VERCEL ? 1 : 20, // Single connection for serverless
   connectionTimeoutMillis: 10000,   // 10 second timeout
   ```

2. **Check Database Performance**
   - Verify Neon database isn't overloaded
   - Check database region vs Vercel function region

### 5. Debugging Information

#### Health Check Endpoint

Visit `/health` endpoint to get detailed diagnostic information:

```json
{
  "status": "error",
  "configuration": {
    "db_url_configured": false,
    "jwt_secret_configured": false,
    "available_env_vars": ["NODE_ENV", "VERCEL"]
  },
  "troubleshooting": [
    "Set DB_URL environment variable in Vercel dashboard",
    "Ensure DB_URL contains valid PostgreSQL connection string"
  ]
}
```

#### Console Logs in Vercel

1. Go to Vercel Dashboard → Functions → View Logs
2. Look for these log entries:
   - `🔍 Health check started...`
   - Environment diagnostics
   - Database connection attempts
   - Error details with troubleshooting steps

### 6. Step-by-Step Deployment Fix

If your deployment is failing, follow these steps:

1. **Verify Local Environment**
   ```bash
   # Test locally first
   npm start
   curl http://localhost:3000/health
   ```

2. **Check Neon Database**
   ```bash
   # Test direct connection to Neon
   node test-db-connection.js
   ```

3. **Set Vercel Environment Variables**
   - DB_URL: Your complete Neon connection string
   - JWT_SECRET: Secure random string (generate with: `openssl rand -hex 64`)
   - NODE_ENV: production

4. **Redeploy**
   ```bash
   git add .
   git commit -m "Fix environment configuration"
   git push origin main
   ```

5. **Test Production**
   ```bash
   curl https://your-app.vercel.app/health
   ```

### 7. Common Error Messages and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `ENOTFOUND` | Invalid hostname in DB_URL | Check Neon connection string |
| `ECONNREFUSED` | Database not accepting connections | Verify database is active |
| `28P01` | Authentication failed | Check username/password in DB_URL |
| `3D000` | Database doesn't exist | Verify database name in connection string |
| `ETIMEDOUT` | Connection timeout | Check network/database performance |
| `DB_URL not configured` | Missing environment variable | Set DB_URL in Vercel dashboard |

### 8. Getting Help

If issues persist:

1. **Check Vercel Function Logs** for detailed error information
2. **Visit the `/health` endpoint** for diagnostic data
3. **Verify Neon database status** in Neon console
4. **Test database connection locally** with the same credentials

### 9. Production Checklist

Before going live, ensure:

- [ ] All environment variables set in Vercel
- [ ] Database connection tested and working
- [ ] Health check endpoint returns success
- [ ] SSL properly configured for database
- [ ] JWT secret is secure and not exposed
- [ ] No sensitive data in logs or error messages

### 10. Performance Optimization

For better performance:

1. **Use connection pooling** (already configured)
2. **Monitor function execution time** in Vercel dashboard
3. **Consider database region** placement near Vercel functions
4. **Implement proper error handling** to avoid crashes

---

## Quick Fix Commands

```bash
# Test database connection
node test-db-connection.js

# Check health endpoint
curl https://your-app.vercel.app/health

# Redeploy to Vercel
vercel --prod

# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

This guide should help you diagnose and fix most Vercel deployment issues with the vehicle maintenance API.
