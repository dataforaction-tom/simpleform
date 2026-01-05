/**
 * Forms API - Create new form
 * POST /api/forms
 * 
 * Storage: Uses in-memory store by default (not persistent across deployments)
 * For production, configure Redis via Vercel Marketplace by setting REDIS_URL
 * Note: Vercel KV has been sunset - use Marketplace Storage (Redis) instead
 */

import { randomBytes } from 'crypto';

// In-memory store (fallback when Redis is not configured)
// Note: This won't persist across deployments or function cold starts
let formsStore = { forms: {} };

// Lazy-load Redis client
let redisClient = null;
async function getRedis() {
  if (redisClient !== null) {
    return redisClient;
  }
  
  // Check if Redis is configured via Marketplace (REDIS_URL)
  if (process.env.REDIS_URL) {
    try {
      // Dynamic import to avoid errors if redis is not installed
      const { createClient } = await import('redis');
      const client = createClient({ url: process.env.REDIS_URL });
      await client.connect();
      redisClient = client;
      return client;
    } catch (error) {
      // redis package not installed or error - use in-memory store
      console.log('Redis not available, using in-memory store:', error.message);
      redisClient = false; // Mark as checked, not available
      return false;
    }
  }
  
  // Backward compatibility: Check for legacy Vercel KV (KV_REST_API_URL)
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const { kv } = await import('@vercel/kv');
      redisClient = kv;
      return kv;
    } catch (error) {
      console.log('Vercel KV not available, using in-memory store:', error.message);
      redisClient = false;
      return false;
    }
  }
  
  redisClient = false; // Mark as checked, not available
  return false;
}

// Read forms from storage
async function readForms() {
  const client = await getRedis();
  if (client) {
    try {
      let data;
      // Handle standard Redis client (from redis package)
      if (typeof client.get === 'function' && process.env.REDIS_URL) {
        const rawData = await client.get('forms');
        data = rawData ? JSON.parse(rawData) : null;
      } else {
        // Handle legacy Vercel KV client
        data = await client.get('forms');
      }
      return data || { forms: {} };
    } catch (error) {
      console.error('Error reading from Redis:', error);
      return { forms: {} };
    }
  }
  // Fallback to in-memory store
  return formsStore;
}

// Write forms to storage
async function writeForms(data) {
  const client = await getRedis();
  if (client) {
    try {
      // Handle standard Redis client (from redis package)
      if (typeof client.set === 'function' && process.env.REDIS_URL) {
        await client.set('forms', JSON.stringify(data));
      } else {
        // Handle legacy Vercel KV client
        await client.set('forms', data);
      }
      return true;
    } catch (error) {
      console.error('Error writing to Redis:', error);
      return false;
    }
  }
  // Fallback to in-memory store
  formsStore = data;
  return true;
}

// Generate unique form ID
function generateFormId() {
  return randomBytes(8).toString('hex');
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { schema } = req.body;

    if (!schema) {
      return res.status(400).json({ success: false, message: 'Form schema is required' });
    }

    // Validate schema has required fields
    if (!schema.formId && !schema.title) {
      return res.status(400).json({ success: false, message: 'Form schema must have formId or title' });
    }

    // Generate form ID
    const formId = schema.formId || generateFormId();
    schema.formId = formId;

    // Read existing forms
    const formsData = await readForms();

    // Add timestamp
    schema.createdAt = new Date().toISOString();
    schema.updatedAt = schema.createdAt;

    // Save form
    formsData.forms[formId] = schema;

    if (!(await writeForms(formsData))) {
      return res.status(500).json({ success: false, message: 'Failed to save form' });
    }

    // Generate URL
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : req.headers.origin || 'https://your-app.vercel.app';
    const formUrl = `${baseUrl}/form/${formId}`;

    return res.status(200).json({
      success: true,
      id: formId,
      url: formUrl,
      message: 'Form saved successfully',
    });
  } catch (error) {
    console.error('Error saving form:', error);
    return res.status(500).json({
      success: false,
      message: `Error saving form: ${error.message}`,
    });
  }
}


