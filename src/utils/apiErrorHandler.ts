import { NextRequest, NextResponse } from 'next/server';

/**
 * Type for API route handler functions
 */
export type ApiRouteHandler = (
  req: NextRequest,
  params?: Record<string, string>
) => Promise<NextResponse>;

/**
 * Wraps an API route handler with error handling
 * @param handler The API route handler function
 * @returns A wrapped handler function with error handling
 */
export function withErrorHandler(handler: ApiRouteHandler): ApiRouteHandler {
  return async (req: NextRequest, params?: Record<string, string>) => {
    try {
      return await handler(req, params);
    } catch (error) {
      console.error('API route error:', error);
      
      // Determine the appropriate status code
      let statusCode = 500;
      let message = 'Internal server error';
      
      if (error instanceof Error) {
        message = error.message;
        
        // Handle specific error types
        if (message.includes('not found') || message.includes('Not found')) {
          statusCode = 404;
        } else if (
          message.includes('unauthorized') || 
          message.includes('Unauthorized') ||
          message.includes('not authorized')
        ) {
          statusCode = 401;
        } else if (
          message.includes('forbidden') || 
          message.includes('Forbidden')
        ) {
          statusCode = 403;
        } else if (
          message.includes('invalid') || 
          message.includes('Invalid') ||
          message.includes('Bad request')
        ) {
          statusCode = 400;
        }
      }
      
      return NextResponse.json(
        { 
          error: message,
          timestamp: new Date().toISOString(),
          path: req.nextUrl.pathname
        },
        { status: statusCode }
      );
    }
  };
}
