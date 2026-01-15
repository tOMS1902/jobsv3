# MongoDB Setup Guide for Jobs Platform

This guide explains how to set up MongoDB for the Jobs v3 platform.

## Overview

The application has been designed to work with MongoDB, a NoSQL document database. The schema is defined in `database_schema_mongodb.js`.

## Collections

The MongoDB database includes the following collections:

1. **users** - User authentication and account information
2. **student_profiles** - Student profile data with embedded work experience
3. **jobs** - Job listings posted by employers
4. **applications** - (Optional) Student applications to jobs
5. **messages** - (Optional) Messages between employers and students

## Setup Options

### Option 1: MongoDB Atlas (Cloud - Recommended for Production)

1. **Create an Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "Free" tier (M0)
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add specific IP addresses

4. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password (save these securely)
   - Grant "Read and Write to any database" role

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Add to `.env.local`:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/jobsv3?retryWrites=true&w=majority
     ```

### Option 2: Local MongoDB Installation

1. **Install MongoDB**
   
   **macOS:**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   ```

   **Ubuntu/Debian:**
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   sudo systemctl start mongod
   ```

   **Windows:**
   - Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Run the installer
   - Choose "Complete" installation
   - MongoDB Compass (GUI) will be included

2. **Verify Installation**
   ```bash
   mongosh
   ```

3. **Set Connection String**
   - Add to `.env.local`:
     ```
     MONGODB_URI=mongodb://localhost:27017/jobsv3
     ```

## Backend Setup

Since this is a frontend application, you need to create a separate backend service to connect to MongoDB.

### Create Backend Project

1. **Initialize Backend**
   ```bash
   mkdir backend
   cd backend
   npm init -y
   ```

2. **Install Dependencies**
   ```bash
   npm install express mongodb cors dotenv
   npm install --save-dev typescript @types/express @types/node @types/cors nodemon ts-node
   ```

3. **Create `tsconfig.json`**
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "commonjs",
       "lib": ["ES2020"],
       "outDir": "./dist",
       "rootDir": "./src",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules"]
   }
   ```

4. **Create `.env` File**
   ```
   MONGODB_URI=mongodb://localhost:27017/jobsv3
   # or for Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/jobsv3
   PORT=3001
   ```

5. **Create `src/db.ts`**
   ```typescript
   import { MongoClient, Db, ObjectId } from 'mongodb';
   
   const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
   const DATABASE_NAME = 'jobsv3';
   
   let client: MongoClient;
   let db: Db;
   
   export async function connectToDatabase() {
     if (db) return { db, client };
     
     client = new MongoClient(MONGODB_URI);
     await client.connect();
     db = client.db(DATABASE_NAME);
     
     console.log('✓ Connected to MongoDB');
     
     // Create indexes
     await createIndexes(db);
     
     return { db, client };
   }
   
   async function createIndexes(db: Db) {
     // Users
     await db.collection('users').createIndex({ email: 1 }, { unique: true });
     await db.collection('users').createIndex({ role: 1 });
     
     // Student Profiles
     await db.collection('student_profiles').createIndex({ userId: 1 }, { unique: true });
     await db.collection('student_profiles').createIndex({ university: 1 });
     await db.collection('student_profiles').createIndex({ skills: 1 });
     
     // Jobs
     await db.collection('jobs').createIndex({ employerId: 1 });
     await db.collection('jobs').createIndex({ status: 1 });
     await db.collection('jobs').createIndex({ location: 1 });
     await db.collection('jobs').createIndex({ tags: 1 });
     await db.collection('jobs').createIndex({ createdAt: -1 });
     
     console.log('✓ Indexes created');
   }
   
   export { ObjectId };
   ```

6. **Create `src/server.ts`**
   ```typescript
   import express from 'express';
   import cors from 'cors';
   import dotenv from 'dotenv';
   import { connectToDatabase, ObjectId } from './db';
   
   dotenv.config();
   
   const app = express();
   const PORT = process.env.PORT || 3001;
   
   app.use(cors());
   app.use(express.json());
   
   // Health check
   app.get('/health', (req, res) => {
     res.json({ status: 'ok' });
   });
   
   // Get all active jobs
   app.get('/api/jobs', async (req, res) => {
     try {
       const { db } = await connectToDatabase();
       const jobs = await db.collection('jobs')
         .find({ status: 'active' })
         .sort({ createdAt: -1 })
         .limit(50)
         .toArray();
       res.json(jobs);
     } catch (error) {
       res.status(500).json({ error: 'Failed to fetch jobs' });
     }
   });
   
   // Get student profile
   app.get('/api/profile/:userId', async (req, res) => {
     try {
       const { db } = await connectToDatabase();
       const profile = await db.collection('student_profiles')
         .findOne({ userId: new ObjectId(req.params.userId) });
       res.json(profile);
     } catch (error) {
       res.status(500).json({ error: 'Failed to fetch profile' });
     }
   });
   
   // Save student profile
   app.post('/api/profile', async (req, res) => {
     try {
       const { db } = await connectToDatabase();
       const profile = req.body;
       profile.updatedAt = new Date();
       
       const result = await db.collection('student_profiles').updateOne(
         { userId: new ObjectId(profile.userId) },
         { $set: profile },
         { upsert: true }
       );
       
       res.json({ success: true, result });
     } catch (error) {
       res.status(500).json({ error: 'Failed to save profile' });
     }
   });
   
   // Start server
   app.listen(PORT, () => {
     console.log(`✓ Backend server running on http://localhost:${PORT}`);
     connectToDatabase().catch(console.error);
   });
   ```

7. **Update `package.json` Scripts**
   ```json
   {
     "scripts": {
       "dev": "nodemon --exec ts-node src/server.ts",
       "build": "tsc",
       "start": "node dist/server.js"
     }
   }
   ```

8. **Run Backend**
   ```bash
   npm run dev
   ```

## Update Frontend Configuration

1. **Update `.env.local`** in the frontend project:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   API_BASE_URL=http://localhost:3001
   NODE_ENV=development
   ```

2. The frontend `apiService.ts` is already configured to use `API_BASE_URL`

## Initialize Database with Sample Data

Create a script to populate initial data:

```javascript
// backend/scripts/seed.js
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('jobsv3');
  
  // Clear existing data
  await db.collection('users').deleteMany({});
  await db.collection('student_profiles').deleteMany({});
  await db.collection('jobs').deleteMany({});
  
  // Create test users
  const studentId = new ObjectId();
  const employerId = new ObjectId();
  
  await db.collection('users').insertMany([
    {
      _id: studentId,
      email: 'user1',
      passwordHash: '$2b$10$testHashForDemo',
      role: 'student',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: employerId,
      email: 'user2',
      passwordHash: '$2b$10$testHashForDemo',
      role: 'employer',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  
  // Create student profile
  await db.collection('student_profiles').insertOne({
    userId: studentId,
    firstName: 'Test',
    lastName: 'Student',
    university: 'Trinity College Dublin (TCD)',
    degree: 'BSc Computer Science',
    bio: 'Dedicated student looking for part-time work',
    phone: '+353 87 123 4567',
    portfolioUrl: '',
    linkedinUrl: '',
    skills: ['Communication', 'Time Management'],
    workExperience: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Create sample job
  await db.collection('jobs').insertOne({
    employerId: employerId,
    title: 'Student Barista',
    companyName: 'Café Delight',
    location: 'Dublin 2',
    logo: 'https://picsum.photos/seed/cafe/200',
    salaryMin: 12.50,
    salaryMax: 15.00,
    tags: ['Part-time', 'Flexible Hours'],
    description: 'We are looking for enthusiastic students to join our café team...',
    responsibilities: [
      'Prepare and serve coffee and beverages',
      'Maintain cleanliness of the café',
      'Provide excellent customer service'
    ],
    skills: ['Customer Service'],
    status: 'active',
    deadline: new Date('2024-12-31'),
    contact: 'hiring@cafedelight.ie',
    applicantCount: 0,
    postedAt: 'Just now',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  console.log('✓ Database seeded successfully');
  await client.close();
}

seed().catch(console.error);
```

Run with: `node scripts/seed.js`

## Testing

1. **Start MongoDB** (if local)
2. **Start Backend**: `cd backend && npm run dev`
3. **Start Frontend**: `npm run dev`
4. Navigate to `http://localhost:3000`

## Deployment

### Backend Deployment (Google Cloud Run Example)

1. **Create `Dockerfile`**
   ```dockerfile
   FROM node:18
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   EXPOSE 8080
   CMD ["npm", "start"]
   ```

2. **Deploy**
   ```bash
   gcloud run deploy jobsv3-backend \
     --source . \
     --platform managed \
     --region us-central1 \
     --set-env-vars MONGODB_URI=your_atlas_connection_string
   ```

3. **Update Frontend** `.env.local`:
   ```
   API_BASE_URL=https://jobsv3-backend-xxxxx.run.app
   ```

## Monitoring

- **MongoDB Atlas**: Built-in monitoring dashboard
- **Local MongoDB**: Use MongoDB Compass GUI
- **Logs**: Check backend console output

## Troubleshooting

### Connection Issues
- Verify MongoDB is running: `mongosh`
- Check connection string in `.env`
- For Atlas: Verify IP whitelist settings

### Authentication Errors
- Check database user credentials
- Verify user has proper permissions

### Performance
- Ensure indexes are created (see `createIndexes` function)
- Monitor slow queries in MongoDB logs
- Use MongoDB Atlas Performance Advisor

## References

- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [MongoDB Compass](https://www.mongodb.com/products/compass)
