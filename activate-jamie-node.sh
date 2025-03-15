#!/bin/bash

# Activate Jamie Developer Persona using Node.js
# This script activates the Jamie Developer persona and triggers the persona monitor integration
# without requiring the server to be running

echo "Activating Jamie Developer persona using Node.js..."

# Run the Node.js activation script
node --experimental-modules src/scripts/activateJamiePersonaNode.js

echo "Activation script completed."