<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1U7WpsV8R3VTdIOgtNJ1hHX2ni04rGXYV

## Database Options

This application supports two database options:

1. **PostgreSQL/Cloud SQL** - See `database_schema.sql` for SQL schema
2. **MongoDB** - See `database_schema_mongodb.js` and `MONGODB_SETUP.md` for MongoDB setup

Choose the database that best fits your needs. MongoDB setup guide provides complete instructions for setting up a backend API.

## Run Locally

**Prerequisites:**  Node.js (v16 or higher)

### Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` and add your actual API keys:
   ```bash
   # Get your API key from: https://ai.google.dev/
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

3. **Run the app:**
   ```bash
   npm run dev
   ```

## Security Best Practices

### Environment Variables

**IMPORTANT:** Never commit sensitive information to version control!

- ✅ **DO:** Store API keys and secrets in `.env.local` or `.env` files
- ✅ **DO:** Use the `.env.example` file as a template for required variables
- ✅ **DO:** Add all `.env*` files (except `.env.example`) to `.gitignore`
- ❌ **DON'T:** Hardcode API keys, passwords, or secrets in your source code
- ❌ **DON'T:** Commit `.env.local` or `.env` files to git
- ❌ **DON'T:** Share your API keys publicly or in screenshots

### Managing API Keys

1. **Development:** Use `.env.local` for local development (already ignored by git)
2. **Production:** Set environment variables in your hosting platform (e.g., Vercel, Netlify, Cloud Run)
3. **Team sharing:** Share the `.env.example` file, not actual keys

### File Security Checklist

The following files are automatically excluded from git tracking:
- `.env.local` - Local environment configuration
- `.env.*.local` - Environment-specific configs
- `*.pem`, `*.key`, `*.cert` - SSL certificates and private keys
- `secrets/` - Any secrets directory

### Backend API Security

When connecting to Cloud SQL or other backend services:
- Never store database credentials in frontend code
- Use a backend API service (e.g., Cloud Run, Express server) as an intermediary
- Implement proper authentication and authorization
- Always use HTTPS in production
- Set `API_BASE_URL` in `.env.local` to point to your backend

### Checking for Exposed Secrets

Before committing, verify no secrets are exposed:
```bash
# Check git status
git status

# View what will be committed
git diff --staged

# Ensure .env.local is not tracked
git ls-files | grep ".env"
```

If you accidentally commit a secret:
1. Immediately revoke/rotate the exposed credential
2. Remove it from git history (consider using `git-filter-repo` or BFG Repo-Cleaner)
3. Generate a new secret and update your `.env.local`

## Demo Credentials

For testing the authentication flow, you can use:
- **Email:** `user1` or `user2`
- **Password:** `toms1902`

**Note:** These are demo credentials for development only. In production, implement proper authentication with hashed passwords and secure session management.
