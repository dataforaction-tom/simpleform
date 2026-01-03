/**
 * Forms API - Create new form
 * POST /api/forms
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';

const FORMS_FILE = join(process.cwd(), 'data', 'forms.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
}

// Read forms from file
function readForms() {
  ensureDataDir();
  if (!existsSync(FORMS_FILE)) {
    return { forms: {} };
  }
  try {
    const content = readFileSync(FORMS_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading forms file:', error);
    return { forms: {} };
  }
}

// Write forms to file
function writeForms(data) {
  ensureDataDir();
  try {
    writeFileSync(FORMS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing forms file:', error);
    return false;
  }
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
    const formsData = readForms();

    // Add timestamp
    schema.createdAt = new Date().toISOString();
    schema.updatedAt = schema.createdAt;

    // Save form
    formsData.forms[formId] = schema;

    if (!writeForms(formsData)) {
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

