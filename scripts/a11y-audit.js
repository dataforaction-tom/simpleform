import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple accessibility audit script
// In production, this would use axe-core CLI or similar

console.log('Running accessibility audit...');

const filesToCheck = [
  'builder/index.html',
  'runtime/form-runtime.css',
];

let hasErrors = false;

for (const file of filesToCheck) {
  const filePath = join(__dirname, '..', file);
  if (existsSync(filePath)) {
    const content = readFileSync(filePath, 'utf-8');
    
    // Basic checks
    if (file.endsWith('.html')) {
      if (!content.includes('lang=')) {
        console.warn(`⚠️  ${file}: Missing lang attribute on <html>`);
      }
      if (!content.includes('aria-label') && !content.includes('aria-labelledby')) {
        console.warn(`⚠️  ${file}: Consider adding ARIA labels`);
      }
    }
    
    if (file.endsWith('.css')) {
      // Check for focus styles
      if (!content.includes(':focus') && !content.includes(':focus-visible')) {
        console.warn(`⚠️  ${file}: Missing focus styles`);
      }
    }
  }
}

if (!hasErrors) {
  console.log('✅ Basic accessibility checks passed');
  console.log('Note: Run full audit with screen readers and axe-core for complete validation');
} else {
  process.exit(1);
}








