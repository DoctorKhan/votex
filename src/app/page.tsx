import VotingApp from "../components/VotingApp";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-background via-background/95 to-background/90">
      {/* Hero Section */}
      <header className="relative overflow-hidden py-12 md:py-20">
        <div className="absolute inset-0 z-0 opacity-10 bg-grid-pattern"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left animate-in fade-in slide-in-from-left duration-700">
              <div className="inline-block mb-4 bg-primary/10 dark:bg-primary/20 p-3 rounded-full">
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
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Votex
              </h1>
              <p className="text-xl md:text-2xl text-foreground/80 max-w-xl mx-auto lg:mx-0 mb-8">
                Revolutionizing democratic participation with secure, intelligent voting technology
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="/initiatives" className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium text-lg">
                  Explore Initiatives
                </a>
                <a href="/forum" className="px-6 py-3 border border-border bg-card hover:bg-card/80 text-foreground rounded-md transition-colors font-medium text-lg">
                  Join Community Forum
                </a>
              </div>
            </div>
            <div className="flex-1 relative animate-in fade-in slide-in-from-right duration-700">
              <div className="relative z-10 bg-card rounded-xl shadow-xl overflow-hidden border border-border/40">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent"></div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Featured Initiative</h3>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-muted p-4">
                      <h4 className="font-medium mb-1">Community Garden Project</h4>
                      <p className="text-sm text-muted-foreground mb-2">Transforming unused spaces into community gardens</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span className="flex items-center"><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>Active</span>
                        <span className="mx-2">•</span>
                        <span>32 votes</span>
                        <span className="mx-2">•</span>
                        <span>4 days left</span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <h4 className="font-medium mb-1">Public Transport Improvement</h4>
                      <p className="text-sm text-muted-foreground mb-2">Adding more bus routes to underserved areas</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span className="flex items-center"><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span>Discussion</span>
                        <span className="mx-2">•</span>
                        <span>18 comments</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <a href="/initiatives" className="text-primary hover:text-primary/90 text-sm font-medium">View all initiatives →</a>
                  </div>
                </div>
              </div>
              <div className="absolute -z-10 -bottom-6 -right-6 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
              <div className="absolute -z-10 -top-6 -left-6 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <main className="py-16 md:py-24">
        <VotingApp>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Votex?</h2>
              <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
                Our platform combines security, intelligence, and accessibility to transform how communities make decisions.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {/* Feature 1 */}
              <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-full w-fit mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <path d="M7 7.5V9"></path>
                    <path d="M7 15v1.5"></path>
                    <path d="M12 7.5V13"></path>
                    <path d="m17 7.5-3 6v1.5"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure & Transparent</h3>
                <p className="text-muted-foreground">
                  Advanced cryptography and tamper-proof logs ensure every vote is securely recorded and verifiable.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-full w-fit mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10"></path>
                    <path d="M10 15V9"></path>
                    <path d="M14 9v6"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Enhanced Tools</h3>
                <p className="text-muted-foreground">
                  Smart proposal generation and analysis help communities make data-driven decisions.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-full w-fit mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M18 16v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v2"></path>
                    <path d="m14 16 4-4-4-4"></path>
                    <path d="M9 12H2"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Community Engagement</h3>
                <p className="text-muted-foreground">
                  Discussion forums and collaborative tools foster inclusive participation from all members.
                </p>
              </div>
            </div>
            
            {/* CTA Section */}
            <div className="rounded-xl overflow-hidden shadow-lg border border-border/40 bg-gradient-to-r from-background to-secondary/5">
              <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to get started?</h3>
                  <p className="text-foreground/70 text-lg mb-6">
                    Join communities already using Votex to make collaborative decisions and drive change.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a href="/initiatives" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                      Explore Initiatives
                    </a>
                    <a href="/chat" className="px-5 py-2.5 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors">
                      AI Assistant
                    </a>
                  </div>
                </div>
                <div className="hidden md:block flex-1 text-right">
                  <div className="inline-block p-1 rounded-lg bg-card border border-border/30 shadow-sm rotate-2">
                    <div className="rounded-md overflow-hidden flex justify-center items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-32 h-32 text-primary/40">
                        <path d="M2 18h10"></path>
                        <path d="M2 14h7"></path>
                        <path d="M2 10h7"></path>
                        <path d="M2 6h7"></path>
                        <path d="M12 6v4c0 1.1.9 2 2 2h2"></path>
                        <path d="M14 13.5V18"></path>
                        <path d="M18 13.5V18"></path>
                        <path d="M18 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </VotingApp>
      </main>
      
      <footer className="py-8 border-t border-border/40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center">
              <div className="mr-2 bg-primary/10 dark:bg-primary/20 p-1 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-primary"
                >
                  <circle cx="12" cy="12" r="4"></circle>
                  <path d="M12 2v2"></path>
                  <path d="M12 20v2"></path>
                  <path d="m4.93 4.93 1.41 1.41"></path>
                  <path d="m17.66 17.66 1.41 1.41"></path>
                  <path d="M2 12h2"></path>
                  <path d="M20 12h2"></path>
                  <path d="m6.34 17.66-1.41 1.41"></path>
                  <path d="m19.07 4.93-1.41 1.41"></path>
                </svg>
              </div>
              <span className="font-semibold text-foreground/90">Votex</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-foreground/60">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
              <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <span>Built with</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">Next.js</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">Tailwind CSS</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">React</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
