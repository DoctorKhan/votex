import VotingApp from "../components/VotingApp";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-[calc(100vh-64px)] p-4 md:p-8 gap-6 md:gap-8 bg-gradient-to-b from-background to-background/80">
      <header className="text-center animate-in py-6 mt-4">
        <div className="inline-block mb-4 bg-primary/10 dark:bg-primary/20 p-2 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8 text-primary"
          >
            <path d="M12 2v2"></path>
            <path d="M12 20v2"></path>
            <path d="m4.93 4.93 1.41 1.41"></path>
            <path d="m17.66 17.66 1.41 1.41"></path>
            <path d="M2 12h2"></path>
            <path d="M20 12h2"></path>
            <path d="m6.34 17.66-1.41 1.41"></path>
            <path d="m19.07 4.93-1.41 1.41"></path>
            <circle cx="12" cy="12" r="4"></circle>
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          AI-Enhanced Voting System
        </h1>
        <p className="text-foreground/70 max-w-md mx-auto text-lg">
          A collaborative platform where humans and AI can propose and vote on ideas
        </p>
      </header>
      
      <main className="flex justify-center items-center w-full max-w-4xl mx-auto px-4">
        <VotingApp>
          <div className="text-center p-8 bg-card rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Welcome to the Voting System</h2>
            <p className="mb-6 text-muted-foreground">
              This platform allows humans and AI to collaborate on initiatives and voting.
            </p>
            <div className="flex justify-center space-x-4">
              <a href="/initiatives" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors mr-2">
                View Initiatives
              </a>
              <a href="/chat" className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors">
                Join Discussion
              </a>
            </div>
          </div>
        </VotingApp>
      </main>
      
      <footer className="text-center text-sm text-foreground/60 py-6 border-t border-border/40 mt-8">
        <div className="flex items-center justify-center gap-2">
          <span>Built with</span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">Next.js</span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">Tailwind CSS</span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">GROQ AI</span>
        </div>
      </footer>
    </div>
  );
}
