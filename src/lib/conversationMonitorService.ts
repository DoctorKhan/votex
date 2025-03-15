import { ForumPostEntity, ForumThreadEntity } from './forumService';
import { ProposalEntity } from './proposalService';
import { generateSmartProposal, generateProposalAnalysis } from './intelligentService';
import { addOrUpdateItem, getAllItems, generateId } from './db';
import { logAction } from './loggingService';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Improvement suggestion identified from conversations
 */
export interface ImprovementSuggestion {
  title: string;
  description: string;
  confidence: number;
  relatedPosts?: string[]; // IDs of posts that led to this suggestion
}

/**
 * Result of monitoring conversations
 */
export interface MonitoringResult {
  analyzed: boolean;
  potentialImprovements: ImprovementSuggestion[];
  error?: string;
}

/**
 * Result of checking proposal status
 */
export interface ProposalStatusResult {
  approvedProposals: ProposalEntity[];
  pendingProposals: ProposalEntity[];
  error?: string;
}

/**
 * Result of creating a design document
 */
export interface DesignDocumentResult {
  success: boolean;
  documentPath?: string;
  error?: string;
}

/**
 * Result of processing conversations
 */
export interface ProcessingResult {
  processed: boolean;
  newProposals: ProposalEntity[];
  approvedProposals: ProposalEntity[];
  error?: string;
}

/**
 * Service that monitors conversations and proposes site improvements
 */
export class ConversationMonitorService {
  private readonly DESIGNS_DIR = 'designs';
  private readonly VOTE_THRESHOLD = 5; // Number of votes required for a proposal to be approved

  /**
   * Analyzes forum conversations to identify potential improvements
   */
  async monitorConversations(): Promise<MonitoringResult> {
    try {
      // Get all forum posts and threads
      const posts = await getAllItems<ForumPostEntity>('forumPosts');
      const threads = await getAllItems<ForumThreadEntity>('forumThreads');
      
      // Skip if no posts to analyze
      if (!posts.length) {
        return {
          analyzed: true,
          potentialImprovements: []
        };
      }
      
      // Group posts by thread
      const postsByThread = this.groupPostsByThread(posts);
      
      // Analyze conversations to identify potential improvements
      const improvements = await this.analyzeConversations(postsByThread, threads);
      
      // Log the monitoring action
      await logAction({
        type: 'CONVERSATION_MONITORING',
        improvementsFound: improvements.length,
        timestamp: Date.now()
      });
      
      return {
        analyzed: true,
        potentialImprovements: improvements
      };
    } catch (error) {
      console.error('Error monitoring conversations:', error);
      return {
        analyzed: false,
        potentialImprovements: [],
        error: 'Failed to monitor conversations'
      };
    }
  }
  
  /**
   * Groups posts by their thread ID
   */
  private groupPostsByThread(posts: ForumPostEntity[]): Record<string, ForumPostEntity[]> {
    return posts.reduce((groups, post) => {
      const threadId = post.threadId;
      if (!groups[threadId]) {
        groups[threadId] = [];
      }
      groups[threadId].push(post);
      return groups;
    }, {} as Record<string, ForumPostEntity[]>);
  }
  
  /**
   * Analyzes conversations to identify potential improvements
   */
  private async analyzeConversations(
    postsByThread: Record<string, ForumPostEntity[]>,
    threads: ForumThreadEntity[]
  ): Promise<ImprovementSuggestion[]> {
    const improvements: ImprovementSuggestion[] = [];
    
    // For each thread, analyze its posts for improvement suggestions
    for (const threadId in postsByThread) {
      const thread = threads.find(t => t.id === threadId);
      if (!thread) continue;
      
      const posts = postsByThread[threadId];
      
      // Skip threads with too few posts
      if (posts.length < 2) continue;
      
      // Sort posts by creation time
      posts.sort((a, b) => a.createdAt - b.createdAt);
      
      // Extract conversation text
      const conversationText = posts.map(post => post.content).join('\n');
      
      // Simple keyword-based analysis for now
      // In a real implementation, this would use more sophisticated NLP or ML
      const improvementKeywords = [
        { keyword: 'dark mode', title: 'Add Dark Mode', confidence: 0.85 },
        { keyword: 'mobile', title: 'Improve Mobile Experience', confidence: 0.8 },
        { keyword: 'search', title: 'Enhance Search Functionality', confidence: 0.75 },
        { keyword: 'notification', title: 'Add Notification System', confidence: 0.8 },
        { keyword: 'profile', title: 'Enhance User Profiles', confidence: 0.7 }
      ];
      
      for (const { keyword, title, confidence } of improvementKeywords) {
        if (conversationText.toLowerCase().includes(keyword.toLowerCase())) {
          // Found a potential improvement
          const relatedPosts = posts
            .filter(post => post.content.toLowerCase().includes(keyword.toLowerCase()))
            .map(post => post.id);
          
          improvements.push({
            title,
            description: `Users have expressed interest in ${title.toLowerCase()} functionality based on their conversations.`,
            confidence,
            relatedPosts
          });
          
          // Only one improvement per thread for now to avoid duplicates
          break;
        }
      }
    }
    
    return improvements;
  }
  
  /**
   * Creates a proposal from an identified improvement
   */
  async createProposalFromImprovement(improvement: ImprovementSuggestion): Promise<ProposalEntity> {
    try {
      // Get existing proposals to avoid duplicates
      const existingProposals = await getAllItems<ProposalEntity>('proposals');
      const existingTitles = existingProposals.map(p => p.title);
      
      // Generate a smart proposal using the AI service
      const smartProposal = await generateSmartProposal(existingTitles);
      
      // Create the proposal entity
      const proposalId = generateId();
      const proposal: ProposalEntity = {
        id: proposalId,
        title: smartProposal.title || improvement.title,
        description: smartProposal.description || improvement.description,
        votes: 0,
        aiCreated: true,
        createdAt: Date.now()
      };
      
      // Generate analysis for the proposal
      const analysis = await generateProposalAnalysis(proposal.title, proposal.description);
      proposal.analysis = analysis;
      
      // Save the proposal
      await addOrUpdateItem('proposals', proposal);
      
      // Log the proposal creation
      await logAction({
        type: 'AI_PROPOSAL_CREATION',
        proposalId,
        title: proposal.title,
        timestamp: Date.now()
      });
      
      return proposal;
    } catch (error) {
      console.error('Error creating proposal from improvement:', error);
      
      // Create a fallback proposal if the AI service fails
      const proposalId = generateId();
      const fallbackProposal: ProposalEntity = {
        id: proposalId,
        title: improvement.title,
        description: improvement.description,
        votes: 0,
        aiCreated: true,
        createdAt: Date.now()
      };
      
      await addOrUpdateItem('proposals', fallbackProposal);
      
      return fallbackProposal;
    }
  }
  
  /**
   * Checks the status of AI-created proposals
   */
  async checkProposalStatus(voteThreshold = this.VOTE_THRESHOLD): Promise<ProposalStatusResult> {
    try {
      // Get all proposals
      const proposals = await getAllItems<ProposalEntity>('proposals');
      
      // Filter for AI-created proposals
      const aiProposals = proposals.filter(p => p.aiCreated);
      
      // Separate approved and pending proposals
      const approvedProposals = aiProposals.filter(p => p.votes >= voteThreshold);
      const pendingProposals = aiProposals.filter(p => p.votes < voteThreshold);
      
      return {
        approvedProposals,
        pendingProposals
      };
    } catch (error) {
      console.error('Error checking proposal status:', error);
      return {
        approvedProposals: [],
        pendingProposals: [],
        error: 'Failed to check proposal status'
      };
    }
  }
  
  /**
   * Creates a design document for an approved proposal
   */
  async createDesignDocument(proposal: ProposalEntity): Promise<DesignDocumentResult> {
    try {
      // Create a slug from the proposal title
      const slug = this.createSlug(proposal.title);
      
      // Create the directory path
      const dirPath = path.join(this.DESIGNS_DIR, slug);
      
      // Create the directory if it doesn't exist
      await fs.promises.mkdir(dirPath, { recursive: true });
      
      // Create the document content
      const content = this.generateDesignDocumentContent(proposal);
      
      // Write the document
      const documentPath = path.join(dirPath, 'design.md');
      await fs.promises.writeFile(documentPath, content);
      
      // Log the design document creation
      await logAction({
        type: 'DESIGN_DOCUMENT_CREATION',
        proposalId: proposal.id,
        documentPath,
        timestamp: Date.now()
      });
      
      return {
        success: true,
        documentPath
      };
    } catch (error) {
      console.error('Error creating design document:', error);
      return {
        success: false,
        error: 'Failed to create design document'
      };
    }
  }
  
  /**
   * Generates the content for a design document
   */
  private generateDesignDocumentContent(proposal: ProposalEntity): string {
    try {
      // Read the template file
      const templatePath = path.join(process.cwd(), 'src', 'templates', 'design-document-template.md');
      
      // Check if template exists, if not use the default template
      let template = '';
      try {
        if (fs.existsSync(templatePath)) {
          template = fs.readFileSync(templatePath, 'utf8');
        }
      } catch (error) {
        console.warn('Could not read design document template:', error);
      }
      
      // If template couldn't be read, use a default template
      if (!template) {
        template = `# Design Document: {title}
Created: {date}
Proposal ID: {proposalId}

## Overview
{description}

## Requirements
{requirements}

## Implementation Plan
{implementationSteps}

## Technical Considerations
### Risks
{risks}

### Benefits
{benefits}

## Resources Required
{resources}

## Timeline
- Estimated implementation time: {timeframe}
- Feasibility score: {feasibility}
- Impact score: {impact}

## Status
- [ ] Implementation started
- [ ] Implementation completed
- [ ] Tests passed
- [ ] Deployed to production
`;
      }
      
      // Get the current date in YYYY-MM-DD format
      const timestamp = new Date().toISOString().split('T')[0];
      
      // Prepare the implementation steps
      const implementationSteps = proposal.analysis?.implementationSteps
        ? proposal.analysis.implementationSteps.map(step => `- ${step.step} (${step.timeframe})`).join('\n')
        : '1. Analyze requirements\n2. Create implementation plan\n3. Develop solution\n4. Test implementation\n5. Deploy changes';
      
      // Prepare the risks
      const risks = proposal.analysis?.risks
        ? proposal.analysis.risks.map(risk => `- ${risk}`).join('\n')
        : '- To be determined';
      
      // Prepare the benefits
      const benefits = proposal.analysis?.benefits
        ? proposal.analysis.benefits.map(benefit => `- ${benefit}`).join('\n')
        : '- To be determined';
      
      // Prepare the resources
      const resources = proposal.analysis?.resourceRequirements
        ? proposal.analysis.resourceRequirements.map(resource => `- ${resource.resource}: ${resource.amount} (Priority: ${resource.priority})`).join('\n')
        : '- To be determined';
      
      // Prepare the timeframe
      const timeframe = proposal.analysis?.timeframe
        ? `${Math.round(proposal.analysis.timeframe * 10)} days`
        : 'To be determined';
      
      // Prepare the feasibility score
      const feasibility = proposal.analysis?.feasibility
        ? proposal.analysis.feasibility.toFixed(2)
        : 'N/A';
      
      // Prepare the impact score
      const impact = proposal.analysis?.impact
        ? proposal.analysis.impact.toFixed(2)
        : 'N/A';
      
      // Replace placeholders in the template
      return template
        .replace(/{title}/g, proposal.title)
        .replace(/{date}/g, timestamp)
        .replace(/{proposalId}/g, proposal.id)
        .replace(/{description}/g, proposal.description)
        .replace(/{requirements}/g, proposal.analysis?.recommendations || 'To be determined')
        .replace(/{implementationSteps}/g, implementationSteps)
        .replace(/{risks}/g, risks)
        .replace(/{benefits}/g, benefits)
        .replace(/{resources}/g, resources)
        .replace(/{timeframe}/g, timeframe)
        .replace(/{feasibility}/g, feasibility)
        .replace(/{impact}/g, impact)
        .replace(/{proposalLink}/g, `/proposals/${proposal.id}`)
        .replace(/{conversationLinks}/g, 'N/A');
    } catch (error) {
      console.error('Error generating design document content:', error);
      
      // Fallback to a simple template if there's an error
      const timestamp = new Date().toISOString().split('T')[0];
      return `# Design Document: ${proposal.title}
Created: ${timestamp}
Proposal ID: ${proposal.id}

## Overview
${proposal.description}

## Status
- [ ] Implementation started
- [ ] Implementation completed
- [ ] Tests passed
- [ ] Deployed to production
`;
    }
  }
  
  /**
   * Creates a slug from a title
   */
  private createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Remove consecutive hyphens
  }
  
  /**
   * Deletes a design document once implemented
   */
  async deleteDesignDocument(documentPath: string): Promise<DesignDocumentResult> {
    try {
      // Check if the document exists
      if (!fs.existsSync(documentPath)) {
        return {
          success: false,
          error: 'Document does not exist'
        };
      }
      
      // Delete the document
      await fs.promises.unlink(documentPath);
      
      // Log the deletion
      await logAction({
        type: 'DESIGN_DOCUMENT_DELETION',
        documentPath,
        timestamp: Date.now()
      });
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting design document:', error);
      return {
        success: false,
        error: 'Failed to delete design document'
      };
    }
  }
  
  /**
   * Checks if a design has been implemented
   */
  async checkDesignImplementation(documentPath: string): Promise<boolean> {
    try {
      // In a real implementation, this would check if the design has been implemented
      // For now, we'll just check if the document exists and has been modified recently
      
      // Check if the document exists
      try {
        await fs.promises.access(documentPath);
      } catch {
        return false;
      }
      
      // For demonstration purposes, we'll randomly determine if a design is implemented
      // In a real system, this would check against actual implementation metrics
      return Math.random() > 0.7; // 30% chance of being "implemented"
    } catch (error) {
      console.error('Error checking design implementation:', error);
      return false;
    }
  }
  
  /**
   * Main process that monitors conversations, creates proposals, and handles approved proposals
   */
  async processConversations(): Promise<ProcessingResult> {
    try {
      // Step 1: Monitor conversations to identify potential improvements
      const monitoringResult = await this.monitorConversations();
      if (!monitoringResult.analyzed) {
        throw new Error(monitoringResult.error || 'Failed to analyze conversations');
      }
      
      // Step 2: Create proposals from identified improvements
      const newProposals: ProposalEntity[] = [];
      for (const improvement of monitoringResult.potentialImprovements) {
        const proposal = await this.createProposalFromImprovement(improvement);
        newProposals.push(proposal);
      }
      
      // Step 3: Check status of existing proposals
      const statusResult = await this.checkProposalStatus();
      
      // Step 4: Create design documents for approved proposals
      for (const proposal of statusResult.approvedProposals) {
        await this.createDesignDocument(proposal);
      }
      
      // Step 5: Check if any designs have been implemented and delete their documents
      const designsDir = this.DESIGNS_DIR;
      try {
        // Get all design directories
        const designDirs = await fs.promises.readdir(designsDir);
        
        for (const dir of designDirs) {
          const documentPath = path.join(designsDir, dir, 'design.md');
          
          // Check if the design has been implemented
          const implemented = await this.checkDesignImplementation(documentPath);
          
          if (implemented) {
            // Delete the design document
            await this.deleteDesignDocument(documentPath);
          }
        }
      } catch (error) {
        // Ignore errors if the designs directory doesn't exist yet
        if (error instanceof Error && 'code' in error && error.code !== 'ENOENT') {
          console.error('Error processing design documents:', error);
        }
      }
      
      return {
        processed: true,
        newProposals,
        approvedProposals: statusResult.approvedProposals
      };
    } catch (error) {
      console.error('Error processing conversations:', error);
      return {
        processed: false,
        newProposals: [],
        approvedProposals: [],
        error: 'Failed to process conversations'
      };
    }
  }
}