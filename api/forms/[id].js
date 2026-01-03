/**
 * Forms API - Get/Update/Delete form by ID
 * GET /api/forms/[id]
 * PUT /api/forms/[id]
 * DELETE /api/forms/[id]
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

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

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, message: 'Form ID is required' });
  }

  try {
    const formsData = readForms();
    const form = formsData.forms[id];

    if (req.method === 'GET') {
      if (!form) {
        return res.status(404).json({ success: false, message: 'Form not found' });
      }

      return res.status(200).json({
        success: true,
        schema: form,
      });
    }

    if (req.method === 'PUT') {
      if (!form) {
        return res.status(404).json({ success: false, message: 'Form not found' });
      }

      const { schema } = req.body;
      if (!schema) {
        return res.status(400).json({ success: false, message: 'Form schema is required' });
      }

      // Update form
      schema.updatedAt = new Date().toISOString();
      schema.createdAt = form.createdAt || schema.updatedAt;
      formsData.forms[id] = schema;

      if (!writeForms(formsData)) {
        return res.status(500).json({ success: false, message: 'Failed to update form' });
      }

      return res.status(200).json({
        success: true,
        message: 'Form updated successfully',
      });
    }

    if (req.method === 'DELETE') {
      if (!form) {
        return res.status(404).json({ success: false, message: 'Form not found' });
      }

      // Delete form
      delete formsData.forms[id];

      if (!writeForms(formsData)) {
        return res.status(500).json({ success: false, message: 'Failed to delete form' });
      }

      return res.status(200).json({
        success: true,
        message: 'Form deleted successfully',
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling form request:', error);
    return res.status(500).json({
      success: false,
      message: `Error: ${error.message}`,
    });
  }
}

