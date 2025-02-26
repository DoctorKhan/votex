# Deploying to rezkhan.net/votex with Coolify

This guide provides step-by-step instructions for deploying this Next.js application to rezkhan.net/votex using Coolify with secure environment variable handling.

## Prerequisites

- A Coolify server already set up
- Your project pushed to a Git repository (GitHub, GitLab, etc.)
- Access to manage DNS for rezkhan.net
- git-crypt for secure environment variable management (optional but recommended)

## 1. Secure Environment Variables with git-crypt

### Why git-crypt?

The .env file contains sensitive API keys and secrets that should never be committed to Git in plaintext. Using git-crypt allows you to:

- Encrypt sensitive files when committed to Git
- Keep them decrypted on your local machine
- Only allow authorized users to decrypt them
- Safely include encrypted credentials in your repo

### Setup git-crypt

1. Install git-crypt:
   ```bash
   # macOS
   brew install git-crypt
   
   # Ubuntu/Debian
   apt-get install git-crypt
   ```

2. Run the provided setup script:
   ```bash
   ./setup-git-crypt.sh
   ```

3. This will:
   - Initialize git-crypt in your repository
   - Configure .gitattributes to encrypt .env files
   - Generate a key for unlocking the repository
   - Keep .env.example unencrypted as a template

4. Add and commit your changes:
   ```bash
   git add .gitattributes .env
   git commit -m "Add encrypted environment variables"
   ```

5. Backup the .git-crypt-key file securely. You'll need it to unlock the repository on your Coolify server.

## 2. Prepare for Deployment

Ensure your repository contains:

- Nixpacks configuration (nixpacks.toml)
- Updated Next.js configuration (basePath, standalone output)
- Environment variable templates (.env.example)

## 3. Deploy with Coolify

### A. Connect Your Repository

1. Log in to your Coolify dashboard
2. Navigate to "Sources" → "New Source"
3. Connect your Git provider and select your repository

### B. Configure Deployment

1. Create a new resource:
   - Click "Create New Resource"
   - Select "Application" → "Nixpacks"
   - Choose your repository

2. Configure environment variables:
   - Add variables from your .env file
   - You may need to add these manually as they are encrypted in the repo

3. Set up domain:
   
   **For subpath deployment (rezkhan.net/votex)**:
   - Configure a proxy on your server to route '/votex' to your Coolify service
   
   **For subdomain (alternative approach)**:
   - Add domain: votex.rezkhan.net
   - Configure DNS: `CNAME votex → your-server-ip`

### C. Unlock git-crypt on Server (if needed)

If your server needs to decrypt files:

1. Transfer your .git-crypt-key to the server securely
2. On the server:
   ```bash
   cd /path/to/repository
   git-crypt unlock /path/to/.git-crypt-key
   ```

3. Make sure to securely delete the key after it's no longer needed:
   ```bash
   shred -u /path/to/.git-crypt-key
   ```

### D. Deploy

1. Trigger deployment from Coolify dashboard
2. Monitor build logs for any errors
3. Once deployed, verify the application at rezkhan.net/votex

## 4. DNS and Proxy Configuration

For a subpath setup (rezkhan.net/votex):

1. Configure your web server (nginx/Apache) with a location block:

```nginx
# Example nginx configuration
location /votex {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## 5. Troubleshooting

- **Path issues**: Ensure basePath is correctly set in next.config.ts
- **Environment variables**: Check if they're properly set in Coolify
- **git-crypt issues**: Verify .gitattributes is properly configured
- **Proxy issues**: Check nginx/Apache configuration for subpath routing

## Security Considerations

- **Never commit .env files without git-crypt** - They contain sensitive API keys
- **Manage git-crypt keys securely** - Store backups in a secure location
- **Automate deployment** - Consider setting up CI/CD with key management
- **Rotate keys periodically** - Update API keys and secrets regularly

By following this guide, your application will be securely deployed to rezkhan.net/votex with Coolify.