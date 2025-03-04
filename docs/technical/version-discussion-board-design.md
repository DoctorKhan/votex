# Version Discussion Board Technical Design

This document provides detailed technical specifications for implementing the Version Discussion Board feature as outlined in the implementation plan. It includes specific schema definitions, service method signatures, component designs, and API specifications.

## Table of Contents

1. [Database Schema](#database-schema)
2. [Service API Specifications](#service-api-specifications)
3. [Component Specifications](#component-specifications)
4. [API Routes](#api-routes)
5. [State Management](#state-management)
6. [Migration Strategy](#migration-strategy)

## Database Schema

### 1. Version and Revision Terminology Change

Update existing type definitions in `src/lib/db.ts` and `src/lib/proposalService.ts`:

```typescript
// Change from RevisionEntity to VersionEntity in db.ts
export type VersionEntity = {
  id: string;
  proposalId: string;
  description: string;
  timestamp: number;
  analysis?: Analysis; // Keeping same analysis structure
};

// Update ProposalEntity
export interface ProposalEntity {
  id: string;
  title: string;
  description: string;
  votes: number;
  aiCreated?: boolean;
  aiVoted?: boolean;
  llmFeedback?: string;
  createdAt: number;
  versions?: VersionEntity[]; // Changed from revisions to versions
  analysis?: Analysis;
}
```

### 2. Discussion Message Schema

Add the following to `src/lib/db.ts`:

```typescript
export type DiscussionMessageEntity = {
  id: string;
  proposalId: string;
  versionId: string;
  userId: string;
  username?: string; // Optional for displaying user names
  content: string;
  timestamp: number;
  reactions?: Record<string, string[]>; // Emoji key to array of user IDs
  parentMessageId?: string; // For threaded replies (optional feature)
};
```

### 3. IndexedDB Store Configuration

Update the IndexedDB setup in `src/components/IndexedDBProvider.tsx`:

```typescript
// Add to the existing stores configuration
{
  name: 'discussions',
  keyPath: 'id',
  indexes: [
    { name: 'proposalId', keyPath: 'proposalId', options: { unique: false } },
    { name: 'versionId', keyPath: 'versionId', options: { unique: false } },
    { name: 'timestamp', keyPath: 'timestamp', options: { unique: false } }
  ]
}
```

## Service API Specifications

### 1. Discussion Service (`src/lib/discussionService.ts`)

```typescript
export class DiscussionService {
  private db: IDBDatabase;
  
  constructor(db: IDBDatabase) {
    this.db = db;
  }
  
  /**
   * Creates a new discussion message
   * @param proposalId The ID of the proposal
   * @param versionId The ID of the version being discussed
   * @param userId The ID of the user creating the message
   * @param content The message content
   * @param parentMessageId Optional ID of parent message for threaded replies
   * @returns Promise that resolves with the created message ID
   */
  async createMessage(
    proposalId: string,
    versionId: string,
    userId: string,
    content: string,
    parentMessageId?: string
  ): Promise<string>;
  
  /**
   * Gets all discussion messages for a proposal across all versions
   * @param proposalId The ID of the proposal
   * @returns Promise that resolves with an array of discussion messages
   */
  async getDiscussionsByProposalId(proposalId: string): Promise<DiscussionMessageEntity[]>;
  
  /**
   * Gets all discussion messages for a specific version of a proposal
   * @param proposalId The ID of the proposal
   * @param versionId The ID of the version
   * @returns Promise that resolves with an array of discussion messages
   */
  async getDiscussionsByVersionId(
    proposalId: string,
    versionId: string
  ): Promise<DiscussionMessageEntity[]>;
  
  /**
   * Deletes a message by ID
   * @param messageId The ID of the message to delete
   * @returns Promise that resolves when the message is deleted
   */
  async deleteMessage(messageId: string): Promise<void>;
  
  /**
   * Adds a reaction to a message
   * @param messageId The ID of the message
   * @param userId The ID of the user adding the reaction
   * @param emoji The emoji reaction
   * @returns Promise that resolves when the reaction is added
   */
  async addReaction(messageId: string, userId: string, emoji: string): Promise<void>;
  
  /**
   * Removes a reaction from a message
   * @param messageId The ID of the message
   * @param userId The ID of the user removing the reaction
   * @param emoji The emoji reaction
   * @returns Promise that resolves when the reaction is removed
   */
  async removeReaction(messageId: string, userId: string, emoji: string): Promise<void>;
}
```

### 2. Modified Proposal Service (`src/lib/proposalService.ts`)

Update the existing methods in ProposalService:

```typescript
export class ProposalService {
  // ... existing code ...
  
  /**
   * Add a version to a proposal (renamed from addRevision)
   * @param proposalId The ID of the proposal to version
   * @param versionText The text of the version
   * @param analysis Optional analysis for this version
   * @returns Promise that resolves with the created version
   */
  async addVersion(
    proposalId: string, 
    versionText: string, 
    analysis?: VersionEntity['analysis']
  ): Promise<VersionEntity>;
  
  /**
   * Get all versions for a proposal (renamed from getRevisions)
   * @param proposalId The ID of the proposal
   * @returns Promise that resolves with an array of versions
   */
  async getVersions(proposalId: string): Promise<VersionEntity[]>;
  
  /**
   * Get a specific version by ID (renamed from getRevision)
   * @param versionId The ID of the version to retrieve
   * @returns Promise that resolves with the version or null if not found
   */
  async getVersion(versionId: string): Promise<VersionEntity | null>;
}
```

## Component Specifications

### 1. VersionDiscussion Component (`src/components/VersionDiscussion.tsx`)

```typescript
interface VersionDiscussionProps {
  proposal: ProposalEntity;
  version: VersionEntity;
  onAddMessage: (versionId: string, content: string) => Promise<void>;
  onAddReaction: (messageId: string, emoji: string) => Promise<void>;
  onRemoveReaction: (messageId: string, emoji: string) => Promise<void>;
  onDeleteMessage?: (messageId: string) => Promise<void>; // Optional, may be admin-only
}

// Component state will include:
interface VersionDiscussionState {
  messages: DiscussionMessageEntity[];
  loading: boolean;
  error: string | null;
  inputValue: string;
  showReplyingTo: string | null; // ID of message being replied to
}
```

### 2. DiscussionMessage Component (`src/components/DiscussionMessage.tsx`)

```typescript
interface DiscussionMessageProps {
  message: DiscussionMessageEntity;
  onAddReaction: (messageId: string, emoji: string) => Promise<void>;
  onRemoveReaction: (messageId: string, emoji: string) => Promise<void>;
  onReply: (messageId: string) => void;
  onDelete?: (messageId: string) => Promise<void>; // Optional, admin-only
  currentUserId: string;
  isThreaded?: boolean; // Whether to show threaded view or flat
}
```

### 3. Updated ProposalItem Component

Add to the existing `ProposalItemProps`:

```typescript
interface ProposalItemProps {
  // Existing props...
  
  // Add new props for discussion functionality
  onAddDiscussionMessage: (proposalId: string, versionId: string, content: string) => Promise<void>;
  onAddMessageReaction: (messageId: string, emoji: string) => Promise<void>;
  onRemoveMessageReaction: (messageId: string, emoji: string) => Promise<void>;
  onDeleteMessage?: (messageId: string) => Promise<void>; // Optional admin-only
}
```

## API Routes

If using server-side APIs for discussion persistence, define the following routes:

### 1. Discussion Message API (`src/app/api/discussions/route.ts`)

```typescript
// POST /api/discussions
// Create a new discussion message
interface CreateMessageRequest {
  proposalId: string;
  versionId: string;
  content: string;
  parentMessageId?: string;
}

// GET /api/discussions?proposalId=xyz
// Get all messages for a proposal

// GET /api/discussions?proposalId=xyz&versionId=abc
// Get messages for a specific version

// DELETE /api/discussions/:messageId
// Delete a message (admin only)

// POST /api/discussions/:messageId/reactions
// Add a reaction to a message
interface ReactionRequest {
  emoji: string;
}

// DELETE /api/discussions/:messageId/reactions/:emoji
// Remove a reaction from a message
```

## State Management

### 1. Context Provider for Discussions

Create a context provider for discussion state management (`src/context/DiscussionContext.tsx`):

```typescript
interface DiscussionContextType {
  discussionsByProposal: Record<string, DiscussionMessageEntity[]>;
  discussionsByVersion: Record<string, DiscussionMessageEntity[]>;
  loading: boolean;
  error: string | null;
  addMessage: (proposalId: string, versionId: string, content: string, parentMessageId?: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  removeReaction: (messageId: string, emoji: string) => Promise<void>;
}

// Provider component will fetch and maintain discussion state
```

## Migration Strategy

### 1. Database Migration

1. Create a new migration to add the discussions store
2. Update existing data models (revisions → versions)
3. Migrate existing proposals and revisions to the new schema

```typescript
// Migration function in IndexedDBProvider.tsx

async function migrateRevisionsToVersions(db: IDBDatabase) {
  const transaction = db.transaction(['proposals', 'revisions'], 'readwrite');
  const proposalStore = transaction.objectStore('proposals');
  const revisionStore = transaction.objectStore('revisions');
  
  // Get all proposals
  const proposals = await getAllItems<ProposalEntity>('proposals');
  
  // For each proposal, update revisions to versions
  for (const proposal of proposals) {
    if (proposal.revisions) {
      proposal.versions = proposal.revisions;
      delete proposal.revisions;
      await addOrUpdateItem('proposals', proposal);
    }
  }
  
  // Rename the object store in a new database version upgrade
  // This would happen in the onupgradeneeded event
}
```

### 2. UI Component Migration

1. Create new discussion components
2. Update existing components to use the new terminology
3. Add phased rollout flags to enable/disable features

## Performance Considerations

### 1. Message Pagination

For proposals with many discussions:

```typescript
/**
 * Gets paginated discussion messages
 * @param proposalId The ID of the proposal
 * @param versionId Optional ID of the version
 * @param page The page number (0-based)
 * @param pageSize The number of messages per page
 * @returns Promise that resolves with paginated results
 */
async getDiscussionsPaginated(
  proposalId: string,
  versionId?: string,
  page: number = 0,
  pageSize: number = 20
): Promise<{
  messages: DiscussionMessageEntity[];
  totalCount: number;
  hasMore: boolean;
}>;
```

### 2. Optimistic Updates

Implement optimistic updates for better UX:

```typescript
// In component that handles posting messages:
function handlePostMessage() {
  // Create a temporary message with optimistic ID
  const optimisticMessage = {
    id: `temp-${Date.now()}`,
    proposalId,
    versionId,
    userId,
    content: inputValue,
    timestamp: Date.now(),
    isPending: true // Flag to show it's optimistic
  };
  
  // Add to local state immediately
  setMessages(prev => [...prev, optimisticMessage]);
  
  // Clear input
  setInputValue('');
  
  // Actually post to the server/database
  discussionService.createMessage(proposalId, versionId, userId, inputValue)
    .then(actualMessage => {
      // Replace optimistic message with actual one
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id ? actualMessage : msg
      ));
    })
    .catch(error => {
      // Show error and remove optimistic message
      setError('Failed to post message');
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
    });
}
```

## Conclusion

This technical design document provides the detailed specifications needed to implement the Version Discussion Board feature. It covers database schema changes, service API definitions, component specifications, and migration strategies. The design follows best practices for performance and user experience, with considerations for future extensibility.