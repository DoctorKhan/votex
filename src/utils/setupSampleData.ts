import { ForumService, ForumThreadEntity } from '../lib/forumService';

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
      const streetLightsThread = await forumService.createThread(
        communityIssuesCategoryId,
        'Street lights in North District need maintenance',
        'Several street lights in the North District have been out for weeks. This is creating unsafe conditions for pedestrians at night.',
        userId,
        username,
        ['infrastructure', 'safety']
      );
      
      const parkWasteThread = await forumService.createThread(
        communityIssuesCategoryId,
        'Public park needs better waste management',
        'The central park has insufficient trash bins and they are often overflowing during weekends. This is causing litter and wildlife issues.',
        userId,
        username,
        ['environment', 'public-space']
      );
      
      const communityCenterThread = await forumService.createThread(
        communityIssuesCategoryId,
        'Community center hours are too limited',
        'The current operating hours of our community center (10am-4pm) are too restrictive for working residents who want to use the facilities.',
        userId,
        username,
        ['community-services', 'accessibility']
      );
      
      console.log('Created sample community issues');
      
      // Add sample replies to the threads
      await addSampleRepliesToThreads(forumService, [
        streetLightsThread.thread,
        parkWasteThread.thread,
        communityCenterThread.thread
      ]);
    } else {
      // If threads already exist, check if they have replies
      // If not, add sample replies to them
      await addSampleRepliesToExistingThreads(forumService, threads);
    }
  } catch (error) {
    console.error('Error setting up community issues:', error);
  }
}

/**
 * Adds sample replies to newly created threads
 */
async function addSampleRepliesToThreads(
  forumService: ForumService,
  threads: ForumThreadEntity[]
): Promise<void> {
  try {
    // Sample user IDs and usernames
    const users = [
      { id: 'resident-1', name: 'LocalResident' },
      { id: 'council-member', name: 'CouncilMember' },
      { id: 'community-volunteer', name: 'CommunityVolunteer' },
      { id: 'concerned-citizen', name: 'ConcernedCitizen' },
      { id: 'neighborhood-watch', name: 'NeighborhoodWatch' }
    ];
    
    // Add replies to the street lights thread
    if (threads[0]) {
      await forumService.createPost(
        threads[0].id,
        "I live in the North District and can confirm this is a major safety issue. I've seen several people using their phone flashlights to navigate at night. We need urgent action on this.",
        users[0].id,
        users[0].name
      );
      
      await forumService.createPost(
        threads[0].id,
        "Thank you for bringing this to our attention. The city council has allocated budget for infrastructure maintenance this quarter. I'll make sure this gets prioritized. Could you please specify which streets are most affected?",
        users[1].id,
        users[1].name,
        true // Mark as moderator post
      );
      
      await forumService.createPost(
        threads[0].id,
        "Main Street and Oak Avenue are completely dark. Pine Street has about 3-4 lights out as well. This has been going on for almost a month now.",
        users[0].id,
        users[0].name
      );
      
      await forumService.createPost(
        threads[0].id,
        "I've created a map marking all the outages in our neighborhood. You can view it here: [link to map]. I counted 17 non-functioning street lights total.",
        users[4].id,
        users[4].name
      );
    }
    
    // Add replies to the park waste management thread
    if (threads[1]) {
      await forumService.createPost(
        threads[1].id,
        "I was at the park last weekend and it was a mess. There were only two trash bins for the entire north section, and both were overflowing by noon. We need more bins and more frequent collection.",
        users[3].id,
        users[3].name
      );
      
      await forumService.createPost(
        threads[1].id,
        "Our volunteer group does monthly park cleanups, but we can't keep up with the weekend crowds. The wildlife situation is concerning too - I've seen raccoons and birds getting into the trash and spreading it around.",
        users[2].id,
        users[2].name
      );
      
      await forumService.createPost(
        threads[1].id,
        "The Parks Department is aware of this issue. We're working on a new waste management plan that includes more bins and twice-daily collection on weekends. We're also looking into wildlife-resistant bin designs.",
        users[1].id,
        users[1].name,
        true // Mark as moderator post
      );
      
      await forumService.createPost(
        threads[1].id,
        "That sounds promising! When can we expect to see these changes implemented? The summer season is approaching and the park will get even busier.",
        users[3].id,
        users[3].name
      );
    }
    
    // Add replies to the community center hours thread
    if (threads[2]) {
      await forumService.createPost(
        threads[2].id,
        "I work until 5pm and can never use the community center facilities. Many of my neighbors are in the same situation. Could we at least have extended hours a few days a week?",
        users[0].id,
        users[0].name
      );
      
      await forumService.createPost(
        threads[2].id,
        "I'd be willing to volunteer one evening a week to help keep the center open later. Maybe we could organize a volunteer schedule to extend hours without increasing staff costs?",
        users[2].id,
        users[2].name
      );
      
      await forumService.createPost(
        threads[2].id,
        "This is a great suggestion. The community center has been operating on limited hours due to budget constraints, but a volunteer program could help. Let's discuss this at the next community meeting.",
        users[1].id,
        users[1].name,
        true // Mark as moderator post
      );
      
      await forumService.createPost(
        threads[2].id,
        "I would also suggest a survey to determine which extended hours would benefit the most residents. Maybe some people would prefer early morning hours before work, while others need evening access.",
        users[4].id,
        users[4].name
      );
      
      await forumService.createPost(
        threads[2].id,
        "Great idea about the survey. I've created an online form here: [link to survey]. Please share with your neighbors so we can get comprehensive feedback.",
        users[1].id,
        users[1].name,
        true // Mark as moderator post
      );
    }
    
    console.log('Added sample replies to community issue threads');
  } catch (error) {
    console.error('Error adding sample replies:', error);
  }
}

/**
 * Adds sample replies to existing threads if they don't have any
 */
async function addSampleRepliesToExistingThreads(
  forumService: ForumService,
  threads: ForumThreadEntity[]
): Promise<void> {
  try {
    for (const thread of threads) {
      // Check if thread already has replies
      const result = await forumService.getThreadPosts(thread.id, { pageSize: 2 });
      
      // If thread only has the initial post (no replies), add sample replies
      if (result.posts.length <= 1) {
        // Filter threads by title keywords to match them with appropriate replies
        if (thread.title.toLowerCase().includes('street light') ||
            thread.title.toLowerCase().includes('maintenance') ||
            thread.title.toLowerCase().includes('infrastructure')) {
          await addStreetLightReplies(forumService, thread.id);
        } else if (thread.title.toLowerCase().includes('park') ||
                  thread.title.toLowerCase().includes('waste') ||
                  thread.title.toLowerCase().includes('environment')) {
          await addParkWasteReplies(forumService, thread.id);
        } else if (thread.title.toLowerCase().includes('community center') ||
                  thread.title.toLowerCase().includes('hours') ||
                  thread.title.toLowerCase().includes('accessibility')) {
          await addCommunityCenterReplies(forumService, thread.id);
        } else {
          // Generic replies for other threads
          await addGenericReplies(forumService, thread.id);
        }
      }
    }
    
    console.log('Added sample replies to existing community issue threads');
  } catch (error) {
    console.error('Error adding sample replies to existing threads:', error);
  }
}

/**
 * Adds street light related replies to a thread
 */
async function addStreetLightReplies(forumService: ForumService, threadId: string): Promise<void> {
  const users = [
    { id: 'resident-1', name: 'LocalResident' },
    { id: 'council-member', name: 'CouncilMember' },
    { id: 'neighborhood-watch', name: 'NeighborhoodWatch' }
  ];
  
  await forumService.createPost(
    threadId,
    "I've noticed this issue too. It's especially dangerous at the corner of Elm and Main where there are no working lights for the entire block.",
    users[0].id,
    users[0].name
  );
  
  await forumService.createPost(
    threadId,
    "The city maintenance department has been notified. They've added this to their priority list and should have crews out within the next week.",
    users[1].id,
    users[1].name,
    true // Mark as moderator post
  );
  
  await forumService.createPost(
    threadId,
    "Our neighborhood watch group has compiled a list of all outages in the area. I'll share it with the maintenance department to make sure they address all the problem spots.",
    users[2].id,
    users[2].name
  );
}

/**
 * Adds park waste management related replies to a thread
 */
async function addParkWasteReplies(forumService: ForumService, threadId: string): Promise<void> {
  const users = [
    { id: 'concerned-citizen', name: 'ConcernedCitizen' },
    { id: 'parks-department', name: 'ParksOfficial' },
    { id: 'community-volunteer', name: 'CommunityVolunteer' }
  ];
  
  await forumService.createPost(
    threadId,
    "The trash situation gets worse every weekend. I've seen wildlife getting into the overflowing bins and spreading garbage throughout the park.",
    users[0].id,
    users[0].name
  );
  
  await forumService.createPost(
    threadId,
    "The Parks Department is implementing a new waste management plan next month. We'll be adding 15 new bins throughout the park and increasing collection frequency on weekends.",
    users[1].id,
    users[1].name,
    true // Mark as moderator post
  );
  
  await forumService.createPost(
    threadId,
    "Our volunteer group is organizing a park cleanup this Saturday. Everyone is welcome to join! We'll meet at the main entrance at 9am and provide all necessary supplies.",
    users[2].id,
    users[2].name
  );
}

/**
 * Adds community center related replies to a thread
 */
async function addCommunityCenterReplies(forumService: ForumService, threadId: string): Promise<void> {
  const users = [
    { id: 'working-parent', name: 'WorkingParent' },
    { id: 'center-director', name: 'CenterDirector' },
    { id: 'senior-resident', name: 'SeniorResident' }
  ];
  
  await forumService.createPost(
    threadId,
    "As someone who works full-time, I can never access the community center services. We need evening hours at least a few days a week.",
    users[0].id,
    users[0].name
  );
  
  await forumService.createPost(
    threadId,
    "We're currently conducting a community survey to determine the most needed hours. Based on the results, we plan to implement extended hours starting next month.",
    users[1].id,
    users[1].name,
    true // Mark as moderator post
  );
  
  await forumService.createPost(
    threadId,
    "I'd like to see more morning programs as well. Many seniors in the community prefer earlier hours rather than evenings.",
    users[2].id,
    users[2].name
  );
  
  await forumService.createPost(
    threadId,
    "Thank you all for your feedback. We're considering both morning and evening extended hours to accommodate different schedules. The survey results will help us finalize the plan.",
    users[1].id,
    users[1].name,
    true // Mark as moderator post
  );
}

/**
 * Adds generic replies to a thread
 */
async function addGenericReplies(forumService: ForumService, threadId: string): Promise<void> {
  const users = [
    { id: 'community-member', name: 'CommunityMember' },
    { id: 'city-official', name: 'CityOfficial' },
    { id: 'local-business', name: 'LocalBusiness' }
  ];
  
  await forumService.createPost(
    threadId,
    "This is an important issue that affects many people in our community. I hope we can find a solution soon.",
    users[0].id,
    users[0].name
  );
  
  await forumService.createPost(
    threadId,
    "Thank you for bringing this to our attention. The city is aware of this issue and we're working on addressing it in our next planning meeting.",
    users[1].id,
    users[1].name,
    true // Mark as moderator post
  );
  
  await forumService.createPost(
    threadId,
    "As a local business owner, I've seen how this affects our neighborhood. I'd be willing to contribute resources to help resolve this issue.",
    users[2].id,
    users[2].name
  );
}