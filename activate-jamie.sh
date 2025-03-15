#!/bin/bash

# Activate Jamie Developer Persona
# This script activates the Jamie Developer persona and triggers the persona monitor integration

echo "Activating Jamie Developer persona..."

# Check if the server is running
if ! curl -s http://localhost:3000 > /dev/null; then
  echo "Error: The server is not running. Please start the server first."
  exit 1
fi

# Run the activation script
node src/scripts/activateJamiePersona.js

echo "Activation script completed."