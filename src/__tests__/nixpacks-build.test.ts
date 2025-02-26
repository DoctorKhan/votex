import { execSync, spawnSync } from 'child_process';

// Helper function to check if Docker is running
function isDockerRunning(): boolean {
  try {
    const result = spawnSync('docker', ['info'], { stdio: 'pipe' });
    return result.status === 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
}

// Helper function to check if nixpacks is installed
function isNixpacksInstalled(): boolean {
  try {
    const result = spawnSync('nixpacks', ['--version'], { stdio: 'pipe' });
    return result.status === 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
}

describe('Nixpacks Build Test', () => {
  // This test is disabled by default
  // Use ENABLE_NIXPACKS_TEST=true to run it
  const shouldRunTest = process.env.ENABLE_NIXPACKS_TEST === 'true';
  const dockerRunning = isDockerRunning();
  const nixpacksInstalled = isNixpacksInstalled();
  
  // Set a longer timeout since the build process can take time
  jest.setTimeout(300000); // 5 minutes
  
  it('should build successfully with nixpacks', () => {
    if (!shouldRunTest) {
      console.log('Skipping nixpacks build test. Set ENABLE_NIXPACKS_TEST=true to run it.');
      return;
    }
    
    if (!dockerRunning) {
      console.log('Skipping nixpacks build test because Docker is not running.');
      return;
    }
    
    if (!nixpacksInstalled) {
      console.log('Skipping nixpacks build test because nixpacks is not installed.');
      return;
    }
    
    try {
      // Clean up any previous test builds
      try {
        execSync('docker rmi votex-test -f', { stdio: 'inherit' });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        // Ignore errors if the image doesn't exist
      }
      
      console.log('Building with nixpacks...');
      execSync('nixpacks build . --name votex-test', { stdio: 'inherit' });
      
      console.log('Starting container...');
      // Start the container in detached mode
      // Use port 3001 instead of 3000 to avoid conflicts with other services
      execSync('docker run -d -p 3001:3000 --name votex-test-container votex-test', { stdio: 'inherit' });
      
      // Give the container some time to start up
      console.log('Waiting for container to start...');
      execSync('sleep 10');
      
      // Check if the container is running
      const containerStatus = execSync('docker ps -f name=votex-test-container --format "{{.Status}}"').toString().trim();
      expect(containerStatus).toContain('Up');
      
      // Check if the health endpoint is responding
      console.log('Testing health endpoint...');
      try {
        const healthCheck = execSync('curl -s http://localhost:3001/api/health').toString().trim();
        expect(healthCheck).toContain('ok');
      } catch (e: unknown) {
        console.error('Health check failed:', e instanceof Error ? e.message : String(e));
        throw e;
      }
      
      console.log('Nixpacks build test passed!');
    } catch (error: unknown) {
      console.error('Nixpacks build test failed:', error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      // Clean up
      try {
        console.log('Cleaning up...');
        execSync('docker stop votex-test-container', { stdio: 'pipe' });
        execSync('docker rm votex-test-container', { stdio: 'pipe' });
      } catch (error: unknown) {
        // Ignore cleanup errors
        console.log('Cleanup warning:', error instanceof Error ? error.message : String(error));
      }
    }
  });
});