# Votex App Deployment to rezkhan.net/votex

This directory contains everything you need to deploy your Next.js Votex application to rezkhan.net/votex using Coolify.

## Files Overview

- **Nixpacks Configuration**:
  - `nixpacks.toml`: Configuration for building the application

- **Next.js Configuration**:
  - `next.config.ts`: Updated for subpath deployment and standalone output

- **Environment Variables**:
  - `.env.example`: Template for required variables
  - `.gitignore`: Updated to ignore .env files but track .env.example

- **Deployment Scripts**:
  - `deploy-to-rezkhan.sh`: Main server setup script
  - `transfer-to-server.sh`: Automates file transfer to server
  - `setup-git-crypt.sh`: Sets up git-crypt for secure env variables

- **Documentation**:
  - `deployment-guide.md`: Comprehensive deployment guide
  - `how-to-deploy.md`: Quick start deployment guide
  - `DEPLOYMENT-README.md`: This file

## Quick Deployment (3 Steps)

### 1. Prepare Your Repository

```bash
# Initialize git-crypt for secure env variables (optional)
./setup-git-crypt.sh

# Commit and push changes to your Git repository
git add .
git commit -m "Add deployment configuration"
git push
```

### 2. Transfer Files to Server

```bash
# Transfer deployment files to rezkhan.net
./transfer-to-server.sh -u your_username

# If using git-crypt, include the key
./transfer-to-server.sh -u your_username -g
```

### 3. Deploy on Server

```bash
# SSH into your server
ssh your_username@rezkhan.net

# Run the deployment script
sudo ./deploy-to-rezkhan.sh
```

Follow the interactive prompts on the server to complete the setup.

## Post-Deployment

After deployment, your application will be available at:
```
https://rezkhan.net/votex
```

## Server Requirements

- Ubuntu/Debian-based system
- SSH access with sudo privileges
- Open ports: 80, 443, 3000

## Security Considerations

- The deployment script sets up HTTPS with Let's Encrypt
- Environment variables are securely handled (using git-crypt if enabled)
- Nixpacks builds are containerized and isolated from the host system

## Troubleshooting

If you encounter issues, check:
1. Coolify dashboard logs
2. Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Application logs in Coolify dashboard

## Updating Your Application

For future updates, simply push changes to your Git repository and redeploy through the Coolify dashboard.

## Additional Resources

- [Coolify Documentation](https://coolify.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [git-crypt Documentation](https://github.com/AGWA/git-crypt)