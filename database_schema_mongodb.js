/**
 * MongoDB Database Schema for Jobs Platform
 * 
 * This file defines the structure of collections and documents for MongoDB.
 * MongoDB is a NoSQL database that stores data in flexible, JSON-like documents.
 * 
 * Setup Instructions:
 * 1. Install MongoDB: https://www.mongodb.com/docs/manual/installation/
 * 2. Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas
 * 3. Install MongoDB driver: npm install mongodb
 * 4. Set MONGODB_URI in your .env.local file
 */

// ============================================================================
// USERS Collection
// ============================================================================
// Stores user authentication and basic account information
const usersSchema = {
  _id: "ObjectId",                    // MongoDB auto-generated unique ID
  email: "string",                    // Unique email address (create unique index)
  passwordHash: "string",             // Hashed password (never store plain text)
  role: "string",                     // "student" or "employer"
  createdAt: "Date",                  // Account creation timestamp
  updatedAt: "Date"                   // Last update timestamp
};

// Example document:
const userExample = {
  _id: ObjectId("507f1f77bcf86cd799439011"),
  email: "student@example.com",
  passwordHash: "$2b$10$...",
  role: "student",
  createdAt: new Date("2024-01-15T10:00:00Z"),
  updatedAt: new Date("2024-01-15T10:00:00Z")
};

// Indexes for users collection:
// db.users.createIndex({ email: 1 }, { unique: true })
// db.users.createIndex({ role: 1 })


// ============================================================================
// STUDENT_PROFILES Collection
// ============================================================================
// Stores detailed profile information for students
// One-to-many relationship with work_experience is embedded as an array
const studentProfilesSchema = {
  _id: "ObjectId",
  userId: "ObjectId",                 // Reference to users._id
  firstName: "string",
  lastName: "string",
  university: "string",
  degree: "string",
  bio: "string",
  phone: "string",
  portfolioUrl: "string",
  linkedinUrl: "string",
  skills: ["string"],                 // Array of skill strings
  // Embedded work experience (no separate collection needed)
  workExperience: [
    {
      _id: "ObjectId",                // Sub-document ID
      role: "string",
      company: "string",
      period: "string"
    }
  ],
  createdAt: "Date",
  updatedAt: "Date"
};

// Example document:
const studentProfileExample = {
  _id: ObjectId("507f1f77bcf86cd799439012"),
  userId: ObjectId("507f1f77bcf86cd799439011"),
  firstName: "Alex",
  lastName: "Byrne",
  university: "Trinity College Dublin (TCD)",
  degree: "BSc Computer Science",
  bio: "Dedicated student looking for part-time work",
  phone: "+353 87 123 4567",
  portfolioUrl: "https://alexbyrne.dev",
  linkedinUrl: "https://linkedin.com/in/alexbyrne",
  skills: ["JavaScript", "React", "Node.js"],
  workExperience: [
    {
      _id: ObjectId("507f1f77bcf86cd799439013"),
      role: "Barista",
      company: "Starbucks",
      period: "Summer 2023"
    },
    {
      _id: ObjectId("507f1f77bcf86cd799439014"),
      role: "Tutor",
      company: "University Tutorial Center",
      period: "2023-2024"
    }
  ],
  createdAt: new Date("2024-01-15T10:30:00Z"),
  updatedAt: new Date("2024-01-15T10:30:00Z")
};

// Indexes for student_profiles collection:
// db.student_profiles.createIndex({ userId: 1 }, { unique: true })
// db.student_profiles.createIndex({ university: 1 })
// db.student_profiles.createIndex({ skills: 1 })


// ============================================================================
// JOBS Collection
// ============================================================================
// Stores job listings posted by employers
const jobsSchema = {
  _id: "ObjectId",
  employerId: "ObjectId",             // Reference to users._id
  title: "string",
  companyName: "string",
  location: "string",
  logo: "string",                     // URL to company logo
  salaryMin: "number",                // Minimum hourly rate
  salaryMax: "number",                // Maximum hourly rate
  tags: ["string"],                   // Array of tags (e.g., "Remote", "Internship")
  description: "string",
  responsibilities: ["string"],       // Array of responsibility strings
  skills: ["string"],                 // Required skills array
  status: "string",                   // "active" or "closed"
  deadline: "Date",                   // Application deadline
  contact: "string",                  // Contact email or info
  applicantCount: "number",           // Number of applicants
  postedAt: "string",                 // Display string (e.g., "2 days ago")
  createdAt: "Date",
  updatedAt: "Date"
};

// Example document:
const jobExample = {
  _id: ObjectId("507f1f77bcf86cd799439015"),
  employerId: ObjectId("507f1f77bcf86cd799439016"),
  title: "Student Barista",
  companyName: "Café Delight",
  location: "Dublin 2",
  logo: "https://example.com/logo.png",
  salaryMin: 12.50,
  salaryMax: 15.00,
  tags: ["Part-time", "Flexible Hours"],
  description: "We're looking for enthusiastic students to join our café team...",
  responsibilities: [
    "Prepare and serve coffee and beverages",
    "Maintain cleanliness of the café",
    "Provide excellent customer service"
  ],
  skills: ["Customer Service", "Communication"],
  status: "active",
  deadline: new Date("2024-02-15T23:59:59Z"),
  contact: "hiring@cafedelight.ie",
  applicantCount: 5,
  postedAt: "2 days ago",
  createdAt: new Date("2024-01-13T10:00:00Z"),
  updatedAt: new Date("2024-01-15T10:00:00Z")
};

// Indexes for jobs collection:
// db.jobs.createIndex({ employerId: 1 })
// db.jobs.createIndex({ status: 1 })
// db.jobs.createIndex({ location: 1 })
// db.jobs.createIndex({ tags: 1 })
// db.jobs.createIndex({ createdAt: -1 })


// ============================================================================
// APPLICATIONS Collection (Optional - for tracking applications)
// ============================================================================
// Stores student applications to jobs
const applicationsSchema = {
  _id: "ObjectId",
  jobId: "ObjectId",                  // Reference to jobs._id
  studentId: "ObjectId",              // Reference to users._id
  status: "string",                   // "applied", "review", "interview", "offer", "rejected"
  appliedDate: "Date",
  coverLetter: "string",              // Optional cover letter
  resume: "string",                   // URL to resume file
  createdAt: "Date",
  updatedAt: "Date"
};

// Example document:
const applicationExample = {
  _id: ObjectId("507f1f77bcf86cd799439017"),
  jobId: ObjectId("507f1f77bcf86cd799439015"),
  studentId: ObjectId("507f1f77bcf86cd799439011"),
  status: "applied",
  appliedDate: new Date("2024-01-14T15:30:00Z"),
  coverLetter: "I am very interested in this position...",
  resume: "https://storage.example.com/resumes/student123.pdf",
  createdAt: new Date("2024-01-14T15:30:00Z"),
  updatedAt: new Date("2024-01-14T15:30:00Z")
};

// Indexes for applications collection:
// db.applications.createIndex({ jobId: 1 })
// db.applications.createIndex({ studentId: 1 })
// db.applications.createIndex({ status: 1 })
// Compound index for finding student's applications
// db.applications.createIndex({ studentId: 1, status: 1 })


// ============================================================================
// MESSAGES Collection (Optional - for employer-student messaging)
// ============================================================================
// Stores messages between employers and students
const messagesSchema = {
  _id: "ObjectId",
  jobId: "ObjectId",                  // Reference to jobs._id
  senderId: "ObjectId",               // Reference to users._id (who sent)
  receiverId: "ObjectId",             // Reference to users._id (who receives)
  studentName: "string",              // Cached for quick display
  text: "string",                     // Message content
  isRead: "boolean",                  // Read status
  timestamp: "Date",
  createdAt: "Date"
};

// Example document:
const messageExample = {
  _id: ObjectId("507f1f77bcf86cd799439018"),
  jobId: ObjectId("507f1f77bcf86cd799439015"),
  senderId: ObjectId("507f1f77bcf86cd799439011"),
  receiverId: ObjectId("507f1f77bcf86cd799439016"),
  studentName: "Alex Byrne",
  text: "I'm interested in this position. When can we schedule an interview?",
  isRead: false,
  timestamp: new Date("2024-01-15T14:20:00Z"),
  createdAt: new Date("2024-01-15T14:20:00Z")
};

// Indexes for messages collection:
// db.messages.createIndex({ jobId: 1 })
// db.messages.createIndex({ receiverId: 1, isRead: 1 })
// db.messages.createIndex({ timestamp: -1 })


// ============================================================================
// MongoDB Connection Setup (Node.js/TypeScript Backend)
// ============================================================================

/*
// Example backend connection code (create a separate backend project)

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = 'jobsv3';

let client: MongoClient;
let db;

export async function connectToDatabase() {
  if (db) return { db, client };
  
  client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(DATABASE_NAME);
  
  console.log('Connected to MongoDB');
  return { db, client };
}

// Example: Create user
export async function createUser(email: string, passwordHash: string, role: string) {
  const { db } = await connectToDatabase();
  const result = await db.collection('users').insertOne({
    email,
    passwordHash,
    role,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return result;
}

// Example: Get student profile with user info
export async function getStudentProfile(userId: string) {
  const { db } = await connectToDatabase();
  
  // Using aggregation to join user and profile data
  const profile = await db.collection('student_profiles').aggregate([
    { $match: { userId: new ObjectId(userId) } },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' }
  ]).toArray();
  
  return profile[0];
}

// Example: Get active jobs
export async function getActiveJobs() {
  const { db } = await connectToDatabase();
  const jobs = await db.collection('jobs')
    .find({ status: 'active' })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
  return jobs;
}
*/

// ============================================================================
// Key Differences from SQL:
// ============================================================================
/*
1. No Foreign Keys: MongoDB uses references (ObjectId) but doesn't enforce them
2. Embedded Documents: Work experience is embedded in student profiles (denormalized)
3. Flexible Schema: Documents in the same collection can have different fields
4. Arrays: Skills, tags, responsibilities are stored as arrays directly
5. Indexes: Create indexes manually for performance (like SQL indexes)
6. Joins: Use $lookup in aggregation pipeline (similar to SQL JOINs)
7. _id: MongoDB auto-generates ObjectId instead of UUID
*/

// ============================================================================
// Migration Notes:
// ============================================================================
/*
If migrating from SQL to MongoDB:

1. Export data from PostgreSQL/SQL database
2. Transform data:
   - UUIDs → ObjectIds
   - Join work_experience into student_profiles as embedded array
   - Convert arrays (split comma-separated values if needed)
3. Import into MongoDB collections
4. Create indexes as shown above
5. Update backend API code to use MongoDB driver instead of SQL queries
6. Test all CRUD operations
*/

module.exports = {
  usersSchema,
  studentProfilesSchema,
  jobsSchema,
  applicationsSchema,
  messagesSchema
};
