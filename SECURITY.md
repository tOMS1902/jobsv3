# Security Policy

## Protecting Sensitive Information

This project follows security best practices to protect API keys, credentials, and other sensitive information.

### Environment Variables

All sensitive configuration is managed through environment variables:

- **`.env.local`** - Your local development environment variables (never committed to git)
- **`.env.example`** - Template showing required environment variables (safe to commit)

### What's Protected

The following are automatically excluded from version control via `.gitignore`:

1. **Environment files:**
   - `.env`
   - `.env.local`
   - `.env.*.local`
   - `.env.development.local`
   - `.env.test.local`
   - `.env.production.local`

2. **Certificates and keys:**
   - `*.pem`
   - `*.key`
   - `*.cert`

3. **Secret directories:**
   - `secrets/`
   - `config/secrets.json`

### Setup for Developers

1. Copy `.env.example` to `.env.local`
2. Fill in your actual API keys and secrets
3. Never commit `.env.local` to version control

### For Production Deployment

Set environment variables directly in your hosting platform:

- **Vercel:** Project Settings → Environment Variables
- **Netlify:** Site Settings → Environment Variables
- **Google Cloud Run:** Deploy with `--set-env-vars` flag
- **Heroku:** Config Vars in dashboard

### API Key Guidelines

#### Gemini API Key
- Obtain from: https://ai.google.dev/
- Set as: `GEMINI_API_KEY` in `.env.local`
- **Never** hardcode in source files

#### Backend API URL
- Development: `http://localhost:3001`
- Production: Set `API_BASE_URL` to your backend service URL
- Example: `https://your-backend.a.run.app`

### Database Security

When implementing backend API connections:

1. **Never** store database credentials in frontend code
2. Use a backend service (Cloud Run, Express) as a proxy
3. Implement proper authentication middleware
4. Use connection pooling for database connections
5. Enable SSL/TLS for database connections
6. Use environment variables for all database configuration

### Authentication Security

Current demo implementation uses test credentials for development. For production:

1. **Password Hashing:** Use bcrypt or Argon2 for password hashing
2. **Session Management:** Implement secure session tokens (JWT, etc.)
3. **HTTPS Only:** Always use HTTPS in production
4. **Rate Limiting:** Implement rate limiting on authentication endpoints
5. **Token Expiration:** Use short-lived access tokens with refresh tokens

### Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Email the repository owner privately
3. Provide details about the vulnerability
4. Allow time for a fix before public disclosure

### Security Checklist for Contributors

Before committing code:

- [ ] No API keys or secrets in code
- [ ] All sensitive config uses environment variables
- [ ] `.env.local` is not tracked by git
- [ ] No database credentials in source files
- [ ] No hardcoded passwords or tokens
- [ ] Updated `.env.example` if new variables added

### Verification Commands

```bash
# Check for accidentally tracked secrets
git ls-files | grep -E "\.env$|\.env\.local"

# Should return nothing - if it shows files, they need to be removed

# Search for potential hardcoded secrets (development check)
grep -r "api_key\|apiKey\|secret\|password" --include="*.ts" --include="*.tsx" src/
```

### Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Vite Environment Variables Guide](https://vitejs.dev/guide/env-and-mode.html)
