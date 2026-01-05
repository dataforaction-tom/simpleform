# Architecture Overview

Form Builder Open Source follows a modular architecture with clear separation of concerns.

## System Components

### 1. Form Runtime

The core engine that renders and executes forms. Written in vanilla JavaScript with zero dependencies.

**Key Features:**
- Field rendering for all field types
- Client-side validation
- Conditional logic evaluation
- Multi-page navigation
- Repeatable sections
- Calculated fields
- Accessibility support

**File:** `runtime/form-runtime.js`

### 2. Form Builder

The interface for creating forms. HTML/JS/CSS application with two modes:
- JSON Editor: Direct schema editing
- GUI Builder: Visual drag-and-drop interface

**File:** `builder/index.html`, `builder/builder.js`, `builder/builder.css`

### 3. Connectors

Plugin modules for submitting form data to various backends. Each connector extends the base `FormConnector` class.

**Files:** `connectors/*.js`

### 4. Schema

JSON Schema definition and TypeScript types for form validation and type checking.

**Files:** `schema/form-schema.json`, `schema/types.ts`

## Data Flow

```
User Input → Form Runtime → Validation → Conditional Logic → Submission → Connector → Backend
```

## Form Runtime Architecture

### Field Renderer

Maps field types to HTML elements:
- Input fields (text, email, number, etc.)
- Textarea
- Select dropdowns
- Radio button groups
- Checkbox groups
- File inputs
- Display elements (headers, paragraphs)

### Validation Engine

Applies validation rules:
- Required fields
- Pattern matching (regex)
- Length validation
- Number range validation
- Date range validation
- File validation
- Cross-field validation

### Conditional Engine

Evaluates conditional rules:
- Show/hide fields based on values
- Enable/disable fields
- Skip pages based on answers
- AND/OR logic for multiple conditions

### Navigation Controller

Manages multi-page form flow:
- Page transitions
- Progress indicator
- Validation before page change
- Skip logic

### Repeatable Manager

Handles dynamic section instances:
- Add/remove instances
- Min/max instance limits
- Indexed field names
- Per-instance validation

### Calculator

Evaluates calculated field expressions:
- Basic arithmetic
- Field value substitution
- Formatting (currency, percentage)

## Builder Architecture

### JSON Editor Mode

- Real-time JSON parsing
- Schema validation
- Error highlighting
- Import/export functionality

### GUI Builder Mode

- Drag-and-drop field addition
- Visual field configuration
- Real-time preview
- Template loading

### Preview System

Uses FormRuntime to render live preview:
- Instant updates on changes
- Full form functionality
- Theme preview

## Connector Pattern

All connectors follow a consistent interface:

```javascript
class FormConnector {
  async authenticate() { }
  async submit(formData) { }
  async validate(formData) { }
}
```

This allows:
- Consistent error handling
- Easy connector swapping
- Unified API

## Build Process

1. **Development**: Edit source files
2. **Build**: `npm run build`
   - Bundles runtime with esbuild
   - Minifies JavaScript
   - Copies CSS and assets
   - Outputs to `dist/`
3. **Deploy**: Serve `dist/` directory

## File Structure

```
form-builder-os/
├── builder/          # Builder interface
├── runtime/          # Form runtime engine
├── connectors/       # Backend connectors
├── schema/           # Schema definitions
├── examples/         # Form templates
├── docs/             # Documentation
├── tests/            # Test suites
└── dist/             # Build output
```

## Design Decisions

### Zero Dependencies Runtime

The runtime has no framework dependencies to:
- Keep bundle size small (<20KB)
- Work in any environment
- Support progressive enhancement
- Avoid version conflicts

### JSON Schema

Forms are defined in JSON to:
- Be portable across systems
- Enable version control
- Support import/export
- Allow programmatic generation

### Modular Connectors

Connectors are separate modules to:
- Allow selective inclusion
- Support custom connectors
- Keep core runtime lightweight
- Enable server-side usage

### Progressive Enhancement

Forms work without JavaScript:
- Basic HTML form structure
- Server-side fallback
- Enhanced with JavaScript
- Accessibility maintained

## Performance Considerations

- Lazy loading of connectors
- Efficient DOM updates
- Minimal re-renders
- CSS variable-based theming (no runtime style calculation)

## Security

- Client-side validation (UX only)
- Server-side validation required
- No XSS vulnerabilities (proper escaping)
- CSRF protection via connectors
- Secure credential handling (server-side)

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## Future Enhancements

- Server-side rendering support
- React/Vue component wrappers
- Advanced validation rules
- Form analytics
- A/B testing support








