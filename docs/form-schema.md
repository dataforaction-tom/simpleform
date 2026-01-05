# Form Schema Reference

The form schema is a JSON object that defines the structure, fields, validation, and behavior of your form.

## Basic Structure

```json
{
  "formId": "unique-id",
  "version": "1.0",
  "title": "Form Title",
  "description": "Form description",
  "settings": { /* form settings */ },
  "pages": [ /* form pages */ ],
  "repeatableSections": [ /* optional */ ],
  "calculatedFields": [ /* optional */ ],
  "conditionalLogic": { /* optional */ }
}
```

## Form Settings

```json
{
  "settings": {
    "multiPage": false,
    "progressBar": true,
    "saveProgress": false,
    "submitButtonText": "Submit",
    "successMessage": "Thank you!",
    "theme": "default"
  }
}
```

## Pages

A form consists of one or more pages. Each page contains fields.

```json
{
  "pages": [
    {
      "id": "page1",
      "title": "Page Title",
      "fields": [ /* fields */ ]
    }
  ]
}
```

## Field Types

### Text Input

```json
{
  "id": "firstName",
  "type": "text",
  "label": "First Name",
  "placeholder": "Enter your name",
  "required": true,
  "validation": {
    "minLength": 2,
    "maxLength": 50,
    "pattern": "^[a-zA-Z]+$"
  }
}
```

### Textarea

```json
{
  "id": "message",
  "type": "textarea",
  "label": "Message",
  "required": true,
  "validation": {
    "minLength": 10,
    "maxLength": 1000
  }
}
```

### Email

```json
{
  "id": "email",
  "type": "email",
  "label": "Email Address",
  "required": true,
  "validation": {
    "message": "Please enter a valid email"
  }
}
```

### Number

```json
{
  "id": "age",
  "type": "number",
  "label": "Age",
  "validation": {
    "min": 0,
    "max": 120
  }
}
```

### Select (Dropdown)

```json
{
  "id": "country",
  "type": "select",
  "label": "Country",
  "required": true,
  "options": [
    { "value": "us", "label": "United States" },
    { "value": "uk", "label": "United Kingdom" }
  ]
}
```

### Radio Buttons

```json
{
  "id": "gender",
  "type": "radio",
  "label": "Gender",
  "required": true,
  "options": [
    { "value": "male", "label": "Male" },
    { "value": "female", "label": "Female" }
  ]
}
```

### Checkboxes

```json
{
  "id": "interests",
  "type": "checkboxes",
  "label": "Interests",
  "options": [
    { "value": "sports", "label": "Sports" },
    { "value": "music", "label": "Music" }
  ]
}
```

### File Upload

```json
{
  "id": "resume",
  "type": "file",
  "label": "Upload Resume",
  "validation": {
    "fileSizeLimit": 5242880,
    "fileTypes": ["application/pdf", ".pdf"]
  }
}
```

### Date/Time

```json
{
  "id": "birthdate",
  "type": "date",
  "label": "Date of Birth",
  "validation": {
    "minDate": "1900-01-01",
    "maxDate": "2024-12-31"
  }
}
```

### Header

```json
{
  "id": "section-title",
  "type": "header",
  "label": "Section Title",
  "level": 2
}
```

### Paragraph

```json
{
  "id": "instructions",
  "type": "paragraph",
  "label": "Please fill out all required fields."
}
```

## Validation Rules

### Required

```json
{
  "required": true
}
```

### Pattern (Regex)

```json
{
  "validation": {
    "pattern": "^[a-zA-Z0-9]+$",
    "message": "Only letters and numbers allowed"
  }
}
```

### Length

```json
{
  "validation": {
    "minLength": 5,
    "maxLength": 100
  }
}
```

### Number Range

```json
{
  "validation": {
    "min": 0,
    "max": 100
  }
}
```

### Cross-Field Validation

```json
{
  "validation": {
    "crossField": {
      "field": "startDate",
      "operator": "after"
    }
  }
}
```

## Conditional Display

Show/hide fields based on other field values:

```json
{
  "id": "phone",
  "type": "tel",
  "label": "Phone Number",
  "conditionalDisplay": {
    "rules": [
      {
        "field": "contactMethod",
        "operator": "equals",
        "value": "phone"
      }
    ],
    "logic": "AND"
  }
}
```

### Operators

- `equals` - Field equals value
- `notEquals` - Field does not equal value
- `greaterThan` - Field is greater than value
- `lessThan` - Field is less than value
- `contains` - Field contains value
- `notContains` - Field does not contain value

## Repeatable Sections

Allow users to add multiple instances of a group of fields:

```json
{
  "repeatableSections": [
    {
      "id": "householdMembers",
      "title": "Household Member",
      "addButtonText": "Add Another Member",
      "removeButtonText": "Remove",
      "minInstances": 1,
      "maxInstances": 10,
      "fields": [
        {
          "id": "memberName",
          "type": "text",
          "label": "Name",
          "required": true
        }
      ]
    }
  ]
}
```

## Calculated Fields

Automatically calculate values based on other fields:

```json
{
  "calculatedFields": [
    {
      "id": "total",
      "expression": "quantity * price",
      "format": "currency",
      "decimalPlaces": 2
    }
  ]
}
```

### Formats

- `number` - Plain number
- `currency` - Currency format ($)
- `percentage` - Percentage format (%)

## Conditional Logic

Skip pages or enable/disable fields:

```json
{
  "conditionalLogic": {
    "skipRules": [
      {
        "condition": {
          "field": "hasPets",
          "operator": "equals",
          "value": "no"
        },
        "action": {
          "type": "skipToPage",
          "target": "page3"
        }
      }
    ]
  }
}
```

## Layout

Control field width and order:

```json
{
  "layout": {
    "width": "half",
    "order": 1
  }
}
```

### Width Options

- `full` - Full width (default)
- `half` - Half width
- `third` - One third width
- `twoThirds` - Two thirds width








