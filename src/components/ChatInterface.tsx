'use client';

import { useState, useRef, useEffect } from 'react';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

interface ChatInterfaceProps {
  proposals?: Array<{
    id: string;
    title: string;
    description: string;
    votes: number;
  }>;
}

// Define discussion topics for the community assistant
const discussionTopics = [
  {
    id: 'initiative_feedback',
    name: 'Initiative Feedback',
    description: 'Get feedback on existing initiatives or ideas for new ones',
    prompt: 'I\'d like to discuss the current initiatives and get your feedback on them.'
  },
  {
    id: 'community_engagement',
    name: 'Community Engagement',
    description: 'Discuss strategies for increasing community participation',
    prompt: 'What are some effective strategies for increasing community engagement in the voting process?'
  },
  {
    id: 'conflict_resolution',
    name: 'Conflict Resolution',
    description: 'Get help with resolving conflicts between competing initiatives',
    prompt: 'I notice there are some competing initiatives. Can you help analyze the trade-offs?'
  },
  {
    id: 'deliberative_process',
    name: 'Deliberative Process',
    description: 'Improve the quality of community deliberation',
    prompt: 'What techniques can we use to improve the quality of deliberation in our community discussions?'
  }
];

export default function ChatInterface({ proposals = [] }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded
  const [suggestedResponses, setSuggestedResponses] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: 'Hello! I\'m your community discussion assistant. I can help facilitate conversations about initiatives, community engagement, and decision-making processes. How can I assist you today?'
        }
      ]);
      
      // Set initial suggested responses
      setSuggestedResponses([
        'Tell me about the current initiatives',
        'How can we improve community engagement?',
        'What makes a good initiative?'
      ]);
    }
  }, [messages.length]);

  // Create a system message that includes information about the current initiatives
  const getSystemContext = () => {
    if (proposals.length === 0) {
      return "There are currently no initiatives in the system.";
    }
    
    return `Here are the current initiatives in the system:\n${proposals.map((p, i) =>
      `${i+1}. ${p.title} (${p.votes} votes): ${p.description}`
    ).join('\n')}`;
  };

  // Handle selecting a discussion topic
  const handleSelectTopic = (prompt: string) => {
    setInput(prompt);
  };
  
  // Generate new suggested responses based on the conversation context
  const generateNewSuggestedResponses = (lastMessage: string) => {
    // Simple heuristic to generate relevant follow-up questions
    const followUps: string[] = [];
    
    // Add general follow-ups based on content
    if (lastMessage.toLowerCase().includes('initiative')) {
      followUps.push('Can you explain more about this initiative?');
    }
    
    if (lastMessage.toLowerCase().includes('community')) {
      followUps.push('How would this impact the community?');
    }
    
    if (lastMessage.toLowerCase().includes('vote') || lastMessage.toLowerCase().includes('voting')) {
      followUps.push('What are the best practices for fair voting?');
    }
    
    // Add some generic follow-ups
    followUps.push('Can you provide more details?');
    followUps.push('What are the next steps?');
    
    // Select up to 3 follow-ups
    const selectedFollowUps = followUps.slice(0, 3);
    
    // Update suggested responses
    setSuggestedResponses(selectedFollowUps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage: Message = {
      role: 'user',
      content: input.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Format messages for the API
      const apiMessages = [...messages, userMessage].map(msg => ({
        role: msg.role === 'system' ? 'user' : msg.role, // Convert system messages to user for API
        content: msg.content
      }));
      
      // Add context about the current proposals
      const systemContext = getSystemContext();
      
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          systemContext
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Generate new suggested responses based on the conversation context
      generateNewSuggestedResponses(assistantMessage.content);
    } catch (err) {
      console.error('Error in chat:', err);
      setError('Failed to get a response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-full bg-card rounded-xl shadow-lg p-6 border border-border/50 backdrop-blur-sm animate-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <h3 className="text-lg font-semibold flex items-center psychedelic-text">
            <span className="bg-accent/10 text-accent text-xs px-2 py-0.5 rounded-full mr-2">Discussion</span>
            Community Discussion Assistant
          </h3>
        </div>
        <button
          onClick={toggleExpand}
          className="text-foreground/60 hover:text-foreground transition-colors"
        >
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          )}
        </button>
      </div>
      
      {isExpanded && (
        <>
          <div className="mb-4">
            <p className="text-foreground/70 text-sm">
              Ask questions about initiatives, community engagement, or decision-making
            </p>
          </div>
          
          {/* Discussion Topics */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            {discussionTopics.map(topic => (
              <button
                key={topic.id}
                onClick={() => handleSelectTopic(topic.prompt)}
                className="text-left p-2 bg-background/70 hover:bg-background border border-border/50 rounded-lg text-sm transition-colors"
              >
                <div className="font-medium mb-1">{topic.name}</div>
                <div className="text-xs text-foreground/60">{topic.description}</div>
              </button>
            ))}
          </div>
          
          {/* Chat Messages */}
          <div className="bg-background/50 border border-border/70 rounded-xl mb-4 h-[300px] overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2 psychedelic-text">No messages yet</h3>
                <p className="text-foreground/70 mb-4">Start a conversation by typing a message below.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user'
                        ? 'justify-end'
                        : message.role === 'system'
                          ? 'justify-center'
                          : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : message.role === 'system'
                            ? 'bg-accent/10 text-accent text-xs py-1 px-2'
                            : 'bg-secondary/10 border border-border rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="p-4 mb-4 bg-danger/10 border border-danger/20 text-danger rounded-lg flex items-start animate-in">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {/* Suggested Responses */}
          {suggestedResponses.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-foreground/60 mb-2">Suggested responses:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedResponses.map((response, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(response)}
                    className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                  >
                    {response}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              disabled={isLoading}
              className="flex-grow px-4 py-3 bg-card border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`px-4 py-3 rounded-lg font-medium transition-all shadow-sm flex items-center justify-center ${
                isLoading || !input.trim()
                  ? 'bg-gray-400 cursor-not-allowed opacity-70'
                  : 'bg-primary hover:bg-primary-hover hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 text-white'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}