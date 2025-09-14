# Overview

ProductPlayground is a PM (Product Manager) interview practice application that helps users prepare for product management interviews through interactive AI-powered sessions. The application provides structured practice across four key interview categories: Product Design, Product Improvement, Root Cause Analysis, and Guesstimate questions. Users can engage in realistic interview conversations, receive AI-generated feedback, and track their progress over time with detailed statistics and performance analytics.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with Vite as the build tool for fast development and hot module replacement
- **Client-side routing** using React Router for navigation between practice areas, dashboard, and user management
- **TailwindCSS** for utility-first styling with PostCSS processing and autoprefixer support
- **Component-based architecture** with reusable UI components organized in a clean folder structure
- **Entity-based data models** that mirror backend schemas, providing type safety and consistent data handling across the application

## Backend Architecture
- **Express.js API server** running on Node.js with ES modules for modern JavaScript support
- **RESTful API design** with clear endpoint organization for users, questions, sessions, and statistics
- **Separation of concerns** with the API server running independently on port 3001
- **CORS configuration** allowing cross-origin requests from the frontend with specific support for Replit domains
- **Proxy setup** in Vite config to route `/api` requests to the backend server during development

## Data Storage Solutions
- **Supabase** as the primary backend-as-a-service platform providing PostgreSQL with built-in authentication
- **Service role key** usage on the backend for elevated database permissions and administrative operations
- **Structured data models** for InterviewSession, Question, User, and UserStats entities with JSON schema definitions
- **Row Level Security (RLS)** configuration for secure data access patterns and user data isolation

## Authentication and Authorization
- **Supabase Auth** integration for user authentication and session management
- **Bearer token authentication** with authorization headers for API requests
- **Mock user implementation** currently in place while proper authentication flows are being developed
- **Secure API client** handling authentication headers and session management across the application

## AI Integration
- **Google Generative AI (Gemini)** for conducting realistic interview conversations and providing intelligent feedback
- **Structured prompting** with JSON schema support to ensure consistent AI response formatting
- **LLM invocation endpoint** that processes user responses and generates contextual follow-up questions
- **Conversation history tracking** to maintain context throughout extended interview sessions

# External Dependencies

## Core Services
- **Supabase** - Backend-as-a-Service providing PostgreSQL database, authentication, real-time features, and serverless functions
- **Google Generative AI (Gemini)** - AI service for conducting interview conversations, generating follow-up questions, and providing detailed feedback
- **PostgreSQL** - Relational database for persistent data storage accessed through Supabase client

## Development Tools
- **Vite** - Build tool and development server with hot module replacement
- **TailwindCSS** - Utility-first CSS framework for rapid UI development
- **React Router** - Client-side routing for single-page application navigation
- **Lucide React** - Icon library providing consistent iconography across the application

## Runtime Dependencies
- **Express.js** - Web application framework for the Node.js backend server
- **CORS** - Cross-Origin Resource Sharing middleware for secure API access
- **dotenv** - Environment variable management for configuration
- **date-fns** - Date utility library for time-based calculations and formatting