# 🚀 Render Deployment Guide for Stay-Finder

## Prerequisites
- ✅ MongoDB Atlas account (you already have this)
- ✅ GitHub repository with your code
- ✅ Render account (free)

## Step 1: Prepare Your Repository

### 1.1 Update Frontend API Configuration
Update your frontend to use environment variables for the API URL:

```javascript
// In your API calls, replace hardcoded URLs with:
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
```

### 1.2 Ensure Environment Variables
Make sure your `.env` file in the server directory has:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=10000
```

## Step 2: Deploy on Render

### 2.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Verify your email

### 2.2 Deploy Backend API
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `stay-finder-api`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free

4. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string
   - `NODE_ENV`: `production`
   - `PORT`: `10000`

5. Click "Create Web Service"

### 2.3 Deploy Frontend
1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `stay-finder-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free

4. Add Environment Variable:
   - `VITE_API_URL`: `https://your-backend-service-name.onrender.com`

5. Click "Create Static Site"

## Step 3: Update Frontend API Configuration

### 3.1 Create API Configuration File
Create `src/utils/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  
  return response.json();
};
```

### 3.2 Update All API Calls
Replace all direct fetch calls with the apiCall function.

## Step 4: Test Your Deployment

### 4.1 Backend Health Check
Visit: `https://your-backend-service-name.onrender.com`
Should show: `{"message":"Welcome to StayFinder API"}`

### 4.2 Frontend Test
Visit your frontend URL and test:
- ✅ User registration/login
- ✅ Property creation
- ✅ Image uploads
- ✅ Search functionality

## Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain
1. Go to your Render service
2. Click "Settings" → "Custom Domains"
3. Add your domain
4. Update DNS records as instructed

## Troubleshooting

### Common Issues:

#### 1. Build Failures
- Check build logs in Render dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

#### 2. API Connection Issues
- Verify VITE_API_URL environment variable
- Check CORS configuration
- Ensure backend is running

#### 3. Database Connection Issues
- Verify MONGODB_URI is correct
- Check MongoDB Atlas network access
- Ensure database user has correct permissions

#### 4. Image Upload Issues
- Check file permissions on Render
- Verify upload directory exists
- Monitor disk space usage

## Environment Variables Reference

### Backend (Web Service)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stayfinder
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=production
PORT=10000
```

### Frontend (Static Site)
```env
VITE_API_URL=https://your-backend-service-name.onrender.com
```

## Cost Estimation (Free Tier)
- **Backend**: Free (750 hours/month)
- **Frontend**: Free (unlimited)
- **Database**: MongoDB Atlas Free (512MB)

## Next Steps After Deployment
1. Set up monitoring and logging
2. Configure automatic backups
3. Set up CI/CD pipeline
4. Add SSL certificates
5. Optimize performance

Your Stay-Finder app will be live and accessible worldwide! 🌍 