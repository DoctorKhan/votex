# Comprehensive Deployment Guide for Votex

This guide provides detailed instructions for deploying the Votex application to rezkhan.net/votex using Coolify with secure environment variable handling.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Repository Preparation](#repository-preparation)
3. [Secure Environment Variables with git-crypt](#secure-environment-variables-with-git-crypt)
4. [Deployment Options](#deployment-options)
5. [Automated Deployment](#automated-deployment)
6. [Manual Deployment with Coolify](#manual-deployment-with-coolify)
7. [DNS and Proxy Configuration](#dns-and-proxy-configuration)
8. [Troubleshooting](#troubleshooting)
9. [Security Considerations](#security-considerations)
10. [Updating Your Application](#updating-your-application)
11. [Additional Resources](#additional-resources)

## Prerequisites

- A Coolify server already set up or SSH access to rezkhan.net
- Your project pushed to a Git repository (GitHub, GitLab, etc.)
- Access to manage DNS for rezkhan.net
- Root or sudo privileges on the server
- git-crypt for secure environment variable management (optional but recommended)
- Open ports on server: 80, 443, 3000

## Repository Preparation

Ensure your repository contains these required configuration files:

- **Nixpacks Configuration**:
  - `nixpacks.toml`: Configuration for building the application

- **Next.js Configuration**:
  - `next.config.ts`: Updated for subpath deployment and standalone output

- **Environment Variables**:
  - `.env.example`: Template for required variables
  - `.gitignore`: Updated to ignore .env files but track .env.example

```bash
# Commit and push changes to your Git repository
git add .
git commit -m "Add deployment configuration"
git push
```

## Secure Environment Variables with git-crypt

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

## Deployment Options

There are two main ways to deploy the application:

1. **Automated Deployment**: Using provided scripts to automate the setup process
2. **Manual Deployment**: Manually configuring Coolify to deploy the application

## Automated Deployment

### Step 1: Transfer Files to Server

```bash
# Transfer deployment files to rezkhan.net
./transfer-to-server.sh -u your_username

# If using git-crypt, include the key
./transfer-to-server.sh -u your_username -g
```

### Step 2: Deploy on Server

```bash
# SSH into your server
ssh your_username@rezkhan.net

# Make sure the script is executable
chmod +x ~/deploy-to-rezkhan.sh

# Run the deployment script
sudo ~/deploy-to-rezkhan.sh
```

### Step 3: Follow the Interactive Prompts

The script will:

1. Install Coolify if not already installed
2. Set up Nginx for the /votex subpath
3. Configure SSL with Let's Encrypt
4. Guide you through the Coolify dashboard setup
5. Set up git-crypt if you're using it

Simply follow the prompts and instructions in the terminal.

## Manual Deployment with Coolify

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

## DNS and Proxy Configuration

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

## Troubleshooting

If you encounter issues:

- **Path issues**: Ensure basePath is correctly set in next.config.ts
- **Environment variables**: Check if they're properly set in Coolify
- **git-crypt issues**: Verify .gitattributes is properly configured
- **Proxy issues**: Check nginx/Apache configuration for subpath routing

Debug logs:
- Check Coolify dashboard for deployment logs
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Verify the Nginx configuration: `sudo nginx -t`
- Ensure ports are open in your firewall: `sudo ufw status`

## Security Considerations

- **Never commit .env files without git-crypt** - They contain sensitive API keys
- **Manage git-crypt keys securely** - Store backups in a secure location
- **Automate deployment** - Consider setting up CI/CD with key management
- **Rotate keys periodically** - Update API keys and secrets regularly
- **HTTPS** - The deployment script sets up HTTPS with Let's Encrypt
- **Containerization** - Nixpacks builds are containerized and isolated from the host system

## Updating Your Application

Once set up, you can deploy new versions of your application directly through the Coolify dashboard by:

1. Pushing changes to your Git repository
2. Clicking "Deploy" in the Coolify dashboard

This will pull the latest code, build the application using Nixpacks, and update your deployment.

## Additional Resources

- [Coolify Documentation](https://coolify.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [git-crypt Documentation](https://github.com/AGWA/git-crypt)
