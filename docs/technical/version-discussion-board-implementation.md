# Version Discussion Board Implementation Plan

## Overview

This document outlines the implementation plan for adding a discussion board feature to each version (previously called "revision") of a proposal in the Votex system. The goal is to enable users to discuss specific versions of proposals, providing more targeted feedback and improving the collaborative process.

## Terminology Change

As part of this implementation, we're renaming "revisions" to "versions" throughout the application to better communicate the concept to users. The term "version" is more widely understood and implies a more significant update.

## Technical Implementation

### 1. Data Model Changes

#### A. New Discussion Message Entity

We will create a new entity type to store discussion messages:

```typescript
export type DiscussionMessageEntity = {
  id: string;
  proposalId: string;
  versionId: string; // The ID of the version this message is associated with
  userId: string;
  content: string;
  timestamp: number;
  reactions?: Record<string, string[]>; // Optional: emoji reactions with user IDs
}
```

#### B. Database Schema Updates

- Add a new `discussions` store in IndexedDB to hold discussion messages
- Update the `db.ts` file to include the new store and related functions
- Ensure proper indexing for efficient querying (by proposalId, versionId)

### 2. Service Layer Changes

#### A. Discussion Service

Create a new service (`src/lib/discussionService.ts`) with the following methods:

- `createMessage(proposalId, versionId, userId, content)`: Add a new message to a version discussion
- `getDiscussionsByProposalId(proposalId)`: Retrieve all discussions for a proposal across versions
- `getDiscussionsByVersionId(proposalId, versionId)`: Get discussions for a specific version
- `deleteMessage(messageId)`: Remove a message (for moderation purposes)
- `addReaction(messageId, userId, emoji)`: Add emoji reactions (optional enhancement)

#### B. ProposalService Updates

Update the existing ProposalService:

- Modify the `addRevision` method to use "version" terminology
- Ensure version IDs are properly generated and tracked
- Adjust any references to "revision" throughout the service

### 3. UI Component Changes

#### A. Version Discussion Component

Create a new component (`src/components/VersionDiscussion.tsx`):

- Displays the discussion thread for a specific version
- Provides an interface for posting new messages
- Shows the version content for context
- Includes a navigation element for switching between versions

#### B. ProposalItem Component Updates

Modify the existing ProposalItem component:

- Update terminology from "revisions" to "versions"
- Add tabbed interface to switch between version content and discussions
- Integrate the VersionDiscussion component
- Add visual indicators showing the number of discussions per version

#### C. ProposalChat Component Updates

Adapt the existing ProposalChat component:

- Modify to show a single thread organized by versions
- Add visual indicators to show which version each message relates to
- Implement filtering functionality to view discussions by version

#### D. Discussion Message Component

Create a new component for individual discussion messages:

- Display message content with Markdown formatting
- Show author information and timestamp
- Include UI for reactions and replies
- Apply appropriate styling to group messages by version

### 4. UI/UX Design Considerations

- Use a tabbed interface within each version panel to switch between content and discussions
- Implement a timeline visualization to show the progression of versions
- Add color coding to distinguish discussions for different versions
- Include badges showing the number of messages for each version
- Ensure mobile-responsive design for all new UI elements

## Implementation Phases

### Phase 1: Data Model and Services

- Implement the database schema changes
- Create the DiscussionService and its methods
- Update ProposalService to use "version" terminology
- Write unit tests for the new functionality

### Phase 2: Core UI Components

- Create the VersionDiscussion component
- Update ProposalItem to incorporate the new component
- Implement basic message input and display functionality
- Update terminology throughout the UI

### Phase 3: Enhanced Features

- Implement the timeline visualization for versions
- Add filtering and navigation features
- Create visual indicators and badges
- Implement reactions and advanced formatting (if time permits)

## Technical Considerations

- **Performance**: Optimize database queries for larger discussion threads
- **Offline Support**: Ensure discussions can be cached and synced properly
- **Error Handling**: Implement proper error states and recovery
- **Accessibility**: Ensure all new UI elements meet accessibility standards
- **Migration**: Plan for migrating existing data to the new schema

## Future Enhancements

- User mentions and notifications
- Rich media attachments
- Thread-based replies
- Discussion moderation tools
- Analytics on discussion engagement

## Conclusion

This implementation plan provides a comprehensive approach to adding version-specific discussions to the Votex platform. The feature will enhance collaboration by allowing users to provide and view feedback on specific versions of proposals, creating a more structured and effective discussion process.