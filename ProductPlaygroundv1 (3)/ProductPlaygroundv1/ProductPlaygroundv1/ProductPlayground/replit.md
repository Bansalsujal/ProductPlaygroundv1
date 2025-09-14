# Overview

ProductPlayground is a PM (Product Manager) interview practice application that helps users prepare for product management interviews through interactive sessions. The application provides structured practice with different question types including product design, improvement, root cause analysis, and guesstimate questions. Users can engage in AI-powered conversational interviews, receive scoring and feedback, and track their progress over time through comprehensive statistics and streak tracking.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with Vite as the build tool for fast development and optimized production builds
- **Client-side routing** using React Router for navigation between different practice areas and user dashboard
- **TailwindCSS** for utility-first styling with PostCSS for processing
- **Component-based architecture** with reusable UI components organized in a clean folder structure
- **Entity-based data models** that mirror backend schemas for type safety and consistent data handling

## Backend Architecture
- **Express.js API server** running on Node.js with ES modules for modern JavaScript support
- **RESTful API design** with clear endpoint organization for users, questions, sessions, and statistics
- **Separation of concerns** with the API server running independently on port 3001
- **CORS configuration** allowing cross-origin requests from the frontend with support for Replit domains
- **Proxy setup** in Vite config to route `/api` requests to the backend server during development

## Data Storage Solutions
- **Supabase** as the primary database platform providing PostgreSQL with built-in authentication
- **Direct PostgreSQL connection** using the `pg` library for more complex database operations
- **Structured data models** for InterviewSession, Question, User, and UserStats entities
- **JSON schema definitions** defining entity properties, types, and relationships
- **Row Level Security (RLS)** configuration for secure data access patterns

## Authentication and Authorization
- **Supabase Auth** integration for user authentication and session management
- **Service role key** usage on the backend for elevated database permissions
- **Mock user implementation** currently in place while proper authentication is being developed
- **Secure API client** handling authentication headers and session management

## AI Integration
- **Google Generative AI (Gemini)** for conducting interview conversations and providing intelligent responses
- **Structured prompting** with JSON schema support for consistent AI responses
- **LLM invocation endpoint** that processes user responses and generates follow-up questions and feedback
- **Conversation history tracking** to maintain context throughout interview sessions

# External Dependencies

## Core Services
- **Supabase** - Backend-as-a-Service providing PostgreSQL database, authentication, and real-time features
- **Google Generative AI (Gemini)** - AI service for conducting interview conversations and generating feedback
- **PostgreSQL** - Relational database for persistent data storage

## Frontend Libraries
- **React** and **React DOM** - Core UI library and rendering
- **React Router DOM** - Client-side routing and navigation
- **Lucide React** - Icon library for consistent UI iconography
- **date-fns** - Date manipulation and formatting utilities

## Development Tools
- **Vite** - Fast build tool and development server with React plugin
- **TailwindCSS** - Utility-first CSS framework with autoprefixer for vendor prefixes
- **ESLint and TypeScript** - Code quality and type checking tools

## Backend Dependencies
- **Express** - Web application framework for the API server
- **CORS** - Cross-origin resource sharing middleware
- **dotenv** - Environment variable management for configuration
- **pg** - PostgreSQL client for direct database operations

## Environment Configuration
- Requires environment variables for Supabase URL, service keys, Gemini API key, and database connection string
- Configured for both local development and Replit deployment environments
- Proxy configuration for seamless frontend-backend communication during development