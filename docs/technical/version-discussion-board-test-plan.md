# Version Discussion Board Test Plan

This document outlines the testing strategy for the Version Discussion Board feature, ensuring that all aspects of the implementation are properly validated.

## Test Categories

### 1. Unit Tests

#### A. Discussion Service Tests

- **File**: `src/__tests__/lib/discussionService.test.ts`
- **Test Cases**:
  - Create a new discussion message successfully
  - Retrieve discussions by proposal ID
  - Retrieve discussions by version ID
  - Delete a message successfully
  - Add a reaction to a message
  - Remove a reaction from a message
  - Handle errors when message creation fails
  - Validate message content restrictions (e.g., empty messages)

#### B. Updated Proposal Service Tests

- **File**: `src/__tests__/lib/proposalService.test.ts`
- **Test Cases**:
  - Add a version to a proposal (renamed from addRevision)
  - Get all versions for a proposal
  - Get a specific version by ID
  - Ensure terminology is consistent across service methods

#### C. Component Tests

- **Files**:
  - `src/__tests__/components/VersionDiscussion.test.tsx`
  - `src/__tests__/components/DiscussionMessage.test.tsx`
- **Test Cases**:
  - Render discussion thread correctly
  - Display messages in chronological order
  - Show proper user attribution for messages
  - Handle reaction adding/removing correctly
  - Display empty state when no messages exist
  - Show loading indicators during data fetching
  - Display error states appropriately

### 2. Integration Tests

- **File**: `src/__tests__/integration/versionDiscussions.test.ts`
- **Test Cases**:
  - Create a proposal, add a version, then add a discussion message
  - Ensure discussions remain associated with correct versions during version updates
  - Verify discussions load correctly when switching between versions
  - Test migration from revisions to versions
  - Verify that the UI correctly reflects backend state changes

### 3. End-to-End Tests

- **File**: `cypress/e2e/versionDiscussions.cy.js` (if using Cypress)
- **Test Cases**:
  - User can navigate to a proposal and view versions
  - User can switch between versions and see different discussions
  - User can add a new message to a specific version
  - User can add and remove reactions from messages
  - UI indicators (badges, counters) update correctly
  - Messages display correctly with formatting
  - Discussions remain stable during navigation

## Test Data Setup

### 1. Mock Proposal with Versions

```typescript
const mockProposal: ProposalEntity = {
  id: 'proposal-1',
  title: 'Test Proposal',
  description: 'This is a test proposal',
  votes: 5,
  createdAt: Date.now(),
  versions: [
    {
      id: 'version-1',
      proposalId: 'proposal-1',
      description: 'Initial version',
      timestamp: Date.now() - 86400000, // 1 day ago
    },
    {
      id: 'version-2',
      proposalId: 'proposal-1',
      description: 'Updated version with changes',
      timestamp: Date.now(),
    }
  ]
};
```

### 2. Mock Discussion Messages

```typescript
const mockDiscussions: DiscussionMessageEntity[] = [
  {
    id: 'message-1',
    proposalId: 'proposal-1',
    versionId: 'version-1',
    userId: 'user-1',
    username: 'Test User 1',
    content: 'This is a comment on the initial version.',
    timestamp: Date.now() - 43200000, // 12 hours ago
  },
  {
    id: 'message-2',
    proposalId: 'proposal-1',
    versionId: 'version-1',
    userId: 'user-2',
    username: 'Test User 2',
    content: 'I have a question about this approach.',
    timestamp: Date.now() - 21600000, // 6 hours ago
  },
  {
    id: 'message-3',
    proposalId: 'proposal-1',
    versionId: 'version-2',
    userId: 'user-1',
    username: 'Test User 1',
    content: 'The updates look good!',
    timestamp: Date.now() - 3600000, // 1 hour ago
  }
];
```

## Test Environment Setup

1. Create a test IndexedDB instance in memory
2. Initialize the database with the required object stores
3. Seed the database with test data
4. Ensure test database is reset between test runs

```typescript
// Example test setup in discussionService.test.ts
let db: IDBDatabase;
let discussionService: DiscussionService;

beforeEach(async () => {
  // Create an in-memory test database
  db = await createTestDatabase();
  discussionService = new DiscussionService(db);
  
  // Seed with test data
  await seedTestData(db);
});

afterEach(async () => {
  // Clean up the test database
  db.close();
});
```

## UI Testing Guidelines

### 1. Visual Testing

- Verify UI components render correctly across different screen sizes
- Check that discussion threads maintain proper indentation and visual hierarchy
- Ensure version indicators are clearly visible and distinguishable
- Verify that active version is highlighted properly
- Check that reactions display correctly with counts

### 2. Accessibility Testing

- Ensure all discussion elements are properly labeled for screen readers
- Verify keyboard navigation works for adding/viewing discussions
- Check color contrast of all text elements
- Ensure focus states are visible and logical

### 3. Performance Testing

- Measure load time for discussions with large numbers of messages
- Test scroll performance in long discussion threads
- Verify that pagination works correctly for large datasets
- Check memory usage when switching between versions with many discussions

## Regression Testing

Areas to check for regressions:

1. Existing proposal viewing and editing functionality
2. Voting mechanisms
3. AI feedback and analysis features
4. Navigation between proposals
5. Overall application performance

## User Acceptance Testing Scenarios

1. As a user, I can view all discussions for a specific version of a proposal
2. As a user, I can post a new message to discuss a specific version
3. As a user, I can react to messages with emoji reactions
4. As a user, I can see which version of a proposal has the most discussion activity
5. As a user, I can navigate between versions and see their respective discussions
6. As a user, I can filter discussions by version
7. As a user, I can see when a message was posted and who posted it

## Testing Tools and Libraries

- Jest for unit and integration testing
- React Testing Library for component testing
- Cypress for end-to-end testing
- Axe for accessibility testing
- Lighthouse for performance metrics

## Bug Reporting Template

When reporting bugs during testing, include:

1. Test environment (browser, device, screen size)
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Screenshots or recordings
6. Console errors (if applicable)

## Conclusion

This test plan provides a comprehensive approach to validating the Version Discussion Board feature. By following these testing guidelines, we can ensure the feature works correctly, maintains good performance, and provides a high-quality user experience.