# Deploying Your Blood Donation App
This guide will walk you through deploying your application to the internet using **free** services.

## Prerequisites
1. **GitHub Account**: To host your code repository.
2. **MongoDB Atlas Account**: To host your database in the cloud.
3. **Render Account**: To host your backend server.
4. **Vercel Account**: To host your frontend website.
5. **Cloudinary Account**: To host user profile images.

---

## Step 1: Push Code to GitHub
1. Create a new repository on GitHub.
2. Push your current project code to this new repository.

---

## Step 2: Set Up MongoDB Atlas (Database)
Your local database (`mongodb://localhost...`) won't work on the internet. You need a cloud database.
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up/log in.
2. Create a **FREE Shared Cluster**.
3. Create a **Database User** (username/password) and whitelist your IP (or allow access from anywhere `0.0.0.0/0`).
4. Get your **Connection String** (looks like `mongodb+srv://<username>:<password>@cluster0.mongodb.net/...`).
   - Replace `<password>` with your actual password.
   - **Save this URL**, you will need it later.

---

## Step 3: Set Up Cloudinary (Images)
1. Go to [Cloudinary](https://cloudinary.com/) and sign up.
2. On your **Dashboard**, copy these 3 values:
   - `Cloud Name`
   - `API Key`
   - `API Secret`

---

## Step 4: Deploy Backend (Render)
1. Go to [Render.com](https://render.com/) and sign up with GitHub.
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Settings:
   - **Name**: `blood-donation-api` (or similar)
   - **Region**: Closest to you (e.g., Singapore, Frankfurt)
   - **Root Directory**: `server` (Important!)
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. **Environment Variables**: Add these key-value pairs:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: (Paste your MongoDB Atlas connection string from Step 2)
   - `JWT_SECRET`: (Create a strong random secret key)
   - `JWT_REFRESH_SECRET`: (Create another strong random secret key)
   - `CLOUDINARY_CLOUD_NAME`: (From Step 3)
   - `CLOUDINARY_API_KEY`: (From Step 3)
   - `CLOUDINARY_API_SECRET`: (From Step 3)
   - `FRONTEND_URL`: (Leave empty for now, we will come back to update this)
6. Click **Create Web Service**. Wait for it to deploy.
7. Copy your backend URL (e.g., `https://blood-donation-api.onrender.com`).

---

## Step 5: Deploy Frontend (Vercel)
1. Go to [Vercel.com](https://vercel.com/) and sign up with GitHub.
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Framework Preset: **Vite**.
5. **Root Directory**: Click Edit and select the `client` folder.
6. **Environment Variables**:
   - `VITE_API_URL`: (Paste your Render Backend URL from Step 4, e.g., `https://blood-donation-api.onrender.com`)
   - *Note: Do NOT add `/api` at the end, just the base URL.*
7. Click **Deploy**.
8. Copy your new Frontend URL (e.g., `https://blood-donation-app.vercel.app`).

---

## Step 6: Final Connection
1. Go back to **Render** (Backend Dashboard) -> **Environment**.
2. Update `FRONTEND_URL` with your new Vercel Frontend URL (from Step 5).
3. Save changes. Render will redeploy automatically.

**Congratulations! Your app is now live!** 🚀
