# Theming Guide

Forms can be customized using CSS variables. The runtime includes a default theme and a dark theme, and you can create your own custom themes.

## CSS Variables

All theme colors and styles are controlled by CSS variables:

```css
:root {
  /* Colors */
  --form-color-primary: #0066cc;
  --form-color-primary-hover: #0052a3;
  --form-color-primary-focus: #0066cc;
  --form-color-text: #333333;
  --form-color-text-secondary: #666666;
  --form-color-border: #cccccc;
  --form-color-border-focus: #0066cc;
  --form-color-error: #d32f2f;
  --form-color-success: #2e7d32;
  --form-color-background: #ffffff;
  --form-color-background-disabled: #f5f5f5;

  /* Spacing */
  --form-spacing-xs: 0.25rem;
  --form-spacing-sm: 0.5rem;
  --form-spacing-md: 1rem;
  --form-spacing-lg: 1.5rem;
  --form-spacing-xl: 2rem;

  /* Typography */
  --form-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --form-font-size-base: 1rem;
  --form-font-size-sm: 0.875rem;
  --form-font-size-lg: 1.125rem;
  --form-line-height: 1.5;

  /* Borders */
  --form-border-radius: 4px;
  --form-border-width: 1px;

  /* Focus */
  --form-focus-outline-width: 2px;
  --form-focus-outline-offset: 2px;
}
```

## Using Themes

### Default Theme

```javascript
const form = new FormRuntime({
  schema: mySchema,
  container: '#form',
  theme: 'default'
});
```

### Dark Theme

```javascript
const form = new FormRuntime({
  schema: mySchema,
  container: '#form',
  theme: 'dark'
});
```

## Creating Custom Themes

### Method 1: Override CSS Variables

```css
.theme-custom {
  --form-color-primary: #ff6b6b;
  --form-color-primary-hover: #ee5a5a;
  --form-color-text: #2d3436;
  --form-color-background: #f8f9fa;
  --form-border-radius: 8px;
}
```

### Method 2: Create a Theme File

1. Create `runtime/themes/custom.css`
2. Override variables:

```css
.theme-custom {
  --form-color-primary: #your-color;
  /* ... other overrides ... */
}
```

3. Include in your HTML:

```html
<link rel="stylesheet" href="runtime/form-runtime.css">
<link rel="stylesheet" href="runtime/themes/custom.css">
```

4. Use in your form:

```javascript
const form = new FormRuntime({
  schema: mySchema,
  container: '#form',
  theme: 'custom'
});
```

## Layout Options

### Field Widths

Fields can be set to different widths:

```json
{
  "layout": {
    "width": "half"  // full, half, third, twoThirds
  }
}
```

### Responsive Behavior

Fields automatically stack on mobile devices. The CSS includes responsive breakpoints:

```css
@media (max-width: 768px) {
  .form-field-half,
  .form-field-third,
  .form-field-twoThirds {
    width: 100%;
  }
}
```

## Custom Styling

### Override Specific Elements

```css
.form-runtime .form-input {
  border: 2px solid #your-color;
  border-radius: 8px;
}

.form-runtime .form-submit-btn {
  background: linear-gradient(to right, #color1, #color2);
  border: none;
}
```

### Add Custom Classes

You can add custom classes to the form container:

```javascript
const form = new FormRuntime({
  schema: mySchema,
  container: '#form'
});

// Add custom class
document.getElementById('form').classList.add('my-custom-class');
```

Then style with:

```css
.my-custom-class .form-field {
  /* your styles */
}
```

## Accessibility Considerations

When creating custom themes:

1. **Contrast Ratios**: Ensure text has at least 4.5:1 contrast ratio
2. **Focus Indicators**: Never remove or hide focus outlines
3. **Color Alone**: Don't rely on color alone to convey information
4. **Text Size**: Support text resizing up to 200%

## Examples

### Minimal Theme

```css
.theme-minimal {
  --form-color-primary: #000;
  --form-color-border: #000;
  --form-border-width: 1px;
  --form-border-radius: 0;
  --form-spacing-md: 0.5rem;
}
```

### Colorful Theme

```css
.theme-colorful {
  --form-color-primary: #ff6b6b;
  --form-color-primary-hover: #ee5a5a;
  --form-color-border-focus: #ff6b6b;
  --form-border-radius: 12px;
  --form-focus-outline-width: 3px;
}
```






