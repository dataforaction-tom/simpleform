# Accessibility Guide

Form Builder Open Source is designed to be WCAG 2.1 AA compliant. This guide covers accessibility features and best practices.

## Built-in Features

### Keyboard Navigation

- **Tab**: Navigate between fields
- **Enter**: Submit form
- **Space**: Toggle checkboxes
- **Arrow Keys**: Navigate radio button groups
- **Escape**: Close modals/dialogs

### Screen Reader Support

- Semantic HTML (`<form>`, `<fieldset>`, `<legend>`)
- ARIA labels for all interactive elements
- ARIA live regions for errors and state changes
- ARIA describedby for help text
- ARIA invalid/required attributes

### Visual Accessibility

- Minimum 4.5:1 contrast ratio for text
- Minimum 3:1 contrast for interactive elements
- Focus indicators (2px outline)
- Error messages in text (not just color)
- Resizable text support (up to 200%)

## Best Practices for Form Creators

### Labels

Always provide clear, descriptive labels:

```json
{
  "id": "email",
  "type": "email",
  "label": "Email Address",  // Good
  "label": "Email"            // Also good
}
```

### Help Text

Use help text to provide additional context:

```json
{
  "id": "phone",
  "type": "tel",
  "label": "Phone Number",
  "helpText": "Include country code if outside US"
}
```

### Required Fields

Clearly mark required fields:

```json
{
  "required": true  // Adds asterisk and ARIA required
}
```

### Error Messages

Provide clear, actionable error messages:

```json
{
  "validation": {
    "minLength": 8,
    "message": "Password must be at least 8 characters"
  }
}
```

### Field Groups

Use fieldsets for related fields:

```json
{
  "type": "radio",
  "label": "Contact Method",  // Becomes legend
  "options": [...]
}
```

### Conditional Fields

When using conditional display, ensure the logic is clear:

```json
{
  "conditionalDisplay": {
    "rules": [
      {
        "field": "hasAccount",
        "operator": "equals",
        "value": "yes"
      }
    ]
  }
}
```

## Testing Checklist

### Screen Readers

- [ ] NVDA (Windows) - Test all form interactions
- [ ] JAWS (Windows) - Verify announcements
- [ ] VoiceOver (macOS/iOS) - Test mobile experience
- [ ] TalkBack (Android) - Test mobile experience

### Keyboard Navigation

- [ ] Tab through all fields
- [ ] Navigate radio groups with arrow keys
- [ ] Toggle checkboxes with space
- [ ] Submit form with Enter
- [ ] Focus indicators visible

### Visual Testing

- [ ] High contrast mode
- [ ] Browser zoom to 200%
- [ ] Color blindness simulators
- [ ] Error messages readable without color

### Automated Testing

Use axe-core or similar tools:

```bash
npm run audit:a11y
```

## Common Issues and Solutions

### Missing Labels

**Issue**: Field has no label  
**Solution**: Always provide a `label` property

### Unclear Error Messages

**Issue**: "Invalid" is not helpful  
**Solution**: Provide specific messages:

```json
{
  "validation": {
    "pattern": "^[a-z]+$",
    "message": "Only lowercase letters allowed"
  }
}
```

### Poor Contrast

**Issue**: Text hard to read  
**Solution**: Use theme variables with proper contrast:

```css
--form-color-text: #333333;  /* Good contrast */
--form-color-text: #cccccc;  /* Poor contrast */
```

### Missing Focus Indicators

**Issue**: Can't see which field is focused  
**Solution**: Never remove focus styles. They're built-in:

```css
.form-input:focus {
  outline: 2px solid var(--form-color-primary-focus);
}
```

## Advanced Accessibility

### Custom ARIA Labels

For complex fields, you can add custom ARIA attributes in the HTML after rendering:

```javascript
const form = new FormRuntime({...});
form.render();

// Add custom ARIA
const field = document.getElementById('myField');
field.setAttribute('aria-label', 'Custom label');
```

### Skip Links

Add skip links for multi-page forms:

```html
<a href="#form-content" class="skip-link">Skip to form</a>
```

### Live Regions

The runtime automatically uses ARIA live regions for:
- Validation errors
- Form submission status
- Page navigation

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)






