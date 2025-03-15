/**
 * Conversation Monitor Integration Example
 * 
 * This example demonstrates how to integrate the ConversationMonitorService
 * into a Next.js application to monitor forum conversations, create proposals,
 * and manage design documents.
 */

import { ConversationMonitorService } from '../lib/conversationMonitorService';
import { ForumService } from '../lib/forumService';
import { ProposalService } from '../lib/proposalService';
import { VotingService } from '../lib/votingService';
import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Example integration of the ConversationMonitorService
 * This would typically be called from a scheduled job or API route
 */
export async function runConversationMonitoring(db: IDBDatabase) {
  console.log('Starting conversation monitoring process...');
  
  // Initialize services
  const conversationMonitor = new ConversationMonitorService();
  const forumService = new ForumService(db);
  const proposalService = new ProposalService(db);
  const votingService = new VotingService(db);
  
  try {
    // Process conversations to identify improvements and create proposals
    const result = await conversationMonitor.processConversations();
    
    if (result.processed) {
      console.log(`Processed conversations successfully.`);
      console.log(`- Created ${result.newProposals.length} new proposals`);
      console.log(`- Found ${result.approvedProposals.length} approved proposals`);
      
      // Log the new proposals
      if (result.newProposals.length > 0) {
        console.log('\nNew proposals:');
        result.newProposals.forEach(proposal => {
          console.log(`- ${proposal.title}: ${proposal.description.substring(0, 50)}...`);
        });
        
        // Example: Use the proposal service to update proposals
        for (const proposal of result.newProposals) {
          await proposalService.updateProposal(proposal.id, proposal);
        }
      }
      
      // Log the approved proposals
      if (result.approvedProposals.length > 0) {
        console.log('\nApproved proposals:');
        result.approvedProposals.forEach(proposal => {
          console.log(`- ${proposal.title} (${proposal.votes} votes)`);
        });
        
        // Example: Use the voting service to reset votes after approval
        await votingService.resetVotes();
      }
      
      // Example: Use the forum service to create a thread about the monitoring results
      if (result.newProposals.length > 0 || result.approvedProposals.length > 0) {
        const categoryId = 'announcements'; // Example category ID
        const title = 'AI Monitoring Results';
        const content = `The AI monitoring system has processed conversations and found:
- ${result.newProposals.length} new proposals
- ${result.approvedProposals.length} approved proposals`;
        
        await forumService.createThread(
          categoryId,
          title,
          content,
          'system',
          'AI Monitor',
          ['ai', 'monitoring']
        );
      }
    } else {
      console.error('Failed to process conversations:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Error in conversation monitoring process:', error);
    throw error;
  }
}

/**
 * Example of how to set up a scheduled job for conversation monitoring
 * This could be called from a Next.js API route with a cron schedule
 */
export async function setupScheduledMonitoring(db: IDBDatabase) {
  // In a real application, this would be scheduled using a cron job or similar
  console.log('Setting up scheduled conversation monitoring...');
  
  // For demonstration purposes, we'll just run it once
  await runConversationMonitoring(db);
  
  console.log('Scheduled monitoring complete.');
}

/**
 * Example of how to check for implemented designs and clean up
 * This would typically be called from a separate scheduled job
 */
export async function checkImplementedDesigns() {
  console.log('Checking for implemented designs...');
  
  const conversationMonitor = new ConversationMonitorService();
  
  try {
    // Get all design documents
    const designsDir = 'designs';
    
    // Check if designs directory exists
    if (!fs.existsSync(designsDir)) {
      console.log('No designs directory found.');
      return;
    }
    
    // Get all design directories
    const designDirs = fs.readdirSync(designsDir);
    
    for (const dir of designDirs) {
      const documentPath = path.join(designsDir, dir, 'design.md');
      
      // Check if the design document exists
      if (fs.existsSync(documentPath)) {
        // Check if the design has been implemented
        const implemented = await conversationMonitor.checkDesignImplementation(documentPath);
        
        if (implemented) {
          // Delete the design document
          const result = await conversationMonitor.deleteDesignDocument(documentPath);
          
          if (result.success) {
            console.log(`Deleted implemented design document: ${documentPath}`);
          } else {
            console.error(`Failed to delete design document: ${result.error}`);
          }
        } else {
          console.log(`Design not yet implemented: ${documentPath}`);
        }
      }
    }
    
    console.log('Design implementation check complete.');
  } catch (error) {
    console.error('Error checking implemented designs:', error);
  }
}

/**
 * Example of how to integrate the conversation monitor into a Next.js API route
 * This would be called from a Next.js API route handler
 */
export async function apiRouteHandler(
  req: NextApiRequest, 
  res: NextApiResponse, 
  db: IDBDatabase
) {
  // This would be a Next.js API route handler
  if (req.method === 'POST') {
    try {
      const result = await runConversationMonitoring(db);
      res.status(200).json({ success: true, result });
    } catch (error) {
      console.error('API route error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to run conversation monitoring' 
      });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}