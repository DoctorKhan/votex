#!/bin/bash
set -e

# Colors for pretty output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_message() {
  echo -e "${BLUE}[DEPLOY]${NC} $1"
}

print_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  print_error "This script must be run as root or with sudo"
  exit 1
fi

# Ask for confirmation
read -p "This script will set up Coolify and deploy your Next.js app to rezkhan.net/votex. Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  print_message "Deployment cancelled"
  exit 0
fi

# Set variables
DOMAIN="rezkhan.net"
SUBPATH="/votex"
COOLIFY_DIR="/opt/coolify"
REPO_URL="" # To be filled in by user
GIT_BRANCH="main"
COOLIFY_VERSION="latest"

# Get repo URL if not set
if [ -z "$REPO_URL" ]; then
  read -p "Enter your Git repository URL: " REPO_URL
  if [ -z "$REPO_URL" ]; then
    print_error "Repository URL is required"
    exit 1
  fi
fi

# Ask for git branch
read -p "Enter the Git branch to deploy [default: main]: " INPUT_BRANCH
GIT_BRANCH=${INPUT_BRANCH:-$GIT_BRANCH}

# Check if Coolify is installed
check_coolify() {
  if [ -d "$COOLIFY_DIR" ]; then
    print_message "Coolify already installed at $COOLIFY_DIR"
    return 0
  else
    return 1
  fi
}

# Install Coolify if not already installed
install_coolify() {
  print_message "Installing Coolify..."
  
  # Create Coolify directory
  mkdir -p $COOLIFY_DIR
  cd $COOLIFY_DIR
  
  # Install Coolify with automatic yes to all prompts and disabled telemetry
  curl -fsSL https://get.coollabs.io/coolify/install.sh | bash -s -- --yes --do-not-track
  
  print_success "Coolify installed successfully"
  
  # Get Coolify URL
  COOLIFY_URL=$(grep "Dashboard" /root/.coolify/coolify-output.log | awk '{print $NF}')
  print_message "Coolify dashboard available at: $COOLIFY_URL"
  print_message "Please complete the initial setup through the dashboard."
  
  # Wait for user to complete setup
  read -p "Press Enter once you've completed the Coolify setup through the web dashboard..."
}

# Set up SSL with Certbot
setup_ssl() {
  print_message "Setting up SSL for $DOMAIN..."
  
  # Check if SSL is already configured
  if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    print_warning "SSL certificate already exists for $DOMAIN"
    print_message "Would you like to renew it? (y/n)"
    read -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      print_message "Skipping SSL setup"
      return
    fi
  fi
  
  # Check if Certbot is installed
  if ! command -v certbot &> /dev/null; then
    print_message "Installing Certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
  fi
  
  # Get email for certificate
  read -p "Enter email address for SSL certificate notifications [default: admin@$DOMAIN]: " SSL_EMAIL
  SSL_EMAIL=${SSL_EMAIL:-admin@$DOMAIN}
  
  # Get SSL certificate
  print_message "Obtaining SSL certificate from Let's Encrypt..."
  if certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $SSL_EMAIL; then
    print_success "SSL certificate installed for $DOMAIN"
  else
    print_error "Failed to obtain SSL certificate"
    print_message "Would you like to continue without SSL? (y/n)"
    read -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      print_error "Deployment cancelled due to SSL failure"
      exit 1
    fi
    print_warning "Continuing without SSL - site will use HTTP only"
    
    # Update Nginx config to work without SSL
    sed -i 's/listen 443 ssl;/listen 80;/g' /etc/nginx/sites-available/$DOMAIN
    sed -i '/ssl_certificate/d' /etc/nginx/sites-available/$DOMAIN
    sed -i '/ssl_certificate_key/d' /etc/nginx/sites-available/$DOMAIN
    sed -i '/ssl_protocols/d' /etc/nginx/sites-available/$DOMAIN
    sed -i '/ssl_prefer_server_ciphers/d' /etc/nginx/sites-available/$DOMAIN
    sed -i '/ssl_ciphers/d' /etc/nginx/sites-available/$DOMAIN
    
    # Remove the HTTP to HTTPS redirect
    sed -i '/return 301/d' /etc/nginx/sites-available/$DOMAIN
  fi
}

# Set up git-crypt (optional)
setup_git_crypt() {
  print_message "Do you want to set up git-crypt for secure environment variables? (y/n)"
  read -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_message "Skipping git-crypt setup"
    return
  fi
  
  # Check if git-crypt is installed
  if ! command -v git-crypt &> /dev/null; then
    print_message "Installing git-crypt..."
    apt-get update
    apt-get install -y git-crypt
  fi
  
  print_message "Do you have a git-crypt key to unlock the repository? (y/n)"
  read -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter the path to your git-crypt key file: " KEY_PATH
    if [ -f "$KEY_PATH" ]; then
      print_message "Using git-crypt key at $KEY_PATH"
      # Key will be used during deployment
    else
      print_error "Key file not found at $KEY_PATH"
      return
    fi
  else
    print_warning "Without a git-crypt key, you may need to configure environment variables manually"
  fi
}

# Create Coolify deployment
create_coolify_deployment() {
  print_message "Setting up deployment in Coolify..."
  
  # Check if Coolify is accessible
  COOLIFY_URL=$(grep "Dashboard" /root/.coolify/coolify-output.log 2>/dev/null | awk '{print $NF}')
  if [ -z "$COOLIFY_URL" ]; then
    COOLIFY_URL="http://localhost:8000"
    print_warning "Could not automatically detect Coolify URL."
    print_message "Using default Coolify URL: $COOLIFY_URL"
    print_message "If this is incorrect, you can access Coolify at its actual URL."
  else
    print_message "Coolify dashboard available at: $COOLIFY_URL"
  fi
  
  # Ask for confirmation before proceeding
  print_message "Would you like detailed guidance for setting up in Coolify? (y/n)"
  read -n 1 -r
  echo
  
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_message "Please complete the following steps in the Coolify dashboard:"
    
    cat <<EOF

===== MANUAL STEPS IN COOLIFY DASHBOARD =====

1. Go to "Sources" and connect your Git provider:
   - Click on "Sources" in the left sidebar
   - Click "New Source"
   - Select your Git provider (GitHub, GitLab, etc.)
   - Follow the authentication steps
   
2. Add your repository:
   - After connecting, select your repository: $REPO_URL
   - If you don't see it, you may need to search or refresh permissions

3. Create a new resource:
   - From the dashboard, click "New Resource"
   - Select "Application" → "Nixpacks"
   - Choose your repository
   - Set branch to: $GIT_BRANCH
   - Click "Create Resource"

4. Configure environment variables:
   - In your new resource, go to the "Settings" tab
   - Scroll to "Environment Variables"
   - Add at minimum:
     INSTANTDB_APP_ID=13b4b31a-32d6-4f29-a77e-6b532a047976
     NODE_ENV=production
     GROQ_API_KEY=(if present in your .env file)

5. Configure domain:
   - In the "Settings" tab, scroll to "Hostname"
   - Set Hostname: $DOMAIN
   - Set subpath: $SUBPATH
   - Enable HTTPS if SSL is configured
   
6. Deploy the application:
   - Go to the "Overview" tab
   - Click "Deploy" button
   - Monitor build logs for any errors

===== END MANUAL STEPS =====

EOF
  else
    print_message "Opening Coolify dashboard. Set up your deployment with repository: $REPO_URL, branch: $GIT_BRANCH"
  fi

  print_message "Open the Coolify dashboard at: $COOLIFY_URL"
  
  # Provide an option to open the dashboard if on a desktop system
  if command -v xdg-open &> /dev/null || command -v open &> /dev/null; then
    print_message "Would you like to automatically open the Coolify dashboard? (y/n)"
    read -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      if command -v xdg-open &> /dev/null; then
        xdg-open "$COOLIFY_URL"
      elif command -v open &> /dev/null; then
        open "$COOLIFY_URL"
      fi
    fi
  fi
  
  read -p "Press Enter once you've completed the deployment in Coolify..."
}

# Main deployment process
main() {
  print_message "Starting deployment to $DOMAIN$SUBPATH..."
  
  # Check and install Coolify if needed
  if ! check_coolify; then
    install_coolify
  fi
  
  # Setup git-crypt
  setup_git_crypt
    
  # Setup SSL
  setup_ssl
  
  # Create Coolify deployment
  create_coolify_deployment
  
  print_success "Deployment setup completed!"
  print_message "Your application should now be accessible at https://$DOMAIN$SUBPATH"
  print_message "Check the Coolify dashboard for deployment status and logs"
}

# Run the main function
main

exit 0