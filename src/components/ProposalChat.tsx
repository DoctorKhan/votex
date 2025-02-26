'use client';

import { useState, useRef, useEffect } from 'react';
import { Proposal } from './ProposalItem';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

interface ProposalChatProps {
  proposal: Proposal;
}

export default function ProposalChat({ proposal }: ProposalChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create a system message that includes information about the specific proposal
  const getProposalContext = () => {
    return `This conversation is about the proposal: "${proposal.title}". 
    Description: ${proposal.description}
    Current votes: ${proposal.votes}
    ${proposal.aiCreated ? 'This proposal was created by AI.' : ''}
    ${proposal.aiVoted ? 'AI has voted for this proposal.' : ''}
    ${proposal.llmFeedback ? `AI feedback on this proposal: ${proposal.llmFeedback}` : ''}
    ${proposal.revisions.length > 0 
      ? `Revisions: ${proposal.revisions.map(r => `${r.timestamp}: ${r.description}`).join(' | ')}` 
      : 'No revisions have been made to this proposal.'}`;
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
        role: msg.role,
        content: msg.content
      }));
      
      // Add context about the specific proposal
      const systemContext = getProposalContext();
      
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
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message
      }]);
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
    <div>
      <button
        onClick={toggleExpand}
        className="text-foreground/60 hover:text-foreground transition-colors flex items-center gap-2 mb-2"
      >
        {isExpanded ? (
          <>
            <span className="text-sm">Hide discussion</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </>
        ) : (
          <>
            <span className="text-sm">Show discussion</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </>
        )}
      </button>
      
      {isExpanded && (
        <>
          
          {/* Chat Messages */}
          <div className="bg-background/50 border border-border/70 rounded-lg mb-3 h-[200px] overflow-y-auto p-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-sm font-medium mb-1">No messages yet</h3>
                <p className="text-foreground/60 text-xs">Start a conversation by typing a message below.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] p-2 rounded-lg text-sm ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-tr-none' 
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
            <div className="p-3 mb-3 bg-danger/10 border border-danger/20 text-danger rounded-lg flex items-start text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this proposal..."
              disabled={isLoading}
              className="flex-grow px-3 py-2 bg-card border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`px-3 py-2 rounded-lg font-medium transition-all shadow-sm flex items-center justify-center ${
                isLoading || !input.trim()
                  ? 'bg-gray-400 cursor-not-allowed opacity-70'
                  : 'bg-primary hover:bg-primary-hover hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 text-white trippy-hover'
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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