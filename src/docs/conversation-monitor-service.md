# Conversation Monitor Service

The Conversation Monitor Service is an AI-powered system that monitors forum conversations, identifies potential site improvements, creates proposals, and manages design documents for approved proposals.

## Overview

This service implements a complete workflow for using AI to improve your application based on user feedback:

1. **Monitoring**: Analyzes forum conversations to identify potential improvements
2. **Proposal Creation**: Generates well-structured proposals for identified improvements
3. **Voting**: Tracks votes on proposals to identify community priorities
4. **Design Document Creation**: Creates design documents for approved proposals
5. **Implementation Tracking**: Monitors implementation status and cleans up completed designs

## Features

- **Conversation Analysis**: Identifies patterns and suggestions in user conversations
- **AI-Generated Proposals**: Creates detailed proposals with analysis and recommendations
- **Automated Design Documents**: Generates comprehensive design documents for approved proposals
- **Test-Driven Development**: Fully tested with Jest for reliability
- **Next.js API Integration**: Ready-to-use API routes for easy integration

## Installation

The Conversation Monitor Service is integrated into the Votex application. No additional installation is required.

## Usage

### Basic Usage

```typescript
import { ConversationMonitorService } from '../lib/conversationMonitorService';

// Create an instance of the service
const monitor = new ConversationMonitorService();

// Process conversations (analyzes conversations, creates proposals, and handles approved proposals)
const result = await monitor.processConversations();

console.log(`Created ${result.newProposals.length} new proposals`);
console.log(`Found ${result.approvedProposals.length} approved proposals`);
```

### API Route

The service includes a Next.js API route for easy integration:

- **GET /api/conversation-monitor**: Returns the status of the monitoring service
- **POST /api/conversation-monitor**: Triggers the conversation monitoring process

Example API call:

```typescript
// Trigger the conversation monitoring process
const response = await fetch('/api/conversation-monitor', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    threshold: 10 // Optional: Custom vote threshold for approving proposals
  })
});

const result = await response.json();
console.log(result);
```

### Scheduled Monitoring

For production use, it's recommended to set up scheduled monitoring using a cron job or similar mechanism:

```typescript
import { setupScheduledMonitoring } from '../examples/conversationMonitorExample';

// Set up scheduled monitoring (e.g., run once per day)
await setupScheduledMonitoring(db);
```

## Components

### ConversationMonitorService

The main service class that orchestrates the entire process.

Key methods:

- `monitorConversations()`: Analyzes forum conversations to identify potential improvements
- `createProposalFromImprovement()`: Creates a proposal based on an identified improvement
- `checkProposalStatus()`: Identifies approved proposals based on vote count
- `createDesignDocument()`: Creates a design document for an approved proposal
- `deleteDesignDocument()`: Deletes a design document once implemented
- `processConversations()`: Orchestrates the entire workflow

### Design Documents

Design documents are created in the `designs/` directory, with each proposal getting its own subdirectory. The documents follow a standardized template defined in `src/templates/design-document-template.md`.

Example design document structure:

```
designs/
  add-dark-mode/
    design.md
  improve-search-functionality/
    design.md
```

## Test-Driven Development

The service was developed using Test-Driven Development (TDD) principles. All functionality is covered by comprehensive tests in `src/__tests__/lib/conversationMonitorService.test.ts`.

To run the tests:

```bash
npx jest src/__tests__/lib/conversationMonitorService.test.ts
```

## Integration Example

For a complete integration example, see `src/examples/conversationMonitorExample.ts`.

## Workflow

1. The service monitors forum conversations to identify potential improvements
2. For each identified improvement, it creates a proposal
3. Proposals are voted on by the community
4. When a proposal receives enough votes, a design document is created
5. The design document guides the implementation
6. Once implemented, the design document is automatically deleted

## License

This service is part of the Votex application and is subject to the same license terms.