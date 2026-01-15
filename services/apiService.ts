
import { User, StudentProfile, JobListing } from '../types.ts';

/**
 * Get the backend API base URL from environment variables
 * Falls back to a local development URL if not configured
 */
const getApiBaseUrl = (): string => {
  // Try to get from environment variable first
  const envUrl = process.env.API_BASE_URL;
  
  if (envUrl) {
    return envUrl;
  }
  
  // Default to local development URL
  console.warn(
    'API_BASE_URL not configured in environment variables. Using local development URL. ' +
    'For production, set API_BASE_URL in your .env.local file.'
  );
  return 'http://localhost:3001';
};

/**
 * NOTE: To connect to Cloud SQL, these methods would call a backend API 
 * (e.g., hosted on Google Cloud Run) that has access to your DB credentials.
 * 
 * SECURITY BEST PRACTICES:
 * - Never store database credentials in the frontend code
 * - Always use environment variables for sensitive configuration
 * - Backend API should handle authentication and authorization
 * - Use HTTPS in production for secure data transmission
 */

export const apiService = {
  // User Authentication
  async login(email: string, pass: string): Promise<any> {
    const apiBaseUrl = getApiBaseUrl();
    // In a real app: return fetch(`${apiBaseUrl}/auth/login`, { ... })
    console.log("API: Authenticating user against SQL database...");
    console.log(`API Base URL: ${apiBaseUrl}`);
    return null; 
  },

  // Profile Management
  async saveStudentProfile(profile: StudentProfile): Promise<boolean> {
    const apiBaseUrl = getApiBaseUrl();
    console.log("API: Saving profile to student_profiles and work_experience tables...");
    console.log(`API Base URL: ${apiBaseUrl}`);
    // Real implementation would use an Auth token
    try {
      /*
      const response = await fetch(`${apiBaseUrl}/profile`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}` // Token should come from secure auth flow
        },
        body: JSON.stringify(profile)
      });
      return response.ok;
      */
      return true;
    } catch (e) {
      return false;
    }
  },

  async getStudentProfile(userId: string): Promise<StudentProfile | null> {
    const apiBaseUrl = getApiBaseUrl();
    console.log(`API: Fetching profile for user ${userId} with JOIN on work_experience...`);
    console.log(`API Base URL: ${apiBaseUrl}`);
    return null;
  },

  // Job Management
  async postJob(job: Partial<JobListing>): Promise<JobListing | null> {
    const apiBaseUrl = getApiBaseUrl();
    console.log("API: Inserting new record into jobs table...");
    console.log(`API Base URL: ${apiBaseUrl}`);
    return null;
  }
};
