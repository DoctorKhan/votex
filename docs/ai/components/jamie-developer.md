# Jamie Developer Persona

Jamie Developer is a software engineer persona that monitors conversations, proposes changes to the site, and implements approved proposals using test-driven development.

## Overview

Jamie Developer is integrated with the Conversation Monitor Service, which allows the persona to:

1. Monitor conversations to identify potential improvements
2. Create proposals for identified improvements
3. Check for approved proposals
4. Create design documents for approved proposals
5. Implement approved proposals using test-driven development
6. Delete design documents once implemented

## Activation

There are two ways to activate Jamie Developer:

### 1. Using the Persona Controller UI

1. Navigate to the Persona Manager in the UI
2. Find Jamie Developer in the list of personas
3. Click the "Activate" button
4. Set the activity frequency to "Medium" or "High"
5. Click the "Proposal" button to trigger a proposal generation

### 2. Using the Activation Scripts

Two activation scripts are provided:

#### Web-based Activation

This script requires the server to be running:

```bash
./activate-jamie.sh
```

#### Node.js-based Activation

This script can be run without the server:

```bash
./activate-jamie-node.sh
```

## API Endpoints

The following API endpoints are available for interacting with Jamie Developer:

### Persona Activation

- **Endpoint**: `/api/personas/activate`
- **Method**: POST
- **Body**:
  ```json
  {
    "personaId": "jamie-dev",
    "active": true,
    "frequency": "medium"
  }
  ```

### Persona Monitor

- **Endpoint**: `/api/persona-monitor`
- **Methods**:
  - GET: Returns the status of the persona monitor integration
  - POST: Triggers a one-time run of the persona monitor integration
  - PUT: Schedules periodic runs of the persona monitor integration

## Implementation Details

Jamie Developer uses test-driven development to implement approved proposals:

1. A design document is created for each approved proposal
2. Tests are written based on the requirements in the design document
3. Code is implemented to pass the tests
4. Once the implementation is complete, the design document is deleted

## Monitoring and Logging

All activities performed by Jamie Developer are logged using the logging service. You can view these logs in the admin panel or in the console output.

## Configuration

The following configuration options are available:

- **Activity Frequency**: Controls how often Jamie Developer performs actions (high, medium, low, paused)
- **Vote Threshold**: The number of votes required for a proposal to be approved (default: 5)
- **Implementation Probability**: The probability of implementing a design document in test mode (default: 0.3)

## Troubleshooting

If Jamie Developer is not active or not performing actions:

1. Check if Jamie is activated in the Persona Manager
2. Run the activation script: `./activate-jamie.sh` or `./activate-jamie-node.sh`
3. Check the console logs for any errors
4. Ensure the database is properly initialized
5. Verify that the Conversation Monitor Service is working correctly