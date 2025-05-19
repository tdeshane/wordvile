import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

dotenv.config();

// Initialize S3 client
const s3Client = new S3Client({ region: 'us-east-1' });
const S3_BUCKET = process.env.S3_BUCKET || 'bible-word-game-words';

const app = express();
const PORT = process.env.PORT || 4000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'Pr@yer&WordG@me2025!'; // Strong, complex password
// For Lambda, we need to copy the default data files to /tmp first
const DATA_DIR = process.env.DATA_DIR || (process.env.AWS_LAMBDA_FUNCTION_NAME ? '/tmp/data' : path.resolve('./data'));
const DEFAULT_DATA_DIR = path.resolve('./data');

// For Lambda we need a direct handler for OPTIONS requests
const directLambdaHandler = async (event) => {
  try {
    console.log('Lambda direct handler invoked with method:', event.httpMethod);
    console.log('Event path:', event.path);
    console.log('Event headers:', JSON.stringify(event.headers || {}));
    
    // Special handling for OPTIONS (preflight) requests
    if (event.httpMethod === 'OPTIONS') {
      console.log('Handling OPTIONS preflight request for path:', event.path);
      
      // Specific handling for verify-admin-password OPTIONS request
      if (event.path === '/verify-admin-password') {
        console.log('Handling specific OPTIONS for /verify-admin-password');
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Admin-Token',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Access-Control-Max-Age': '86400',
            'Content-Type': 'text/plain',
            'Content-Length': '0'
          },
          body: ''
        };
      }
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Admin-Token',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Access-Control-Max-Age': '86400',
          'Content-Type': 'application/json',
          'Content-Length': '0'
        },
        body: ''
      };
    }
    
    // Handle verify-admin-password directly
    if (event.path === '/verify-admin-password' && event.httpMethod === 'POST') {
      console.log('Handling direct password verification request');
      try {
        const body = JSON.parse(event.body || '{}');
        const { password } = body;
        
        console.log('Received password attempt:', password ? '****' : 'empty');
        
        if (password === ADMIN_TOKEN) {
          console.log('Password verification successful');
          return {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Admin-Token',
              'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              success: true,
              adminToken: ADMIN_TOKEN
            })
          };
        }
        
        console.log('Password verification failed');
        return {
          statusCode: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Admin-Token',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            error: 'Invalid admin password'
          })
        };
      } catch (error) {
        console.error('Error processing password verification:', error);
        return {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Admin-Token',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            error: 'Server error during verification'
          })
        };
      }
    }
    
    // For other paths, use Express routing through serverless-express
    console.log('Falling back to Express routing for path:', event.path);
    return null;
  } catch (error) {
    console.error('Unhandled error in directLambdaHandler:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Admin-Token',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Unexpected server error'
      })
    };
  }
};

// CORS Configuration for Express
const corsOptions = {
  origin: '*',
  methods: 'GET,POST,OPTIONS',
  allowedHeaders: ['Content-Type', 'x-admin-token', 'Authorization', 'X-Amz-Date', 'X-Api-Key', 'X-Amz-Security-Token'],
  exposedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers'],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(express.json());

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-admin-token, Authorization, X-Api-Key, X-Amz-Date, X-Amz-Security-Token');
  res.header('Access-Control-Max-Age', '86400');
  res.status(204).end();
});

// Add a specific handler for /verify-admin-password OPTIONS
app.options('/verify-admin-password', (req, res) => {
  console.log('Express handling OPTIONS for /verify-admin-password');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-admin-token, Authorization, X-Api-Key, X-Amz-Date, X-Amz-Security-Token');
  res.header('Access-Control-Max-Age', '86400');
  res.status(204).end();
});

// Ensure CORS headers are on all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-admin-token, Authorization, X-Api-Key, X-Amz-Date, X-Amz-Security-Token');
  next();
});

// Create the data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Helper to get file path for a game
function getFilePath(game) {
  return path.join(DATA_DIR, `${game}.json`);
}

// Helper function to get words from S3
async function getWordsFromS3(game) {
  try {
    console.log(`Getting words for ${game} from S3 bucket ${S3_BUCKET}`);
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: `${game}.json`
    });
    
    const response = await s3Client.send(command);
    const data = await response.Body.transformToString();
    return JSON.parse(data);
  } catch (error) {
    // If object not found or any other error, return empty array
    console.log(`Error getting words from S3: ${error.message}`);
    // Try to get from local file as fallback
    try {
      if (fs.existsSync(DEFAULT_DATA_DIR)) {
        const localFilePath = path.join(DEFAULT_DATA_DIR, `${game}.json`);
        if (fs.existsSync(localFilePath)) {
          console.log(`Using default data from ${localFilePath}`);
          const data = fs.readFileSync(localFilePath, 'utf8');
          return JSON.parse(data);
        }
      }
    } catch (localError) {
      console.log(`Error reading local file: ${localError.message}`);
    }
    return [];
  }
}

// GET /words/:game
app.get('/words/:game', async (req, res) => {
  try {
    const { game } = req.params;
    
    // Log request information for debugging
    console.log(`GET /words/${game} request received`);
    
    // Try to get words from S3
    const words = await getWordsFromS3(game);
    console.log(`Retrieved ${words.length} words for ${game}`);
    return res.json(words);
  } catch (error) {
    console.error(`Unexpected error in GET /words/:game: ${error}`);
    // Return empty array with 200 status instead of error
    return res.status(200).json([]);
  }
});

// Helper function to save words to S3
async function saveWordsToS3(game, words) {
  console.log(`Saving ${words.length} words for ${game} to S3 bucket ${S3_BUCKET}`);
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: `${game}.json`,
    Body: JSON.stringify(words, null, 2),
    ContentType: 'application/json'
  });
  
  return s3Client.send(command);
}

// POST /words/:game (admin only)
app.post('/words/:game', async (req, res) => {
  try {
    const { game } = req.params;
    const token = req.headers['x-admin-token'] || req.body.token;
    
    console.log(`POST /words/${game} request received`);
    console.log('Token from headers:', req.headers['x-admin-token']);
    console.log('Token from body:', req.body.token);
    console.log('Combined token used:', token);
    console.log('Expected ADMIN_TOKEN:', ADMIN_TOKEN);
    
    // More lenient token checking - accept hardcoded fallback password as well
    const FALLBACK_PASSWORD = 'Pr@yer&WordG@me2025!';
    if (token !== ADMIN_TOKEN && token !== FALLBACK_PASSWORD) {
      console.log('Invalid admin token provided');
      return res.status(403).json({ error: 'Forbidden: invalid admin token' });
    }
    
    const words = req.body.words;
    console.log('Words received:', Array.isArray(words) ? words.length : 'not an array');
    
    if (!Array.isArray(words) || !words.every(w => w.word && w.hint)) {
      console.log('Invalid word list format provided');
      return res.status(400).json({ error: 'Invalid word list format' });
    }
    
    try {
      // Save to S3
      await saveWordsToS3(game, words);
      console.log(`Successfully saved words to S3 for ${game}`);
      
      // Also save to local filesystem as backup if possible
      try {
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        const filePath = getFilePath(game);
        fs.writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8');
        console.log(`Backup saved to ${filePath}`);
      } catch (localError) {
        // Just log the error but don't fail the request
        console.log(`Failed to save local backup: ${localError.message}`);
      }
      
      return res.json({ success: true });
    } catch (s3Error) {
      console.error(`Error saving to S3: ${s3Error.message}`);
      return res.status(200).json({ success: false, error: 'Could not save to S3' });
    }
  } catch (error) {
    console.error(`Unexpected error in POST /words/:game: ${error}`);
    return res.status(200).json({ success: false, error: 'Server error writing word data' });
  }
});

// POST /verify-admin-password (through Express)
app.post('/verify-admin-password', (req, res) => {
  try {
    const { password } = req.body;
    console.log('Express password verification attempt received');
    
    if (password === ADMIN_TOKEN) {
      console.log('Express password verification successful');
      return res.status(200).json({ 
        success: true, 
        adminToken: ADMIN_TOKEN 
      });
    }
    
    console.log('Express password verification failed - invalid password');
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid admin password' 
    });
  } catch (error) {
    console.error('Express error in password verification:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during verification'
    });
  }
});

// Error handler that ensures CORS headers are still present
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Ensure CORS headers are set
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-admin-token, Authorization, X-Api-Key, X-Amz-Date, X-Amz-Security-Token');
  
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Combined handler for Lambda
export const handler = async (event, context) => {
  console.log('Lambda handler called with method:', event.httpMethod, 'path:', event.path);
  
  // First, handle OPTIONS requests directly
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Admin-Token',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'text/plain',
        'Content-Length': '0'
      },
      body: ''
    };
  }
  
  // Handle verify-admin-password directly
  if (event.path === '/verify-admin-password' && event.httpMethod === 'POST') {
    console.log('Handling password verification request');
    try {
      const body = JSON.parse(event.body || '{}');
      const { password } = body;
      
      console.log('Received password attempt:', password ? '(redacted)' : 'none');
      
      if (password === ADMIN_TOKEN) {
        console.log('Password verification successful');
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Admin-Token',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: true,
            adminToken: ADMIN_TOKEN
          })
        };
      }
      
      console.log('Password verification failed');
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Admin-Token',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: 'Invalid admin password'
        })
      };
    } catch (error) {
      console.error('Error in password verification:', error);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Admin-Token',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: 'Server error during verification'
        })
      };
    }
  }
  
  // Otherwise, use serverless-express for API routes
  try {
    const serverlessExpress = (await import('@vendia/serverless-express')).default;
    const serverlessHandler = serverlessExpress({ app });
    return serverlessHandler(event, context);
  } catch (error) {
    console.error('Error in serverless-express handling:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Admin-Token',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Server error'
      })
    };
  }
};

// Local development server
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(PORT, () => {
    console.log(`Word Game backend running on port ${PORT}`);
  });
} 