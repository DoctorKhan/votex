# How to Deploy to rezkhan.net/votex

I've created a deployment script to automate the process of setting up your Next.js application on rezkhan.net/votex using Coolify. Follow these steps to deploy your application:

## Prerequisites

- SSH access to rezkhan.net
- Root or sudo privileges on the server
- Git repository with your application code

## Step 1: Push Your Changes to Git

Before deploying, make sure your local changes (Nixpacks configuration, Next.js configuration, etc.) are committed and pushed to your Git repository:

```bash
git add .
git commit -m "Add deployment configuration"
git push
```

## Step 2: Transfer the Deployment Script to rezkhan.net

Copy the deployment script to your server:

```bash
scp deploy-to-rezkhan.sh user@rezkhan.net:~/
```

Replace `user` with your SSH username for rezkhan.net.

## Step 3: If Using git-crypt, Transfer the Key (Optional)

If your repository uses git-crypt to encrypt sensitive files like .env:

```bash
# Transfer the git-crypt key
scp .git-crypt-key user@rezkhan.net:~/
```

## Step 4: Connect to Your Server and Run the Script

```bash
# SSH into your server
ssh user@rezkhan.net

# Make sure the script is executable
chmod +x ~/deploy-to-rezkhan.sh

# Run the script with sudo
sudo ~/deploy-to-rezkhan.sh
```

## Step 5: Follow the Interactive Prompts

The script will:

1. Install Coolify if not already installed
2. Set up Nginx for the /votex subpath
3. Configure SSL with Let's Encrypt
4. Guide you through the Coolify dashboard setup
5. Set up git-crypt if you're using it

Simply follow the prompts and instructions in the terminal.

## Step 6: Complete the Coolify Dashboard Setup

During execution, the script will pause and provide instructions for steps you need to complete in the Coolify dashboard:

1. Connect your Git repository
2. Configure the deployment settings
3. Set up environment variables
4. Deploy the application

## Step 7: Verify Your Deployment

After the script completes, your application should be accessible at:

```
https://rezkhan.net/votex
```

## Troubleshooting

If you encounter issues:

1. Check the Coolify dashboard for deployment logs
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify the Nginx configuration: `sudo nginx -t`
4. Ensure ports are open in your firewall: `sudo ufw status`

## Notes for Future Deployments

Once set up, you can deploy new versions of your application directly through the Coolify dashboard by:

1. Pushing changes to your Git repository
2. Clicking "Deploy" in the Coolify dashboard

This will pull the latest code, build the application using Nixpacks, and update your deployment.