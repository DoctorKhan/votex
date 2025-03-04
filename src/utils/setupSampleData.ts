import { ForumService } from '../lib/forumService';

/**
 * Sets up sample community issues and ensures the category exists
 */
export async function setupCommunityIssues(db: IDBDatabase): Promise<void> {
  try {
    const forumService = new ForumService(db);
    
    // First, get all categories to find or create the Community Issues category
    const categories = await forumService.getAllCategories();
    
    // Find the Community Issues category or create it if it doesn't exist
    let communityIssuesCategoryId = '';
    const communityIssuesCategory = categories.find(cat => cat.name === 'Community Issues');
    
    if (communityIssuesCategory) {
      communityIssuesCategoryId = communityIssuesCategory.id;
    } else {
      // Create the category if it doesn't exist
      const newCategory = await forumService.createCategory({
        name: 'Community Issues',
        description: 'Report and discuss community issues that need attention',
        sortOrder: 4,
        lastActivityAt: Date.now()
      });
      communityIssuesCategoryId = newCategory.id;
    }
    
    // Check if the category already has threads
    const threads = await forumService.getCategoryThreads(communityIssuesCategoryId);
    
    // If there are no threads, create sample ones
    if (threads.length === 0) {
      const userId = 'sample-user-id';
      const username = 'DemoUser';
      
      // Create sample community issues
      await forumService.createThread(
        communityIssuesCategoryId,
        'Street lights in North District need maintenance',
        'Several street lights in the North District have been out for weeks. This is creating unsafe conditions for pedestrians at night.',
        userId,
        username,
        ['infrastructure', 'safety']
      );
      
      await forumService.createThread(
        communityIssuesCategoryId,
        'Public park needs better waste management',
        'The central park has insufficient trash bins and they are often overflowing during weekends. This is causing litter and wildlife issues.',
        userId,
        username,
        ['environment', 'public-space']
      );
      
      await forumService.createThread(
        communityIssuesCategoryId,
        'Community center hours are too limited',
        'The current operating hours of our community center (10am-4pm) are too restrictive for working residents who want to use the facilities.',
        userId,
        username,
        ['community-services', 'accessibility']
      );
      
      console.log('Created sample community issues');
    }
  } catch (error) {
    console.error('Error setting up community issues:', error);
  }
}