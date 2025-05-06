# CodeCraft Architecture

## Overview

CodeCraft is a full-stack web application for AI-assisted code generation. It allows users to enter prompts describing code they want to generate, and the system uses OpenAI's GPT models to produce relevant code snippets. The application includes features like history tracking, language-specific code generation, and Git provider integration capabilities.

The application follows a client-server architecture with a React frontend and Node.js/Express backend. It uses a PostgreSQL database via NeonDB's serverless offering for data persistence and integrates with OpenAI's API for code generation.

## System Architecture

### High-Level Architecture

The application follows a modern full-stack architecture with:

1. **Frontend**: React-based single-page application using Vite as the build tool
2. **Backend**: Express.js REST API server
3. **Database**: PostgreSQL database accessed via Drizzle ORM
4. **External Services**: OpenAI API for code generation

```
┌─────────────┐       ┌─────────────┐      ┌─────────────┐
│             │       │             │      │             │
│   React     │◄─────►│   Express   │◄────►│  PostgreSQL │
│   Frontend  │       │   Backend   │      │  Database   │
│             │       │             │      │             │
└─────────────┘       └──────┬──────┘      └─────────────┘
                             │
                             ▼
                      ┌─────────────┐
                      │    OpenAI   │
                      │     API     │
                      │             │
                      └─────────────┘
```

### Directory Structure

The project follows a structured organization:

- `/client`: Frontend React application
  - `/src`: Source code
    - `/components`: React components
    - `/hooks`: Custom React hooks
    - `/lib`: Utility functions
    - `/pages`: Page components
- `/server`: Express backend
  - API routes and server configuration
- `/db`: Database configuration and seed data
- `/shared`: Shared code between frontend and backend (schemas)

## Key Components

### Frontend

The frontend is built with React and uses several key libraries:

1. **Component Library**: Uses the Shadcn UI component library (built on Radix UI primitives) for consistent UI elements
2. **State Management**: Uses React Query for server state management
3. **Styling**: Uses Tailwind CSS for styling
4. **Routing**: Uses Wouter for client-side routing

Notable frontend architectural decisions:

- **Theme Support**: Implements a dark/light theme system
- **Component Composition**: Follows a modular component approach
- **API Integration**: Centralizes API calls in dedicated lib files

### Backend

The backend is an Express.js server that provides REST API endpoints:

1. **API Endpoints**: 
   - `/api/generate`: Processes code generation requests
   - `/api/history`: Retrieves user history
   - `/api/connect`: Handles Git provider integration

2. **Middleware**:
   - Request logging
   - Error handling

3. **Services**:
   - OpenAI service for code generation
   - Storage service for database operations

### Database

The application uses PostgreSQL with Drizzle ORM for database access. Key schemas:

1. **users**: Stores user information
2. **prompts**: Stores generated code prompts and responses
3. **history**: Tracks user interaction history
4. **git_connections**: Stores Git provider connection details

The schema relationships are properly defined using Drizzle's relations system.

### API Structure

The backend implements RESTful endpoints:

- **POST /api/generate**: Generates code based on user prompts
- **GET /api/history**: Retrieves generation history
- **POST /api/connect**: Connects to Git providers

## Data Flow

### Code Generation Flow

1. User enters a prompt in the frontend
2. Frontend sends a request to the `/api/generate` endpoint
3. Backend validates the request and formats the prompt
4. Backend calls OpenAI API with the formatted prompt
5. OpenAI API returns generated code
6. Backend processes the response, extracts code snippets
7. Backend stores the prompt and response in the database
8. Backend returns the processed code snippets to the frontend
9. Frontend displays the code snippets to the user

### History Tracking Flow

1. User actions are recorded in the database
2. The sidebar displays recent history items
3. History can be filtered by search queries
4. Clicking on a history item loads the saved prompt and response

## External Dependencies

### Core Dependencies

- **@neondatabase/serverless**: Serverless PostgreSQL client
- **drizzle-orm**: TypeScript ORM for database access
- **openai**: OpenAI API client
- **react**: Frontend UI library
- **@tanstack/react-query**: Data fetching and state management
- **tailwindcss**: Utility-first CSS framework
- **shadcn/ui**: Component library built on Radix UI

### Development Dependencies

- **vite**: Frontend build tool
- **typescript**: Type checking
- **esbuild**: Server-side code bundling

## Deployment Strategy

The application is configured for deployment on Replit:

1. **Development**: Uses Vite's dev server with HMR
2. **Build Process**: 
   - Frontend: Built with Vite
   - Backend: Bundled with esbuild
3. **Production**: 
   - Serves static assets from the `dist/public` directory
   - Runs the Node.js server from `dist/index.js`

The deployment configuration in `.replit` indicates:

- Automatic deployment triggered by code changes
- Port configuration (5000 internally, mapped to 80 externally)
- Build and start commands defined in package.json

## Security Considerations

- **Environment Variables**: Sensitive information like API keys stored in environment variables
- **Password Storage**: User passwords are stored in the database (could be improved with proper hashing)
- **API Keys**: OpenAI API key is managed server-side to prevent client exposure

## Future Considerations

Potential improvements to the architecture:

1. **Authentication System**: Implement a proper authentication system with JWT or sessions
2. **Rate Limiting**: Add rate limiting for API requests
3. **Caching**: Implement caching for frequent requests
4. **Testing**: Add unit and integration tests
5. **Monitoring**: Add error tracking and performance monitoring