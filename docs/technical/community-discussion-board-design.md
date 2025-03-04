# Community Discussion Board Technical Design

This document provides detailed technical specifications for implementing the Community Discussion Board feature as outlined in the implementation plan. It includes specific schema definitions, service method signatures, component designs, API specifications, and UI/UX details.

## Table of Contents

1. [Database Schema](#database-schema)
2. [Service Layer Specifications](#service-layer-specifications)
3. [Component Designs](#component-designs)
4. [API Endpoints](#api-endpoints)
5. [Authentication & Authorization](#authentication--authorization)
6. [UI/UX Design Details](#uiux-design-details)
7. [Performance Optimizations](#performance-optimizations)

## Database Schema

### Forum Categories

```typescript
export type ForumCategoryEntity = {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  createdAt: number;
  lastActivityAt: number;
  threadCount: number;
  parentCategoryId?: string; // For nested categories (optional)
  icon?: string; // Icon identifier
  visibleToRoles?: string[]; // For role-based visibility
  color?: string; // For category theming
};
```

### Forum Threads

```typescript
export type ForumThreadEntity = {
  id: string;
  categoryId: string;
  title: string;
  content: string; // Initial post content
  createdBy: string;
  createdAt: number;
  lastReplyAt: number;
  lastReplyBy?: string;
  replyCount: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  isAnnouncement: boolean;
  tags?: string[];
  subscribedUsers?: string[]; // Users subscribed to updates
};
```

### Forum Posts

```typescript
export type ForumPostEntity = {
  id: string;
  threadId: string;
  content: string;
  userId: string;
  username?: string;
  userRole?: string;
  createdAt: number;
  editedAt?: number;
  editCount?: number;
  reactions?: Record<string, string[]>; // Emoji key to array of user IDs
  isModeratorPost?: boolean;
  isThreadStarter?: boolean;
  isSolution?: boolean; // For Q&A style threads
  attachments?: {
    id: string;
    filename: string;
    size: number;
    mimeType: string;
    url: string;
  }[];
  mentionedUsers?: string[]; // User IDs mentioned in the post
};
```

### User Forum Profile

```typescript
export type UserForumProfileEntity = {
  userId: string;
  username: string;
  joinedAt: number;
  postCount: number;
  threadCount: number;
  reputation?: number;
  badges?: {
    id: string;
    name: string;
    icon: string;
    awardedAt: number;
  }[];
  signature?: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastActiveAt?: number;
  role: 'user' | 'moderator' | 'admin';
  preferences: {
    emailNotifications: boolean;
    subscribeToCreatedThreads: boolean;
    digestFrequency: 'none' | 'daily' | 'weekly';
  };
};
```

### Moderation Items

```typescript
export type ModerationItemEntity = {
  id: string;
  type: 'thread' | 'post' | 'user';
  targetId: string; // ID of the thread, post, or user
  reason: string;
  reportedBy: string;
  reportedAt: number;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: number;
  action?: 'none' | 'hide' | 'delete' | 'warn' | 'ban';
  notes?: string;
};
```

## Service Layer Specifications

### Forum Service (`src/lib/forumService.ts`)

```typescript
export class ForumService {
  private db: IDBDatabase;
  
  constructor(db: IDBDatabase) {
    this.db = db;
  }
  
  // Category Methods
  async createCategory(category: Omit<ForumCategoryEntity, 'id' | 'createdAt' | 'threadCount'>): Promise<string>;
  async updateCategory(id: string, updates: Partial<ForumCategoryEntity>): Promise<void>;
  async deleteCategory(id: string): Promise<void>;
  async getCategory(id: string): Promise<ForumCategoryEntity | null>;
  async getAllCategories(): Promise<ForumCategoryEntity[]>;
  async getCategoryThreads(categoryId: string, options?: { 
    page?: number, 
    pageSize?: number, 
    sortBy?: 'lastReplyAt' | 'createdAt' | 'replyCount', 
    sortOrder?: 'asc' | 'desc',
    filterTags?: string[]
  }): Promise<{
    threads: ForumThreadEntity[],
    total: number,
    hasMore: boolean
  }>;
  
  // Thread Methods
  async createThread(
    categoryId: string, 
    title: string, 
    content: string, 
    userId: string,
    options?: {
      tags?: string[],
      isPinned?: boolean,
      isAnnouncement?: boolean
    }
  ): Promise<string>;
  async updateThread(id: string, updates: Partial<ForumThreadEntity>): Promise<void>;
  async deleteThread(id: string): Promise<void>;
  async getThread(id: string): Promise<ForumThreadEntity | null>;
  async viewThread(id: string, userId: string): Promise<void>; // Increment view count
  async pinThread(id: string, isPinned: boolean): Promise<void>;
  async lockThread(id: string, isLocked: boolean): Promise<void>;
  async moveThread(id: string, newCategoryId: string): Promise<void>;
  async getThreadsByUser(userId: string, options?: { page?: number, pageSize?: number }): Promise<{
    threads: ForumThreadEntity[],
    total: number,
    hasMore: boolean
  }>;
  
  // Post Methods
  async createPost(threadId: string, content: string, userId: string, options?: {
    attachments?: { filename: string, size: number, mimeType: string, url: string }[],
    isModeratorPost?: boolean
  }): Promise<string>;
  async updatePost(id: string, updates: { content: string, userId: string }): Promise<void>;
  async deletePost(id: string): Promise<void>;
  async getPost(id: string): Promise<ForumPostEntity | null>;
  async getThreadPosts(threadId: string, options?: { 
    page?: number, 
    pageSize?: number,
    sortOrder?: 'asc' | 'desc'
  }): Promise<{
    posts: ForumPostEntity[],
    total: number,
    hasMore: boolean
  }>;
  async getPostsByUser(userId: string, options?: { page?: number, pageSize?: number }): Promise<{
    posts: ForumPostEntity[],
    total: number,
    hasMore: boolean
  }>;
  
  // Reactions
  async addReaction(postId: string, userId: string, emoji: string): Promise<void>;
  async removeReaction(postId: string, userId: string, emoji: string): Promise<void>;
  
  // Subscriptions
  async subscribeToThread(threadId: string, userId: string): Promise<void>;
  async unsubscribeFromThread(threadId: string, userId: string): Promise<void>;
  async getSubscribedThreads(userId: string): Promise<ForumThreadEntity[]>;
  
  // User Profile
  async getUserForumProfile(userId: string): Promise<UserForumProfileEntity | null>;
  async updateUserForumProfile(userId: string, updates: Partial<UserForumProfileEntity>): Promise<void>;
  
  // Moderation
  async reportItem(type: 'thread' | 'post' | 'user', targetId: string, reason: string, userId: string): Promise<string>;
  async getModerationQueue(options?: { status?: 'pending' | 'reviewed' | 'actioned' | 'dismissed' }): Promise<ModerationItemEntity[]>;
  async reviewModerationItem(id: string, moderatorId: string, decision: {
    status: 'reviewed' | 'actioned' | 'dismissed',
    action?: 'none' | 'hide' | 'delete' | 'warn' | 'ban',
    notes?: string
  }): Promise<void>;
  
  // Search
  async searchForum(query: string, options?: {
    type?: 'thread' | 'post' | 'all',
    categoryId?: string,
    page?: number,
    pageSize?: number
  }): Promise<{
    threads: ForumThreadEntity[],
    posts: ForumPostEntity[],
    total: number,
    hasMore: boolean
  }>;
}
```

### User Service Extensions

Add these methods to the existing user service:

```typescript
// Add to UserService
async getUserForumStats(userId: string): Promise<{
  postCount: number;
  threadCount: number;
  joinedAt: number;
  lastActiveAt: number;
}>;

async updateUserForumActivity(userId: string): Promise<void>; // Update last active timestamp
```

## Component Designs

### Main Forum Layout Component

```typescript
interface ForumLayoutProps {
  children: React.ReactNode;
}

// ForumLayout will provide:
// - Navigation context for breadcrumbs
// - Sidebar for categories/navigation
// - Main content area for children
// - Info panels for forum stats/active users
```

### Category List Component

```typescript
interface CategoryListProps {
  categories: ForumCategoryEntity[];
  onCategoryClick: (categoryId: string) => void;
  className?: string;
}

// Will render a list of categories with:
// - Category name and description
// - Thread count
// - Last activity timestamp
// - Visual indicators for new content
```

### Thread List Component

```typescript
interface ThreadListProps {
  categoryId: string;
  threads: ForumThreadEntity[];
  totalThreads: number;
  hasMore: boolean;
  onLoadMore: () => void;
  onThreadClick: (threadId: string) => void;
  onCreateThread?: () => void;
  isLoading?: boolean;
  filters?: {
    sortBy: 'lastReplyAt' | 'createdAt' | 'replyCount';
    sortOrder: 'asc' | 'desc';
    tags?: string[];
  };
  onFilterChange?: (newFilters: ThreadListProps['filters']) => void;
}

// Will render:
// - List of threads with metadata
// - Sorting and filtering controls
// - Create thread button (if permitted)
// - Pagination controls
```

### Thread View Component

```typescript
interface ThreadViewProps {
  threadId: string;
  onReply: (content: string) => Promise<void>;
  onReaction: (postId: string, emoji: string) => Promise<void>;
  onEdit: (postId: string, newContent: string) => Promise<void>;
  onDelete?: (postId: string) => Promise<void>;
  onReport?: (postId: string, reason: string) => Promise<void>;
  onSubscribe?: () => Promise<void>;
  isSubscribed?: boolean;
  currentUserId: string;
  userRole: 'user' | 'moderator' | 'admin';
}

// Will render:
// - Thread title and metadata
// - Original post content
// - List of replies
// - Reply editor
// - Thread controls for moderators
```

### Post Component

```typescript
interface PostProps {
  post: ForumPostEntity;
  threadId: string;
  currentUserId: string;
  userRole: 'user' | 'moderator' | 'admin';
  onReaction: (emoji: string) => Promise<void>;
  onEdit?: (newContent: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onReport?: (reason: string) => Promise<void>;
  isThreadStarter?: boolean;
}

// Will render:
// - Post content with formatting
// - User info and avatar
// - Timestamps
// - Reaction buttons and counts
// - Edit/delete controls if authorized
```

### Post Editor Component

```typescript
interface PostEditorProps {
  initialContent?: string;
  placeholder?: string;
  onSubmit: (content: string, attachments?: File[]) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  maxLength?: number;
  minLength?: number;
  allowAttachments?: boolean;
  maxAttachments?: number;
  allowedFileTypes?: string[];
  maxFileSize?: number;
  autoFocus?: boolean;
}

// Will provide:
// - Rich text editor
// - Preview tab
// - Formatting toolbar
// - File upload UI if allowed
// - Submit and cancel buttons
// - Character count
```

### User Profile Component

```typescript
interface UserProfileProps {
  userId: string;
  isCurrentUser?: boolean;
  onUpdateProfile?: (updates: Partial<UserForumProfileEntity>) => Promise<void>;
}

// Will display:
// - User info and stats
// - Post history
// - Thread history
// - Badges and achievements
// - Edit profile form (if isCurrentUser)
```

## API Endpoints

If using server-side APIs, the following endpoints will be needed:

### Categories

```
GET /api/forum/categories
GET /api/forum/categories/:id
POST /api/forum/categories (admin only)
PUT /api/forum/categories/:id (admin only)
DELETE /api/forum/categories/:id (admin only)
```

### Threads

```
GET /api/forum/threads?categoryId=:categoryId&page=:page&pageSize=:pageSize&sortBy=:sortBy&sortOrder=:sortOrder
GET /api/forum/threads/:id
POST /api/forum/threads
PUT /api/forum/threads/:id (owner or moderator only)
DELETE /api/forum/threads/:id (owner or moderator only)
POST /api/forum/threads/:id/view (increment view count)
PUT /api/forum/threads/:id/pin (moderator only)
PUT /api/forum/threads/:id/lock (moderator only)
PUT /api/forum/threads/:id/move (moderator only)
GET /api/forum/users/:userId/threads (get threads by user)
```

### Posts

```
GET /api/forum/posts?threadId=:threadId&page=:page&pageSize=:pageSize
GET /api/forum/posts/:id
POST /api/forum/posts
PUT /api/forum/posts/:id (owner or moderator only)
DELETE /api/forum/posts/:id (owner or moderator only)
GET /api/forum/users/:userId/posts (get posts by user)
```

### Reactions

```
POST /api/forum/posts/:id/reactions
DELETE /api/forum/posts/:id/reactions/:emoji
```

### Subscriptions

```
POST /api/forum/threads/:id/subscribe
DELETE /api/forum/threads/:id/subscribe
GET /api/forum/users/:userId/subscriptions
```

### User Profiles

```
GET /api/forum/users/:userId/profile
PUT /api/forum/users/:userId/profile (current user or admin only)
```

### Moderation

```
POST /api/forum/moderation/report
GET /api/forum/moderation/queue (moderator only)
PUT /api/forum/moderation/:id/review (moderator only)
```

### Search

```
GET /api/forum/search?q=:query&type=:type&categoryId=:categoryId&page=:page&pageSize=:pageSize
```

## Authentication & Authorization

### Role Definitions

```typescript
export enum ForumRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin'
}

export const ForumPermissions = {
  // Category permissions
  CREATE_CATEGORY: [ForumRole.ADMIN],
  EDIT_CATEGORY: [ForumRole.ADMIN],
  DELETE_CATEGORY: [ForumRole.ADMIN],
  
  // Thread permissions
  CREATE_THREAD: [ForumRole.USER, ForumRole.MODERATOR, ForumRole.ADMIN],
  EDIT_OWN_THREAD: [ForumRole.USER, ForumRole.MODERATOR, ForumRole.ADMIN],
  EDIT_ANY_THREAD: [ForumRole.MODERATOR, ForumRole.ADMIN],
  DELETE_OWN_THREAD: [ForumRole.USER, ForumRole.MODERATOR, ForumRole.ADMIN],
  DELETE_ANY_THREAD: [ForumRole.MODERATOR, ForumRole.ADMIN],
  PIN_THREAD: [ForumRole.MODERATOR, ForumRole.ADMIN],
  LOCK_THREAD: [ForumRole.MODERATOR, ForumRole.ADMIN],
  MOVE_THREAD: [ForumRole.MODERATOR, ForumRole.ADMIN],
  
  // Post permissions
  CREATE_POST: [ForumRole.USER, ForumRole.MODERATOR, ForumRole.ADMIN],
  EDIT_OWN_POST: [ForumRole.USER, ForumRole.MODERATOR, ForumRole.ADMIN],
  EDIT_ANY_POST: [ForumRole.MODERATOR, ForumRole.ADMIN],
  DELETE_OWN_POST: [ForumRole.USER, ForumRole.MODERATOR, ForumRole.ADMIN],
  DELETE_ANY_POST: [ForumRole.MODERATOR, ForumRole.ADMIN],
  
  // Moderation permissions
  VIEW_MODERATION_QUEUE: [ForumRole.MODERATOR, ForumRole.ADMIN],
  ACTION_MODERATION_ITEMS: [ForumRole.MODERATOR, ForumRole.ADMIN],
};

export function hasForumPermission(userRole: ForumRole, permission: keyof typeof ForumPermissions): boolean {
  return ForumPermissions[permission].includes(userRole);
}
```

### Authorization Middleware

Create an authorization middleware for API routes:

```typescript
function forumAuthMiddleware(
  permission: keyof typeof ForumPermissions
) {
  return (req, res, next) => {
    const userRole = req.user?.role || ForumRole.USER;
    
    if (hasForumPermission(userRole, permission)) {
      return next();
    }
    
    return res.status(403).json({ error: 'Unauthorized' });
  };
}
```

## UI/UX Design Details

### Layout Structure

The forum will use a three-column layout:

1. **Left Sidebar**: Navigation, categories list, quick links
2. **Main Content Area**: Thread list or thread view with posts
3. **Right Sidebar**: Forum information, active users, stats, recent activity

For mobile, this will collapse to a single column with navigation menus.

### Color Scheme

- Categories will have subtle color indicators
- Pinned threads will have a distinct background color
- Moderator posts will be visually distinguished
- Unread content will have visual indicators

### Typography

- Thread titles: Larger, bold font
- Category names: Medium, semibold font
- Post content: Regular body text
- Metadata: Smaller, lighter font

### Icons and Visual Elements

- Create a consistent set of icons for:
  - Thread status (locked, pinned, has new replies)
  - User actions (reply, like, report)
  - Moderation actions
  - Categories

### Responsive Behavior

- Desktop: Full three-column layout
- Tablet: Two columns (main content + one sidebar)
- Mobile: Single column with collapsible panels

## Performance Optimizations

### Pagination & Infinite Scrolling

- Implement pagination for thread lists with page size of 20-25
- Use infinite scrolling for post lists within threads
- Fetch additional data when user scrolls to 75% of the current content

### Data Caching

- Cache category and thread list data
- Store recently viewed threads in session storage
- Implement optimistic UI updates for posting/reactions

### Database Indexing

- Create indexes on frequently queried fields:
  - `categoryId` in threads
  - `threadId` in posts
  - `userId` in posts and threads
  - `createdAt` and `lastReplyAt` for sorting

### Lazy Loading

- Lazy load images and attachments
- Implement virtualized lists for long thread lists
- Defer loading of thread content until visible

### Optimistic UI Updates

```typescript
// Example of optimistic update for adding a post
function handleAddPost(threadId: string, content: string) {
  // Create optimistic post
  const optimisticPost: Partial<ForumPostEntity> = {
    id: `temp-${Date.now()}`,
    threadId,
    content,
    userId: currentUserId,
    username: currentUsername,
    createdAt: Date.now(),
    isOptimistic: true // Flag to indicate this is an optimistic update
  };
  
  // Add to local state immediately
  setPosts(prev => [...prev, optimisticPost]);
  
  // Submit to backend
  forumService.createPost(threadId, content, currentUserId)
    .then(newPostId => {
      // Replace optimistic post with real one
      setPosts(prev => 
        prev.map(post => post.id === optimisticPost.id 
          ? { ...post, id: newPostId, isOptimistic: false } 
          : post
        )
      );
    })
    .catch(error => {
      // Remove optimistic post on error
      setPosts(prev => prev.filter(post => post.id !== optimisticPost.id));
      showError('Failed to post reply');
    });
}
```

## Conclusion

This technical design document provides detailed specifications for implementing a robust community discussion board. The design includes comprehensive data models, service APIs, component specifications, and performance optimizations to ensure a high-quality user experience.

The implementation should follow modern best practices for web applications, with an emphasis on performance, accessibility, and user experience. The modular architecture will allow for iterative development and future enhancements.