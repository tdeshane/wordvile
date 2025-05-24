import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import serverlessExpress from '@vendia/serverless-express';

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

// CORS Configuration for Express
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // For now, allow all origins. In production, restrict this to your frontend's domain.
    // const allowedOrigins = ['https://d2qww79wy1vhmw.cloudfront.net', 'http://localhost:3000'];
    // if (allowedOrigins.indexOf(origin) === -1) {
    //   const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    //   return callback(new Error(msg), false);
    // }
    return callback(null, true);
  },
  methods: 'GET,POST,OPTIONS',
  allowedHeaders: ['Content-Type', 'x-admin-token', 'Authorization', 'X-Amz-Date', 'X-Api-Key', 'X-Amz-Security-Token'],
  exposedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers'],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false, // Important: Let CORS middleware handle preflight and terminate it.
  optionsSuccessStatus: 204 // For OPTIONS requests, return 204 No Content.
};

// Apply CORS middleware early
app.use(cors(corsOptions));

// Explicitly handle OPTIONS requests for all routes if not handled by `cors` middleware
// This might be redundant if `cors` with `preflightContinue: false` handles it, but can be a fallback.
app.options('*', cors(corsOptions)); // Ensure OPTIONS requests are handled with CORS headers

app.use(express.json());

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

// Helper function to get Silver state from S3 or local file
async function getSilverState() {
  const s3Key = 'silver.json';
  try {
    console.log(`Getting Silver state from S3 bucket ${S3_BUCKET}, key ${s3Key}`);
    const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: s3Key });
    const response = await s3Client.send(command);
    const dataString = await response.Body.transformToString();
    const state = JSON.parse(dataString);
    // Ensure all new fields have default values if not present
    state.health = state.health === undefined ? 100 : state.health;
    state.maxHealth = state.maxHealth === undefined ? 100 : state.maxHealth;
    state.stamina = state.stamina === undefined ? 100 : state.stamina;
    state.maxStamina = state.maxStamina === undefined ? 100 : state.maxStamina;
    state.food = state.food === undefined ? 100 : state.food;
    state.maxFood = state.maxFood === undefined ? 100 : state.maxFood;
    state.oxygen = state.oxygen === undefined ? 100 : state.oxygen;
    state.maxOxygen = state.maxOxygen === undefined ? 100 : state.maxOxygen;
    state.temperature = state.temperature === undefined ? 37 : state.temperature;
    state.creativity = state.creativity === undefined ? 50 : state.creativity;
    state.imagination = state.imagination === undefined ? 50 : state.imagination;
    return state;
  } catch (s3Error) {
    console.log(`Error getting Silver state from S3: ${s3Error.message}. Trying local fallback.`);
    const localFilePath = path.join(DEFAULT_DATA_DIR, s3Key);
    if (fs.existsSync(localFilePath)) {
      console.log(`Using default Silver state data from ${localFilePath}`);
      const fileData = fs.readFileSync(localFilePath, 'utf8');
      const state = JSON.parse(fileData);
      // Ensure all new fields have default values if not present
      state.health = state.health === undefined ? 100 : state.health;
      state.maxHealth = state.maxHealth === undefined ? 100 : state.maxHealth;
      state.stamina = state.stamina === undefined ? 100 : state.stamina;
      state.maxStamina = state.maxStamina === undefined ? 100 : state.maxStamina;
      state.food = state.food === undefined ? 100 : state.food;
      state.maxFood = state.maxFood === undefined ? 100 : state.maxFood;
      state.oxygen = state.oxygen === undefined ? 100 : state.oxygen;
      state.maxOxygen = state.maxOxygen === undefined ? 100 : state.maxOxygen;
      state.temperature = state.temperature === undefined ? 37 : state.temperature;
      state.creativity = state.creativity === undefined ? 50 : state.creativity;
      state.imagination = state.imagination === undefined ? 50 : state.imagination;
      return state;
    } else {
      throw new Error('Silver state configuration not found in S3 or locally.');
    }
  }
}

// Helper function to save Silver state to S3 and local file
async function saveSilverState(state) {
  const s3Key = 'silver.json';
  const stateString = JSON.stringify(state, null, 2);
  try {
    console.log(`Saving Silver state to S3 bucket ${S3_BUCKET}, key ${s3Key}`);
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: stateString,
      ContentType: 'application/json'
    });
    await s3Client.send(command);
    console.log(`Successfully saved Silver state to S3`);
  } catch (s3Error) {
    console.error(`Error saving Silver state to S3: ${s3Error.message}`);
    // Continue to save locally even if S3 fails for now
  }
  try {
    const localFilePath = path.join(DATA_DIR, s3Key);
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(localFilePath, stateString, 'utf8');
    console.log(`Silver state saved to ${localFilePath}`);
  } catch (localError) {
    console.error(`Failed to save Silver state locally: ${localError.message}`);
    throw new Error('Failed to save Silver state.'); // If local save also fails, then it's a problem
  }
}

// Helper function to get The Sheiker state from S3 or local file
async function getTheSheikerState() {
  const s3Key = 'thesheiker.json';
  try {
    console.log(`Getting The Sheiker state from S3 bucket ${S3_BUCKET}, key ${s3Key}`);
    const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: s3Key });
    const response = await s3Client.send(command);
    const dataString = await response.Body.transformToString();
    const state = JSON.parse(dataString);
    // Ensure all new fields have default values if not present
    state.health = state.health === undefined ? 100 : state.health;
    state.maxHealth = state.maxHealth === undefined ? 100 : state.maxHealth;
    state.stamina = state.stamina === undefined ? 100 : state.stamina;
    state.maxStamina = state.maxStamina === undefined ? 100 : state.maxStamina;
    state.food = state.food === undefined ? 100 : state.food;
    state.maxFood = state.maxFood === undefined ? 100 : state.maxFood;
    state.oxygen = state.oxygen === undefined ? 100 : state.oxygen;
    state.maxOxygen = state.maxOxygen === undefined ? 100 : state.maxOxygen;
    state.temperature = state.temperature === undefined ? 37 : state.temperature;
    state.creativity = state.creativity === undefined ? 50 : state.creativity;
    state.imagination = state.imagination === undefined ? 50 : state.imagination;
    return state;
  } catch (s3Error) {
    console.log(`Error getting The Sheiker state from S3: ${s3Error.message}. Trying local fallback.`);
    const localFilePath = path.join(DEFAULT_DATA_DIR, s3Key);
    if (fs.existsSync(localFilePath)) {
      console.log(`Using default The Sheiker state data from ${localFilePath}`);
      const fileData = fs.readFileSync(localFilePath, 'utf8');
      const state = JSON.parse(fileData);
      // Ensure all new fields have default values if not present
      state.health = state.health === undefined ? 100 : state.health;
      state.maxHealth = state.maxHealth === undefined ? 100 : state.maxHealth;
      state.stamina = state.stamina === undefined ? 100 : state.stamina;
      state.maxStamina = state.maxStamina === undefined ? 100 : state.maxStamina;
      state.food = state.food === undefined ? 100 : state.food;
      state.maxFood = state.maxFood === undefined ? 100 : state.maxFood;
      state.oxygen = state.oxygen === undefined ? 100 : state.oxygen;
      state.maxOxygen = state.maxOxygen === undefined ? 100 : state.maxOxygen;
      state.temperature = state.temperature === undefined ? 37 : state.temperature;
      state.creativity = state.creativity === undefined ? 50 : state.creativity;
      state.imagination = state.imagination === undefined ? 50 : state.imagination;
      return state;
    } else {
      throw new Error('The Sheiker state configuration not found in S3 or locally.');
    }
  }
}

// Helper function to save The Sheiker state to S3 and local file
async function saveTheSheikerState(state) {
  const s3Key = 'thesheiker.json';
  const stateString = JSON.stringify(state, null, 2);
  try {
    console.log(`Saving The Sheiker state to S3 bucket ${S3_BUCKET}, key ${s3Key}`);
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: stateString,
      ContentType: 'application/json'
    });
    await s3Client.send(command);
    console.log(`Successfully saved The Sheiker state to S3`);
  } catch (s3Error) {
    console.error(`Error saving The Sheiker state to S3: ${s3Error.message}`);
    // Continue to save locally even if S3 fails for now
  }
  try {
    const localFilePath = path.join(DATA_DIR, s3Key);
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(localFilePath, stateString, 'utf8');
    console.log(`The Sheiker state saved to ${localFilePath}`);
  } catch (localError) {
    console.error(`Failed to save The Sheiker state locally: ${localError.message}`);
    throw new Error('Failed to save The Sheiker state.'); // If local save also fails, then it's a problem
  }
}

// GET /silver/state
app.get('/silver/state', async (req, res) => {
  try {
    console.log(`GET /silver/state request received`);
    const silverStateData = await getSilverState();

    if (!silverStateData || typeof silverStateData !== 'object') {
      console.log('silver.json not found, empty, or not a valid JSON object.');
      return res.status(404).json({ error: 'Silver state configuration not found or invalid.' });
    }
    console.log(`Successfully retrieved silver state data:`, JSON.stringify(silverStateData).substring(0,100) + "...");
    return res.json(silverStateData);
  } catch (error) {
    console.error(`Unexpected error in GET /silver/state: ${error.message}`, error);
    return res.status(500).json({ error: 'Server error processing Silver state request.' });
  }
});

// GET /thesheiker/state
app.get('/thesheiker/state', async (req, res) => {
  try {
    console.log(`GET /thesheiker/state request received`);
    const sheikerStateData = await getTheSheikerState();

    if (!sheikerStateData || typeof sheikerStateData !== 'object') {
      console.log('thesheiker.json not found, empty, or not a valid JSON object.');
      return res.status(404).json({ error: 'The Sheiker state configuration not found or invalid.' });
    }
    console.log(`Successfully retrieved The Sheiker state data:`, JSON.stringify(sheikerStateData).substring(0,100) + "...");
    return res.json(sheikerStateData);
  } catch (error) {
    console.error(`Unexpected error in GET /thesheiker/state: ${error.message}`, error);
    return res.status(500).json({ error: 'Server error processing The Sheiker state request.' });
  }
});

// POST /silver/absorb
app.post('/silver/absorb', async (req, res) => {
  try {
    const { emeralds } = req.body;
    console.log(`POST /silver/absorb request received with ${emeralds} emeralds`);
    
    if (typeof emeralds !== 'number' || emeralds <= 0) {
      return res.status(400).json({ error: 'Invalid number of emeralds.' });
    }

    const currentState = await getSilverState();
    currentState.emeraldsCollected = (currentState.emeraldsCollected || 0) + emeralds;
    currentState.corruptionLevel = Math.max(0, (currentState.corruptionLevel || 100) - (emeralds * 5)); // Each emerald reduces corruption

    // Check for redemption
    if (currentState.corruptionLevel <= 0) {
      currentState.state = 'redeemed';
      currentState.appearance = {
        eyes: "shining silver",
        aura: "gentle, glowing light",
        form: "radiant and whole"
      };
      currentState.description = "Redeemed by the power of collected emeralds, Silver is restored to her former glory. The darkness has lifted, and her command over words now brings hope and life back to Wordvile.";
    } else {
      // Potentially update appearance based on partial redemption if desired
      // For now, we only change to fully redeemed or stay corrupted.
    }

    await saveSilverState(currentState);
    return res.json(currentState);
  } catch (error) {
    console.error(`Unexpected error in POST /silver/absorb: ${error.message}`, error);
    return res.status(500).json({ error: 'Server error processing absorb request.' });
  }
});

// POST /silver/drain
app.post('/silver/drain', async (req, res) => {
  try {
    const { words } = req.body; // Assuming words is a number representing the amount of power drained
    console.log(`POST /silver/drain request received for ${words} words`);

    if (typeof words !== 'number' || words <= 0) {
      return res.status(400).json({ error: 'Invalid number of words to drain.' });
    }

    const currentState = await getSilverState();
    // Draining words increases corruption, unless she is already redeemed.
    if (currentState.state === 'corrupted') {
      currentState.corruptionLevel = Math.min(100 + (words * 2) , (currentState.corruptionLevel || 0) + (words * 2)); // Each word drained increases corruption
      // Potentially update appearance if corruption increases significantly
      if (currentState.corruptionLevel > 100 && currentState.appearance.eyes !== "fiery red") {
         currentState.appearance.eyes = "fiery red"; // Example of appearance change due to more corruption
         currentState.appearance.aura = "pulsating dark energy";
      }
    }


    await saveSilverState(currentState);
    return res.json(currentState);
  } catch (error) {
    console.error(`Unexpected error in POST /silver/drain: ${error.message}`, error);
    return res.status(500).json({ error: 'Server error processing drain request.' });
  }
});

// POST /character/:charName/use-ability
app.post('/character/:charName/use-ability', async (req, res) => {
  try {
    const { charName } = req.params;
    const { abilityName } = req.body;
    console.log(`POST /character/${charName}/use-ability request received for ability: ${abilityName}`);

    let currentState;
    let saveStateFunction;
    let characterConfig;

    if (charName.toLowerCase() === 'silver') {
      currentState = await getSilverState();
      saveStateFunction = saveSilverState;
      characterConfig = currentState; // Silver's abilities are part of its main state file
    } else if (charName.toLowerCase() === 'thesheiker') {
      currentState = await getTheSheikerState();
      saveStateFunction = saveTheSheikerState;
      characterConfig = currentState; // The Sheiker's abilities are in its main state file
    } else {
      return res.status(404).json({ error: 'Character not found.' });
    }

    if (!characterConfig || !Array.isArray(characterConfig.abilities)) {
        return res.status(500).json({ error: `Abilities configuration not found for ${charName}.` });
    }

    const ability = characterConfig.abilities.find(a => a.name.toLowerCase() === abilityName.toLowerCase());

    if (!ability) {
      return res.status(400).json({ error: `Ability '${abilityName}' not found for ${charName}.` });
    }

    if (currentState.power < ability.cost) {
      return res.status(400).json({ error: 'Not enough power to use this ability.' });
    }

    currentState.power -= ability.cost;
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: `Used ability: ${ability.name}`,
      cost: ability.cost,
      powerRemaining: currentState.power
    };
    
    if (!Array.isArray(currentState.log)) {
        currentState.log = [];
    }
    currentState.log.push(logEntry);
    // Keep log to a reasonable size, e.g., last 20 entries
    if (currentState.log.length > 20) {
        currentState.log = currentState.log.slice(currentState.log.length - 20);
    }
    
    // Specific ability effects can be added here if they modify more than just power
    // For example, for The Sheiker's "Shelbox" or "Teleport", you might set temporary statuses.
    // For now, we just deduct power and log.

    await saveStateFunction(currentState);
    return res.json({
        message: `${ability.name} used successfully!`,
        newState: currentState 
    });

  } catch (error) {
    console.error(`Unexpected error in POST /character/:charName/use-ability: ${error.message}`, error);
    return res.status(500).json({ error: 'Server error processing ability request.' });
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
  // res.header('Access-Control-Allow-Origin', '*'); // Already handled by cors middleware
  // res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  // res.header('Access-Control-Allow-Headers', 'Content-Type, x-admin-token, Authorization, X-Api-Key, X-Amz-Date, X-Amz-Security-Token');
  
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Combined handler for Lambda using @vendia/serverless-express
let serverlessExpressInstance;

async function setup(event, context) {
  console.log('Lambda handler setup initiated.');
  console.log('S3_BUCKET:', process.env.S3_BUCKET);
  console.log('ADMIN_TOKEN (length):', process.env.ADMIN_TOKEN ? process.env.ADMIN_TOKEN.length : 0);

  // For Lambda, ensure data directory exists in /tmp
  if (process.env.AWS_LAMBDA_FUNCTION_NAME && !fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log(`Created DATA_DIR at ${DATA_DIR} in Lambda environment.`);
      const packagedDataDir = path.resolve('./data'); 
      if (fs.existsSync(packagedDataDir)) {
        fs.readdirSync(packagedDataDir).forEach(file => {
          const srcPath = path.join(packagedDataDir, file);
          const destPath = path.join(DATA_DIR, file);
          if (!fs.existsSync(destPath)) { // Only copy if it doesn't exist, S3 is primary
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied ${srcPath} to ${destPath} as initial default.`);
          } else {
            console.log(`File ${destPath} already exists in /tmp/data, not overwriting from package.`);
          }
        });
      } else {
        console.log(`Packaged data directory ${packagedDataDir} not found.`);
      }
    } catch (e) {
      console.error('Error creating or populating DATA_DIR in Lambda /tmp:', e);
    }
  }
  serverlessExpressInstance = serverlessExpress({ app });
  return serverlessExpressInstance(event, context);
}

export const handler = async (event, context) => {
  console.log('Lambda handler called with method:', event.httpMethod, 'path:', event.path);
  // console.log('Event Headers:', JSON.stringify(event.headers)); // Already logged in setup if needed

  if (serverlessExpressInstance) {
    return serverlessExpressInstance(event, context);
  }
  return setup(event, context);
};

// Local development server
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(PORT, () => {
    console.log(`Word Game backend running on port ${PORT}`);
  });
}