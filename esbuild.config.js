import esbuild from 'esbuild';
import { readdirSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, 'dist');

// Ensure dist directory exists
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Build runtime
async function buildRuntime() {
  const runtimeDir = join(distDir, 'runtime');
  if (!existsSync(runtimeDir)) {
    mkdirSync(runtimeDir, { recursive: true });
  }

  await esbuild.build({
    entryPoints: ['runtime/form-runtime.js'],
    bundle: true,
    minify: true,
    format: 'iife',
    globalName: 'FormRuntime',
    outfile: join(runtimeDir, 'form-runtime.js'),
    target: ['es2020'],
    legalComments: 'none',
  });

  // Copy CSS files
  copyFileSync('runtime/form-runtime.css', join(runtimeDir, 'form-runtime.css'));
  
  // Copy themes
  const themesDir = join(runtimeDir, 'themes');
  if (!existsSync(themesDir)) {
    mkdirSync(themesDir, { recursive: true });
  }
  if (existsSync('runtime/themes')) {
    const themeFiles = readdirSync('runtime/themes');
    themeFiles.forEach(file => {
      if (file.endsWith('.css')) {
        copyFileSync(join('runtime/themes', file), join(themesDir, file));
      }
    });
  }
}

// Build builder
async function buildBuilder() {
  const builderDir = join(distDir, 'builder');
  if (!existsSync(builderDir)) {
    mkdirSync(builderDir, { recursive: true });
  }

  await esbuild.build({
    entryPoints: ['builder/builder.js'],
    bundle: true,
    minify: true,
    format: 'iife',
    outfile: join(builderDir, 'builder.js'),
    target: ['es2020'],
    legalComments: 'none',
  });

  // Copy HTML and CSS
  if (existsSync('builder/index.html')) {
    copyFileSync('builder/index.html', join(builderDir, 'index.html'));
  }
  if (existsSync('builder/builder.css')) {
    copyFileSync('builder/builder.css', join(builderDir, 'builder.css'));
  }

  // Copy examples
  const examplesDir = join(builderDir, 'examples');
  if (existsSync('builder/examples')) {
    if (!existsSync(examplesDir)) {
      mkdirSync(examplesDir, { recursive: true });
    }
    const exampleFiles = readdirSync('builder/examples');
    exampleFiles.forEach(file => {
      copyFileSync(join('builder/examples', file), join(examplesDir, file));
    });
  }
}

// Build connectors
async function buildConnectors() {
  const connectorsDir = join(distDir, 'connectors');
  if (!existsSync(connectorsDir)) {
    mkdirSync(connectorsDir, { recursive: true });
  }

  if (existsSync('connectors')) {
    const connectorFiles = readdirSync('connectors').filter(f => f.endsWith('.js'));
    
    for (const file of connectorFiles) {
      await esbuild.build({
        entryPoints: [join('connectors', file)],
        bundle: true,
        minify: true,
        format: 'esm',
        outfile: join(connectorsDir, file),
        target: ['es2020'],
        legalComments: 'none',
      });
    }
  }
}

// Copy schema
async function copySchema() {
  const schemaDir = join(distDir, 'schema');
  if (!existsSync(schemaDir)) {
    mkdirSync(schemaDir, { recursive: true });
  }
  if (existsSync('schema/form-schema.json')) {
    copyFileSync('schema/form-schema.json', join(schemaDir, 'form-schema.json'));
  }
}

// Copy form.html and index.html
async function copyFormPage() {
  if (existsSync('form.html')) {
    copyFileSync('form.html', join(distDir, 'form.html'));
  }
  if (existsSync('index.html')) {
    copyFileSync('index.html', join(distDir, 'index.html'));
  }
}

// Main build
async function build() {
  console.log('Building form-builder-os...');
  
  try {
    await Promise.all([
      buildRuntime(),
      buildBuilder(),
      buildConnectors(),
      copySchema(),
      copyFormPage(),
    ]);
    
    console.log('Build complete!');
    console.log('Note: API functions in api/ directory are served directly by Vercel and do not need to be built.');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();






