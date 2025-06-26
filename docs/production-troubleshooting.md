# Production Deployment Troubleshooting Guide

## Issue: Admin Panel Can't Login in Production

### Problem Description
- Local development works fine
- Production shows `OPTIONS /auth/login 204` in logs
- Actual login request may be failing silently

### Common Causes & Solutions

#### 1. CORS Configuration Issues

**Check your production environment variables:**
```bash
# In your deployment platform (Vercel/Netlify/etc.), ensure these are set:
NODE_ENV=production
FRONTEND_URL=https://your-admin-panel-domain.com
ADMIN_PANEL_URL=https://your-admin-panel-domain.com
```

**Verify your frontend is making requests to the correct API URL:**
```javascript
// In your admin panel code, check if API_BASE_URL is correct for production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-api-domain.com';
```

#### 2. Environment Variables Not Set in Production

**For Vercel:**
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all required variables from `.env.production`

**For Netlify:**
1. Go to Site settings → Environment variables
2. Add all required variables

**For Railway/Heroku:**
1. Use their CLI or dashboard to set environment variables

#### 3. Database Connection Issues

**Check if production can connect to MongoDB:**
```javascript
// Add this to your connection file for debugging
mongoose.connection.on('connected', () => {
  console.log('[DB] Connected to MongoDB in production');
});

mongoose.connection.on('error', (err) => {
  console.error('[DB] MongoDB connection error:', err);
});
```

#### 4. HTTPS/SSL Issues

**Ensure all URLs use HTTPS in production:**
- API endpoints should use `https://`
- Frontend URLs should use `https://`
- No mixed content warnings in browser console

### Debugging Steps

#### Step 1: Check Browser Console
1. Open your admin panel in production
2. Open Developer Tools → Network tab
3. Try to login and check:
   - Is the OPTIONS request successful?
   - Is there a follow-up POST request?
   - What's the response status and body?

#### Step 2: Check Server Logs
With the enhanced logging, you should see:
```
[CORS] Request from origin: https://your-admin-panel.com
[CORS] Environment: production
[CORS] Frontend URL: https://your-admin-panel.com
[DEBUG] POST /v1/auth/login Request Body: {...}
```

#### Step 3: Test API Directly
Use curl or Postman to test your production API:
```bash
curl -X POST https://your-api-domain.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://your-admin-panel.com" \
  -d '{"email":"test@example.com","password":"testpass"}'
```

#### Step 4: Frontend Configuration Check
Ensure your admin panel is configured correctly:

```javascript
// Check if your frontend is using the correct API URL
console.log('API Base URL:', process.env.REACT_APP_API_URL);

// Check if credentials are being sent
const response = await axios.post(`${API_URL}/auth/login`, {
  email,
  password
}, {
  withCredentials: true, // Important for CORS
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### Quick Fixes to Try

#### Fix 1: Temporary Allow All Origins (for testing only)
```javascript
// In index.js, temporarily replace CORS config with:
app.use(cors({
  origin: true,
  credentials: true
}));
```

#### Fix 2: Add Explicit Preflight Handling
```javascript
// Add this before your routes in index.js
app.options('*', cors(corsOptions));
```

#### Fix 3: Check Production Environment Variables
Add this debugging route temporarily:
```javascript
// Add this route for debugging (remove after fixing)
app.get('/debug/env', (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL,
    adminPanelUrl: process.env.ADMIN_PANEL_URL,
    mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set'
  });
});
```

### Action Items for You

1. **Set Environment Variables in Production:**
   - Replace `https://your-frontend-domain.com` with your actual admin panel URL
   - Add all environment variables to your deployment platform

2. **Deploy Updated Code:**
   - The enhanced CORS configuration
   - Additional logging
   - Updated vercel.json with CORS headers

3. **Check Production Logs:**
   - Look for CORS debug messages
   - Verify database connection
   - Check if login endpoint is being reached

4. **Test Frontend Configuration:**
   - Ensure `withCredentials: true` in API calls
   - Verify correct API base URL
   - Check for any console errors

### Common Environment Variable Names by Platform

**Vercel:**
- Set in dashboard → Settings → Environment Variables

**Netlify:**
- Set in dashboard → Site settings → Environment variables

**Railway:**
```bash
railway variables set FRONTEND_URL=https://your-admin-panel.com
```

**Heroku:**
```bash
heroku config:set FRONTEND_URL=https://your-admin-panel.com
```

### Next Steps After Deployment

1. Check server logs for CORS and DEBUG messages
2. Test the `/debug/env` endpoint to verify environment variables
3. Monitor browser network tab during login attempts
4. Share the specific error messages or logs for further debugging

Remember to remove debug routes and excessive logging after fixing the issue for security and performance reasons.
