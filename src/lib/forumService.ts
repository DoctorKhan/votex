/**
 * Forum Service
 * Provides database operations for the community discussion board
 */

// Entity types
export interface ForumCategoryEntity {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  threadCount?: number;
  lastActivityAt: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface ForumThreadEntity {
  id: string;
  categoryId: string;
  title: string;
  createdBy: string;
  createdAt: number;
  updatedAt?: number;
  lastActivityAt: number;
  viewCount: number;
  postCount: number;
  isPinned: boolean;
  isLocked: boolean;
  tags?: string[];
  subscribedUsers?: string[];
}

export interface ForumPostEntity {
  id: string;
  threadId: string;
  userId: string;
  username?: string;
  content: string;
  createdAt: number;
  editedAt?: number;
  isModeratorPost?: boolean;
  reactions?: {
    [emoji: string]: string[]; // array of user IDs who reacted with this emoji
  };
}

// Input types
export interface ThreadPostsOptions {
  page?: number;
  pageSize?: number;
  sortOrder?: 'asc' | 'desc';
}

// Result types
export interface ThreadPostsResult {
  posts: ForumPostEntity[];
  total: number;
  hasMore: boolean;
}

/**
 * ForumService class
 * Handles all forum-related database operations
 */
export class ForumService {
  private db: IDBDatabase;
  private readonly CATEGORY_STORE = 'forumCategories';
  private readonly THREAD_STORE = 'forumThreads';
  private readonly POST_STORE = 'forumPosts';

  constructor(db: IDBDatabase) {
    this.db = db;
    this.ensureStoresExist();
  }

  /**
   * Ensures all required object stores exist in the database
   */
  private async ensureStoresExist() {
    // Check if stores already exist
    const storeNames = Array.from(this.db.objectStoreNames);
    const requiredStores = [this.CATEGORY_STORE, this.THREAD_STORE, this.POST_STORE];
    
    // If all stores exist, we're done
    if (requiredStores.every(store => storeNames.includes(store))) {
      return;
    }
    
    // Otherwise, we need to create the missing stores
    // This requires a version change transaction, which we can't do here
    // Instead, log a warning
    console.warn('Forum stores not found in database. Please initialize the database with forum stores.');
  }

  /**
   * Helper method to generate a promise for IndexedDB requests
   */
  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Helper method for database transactions
   */
  private async transaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    const transaction = this.db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = callback(store);
    
    return this.promisifyRequest(request);
  }

  // =============== CATEGORY METHODS ===============

  /**
   * Get all forum categories
   */
  async getAllCategories(): Promise<ForumCategoryEntity[]> {
    try {
      const categories = await this.transaction<ForumCategoryEntity[]>(
        this.CATEGORY_STORE,
        'readonly',
        store => store.getAll()
      );

      // Get thread counts for each category
      const threadsByCategory = await this.getThreadCountsByCategory();
      
      // Merge thread counts into categories
      return categories.map(category => ({
        ...category,
        threadCount: threadsByCategory[category.id] || 0
      }));
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  /**
   * Get thread counts for all categories
   */
  private async getThreadCountsByCategory(): Promise<Record<string, number>> {
    try {
      const threads = await this.transaction<ForumThreadEntity[]>(
        this.THREAD_STORE,
        'readonly',
        store => store.getAll()
      );
      
      // Count threads by category
      return threads.reduce((counts, thread) => {
        counts[thread.categoryId] = (counts[thread.categoryId] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);
    } catch (error) {
      console.error('Error getting thread counts:', error);
      return {};
    }
  }

  /**
   * Get a category by ID
   */
  async getCategory(categoryId: string): Promise<ForumCategoryEntity | null> {
    try {
      return await this.transaction<ForumCategoryEntity>(
        this.CATEGORY_STORE,
        'readonly',
        store => store.get(categoryId)
      );
    } catch (error) {
      console.error(`Error getting category ${categoryId}:`, error);
      return null;
    }
  }

  /**
   * Create a new forum category
   */
  async createCategory(category: Omit<ForumCategoryEntity, 'id'>): Promise<ForumCategoryEntity> {
    const now = Date.now();
    const newCategory: ForumCategoryEntity = {
      id: `cat_${now}_${Math.random().toString(36).substring(2, 9)}`,
      ...category,
      createdAt: now,
      updatedAt: now
    };

    try {
      await this.transaction(
        this.CATEGORY_STORE,
        'readwrite',
        store => store.add(newCategory)
      );
      
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category');
    }
  }

  /**
   * Update a forum category
   */
  async updateCategory(
    categoryId: string,
    updates: Partial<Omit<ForumCategoryEntity, 'id' | 'createdAt'>>
  ): Promise<ForumCategoryEntity> {
    try {
      const category = await this.getCategory(categoryId);
      if (!category) {
        throw new Error(`Category ${categoryId} not found`);
      }
      
      const updatedCategory: ForumCategoryEntity = {
        ...category,
        ...updates,
        updatedAt: Date.now()
      };
      
      await this.transaction(
        this.CATEGORY_STORE,
        'readwrite',
        store => store.put(updatedCategory)
      );
      
      return updatedCategory;
    } catch (error) {
      console.error(`Error updating category ${categoryId}:`, error);
      throw new Error('Failed to update category');
    }
  }

  /**
   * Delete a forum category and all its threads and posts
   */
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      // Get all threads in the category
      const threads = await this.getCategoryThreads(categoryId);
      const threadIds = threads.map(thread => thread.id);
      
      // Delete all posts in the threads
      for (const threadId of threadIds) {
        await this.deleteThreadPosts(threadId);
      }
      
      // Delete all threads in the category
      const threadTransaction = this.db.transaction(this.THREAD_STORE, 'readwrite');
      const threadStore = threadTransaction.objectStore(this.THREAD_STORE);
      
      for (const threadId of threadIds) {
        threadStore.delete(threadId);
      }
      
      // Delete the category
      await this.transaction(
        this.CATEGORY_STORE,
        'readwrite',
        store => store.delete(categoryId)
      );
    } catch (error) {
      console.error(`Error deleting category ${categoryId}:`, error);
      throw new Error('Failed to delete category');
    }
  }

  // =============== THREAD METHODS ===============

  /**
   * Get threads in a category
   */
  async getCategoryThreads(
    categoryId: string,
    options: { page?: number; pageSize?: number } = {}
  ): Promise<ForumThreadEntity[]> {
    try {
      const allThreads = await this.transaction<ForumThreadEntity[]>(
        this.THREAD_STORE,
        'readonly',
        store => store.getAll()
      );
      
      // Filter by category
      let threads = allThreads.filter(thread => thread.categoryId === categoryId);
      
      // Sort by pinned first, then by last activity
      threads.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.lastActivityAt - a.lastActivityAt;
      });
      
      // Apply pagination if options are provided
      if (options.page !== undefined && options.pageSize !== undefined) {
        const start = options.page * options.pageSize;
        threads = threads.slice(start, start + options.pageSize);
      }
      
      return threads;
    } catch (error) {
      console.error(`Error getting threads for category ${categoryId}:`, error);
      return [];
    }
  }

  /**
   * Get a thread by ID
   */
  async getThread(threadId: string): Promise<ForumThreadEntity | null> {
    try {
      return await this.transaction<ForumThreadEntity>(
        this.THREAD_STORE,
        'readonly',
        store => store.get(threadId)
      );
    } catch (error) {
      console.error(`Error getting thread ${threadId}:`, error);
      return null;
    }
  }

  /**
   * Create a new thread
   */
  async createThread(
    categoryId: string,
    title: string,
    initialPost: string,
    userId: string,
    username?: string,
    tags: string[] = []
  ): Promise<{ thread: ForumThreadEntity; post: ForumPostEntity }> {
    const now = Date.now();
    
    try {
      // Create thread
      const newThread: ForumThreadEntity = {
        id: `thread_${now}_${Math.random().toString(36).substring(2, 9)}`,
        categoryId,
        title,
        createdBy: username || userId,
        createdAt: now,
        lastActivityAt: now,
        viewCount: 0,
        postCount: 1,
        isPinned: false,
        isLocked: false,
        tags,
        subscribedUsers: [userId]
      };
      
      // Create initial post
      const newPost: ForumPostEntity = {
        id: `post_${now}_${Math.random().toString(36).substring(2, 9)}`,
        threadId: newThread.id,
        userId,
        username,
        content: initialPost,
        createdAt: now
      };
      
      // Save thread and post
      await this.transaction(
        this.THREAD_STORE,
        'readwrite',
        store => store.add(newThread)
      );
      
      await this.transaction(
        this.POST_STORE,
        'readwrite',
        store => store.add(newPost)
      );
      
      // Update category's last activity time
      await this.updateCategoryActivity(categoryId, now);
      
      return { thread: newThread, post: newPost };
    } catch (error) {
      console.error('Error creating thread:', error);
      throw new Error('Failed to create thread');
    }
  }

  /**
   * Update a thread's last activity time
   */
  private async updateThreadActivity(threadId: string, timestamp = Date.now()): Promise<void> {
    try {
      const thread = await this.getThread(threadId);
      if (!thread) return;
      
      const updatedThread: ForumThreadEntity = {
        ...thread,
        lastActivityAt: timestamp
      };
      
      await this.transaction(
        this.THREAD_STORE,
        'readwrite',
        store => store.put(updatedThread)
      );
      
      // Also update the category's last activity time
      await this.updateCategoryActivity(thread.categoryId, timestamp);
    } catch (error) {
      console.error(`Error updating thread activity for ${threadId}:`, error);
    }
  }

  /**
   * Update a category's last activity time
   */
  private async updateCategoryActivity(categoryId: string, timestamp = Date.now()): Promise<void> {
    try {
      const category = await this.getCategory(categoryId);
      if (!category) return;
      
      const updatedCategory: ForumCategoryEntity = {
        ...category,
        lastActivityAt: timestamp
      };
      
      await this.transaction(
        this.CATEGORY_STORE,
        'readwrite',
        store => store.put(updatedCategory)
      );
    } catch (error) {
      console.error(`Error updating category activity for ${categoryId}:`, error);
    }
  }

  /**
   * Increment a thread's view count
   */
  async viewThread(threadId: string): Promise<void> {
    try {
      const thread = await this.getThread(threadId);
      if (!thread) return;
      
      const updatedThread: ForumThreadEntity = {
        ...thread,
        viewCount: thread.viewCount + 1
      };
      
      await this.transaction(
        this.THREAD_STORE,
        'readwrite',
        store => store.put(updatedThread)
      );
    } catch (error) {
      console.error(`Error incrementing view count for thread ${threadId}:`, error);
    }
  }

  /**
   * Toggle a thread's pinned status
   */
  async toggleThreadPin(threadId: string): Promise<boolean> {
    try {
      const thread = await this.getThread(threadId);
      if (!thread) throw new Error(`Thread ${threadId} not found`);
      
      const updatedThread: ForumThreadEntity = {
        ...thread,
        isPinned: !thread.isPinned,
        updatedAt: Date.now()
      };
      
      await this.transaction(
        this.THREAD_STORE,
        'readwrite',
        store => store.put(updatedThread)
      );
      
      return updatedThread.isPinned;
    } catch (error) {
      console.error(`Error toggling pin status for thread ${threadId}:`, error);
      throw new Error('Failed to toggle thread pin status');
    }
  }

  /**
   * Toggle a thread's locked status
   */
  async toggleThreadLock(threadId: string): Promise<boolean> {
    try {
      const thread = await this.getThread(threadId);
      if (!thread) throw new Error(`Thread ${threadId} not found`);
      
      const updatedThread: ForumThreadEntity = {
        ...thread,
        isLocked: !thread.isLocked,
        updatedAt: Date.now()
      };
      
      await this.transaction(
        this.THREAD_STORE,
        'readwrite',
        store => store.put(updatedThread)
      );
      
      return updatedThread.isLocked;
    } catch (error) {
      console.error(`Error toggling lock status for thread ${threadId}:`, error);
      throw new Error('Failed to toggle thread lock status');
    }
  }

  /**
   * Subscribe to a thread
   */
  async subscribeToThread(threadId: string, userId: string): Promise<void> {
    try {
      const thread = await this.getThread(threadId);
      if (!thread) throw new Error(`Thread ${threadId} not found`);
      
      // Check if already subscribed
      const subscribedUsers = thread.subscribedUsers || [];
      if (subscribedUsers.includes(userId)) return;
      
      // Add user to subscribers
      const updatedThread: ForumThreadEntity = {
        ...thread,
        subscribedUsers: [...subscribedUsers, userId]
      };
      
      await this.transaction(
        this.THREAD_STORE,
        'readwrite',
        store => store.put(updatedThread)
      );
    } catch (error) {
      console.error(`Error subscribing to thread ${threadId}:`, error);
      throw new Error('Failed to subscribe to thread');
    }
  }

  /**
   * Unsubscribe from a thread
   */
  async unsubscribeFromThread(threadId: string, userId: string): Promise<void> {
    try {
      const thread = await this.getThread(threadId);
      if (!thread) throw new Error(`Thread ${threadId} not found`);
      
      // Check if subscribed
      const subscribedUsers = thread.subscribedUsers || [];
      if (!subscribedUsers.includes(userId)) return;
      
      // Remove user from subscribers
      const updatedThread: ForumThreadEntity = {
        ...thread,
        subscribedUsers: subscribedUsers.filter(id => id !== userId)
      };
      
      await this.transaction(
        this.THREAD_STORE,
        'readwrite',
        store => store.put(updatedThread)
      );
    } catch (error) {
      console.error(`Error unsubscribing from thread ${threadId}:`, error);
      throw new Error('Failed to unsubscribe from thread');
    }
  }

  /**
   * Delete a thread and all its posts
   */
  async deleteThread(threadId: string): Promise<void> {
    try {
      const thread = await this.getThread(threadId);
      if (!thread) throw new Error(`Thread ${threadId} not found`);
      
      // Delete all posts in the thread
      await this.deleteThreadPosts(threadId);
      
      // Delete the thread
      await this.transaction(
        this.THREAD_STORE,
        'readwrite',
        store => store.delete(threadId)
      );
    } catch (error) {
      console.error(`Error deleting thread ${threadId}:`, error);
      throw new Error('Failed to delete thread');
    }
  }

  /**
   * Delete all posts in a thread
   */
  private async deleteThreadPosts(threadId: string): Promise<void> {
    try {
      const posts = await this.transaction<ForumPostEntity[]>(
        this.POST_STORE,
        'readonly',
        store => store.getAll()
      );
      
      const threadPosts = posts.filter(post => post.threadId === threadId);
      
      const transaction = this.db.transaction(this.POST_STORE, 'readwrite');
      const store = transaction.objectStore(this.POST_STORE);
      
      for (const post of threadPosts) {
        store.delete(post.id);
      }
      
      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error(`Error deleting posts for thread ${threadId}:`, error);
      throw new Error('Failed to delete thread posts');
    }
  }

  // =============== POST METHODS ===============

  /**
   * Get posts in a thread
   */
  async getThreadPosts(
    threadId: string,
    options: ThreadPostsOptions = {}
  ): Promise<ThreadPostsResult> {
    const { page = 0, pageSize = 20, sortOrder = 'asc' } = options;
    
    try {
      const allPosts = await this.transaction<ForumPostEntity[]>(
        this.POST_STORE,
        'readonly',
        store => store.getAll()
      );
      
      // Filter by thread
      const threadPosts = allPosts.filter(post => post.threadId === threadId);
      const total = threadPosts.length;
      
      // Sort by creation time
      threadPosts.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.createdAt - b.createdAt;
        } else {
          return b.createdAt - a.createdAt;
        }
      });
      
      // Apply pagination
      const start = page * pageSize;
      const paginatedPosts = threadPosts.slice(start, start + pageSize);
      const hasMore = start + pageSize < total;
      
      return {
        posts: paginatedPosts,
        total,
        hasMore
      };
    } catch (error) {
      console.error(`Error getting posts for thread ${threadId}:`, error);
      return { posts: [], total: 0, hasMore: false };
    }
  }

  /**
   * Get a post by ID
   */
  async getPost(postId: string): Promise<ForumPostEntity | null> {
    try {
      return await this.transaction<ForumPostEntity>(
        this.POST_STORE,
        'readonly',
        store => store.get(postId)
      );
    } catch (error) {
      console.error(`Error getting post ${postId}:`, error);
      return null;
    }
  }

  /**
   * Create a new post in a thread
   */
  async createPost(
    threadId: string,
    content: string,
    userId: string,
    username?: string,
    isModeratorPost = false
  ): Promise<ForumPostEntity> {
    const now = Date.now();
    
    try {
      const thread = await this.getThread(threadId);
      if (!thread) throw new Error(`Thread ${threadId} not found`);
      
      // Check if thread is locked
      if (thread.isLocked && !isModeratorPost) {
        throw new Error('Cannot post in a locked thread');
      }
      
      // Create new post
      const newPost: ForumPostEntity = {
        id: `post_${now}_${Math.random().toString(36).substring(2, 9)}`,
        threadId,
        userId,
        username,
        content,
        createdAt: now,
        isModeratorPost
      };
      
      // Save post
      await this.transaction(
        this.POST_STORE,
        'readwrite',
        store => store.add(newPost)
      );
      
      // Update thread post count and activity time
      const updatedThread: ForumThreadEntity = {
        ...thread,
        postCount: thread.postCount + 1,
        lastActivityAt: now
      };
      
      await this.transaction(
        this.THREAD_STORE,
        'readwrite',
        store => store.put(updatedThread)
      );
      
      // Update category activity time
      await this.updateCategoryActivity(thread.categoryId, now);
      
      return newPost;
    } catch (error) {
      console.error(`Error creating post in thread ${threadId}:`, error);
      throw new Error('Failed to create post');
    }
  }

  /**
   * Update a post's content
   */
  async updatePost(
    postId: string,
    content: string,
    userId: string
  ): Promise<ForumPostEntity> {
    try {
      const post = await this.getPost(postId);
      if (!post) throw new Error(`Post ${postId} not found`);
      
      // Check if user is the post author
      if (post.userId !== userId) {
        throw new Error('Only the author can edit this post');
      }
      
      // Update post
      const updatedPost: ForumPostEntity = {
        ...post,
        content,
        editedAt: Date.now()
      };
      
      await this.transaction(
        this.POST_STORE,
        'readwrite',
        store => store.put(updatedPost)
      );
      
      return updatedPost;
    } catch (error) {
      console.error(`Error updating post ${postId}:`, error);
      throw new Error('Failed to update post');
    }
  }

  /**
   * Delete a post
   */
  async deletePost(postId: string, userId: string): Promise<void> {
    try {
      const post = await this.getPost(postId);
      if (!post) throw new Error(`Post ${postId} not found`);
      
      // Check if user is the post author
      if (post.userId !== userId) {
        throw new Error('Only the author can delete this post');
      }
      
      // Get the thread
      const thread = await this.getThread(post.threadId);
      if (!thread) throw new Error(`Thread ${post.threadId} not found`);
      
      // Delete the post
      await this.transaction(
        this.POST_STORE,
        'readwrite',
        store => store.delete(postId)
      );
      
      // Update thread post count
      const updatedThread: ForumThreadEntity = {
        ...thread,
        postCount: Math.max(0, thread.postCount - 1)
      };
      
      await this.transaction(
        this.THREAD_STORE,
        'readwrite',
        store => store.put(updatedThread)
      );
    } catch (error) {
      console.error(`Error deleting post ${postId}:`, error);
      throw new Error('Failed to delete post');
    }
  }

  /**
   * Add a reaction to a post
   */
  async addReaction(
    postId: string,
    userId: string,
    emoji: string
  ): Promise<void> {
    try {
      const post = await this.getPost(postId);
      if (!post) throw new Error(`Post ${postId} not found`);
      
      // Initialize or update reactions
      const reactions = post.reactions || {};
      const emojiReactions = reactions[emoji] || [];
      
      // Check if user already reacted with this emoji
      if (emojiReactions.includes(userId)) return;
      
      // Add reaction
      const updatedReactions = {
        ...reactions,
        [emoji]: [...emojiReactions, userId]
      };
      
      // Update post
      const updatedPost: ForumPostEntity = {
        ...post,
        reactions: updatedReactions
      };
      
      await this.transaction(
        this.POST_STORE,
        'readwrite',
        store => store.put(updatedPost)
      );
    } catch (error) {
      console.error(`Error adding reaction to post ${postId}:`, error);
      throw new Error('Failed to add reaction');
    }
  }

  /**
   * Remove a reaction from a post
   */
  async removeReaction(
    postId: string,
    userId: string,
    emoji: string
  ): Promise<void> {
    try {
      const post = await this.getPost(postId);
      if (!post) throw new Error(`Post ${postId} not found`);
      
      // Check if reactions exist
      const reactions = post.reactions || {};
      const emojiReactions = reactions[emoji] || [];
      
      // Check if user reacted with this emoji
      if (!emojiReactions.includes(userId)) return;
      
      // Remove reaction
      const updatedEmojiReactions = emojiReactions.filter(id => id !== userId);
      
      // Update reactions
      const updatedReactions = { ...reactions };
      
      if (updatedEmojiReactions.length === 0) {
        // Remove emoji key if no reactions left
        delete updatedReactions[emoji];
      } else {
        updatedReactions[emoji] = updatedEmojiReactions;
      }
      
      // Update post
      const updatedPost: ForumPostEntity = {
        ...post,
        reactions: updatedReactions
      };
      
      await this.transaction(
        this.POST_STORE,
        'readwrite',
        store => store.put(updatedPost)
      );
    } catch (error) {
      console.error(`Error removing reaction from post ${postId}:`, error);
      throw new Error('Failed to remove reaction');
    }
  }
}