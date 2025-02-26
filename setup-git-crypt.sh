#!/bin/bash
set -e

# Check if git-crypt is installed
if ! command -v git-crypt &> /dev/null; then
    echo "git-crypt is not installed. Please install it first."
    echo "macOS: brew install git-crypt"
    echo "Linux: apt-get install git-crypt"
    exit 1
fi

# Initialize git-crypt
echo "Initializing git-crypt..."
git-crypt init

# Create .gitattributes file if it doesn't exist
if [ ! -f .gitattributes ]; then
    echo "Creating .gitattributes file..."
    touch .gitattributes
fi

# Add encryption rules to .gitattributes
echo "Adding encryption rules to .gitattributes..."
cat <<EOT >> .gitattributes
.env filter=git-crypt diff=git-crypt
.env.* filter=git-crypt diff=git-crypt
!.env.example filter= diff=
EOT

# Export key for backup
echo "Exporting git-crypt key to .git-crypt-key (KEEP THIS SECURE!)..."
git-crypt export-key .git-crypt-key

echo "========================================================"
echo "git-crypt setup complete!"
echo "========================================================"
echo ""
echo "To add a user with their GPG key:"
echo "git-crypt add-gpg-user USER_ID"
echo ""
echo "To unlock the repository on a new machine:"
echo "git-crypt unlock /path/to/.git-crypt-key"
echo ""
echo "IMPORTANT: Keep .git-crypt-key secure and back it up!"
echo "You can now commit .env files safely - they will be encrypted."
echo "Note: .env.example will remain unencrypted for reference."
echo "========================================================"