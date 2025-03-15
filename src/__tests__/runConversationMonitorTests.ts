/**
 * Test runner for the ConversationMonitorService
 * 
 * This script runs the tests for the ConversationMonitorService
 * and demonstrates its functionality.
 */

import { ConversationMonitorService } from '../lib/conversationMonitorService';

async function runTests() {
  console.log('Starting ConversationMonitorService tests...');
  
  // Create an instance of the service
  const service = new ConversationMonitorService();
  
  try {
    // Test monitoring conversations
    console.log('\n1. Testing monitorConversations()...');
    const monitoringResult = await service.monitorConversations();
    console.log('Monitoring result:', JSON.stringify(monitoringResult, null, 2));
    
    // Create a sample improvement suggestion
    const improvement = {
      title: 'Add Dark Mode',
      description: 'Implement a dark mode feature to reduce eye strain',
      confidence: 0.85
    };
    
    // Test creating a proposal from an improvement
    console.log('\n2. Testing createProposalFromImprovement()...');
    const proposal = await service.createProposalFromImprovement(improvement);
    console.log('Created proposal:', JSON.stringify(proposal, null, 2));
    
    // Test checking proposal status
    console.log('\n3. Testing checkProposalStatus()...');
    const statusResult = await service.checkProposalStatus();
    console.log('Proposal status:', JSON.stringify(statusResult, null, 2));
    
    // Test creating a design document
    console.log('\n4. Testing createDesignDocument()...');
    const documentResult = await service.createDesignDocument(proposal);
    console.log('Design document result:', JSON.stringify(documentResult, null, 2));
    
    // Test the full process
    console.log('\n5. Testing processConversations()...');
    const processResult = await service.processConversations();
    console.log('Process result:', JSON.stringify(processResult, null, 2));
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests().catch(console.error);