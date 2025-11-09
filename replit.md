# Exercise Tracker

## Overview
This is a FreeCodeCamp Exercise Tracker project - a REST API application built with Node.js and Express. The application allows users to create accounts, log exercises, and retrieve exercise logs.

## Project Type
Full-stack application with:
- **Backend**: Express.js REST API
- **Frontend**: Static HTML/CSS interface served by Express

## Recent Changes
- **2025-11-09**: Initial setup for Replit environment
  - Configured server to run on port 5000 with host 0.0.0.0
  - Set up workflow for the Express server
  - Configured deployment settings for autoscale
  - Dependencies installed and verified

## Project Architecture

### Structure
```
├── index.js           # Main Express server entry point
├── public/            # Static assets (CSS)
│   └── style.css
├── views/             # HTML templates
│   └── index.html
├── package.json       # Dependencies and scripts
└── sample.env         # Environment variable template
```

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express 4.x
- **Middleware**: CORS, dotenv
- **Port**: 5000 (configured for Replit)

### API Endpoints (to be implemented)
- `POST /api/users` - Create a new user
- `POST /api/users/:_id/exercises` - Add exercise for a user
- `GET /api/users/:_id/logs` - Get user's exercise log with optional filters (from, to, limit)

## Running the Application
The application runs via the configured workflow:
- **Command**: `PORT=5000 npm start`
- **Port**: 5000
- **Host**: 0.0.0.0 (required for Replit proxy)

## Deployment
- **Type**: Autoscale (stateless web application)
- **Command**: `npm start`
- Environment variable PORT is automatically set to 5000

## Current State
- Server is configured and running successfully
- Frontend interface displays correctly
- API endpoints are ready to be implemented as per FreeCodeCamp curriculum requirements
