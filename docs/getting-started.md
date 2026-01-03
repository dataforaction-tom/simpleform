# Getting Started

Welcome to Form Builder Open Source! This guide will help you get started with creating and deploying forms.

## Installation

### Option 1: Download and Use

1. Download or clone this repository
2. Open `builder/index.html` in your browser
3. Start building forms!

### Option 2: Deploy to Static Hosting

Deploy the `builder/` directory to any static hosting service:

- **Netlify**: Drag and drop the `builder/` folder
- **Vercel**: Connect your repository
- **GitHub Pages**: Push to `gh-pages` branch
- **Any web server**: Upload files via FTP/SFTP

### Option 3: Self-Hosted

For production use, you may want to:

1. Build the project: `npm run build`
2. Serve the `dist/` directory
3. Set up server-side connectors if needed

## Creating Your First Form

### Using the GUI Builder

1. Open the builder interface
2. Drag fields from the sidebar onto the canvas
3. Click on fields to configure them
4. Use the Preview tab to test your form
5. Export your form as JSON

### Using the JSON Editor

1. Switch to the JSON Editor tab
2. Edit the form schema directly
3. Use templates as starting points
4. Validate your JSON in real-time

### Using Templates

1. Click on a template button in the sidebar
2. Customize the template to your needs
3. Add or remove fields as needed

## Deploying a Form

### Static HTML Page

1. Export your form JSON
2. Create an HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="runtime/form-runtime.css">
</head>
<body>
  <div id="form-container"></div>
  <script src="runtime/form-runtime.js"></script>
  <script>
    // Load your form schema
    const formSchema = { /* your form JSON */ };
    
    const form = new FormRuntime({
      schema: formSchema,
      container: '#form-container',
      onSubmit: async (data) => {
        // Handle submission
        console.log(data);
        return { success: true, message: 'Thank you!' };
      }
    });
    form.render();
  </script>
</body>
</html>
```

### Embedded Form

Include the runtime in your existing page:

```html
<script src="https://your-domain.com/runtime/form-runtime.js"></script>
<link rel="stylesheet" href="https://your-domain.com/runtime/form-runtime.css">
```

### Iframe Embed

Generate an embeddable iframe URL that loads your form.

## Next Steps

- Read the [Form Schema Reference](form-schema.md) for detailed field options
- Set up [Connectors](connectors.md) to handle form submissions
- Customize the [Theme](theming.md) to match your brand
- Review [Accessibility](accessibility.md) best practices






