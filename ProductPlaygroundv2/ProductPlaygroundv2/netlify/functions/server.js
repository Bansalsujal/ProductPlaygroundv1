import serverless from 'serverless-http';
import app from '../../api/server.js';

export const handler = serverless(app);