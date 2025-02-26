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
  echo -e "${BLUE}[TRANSFER]${NC} $1"
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

# Default values
SERVER="rezkhan.net"
USER=""
USE_GIT_CRYPT=false
GIT_CRYPT_KEY=".git-crypt-key"

# Parse command-line options
while getopts "u:k:hg" opt; do
  case $opt in
    u)
      USER=$OPTARG
      ;;
    k)
      GIT_CRYPT_KEY=$OPTARG
      USE_GIT_CRYPT=true
      ;;
    g)
      USE_GIT_CRYPT=true
      ;;
    h)
      echo "Usage: $0 [-u username] [-g] [-k path/to/git-crypt-key] [-h]"
      echo "  -u  SSH username for rezkhan.net (default: prompt for it)"
      echo "  -g  Include git-crypt key in transfer"
      echo "  -k  Path to git-crypt key (default: .git-crypt-key)"
      echo "  -h  Show this help message"
      exit 0
      ;;
    \?)
      print_error "Invalid option: -$OPTARG"
      exit 1
      ;;
    :)
      print_error "Option -$OPTARG requires an argument."
      exit 1
      ;;
  esac
done

# Ask for username if not provided
if [ -z "$USER" ]; then
  read -p "Enter your SSH username for $SERVER: " USER
  if [ -z "$USER" ]; then
    print_error "Username is required"
    exit 1
  fi
fi

# Begin transfer
print_message "Preparing to transfer deployment files to $USER@$SERVER..."

# Create a temporary directory for the files
TEMP_DIR=$(mktemp -d)
print_message "Creating temporary directory at $TEMP_DIR"

# Copy files to temporary directory
cp deploy-to-rezkhan.sh $TEMP_DIR/
chmod +x $TEMP_DIR/deploy-to-rezkhan.sh

# If using git-crypt, check if key exists
if [ "$USE_GIT_CRYPT" = true ]; then
  if [ -f "$GIT_CRYPT_KEY" ]; then
    print_message "Including git-crypt key: $GIT_CRYPT_KEY"
    cp "$GIT_CRYPT_KEY" $TEMP_DIR/
  else
    print_warning "git-crypt key not found at $GIT_CRYPT_KEY - skipping"
    USE_GIT_CRYPT=false
  fi
fi

# Transfer files to server
print_message "Transferring files to $USER@$SERVER..."
scp -r $TEMP_DIR/* $USER@$SERVER:~/

# Clean up
rm -rf $TEMP_DIR
print_success "Files transferred successfully!"

# Instructions
cat <<EOF

===== NEXT STEPS =====

1. SSH into your server:
   ssh $USER@$SERVER

2. Run the deployment script:
   sudo ~/deploy-to-rezkhan.sh

EOF

# If using git-crypt, add a warning about securing the key
if [ "$USE_GIT_CRYPT" = true ]; then
  print_warning "IMPORTANT: A git-crypt key was transferred to your server. Remember to secure or delete it after use!"
  echo "   shred -u ~/$GIT_CRYPT_KEY"
fi

print_message "Follow the prompts on the server to complete deployment."