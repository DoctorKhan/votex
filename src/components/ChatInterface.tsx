'use client';

import { useState, useRef, useEffect } from 'react';
import { formatMarkdownText } from '../utils/formatText';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
};

interface ChatInterfaceProps {
  proposals?: Array<{
    id: string;
    title: string;
    description: string;
    votes: number;
  }>;
}

// Define discussion topics for the community assistant with icons
const discussionTopics = [
  {
    id: 'initiative_feedback',
    name: 'Initiative Feedback',
    description: 'Get feedback on existing initiatives or ideas for new ones',
    prompt: 'I\'d like to discuss the current initiatives and get your feedback on them.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
      </svg>
    )
  },
  {
    id: 'community_engagement',
    name: 'Community Engagement',
    description: 'Discuss strategies for increasing community participation',
    prompt: 'What are some effective strategies for increasing community engagement in the voting process?',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    )
  },
  {
    id: 'conflict_resolution',
    name: 'Conflict Resolution',
    description: 'Get help with resolving conflicts between competing initiatives',
    prompt: 'I notice there are some competing initiatives. Can you help analyze the trade-offs?',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
      </svg>
    )
  },
  {
    id: 'deliberative_process',
    name: 'Deliberative Process',
    description: 'Improve the quality of community deliberation',
    prompt: 'What techniques can we use to improve the quality of deliberation in our community discussions?',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    )
  }
];

export default function ChatInterface({ proposals = [] }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded
  const [suggestedResponses, setSuggestedResponses] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

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
          content: 'Hello! I\'m your community discussion assistant. I can help facilitate conversations about initiatives, community engagement, and decision-making processes. How can I assist you today?',
          timestamp: new Date()
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
  const handleSelectTopic = (topic: typeof discussionTopics[0]) => {
    setSelectedCategory(topic.id);
    setInput(topic.prompt);
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
      content: input.trim(),
      timestamp: new Date()
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
        content: data.message,
        timestamp: new Date()
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

  // Format timestamp for chat messages
  const formatTimestamp = (date?: Date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-full bg-card rounded-xl shadow-lg p-6 border border-border/50 backdrop-blur-sm animate-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold flex items-center psychedelic-text">
              <span className="bg-accent/10 text-accent text-xs px-2 py-0.5 rounded-full mr-2">Discussion</span>
              Community Discussion Assistant
            </h3>
            <p className="text-xs text-foreground/60">
              Facilitating democratic conversations
            </p>
          </div>
        </div>
        <button
          onClick={toggleExpand}
          className="w-8 h-8 rounded-full bg-background/80 hover:bg-background flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
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
          <div className="mb-4 p-3 bg-background/70 rounded-lg border border-border/30">
            <h4 className="text-sm font-medium flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
              Discussion Guide
            </h4>
            <p className="text-foreground/70 text-sm">
              Ask questions about initiatives, community engagement, or decision-making processes to get insights and guidance.
            </p>
          </div>
          
          {/* Discussion Topics - Improved with icons and better layout */}
          <div className="mb-5">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 7 4 4 20 4 20 7"></polyline>
                <line x1="9" y1="20" x2="15" y2="20"></line>
                <line x1="12" y1="4" x2="12" y2="20"></line>
              </svg>
              Discussion Topics
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {discussionTopics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => handleSelectTopic(topic)}
                  className={`text-left p-3 hover:bg-background border rounded-lg text-sm transition-all hover:shadow-sm ${
                    selectedCategory === topic.id 
                      ? 'bg-primary/10 border-primary/30' 
                      : 'bg-background/40 border-border/50 hover:border-border'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                      selectedCategory === topic.id ? 'bg-primary/20 text-primary' : 'bg-foreground/10 text-foreground/60'
                    }`}>
                      {topic.icon}
                    </div>
                    <div className="font-medium">{topic.name}</div>
                  </div>
                  <div className="text-xs text-foreground/60 pl-8">{topic.description}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Chat Messages */}
          <div 
            ref={messageContainerRef}
            className="bg-background/50 border border-border/70 rounded-xl mb-4 h-[350px] overflow-y-auto p-4 scroll-smooth"
          >
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
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 flex-shrink-0 self-end">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                    )}
                    
                    <div
                      className={`relative max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : message.role === 'system'
                            ? 'bg-accent/10 text-accent text-xs py-1 px-2'
                            : 'bg-secondary/10 border border-border rounded-tl-none'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <div
                          className="whitespace-pre-wrap chat-message"
                          dangerouslySetInnerHTML={{ __html: formatMarkdownText(message.content) }}
                        />
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                      
                      {message.timestamp && (
                        <div className={`text-[10px] mt-1 ${
                          message.role === 'user' ? 'text-primary-foreground/70 text-right' : 'text-foreground/50'
                        }`}>
                          {formatTimestamp(message.timestamp)}
                        </div>
                      )}
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-2 flex-shrink-0 self-end text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                    )}
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
            <div className="mb-4 bg-background/30 p-3 rounded-lg border border-border/30">
              <p className="text-xs text-foreground/70 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                Suggested responses:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedResponses.map((response, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(response)}
                    className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors border border-primary/20"
                  >
                    {response}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              disabled={isLoading}
              className="flex-grow px-4 py-3 bg-background/80 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`px-4 py-3 rounded-lg font-medium transition-all shadow-sm flex items-center justify-center ${
                isLoading || !input.trim()
                  ? 'bg-foreground/30 cursor-not-allowed opacity-70'
                  : 'bg-primary hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 text-white'
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
