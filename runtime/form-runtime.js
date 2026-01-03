/**
 * Form Runtime - Core form engine
 * Zero dependencies, vanilla JavaScript
 */

class FormRuntime {
  constructor(options = {}) {
    const {
      schema,
      container,
      theme = 'default',
      onSubmit,
      onValidationError,
    } = options;

    if (!schema) {
      throw new Error('FormRuntime: schema is required');
    }
    if (!container) {
      throw new Error('FormRuntime: container is required');
    }

    this.schema = schema;
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.theme = theme;
    this.onSubmit = onSubmit;
    this.onValidationError = onValidationError;

    this.currentPageIndex = 0;
    this.formData = {};
    this.repeatableInstances = {};
    this.fieldElements = new Map();
    this.validationErrors = new Map();
    this.ariaLiveRegion = null;

    this.init();
  }

  init() {
    // Create ARIA live region for announcements
    this.ariaLiveRegion = document.createElement('div');
    this.ariaLiveRegion.setAttribute('role', 'status');
    this.ariaLiveRegion.setAttribute('aria-live', 'polite');
    this.ariaLiveRegion.setAttribute('aria-atomic', 'true');
    this.ariaLiveRegion.className = 'sr-only';
    this.ariaLiveRegion.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;';
    document.body.appendChild(this.ariaLiveRegion);

    // Initialize repeatable sections
    if (this.schema.repeatableSections) {
      this.schema.repeatableSections.forEach((section) => {
        this.repeatableInstances[section.id] = [];
        const minInstances = section.minInstances || 1;
        for (let i = 0; i < minInstances; i++) {
          this.addRepeatableInstance(section.id);
        }
      });
    }
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = '';
    this.container.className = `form-runtime theme-${this.theme}`;

    // Add CSS if not already loaded
    if (!document.querySelector('link[href*="form-runtime.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = './runtime/form-runtime.css';
      document.head.appendChild(link);
    }

    // Create form element
    const form = document.createElement('form');
    form.setAttribute('novalidate', 'novalidate');
    form.setAttribute('aria-label', this.schema.title || 'Form');

    // Progress bar for multi-page
    if (this.schema.settings?.multiPage && this.schema.settings?.progressBar) {
      form.appendChild(this.createProgressBar());
    }

    // Render current page or all pages
    if (this.schema.settings?.multiPage) {
      form.appendChild(this.renderPage(this.schema.pages[this.currentPageIndex]));
    } else {
      this.schema.pages.forEach((page) => {
        form.appendChild(this.renderPage(page));
      });
    }

    // Render repeatable sections
    if (this.schema.repeatableSections) {
      this.schema.repeatableSections.forEach((section) => {
        form.appendChild(this.renderRepeatableSection(section));
      });
    }

    // Navigation buttons
    form.appendChild(this.createNavigationButtons());

    // Submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = this.schema.settings?.submitButtonText || 'Submit';
    submitBtn.className = 'form-submit-btn';
    form.appendChild(submitBtn);

    // Form submission handler
    form.addEventListener('submit', (e) => this.handleSubmit(e));

    this.container.appendChild(form);

    // Update calculated fields
    this.updateCalculatedFields();

    // Apply conditional logic
    this.evaluateConditionalLogic();

    // Update submit button state based on validation
    this.updateSubmitButtonState();
  }

  createProgressBar() {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'form-progress';
    progressContainer.setAttribute('role', 'progressbar');
    progressContainer.setAttribute('aria-valuenow', this.currentPageIndex + 1);
    progressContainer.setAttribute('aria-valuemin', 1);
    progressContainer.setAttribute('aria-valuemax', this.schema.pages.length);
    progressContainer.setAttribute('aria-label', `Page ${this.currentPageIndex + 1} of ${this.schema.pages.length}`);

    const progressBar = document.createElement('div');
    progressBar.className = 'form-progress-bar';
    const percentage = ((this.currentPageIndex + 1) / this.schema.pages.length) * 100;
    progressBar.style.width = `${percentage}%`;
    progressBar.setAttribute('aria-hidden', 'true');

    progressContainer.appendChild(progressBar);
    return progressContainer;
  }

  renderPage(page) {
    const pageContainer = document.createElement('div');
    pageContainer.className = 'form-page';
    pageContainer.id = `page-${page.id}`;
    pageContainer.setAttribute('data-page-id', page.id);

    if (this.schema.settings?.multiPage && page.id !== this.schema.pages[this.currentPageIndex].id) {
      pageContainer.style.display = 'none';
    }

    if (page.title) {
      const title = document.createElement('h2');
      title.className = 'form-page-title';
      title.textContent = page.title;
      pageContainer.appendChild(title);
    }

    const fieldsContainer = document.createElement('div');
    fieldsContainer.className = 'form-fields';

    // Check if page.fields exists and filter out any null/undefined fields
    if (page.fields && Array.isArray(page.fields)) {
      page.fields.filter(field => field != null).forEach((field) => {
        if (field && field.id && field.type) {
          const fieldElement = this.renderField(field);
          if (fieldElement) {
            fieldsContainer.appendChild(fieldElement);
          }
        }
      });
    }

    pageContainer.appendChild(fieldsContainer);
    return pageContainer;
  }

  renderField(field) {
    // Validate field object
    if (!field || !field.id || !field.type) {
      console.warn('Invalid field object:', field);
      return null;
    }

    const fieldContainer = document.createElement('div');
    fieldContainer.className = `form-field form-field-${field.type}`;
    fieldContainer.setAttribute('data-field-id', field.id);

    if (field.layout?.width && field.layout.width !== 'full') {
      fieldContainer.classList.add(`form-field-${field.layout.width}`);
    }

    let inputElement;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
      case 'number':
      case 'date':
      case 'time':
      case 'datetime-local':
        inputElement = this.renderInputField(field);
        break;
      case 'textarea':
        inputElement = this.renderTextareaField(field);
        break;
      case 'select':
        inputElement = this.renderSelectField(field);
        break;
      case 'radio':
        inputElement = this.renderRadioField(field);
        break;
      case 'checkboxes':
        inputElement = this.renderCheckboxesField(field);
        break;
      case 'file':
        inputElement = this.renderFileField(field);
        break;
      case 'hidden':
        inputElement = this.renderHiddenField(field);
        break;
      case 'richtext':
        inputElement = this.renderRichTextField(field);
        break;
      case 'header':
        inputElement = this.renderHeaderField(field);
        break;
      case 'paragraph':
        inputElement = this.renderParagraphField(field);
        break;
      default:
        return null;
    }

    if (inputElement) {
      // Add label if not already added
      if (field.type !== 'hidden' && field.type !== 'richtext' && field.type !== 'header' && field.type !== 'paragraph') {
        const label = this.createLabel(field);
        fieldContainer.appendChild(label);
      }

      fieldContainer.appendChild(inputElement);

      // Add help text
      if (field.helpText) {
        const helpText = document.createElement('div');
        helpText.className = 'form-help-text';
        helpText.id = `help-${field.id}`;
        helpText.textContent = field.helpText;
        fieldContainer.appendChild(helpText);
        if (inputElement.setAttribute) {
          inputElement.setAttribute('aria-describedby', `help-${field.id}`);
        }
      }

      // Add error container
      const errorContainer = document.createElement('div');
      errorContainer.className = 'form-error';
      errorContainer.id = `error-${field.id}`;
      errorContainer.setAttribute('role', 'alert');
      errorContainer.setAttribute('aria-live', 'polite');
      fieldContainer.appendChild(errorContainer);

      // Store field element
      this.fieldElements.set(field.id, {
        container: fieldContainer,
        input: inputElement,
        error: errorContainer,
        field: field,
      });

      // Set default value
      if (field.defaultValue !== undefined) {
        this.setFieldValue(field.id, field.defaultValue);
      }

      // Add event listeners
      this.attachFieldListeners(field.id, inputElement);
    }

    return fieldContainer;
  }

  createLabel(field) {
    const label = document.createElement('label');
    label.htmlFor = field.id;
    label.textContent = field.label || '';
    if (field.required) {
      const required = document.createElement('span');
      required.className = 'form-required';
      required.textContent = ' *';
      required.setAttribute('aria-label', 'required');
      label.appendChild(required);
    }
    return label;
  }

  renderInputField(field) {
    const input = document.createElement('input');
    input.type = field.type === 'datetime' ? 'datetime-local' : field.type;
    input.id = field.id;
    input.name = field.id;
    input.className = 'form-input';

    if (field.placeholder) {
      input.placeholder = field.placeholder;
    }
    if (field.required) {
      input.setAttribute('required', 'required');
      input.setAttribute('aria-required', 'true');
    }
    if (field.validation?.pattern) {
      input.pattern = field.validation.pattern;
    }
    if (field.validation?.minLength) {
      input.minLength = field.validation.minLength;
    }
    if (field.validation?.maxLength) {
      input.maxLength = field.validation.maxLength;
    }
    if (field.type === 'number') {
      if (field.validation?.min !== undefined) {
        input.min = field.validation.min;
      }
      if (field.validation?.max !== undefined) {
        input.max = field.validation.max;
      }
    }
    if (field.type === 'date' || field.type === 'datetime') {
      if (field.validation?.minDate) {
        input.min = field.validation.minDate;
      }
      if (field.validation?.maxDate) {
        input.max = field.validation.maxDate;
      }
    }

    return input;
  }

  renderTextareaField(field) {
    const textarea = document.createElement('textarea');
    textarea.id = field.id;
    textarea.name = field.id;
    textarea.className = 'form-textarea';

    if (field.placeholder) {
      textarea.placeholder = field.placeholder;
    }
    if (field.required) {
      textarea.setAttribute('required', 'required');
      textarea.setAttribute('aria-required', 'true');
    }
    if (field.validation?.minLength) {
      textarea.minLength = field.validation.minLength;
    }
    if (field.validation?.maxLength) {
      textarea.maxLength = field.validation.maxLength;
    }

    return textarea;
  }

  renderSelectField(field) {
    const select = document.createElement('select');
    select.id = field.id;
    select.name = field.id;
    select.className = 'form-select';

    if (field.required) {
      select.setAttribute('required', 'required');
      select.setAttribute('aria-required', 'true');
    }

    if (field.options) {
      field.options.forEach((option) => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        select.appendChild(optionElement);
      });
    }

    return select;
  }

  renderRadioField(field) {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'form-radio-group';
    fieldset.id = `fieldset-${field.id}`;

    const legend = document.createElement('legend');
    legend.textContent = field.label || '';
    if (field.required) {
      const required = document.createElement('span');
      required.className = 'form-required';
      required.textContent = ' *';
      legend.appendChild(required);
    }
    fieldset.appendChild(legend);

    if (field.options) {
      field.options.forEach((option, index) => {
        const radioContainer = document.createElement('div');
        radioContainer.className = 'form-radio-option';

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.id = `${field.id}-${index}`;
        radio.name = field.id;
        radio.value = option.value;
        radio.className = 'form-radio';

        if (field.required) {
          radio.setAttribute('required', 'required');
          radio.setAttribute('aria-required', 'true');
        }

        const label = document.createElement('label');
        label.htmlFor = `${field.id}-${index}`;
        label.textContent = option.label;

        radioContainer.appendChild(radio);
        radioContainer.appendChild(label);
        fieldset.appendChild(radioContainer);
      });
    }

    return fieldset;
  }

  renderCheckboxesField(field) {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'form-checkboxes-group';
    fieldset.id = `fieldset-${field.id}`;

    const legend = document.createElement('legend');
    legend.textContent = field.label || '';
    if (field.required) {
      const required = document.createElement('span');
      required.className = 'form-required';
      required.textContent = ' *';
      legend.appendChild(required);
    }
    fieldset.appendChild(legend);

    if (field.options) {
      field.options.forEach((option, index) => {
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = 'form-checkbox-option';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${field.id}-${index}`;
        checkbox.name = field.id;
        checkbox.value = option.value;
        checkbox.className = 'form-checkbox';

        const label = document.createElement('label');
        label.htmlFor = `${field.id}-${index}`;
        label.textContent = option.label;

        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(label);
        fieldset.appendChild(checkboxContainer);
      });
    }

    return fieldset;
  }

  renderFileField(field) {
    const input = document.createElement('input');
    input.type = 'file';
    input.id = field.id;
    input.name = field.id;
    input.className = 'form-file';

    if (field.required) {
      input.setAttribute('required', 'required');
      input.setAttribute('aria-required', 'true');
    }
    if (field.validation?.fileTypes) {
      input.accept = field.validation.fileTypes.join(',');
    }

    // File size validation will be done in validation
    return input;
  }

  renderHiddenField(field) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.id = field.id;
    input.name = field.id;
    if (field.defaultValue !== undefined) {
      input.value = String(field.defaultValue);
    }
    return input;
  }

  renderRichTextField(field) {
    const div = document.createElement('div');
    div.className = 'form-richtext';
    div.id = field.id;
    if (field.defaultValue) {
      div.innerHTML = String(field.defaultValue);
    }
    return div;
  }

  renderHeaderField(field) {
    const level = field.level || 2;
    const header = document.createElement(`h${level}`);
    header.className = 'form-header';
    header.id = field.id;
    header.textContent = field.label || '';
    return header;
  }

  renderParagraphField(field) {
    const p = document.createElement('p');
    p.className = 'form-paragraph';
    p.id = field.id;
    p.textContent = field.label || field.defaultValue || '';
    return p;
  }

  attachFieldListeners(fieldId, element) {
    // Get field info to check field type
    const fieldInfo = this.fieldElements.get(fieldId);
    const field = fieldInfo ? fieldInfo.field : null;

    // Handle input changes
    const handleChange = () => {
      const value = this.getFieldValue(fieldId);
      this.formData[fieldId] = value;
      this.clearFieldError(fieldId);
      this.updateCalculatedFields();
      this.evaluateConditionalLogic();
    };

    if (element.tagName === 'FIELDSET') {
      // For radio and checkbox groups
      element.addEventListener('change', handleChange);
    } else {
      element.addEventListener('input', handleChange);
      element.addEventListener('change', handleChange);
    }

    // Handle validation on blur
    element.addEventListener('blur', () => {
      this.validateField(fieldId);
      this.updateSubmitButtonState();
    });

    // Update submit button state on input/change
    const updateState = () => {
      this.updateSubmitButtonState();
    };
    
    // Check field type or element type
    if (field && (field.type === 'checkbox' || field.type === 'radio' || field.type === 'checkboxes')) {
      element.addEventListener('change', updateState);
    } else if (element.tagName === 'FIELDSET') {
      element.addEventListener('change', updateState);
    } else {
      element.addEventListener('input', updateState);
      element.addEventListener('change', updateState);
    }
  }

  getFieldValue(fieldId) {
    const fieldInfo = this.fieldElements.get(fieldId);
    if (!fieldInfo) return null;

    const { input, field } = fieldInfo;

    if (field.type === 'checkboxes') {
      const checkboxes = input.querySelectorAll('input[type="checkbox"]:checked');
      return Array.from(checkboxes).map((cb) => cb.value);
    } else if (field.type === 'radio') {
      const radio = input.querySelector(`input[name="${fieldId}"]:checked`);
      return radio ? radio.value : null;
    } else if (field.type === 'file') {
      return input.files[0] || null;
    } else {
      return input.value || null;
    }
  }

  setFieldValue(fieldId, value) {
    const fieldInfo = this.fieldElements.get(fieldId);
    if (!fieldInfo) return;

    const { input, field } = fieldInfo;

    if (field.type === 'checkboxes') {
      const checkboxes = input.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((cb) => {
        cb.checked = Array.isArray(value) && value.includes(cb.value);
      });
    } else if (field.type === 'radio') {
      const radio = input.querySelector(`input[name="${fieldId}"][value="${value}"]`);
      if (radio) radio.checked = true;
    } else {
      input.value = value;
    }

    this.formData[fieldId] = value;
  }

  clearFieldError(fieldId) {
    const fieldInfo = this.fieldElements.get(fieldId);
    if (fieldInfo) {
      fieldInfo.error.textContent = '';
      fieldInfo.error.setAttribute('aria-hidden', 'true');
      if (fieldInfo.input.setAttribute) {
        fieldInfo.input.removeAttribute('aria-invalid');
      }
      fieldInfo.container.classList.remove('form-field-error');
    }
    this.validationErrors.delete(fieldId);
    // Update submit button state when error is cleared
    this.updateSubmitButtonState();
  }

  setFieldError(fieldId, message) {
    const fieldInfo = this.fieldElements.get(fieldId);
    if (fieldInfo) {
      fieldInfo.error.textContent = message;
      fieldInfo.error.setAttribute('aria-hidden', 'false');
      if (fieldInfo.input.setAttribute) {
        fieldInfo.input.setAttribute('aria-invalid', 'true');
      }
      fieldInfo.container.classList.add('form-field-error');
    }
    this.validationErrors.set(fieldId, message);
  }

  validateField(fieldId) {
    const fieldInfo = this.fieldElements.get(fieldId);
    if (!fieldInfo) return true;

    const { field, input } = fieldInfo;
    const value = this.getFieldValue(fieldId);

    // Required validation
    if (field.required && (value === null || value === '' || (Array.isArray(value) && value.length === 0))) {
      this.setFieldError(fieldId, field.validation?.message || `${field.label || fieldId} is required`);
      return false;
    }

    // Skip other validations if field is empty and not required
    if (!value || value === '') {
      this.clearFieldError(fieldId);
      return true;
    }

    // Pattern validation
    if (field.validation?.pattern && typeof value === 'string') {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(value)) {
        this.setFieldError(fieldId, field.validation?.message || 'Invalid format');
        return false;
      }
    }

    // Length validation
    if (typeof value === 'string') {
      if (field.validation?.minLength && value.length < field.validation.minLength) {
        this.setFieldError(fieldId, field.validation?.message || `Minimum length is ${field.validation.minLength}`);
        return false;
      }
      if (field.validation?.maxLength && value.length > field.validation.maxLength) {
        this.setFieldError(fieldId, field.validation?.message || `Maximum length is ${field.validation.maxLength}`);
        return false;
      }
    }

    // Number validation
    if (field.type === 'number' && typeof value === 'string') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        if (field.validation?.min !== undefined && numValue < field.validation.min) {
          this.setFieldError(fieldId, field.validation?.message || `Minimum value is ${field.validation.min}`);
          return false;
        }
        if (field.validation?.max !== undefined && numValue > field.validation.max) {
          this.setFieldError(fieldId, field.validation?.message || `Maximum value is ${field.validation.max}`);
          return false;
        }
      }
    }

    // File validation
    if (field.type === 'file' && value instanceof File) {
      if (field.validation?.fileSizeLimit && value.size > field.validation.fileSizeLimit) {
        this.setFieldError(fieldId, field.validation?.message || `File size exceeds limit`);
        return false;
      }
      if (field.validation?.fileTypes && field.validation.fileTypes.length > 0) {
        const fileType = value.type || value.name.split('.').pop();
        const allowed = field.validation.fileTypes.some((type) => {
          return fileType.includes(type) || fileType.endsWith(type);
        });
        if (!allowed) {
          this.setFieldError(fieldId, field.validation?.message || `File type not allowed`);
          return false;
        }
      }
    }

    // Cross-field validation
    if (field.validation?.crossField) {
      const crossField = field.validation.crossField;
      const otherValue = this.getFieldValue(crossField.field);
      if (otherValue !== null && otherValue !== '') {
        let valid = true;
        switch (crossField.operator) {
          case 'after':
            valid = new Date(value) > new Date(otherValue);
            break;
          case 'before':
            valid = new Date(value) < new Date(otherValue);
            break;
          case 'greaterThan':
            valid = parseFloat(value) > parseFloat(otherValue);
            break;
          case 'lessThan':
            valid = parseFloat(value) < parseFloat(otherValue);
            break;
        }
        if (!valid) {
          this.setFieldError(fieldId, field.validation?.message || 'Validation failed');
          return false;
        }
      }
    }

    this.clearFieldError(fieldId);
    return true;
  }

  validate() {
    let isValid = true;
    const errors = [];

    // Validate all fields
    this.fieldElements.forEach((fieldInfo, fieldId) => {
      const fieldValid = this.validateField(fieldId);
      if (!fieldValid) {
        isValid = false;
        errors.push({
          fieldId,
          message: this.validationErrors.get(fieldId),
        });
      }
    });

    // Validate repeatable sections
    if (this.schema.repeatableSections) {
      this.schema.repeatableSections.forEach((section) => {
        const instances = this.repeatableInstances[section.id] || [];
        instances.forEach((instance, instanceIndex) => {
          section.fields.forEach((field) => {
            const fieldId = `${section.id}[${instanceIndex}].${field.id}`;
            const fieldInfo = this.fieldElements.get(fieldId);
            if (fieldInfo) {
              const fieldValid = this.validateField(fieldId);
              if (!fieldValid) {
                isValid = false;
                errors.push({
                  fieldId,
                  message: this.validationErrors.get(fieldId),
                });
              }
            }
          });
        });
      });
    }

    if (!isValid && this.onValidationError) {
      this.onValidationError(errors);
    }

    return isValid;
  }

  getData() {
    const data = { ...this.formData };

    // Include repeatable section data
    if (this.schema.repeatableSections) {
      this.schema.repeatableSections.forEach((section) => {
        const instances = this.repeatableInstances[section.id] || [];
        data[section.id] = instances.map((instance, index) => {
          const instanceData = {};
          section.fields.forEach((field) => {
            const fieldId = `${section.id}[${index}].${field.id}`;
            instanceData[field.id] = this.getFieldValue(fieldId);
          });
          return instanceData;
        });
      });
    }

    return data;
  }

  setData(data) {
    Object.keys(data).forEach((key) => {
      if (this.fieldElements.has(key)) {
        this.setFieldValue(key, data[key]);
      }
    });
  }

  reset() {
    this.formData = {};
    this.currentPageIndex = 0;
    this.validationErrors.clear();

    this.fieldElements.forEach((fieldInfo) => {
      const { input, field } = fieldInfo;
      if (field.type === 'checkboxes' || field.type === 'radio') {
        input.querySelectorAll('input').forEach((inp) => {
          inp.checked = false;
        });
      } else if (field.type !== 'hidden' && field.type !== 'richtext' && field.type !== 'header' && field.type !== 'paragraph') {
        input.value = '';
      }
      this.clearFieldError(fieldInfo.field.id);
    });

    // Reset repeatable sections
    if (this.schema.repeatableSections) {
      this.schema.repeatableSections.forEach((section) => {
        this.repeatableInstances[section.id] = [];
        const minInstances = section.minInstances || 1;
        for (let i = 0; i < minInstances; i++) {
          this.addRepeatableInstance(section.id);
        }
      });
    }

    this.render();
  }

  goToPage(pageId) {
    const pageIndex = this.schema.pages.findIndex((p) => p.id === pageId);
    if (pageIndex !== -1) {
      this.currentPageIndex = pageIndex;
      this.render();
      this.announce(`Navigated to page ${pageIndex + 1}`);
    }
  }

  destroy() {
    if (this.ariaLiveRegion && this.ariaLiveRegion.parentNode) {
      this.ariaLiveRegion.parentNode.removeChild(this.ariaLiveRegion);
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.fieldElements.clear();
    this.validationErrors.clear();
  }

  // Repeatable sections
  addRepeatableInstance(sectionId) {
    const section = this.schema.repeatableSections?.find((s) => s.id === sectionId);
    if (!section) return;

    const instances = this.repeatableInstances[sectionId] || [];
    if (section.maxInstances && instances.length >= section.maxInstances) {
      return;
    }

    const instanceIndex = instances.length;
    instances.push({});
    this.repeatableInstances[sectionId] = instances;

    // Re-render to show new instance
    this.render();
  }

  removeRepeatableInstance(sectionId, instanceIndex) {
    const section = this.schema.repeatableSections?.find((s) => s.id === sectionId);
    if (!section) return;

    const instances = this.repeatableInstances[sectionId] || [];
    if (instances.length <= (section.minInstances || 1)) {
      return;
    }

    instances.splice(instanceIndex, 1);
    this.repeatableInstances[sectionId] = instances;

    // Remove field elements for this instance
    section.fields.forEach((field) => {
      const fieldId = `${sectionId}[${instanceIndex}].${field.id}`;
      this.fieldElements.delete(fieldId);
    });

    this.render();
  }

  renderRepeatableSection(section) {
    const container = document.createElement('div');
    container.className = 'form-repeatable-section';
    container.id = `repeatable-${section.id}`;

    const title = document.createElement('h3');
    title.textContent = section.title || section.id;
    container.appendChild(title);

    const instances = this.repeatableInstances[section.id] || [];
    instances.forEach((instance, instanceIndex) => {
      const instanceContainer = document.createElement('div');
      instanceContainer.className = 'form-repeatable-instance';
      instanceContainer.setAttribute('data-instance-index', instanceIndex);

      const instanceTitle = document.createElement('h4');
      instanceTitle.textContent = `${section.title || 'Item'} ${instanceIndex + 1}`;
      instanceContainer.appendChild(instanceTitle);

      section.fields.forEach((field) => {
        const fieldId = `${section.id}[${instanceIndex}].${field.id}`;
        const fieldCopy = { ...field, id: fieldId };
        const fieldElement = this.renderField(fieldCopy);
        if (fieldElement) {
          instanceContainer.appendChild(fieldElement);
        }
      });

      // Remove button
      if (instances.length > (section.minInstances || 1)) {
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'form-remove-instance-btn';
        removeBtn.textContent = section.removeButtonText || 'Remove';
        removeBtn.addEventListener('click', () => {
          this.removeRepeatableInstance(section.id, instanceIndex);
        });
        instanceContainer.appendChild(removeBtn);
      }

      container.appendChild(instanceContainer);
    });

    // Add button
    if (!section.maxInstances || instances.length < section.maxInstances) {
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'form-add-instance-btn';
      addBtn.textContent = section.addButtonText || 'Add Another';
      addBtn.addEventListener('click', () => {
        this.addRepeatableInstance(section.id);
      });
      container.appendChild(addBtn);
    }

    return container;
  }

  // Calculated fields
  updateCalculatedFields() {
    if (!this.schema.calculatedFields) return;

    this.schema.calculatedFields.forEach((calcField) => {
      try {
        const value = this.evaluateExpression(calcField.expression);
        const formatted = this.formatCalculatedValue(value, calcField.format, calcField.decimalPlaces);

        // Create or update calculated field display
        let displayElement = document.getElementById(`calc-${calcField.id}`);
        if (!displayElement) {
          displayElement = document.createElement('div');
          displayElement.id = `calc-${calcField.id}`;
          displayElement.className = 'form-calculated-field';
          // Try to find a good place to insert it
          const firstField = this.container.querySelector('.form-field');
          if (firstField) {
            firstField.parentNode.insertBefore(displayElement, firstField);
          } else {
            this.container.appendChild(displayElement);
          }
        }
        displayElement.textContent = formatted;
      } catch (error) {
        console.warn('Error calculating field:', calcField.id, error);
      }
    });
  }

  evaluateExpression(expression) {
    // Replace field IDs with their values
    let expr = expression;
    this.fieldElements.forEach((fieldInfo, fieldId) => {
      const value = this.getFieldValue(fieldId);
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        expr = expr.replace(new RegExp(`\\b${fieldId}\\b`, 'g'), numValue);
      }
    });

    // Evaluate safely
    try {
      // eslint-disable-next-line no-eval
      return eval(expr);
    } catch (error) {
      return 0;
    }
  }

  formatCalculatedValue(value, format, decimalPlaces = 2) {
    const num = parseFloat(value);
    if (isNaN(num)) return '0';

    const fixed = num.toFixed(decimalPlaces);
    switch (format) {
      case 'currency':
        return `$${fixed}`;
      case 'percentage':
        return `${fixed}%`;
      default:
        return fixed;
    }
  }

  // Conditional logic
  evaluateConditionalLogic() {
    this.fieldElements.forEach((fieldInfo, fieldId) => {
      const { field, container } = fieldInfo;
      if (field.conditionalDisplay) {
        const shouldShow = this.evaluateConditionalRules(field.conditionalDisplay.rules, field.conditionalDisplay.logic);
        if (shouldShow) {
          container.style.display = '';
          container.setAttribute('aria-hidden', 'false');
        } else {
          container.style.display = 'none';
          container.setAttribute('aria-hidden', 'true');
        }
      }
    });

    // Handle skip rules
    if (this.schema.conditionalLogic?.skipRules) {
      this.schema.conditionalLogic.skipRules.forEach((rule) => {
        if (this.evaluateConditionalRule(rule.condition)) {
          if (rule.action.type === 'skipToPage') {
            this.goToPage(rule.action.target);
          } else if (rule.action.type === 'enableField' || rule.action.type === 'disableField') {
            const fieldInfo = this.fieldElements.get(rule.action.target);
            if (fieldInfo) {
              fieldInfo.input.disabled = rule.action.type === 'disableField';
            }
          }
        }
      });
    }
  }

  evaluateConditionalRules(rules, logic = 'AND') {
    if (rules.length === 0) return true;

    const results = rules.map((rule) => this.evaluateConditionalRule(rule));

    if (logic === 'OR') {
      return results.some((r) => r);
    } else {
      return results.every((r) => r);
    }
  }

  evaluateConditionalRule(rule) {
    const value = this.getFieldValue(rule.field);
    const ruleValue = rule.value;

    switch (rule.operator) {
      case 'equals':
        return String(value) === String(ruleValue);
      case 'notEquals':
        return String(value) !== String(ruleValue);
      case 'greaterThan':
        return parseFloat(value) > parseFloat(ruleValue);
      case 'lessThan':
        return parseFloat(value) < parseFloat(ruleValue);
      case 'contains':
        return String(value).includes(String(ruleValue));
      case 'notContains':
        return !String(value).includes(String(ruleValue));
      default:
        return false;
    }
  }

  // Navigation
  createNavigationButtons() {
    if (!this.schema.settings?.multiPage) {
      return document.createDocumentFragment();
    }

    const navContainer = document.createElement('div');
    navContainer.className = 'form-navigation';

    // Previous button
    if (this.currentPageIndex > 0) {
      const prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'form-nav-btn form-nav-prev';
      prevBtn.textContent = 'Previous';
      prevBtn.addEventListener('click', () => {
        if (this.currentPageIndex > 0) {
          this.currentPageIndex--;
          this.render();
        }
      });
      navContainer.appendChild(prevBtn);
    }

    // Next button
    if (this.currentPageIndex < this.schema.pages.length - 1) {
      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'form-nav-btn form-nav-next';
      nextBtn.textContent = 'Next';
      nextBtn.addEventListener('click', () => {
        if (this.validateCurrentPage()) {
          if (this.currentPageIndex < this.schema.pages.length - 1) {
            this.currentPageIndex++;
            this.render();
            // Update submit button state after page change
            setTimeout(() => {
              this.updateSubmitButtonState();
            }, 100);
          }
        }
      });
      navContainer.appendChild(nextBtn);
    }

    return navContainer;
  }

  validateCurrentPage() {
    const currentPage = this.schema.pages[this.currentPageIndex];
    let isValid = true;

    currentPage.fields.forEach((field) => {
      if (!this.validateField(field.id)) {
        isValid = false;
      }
    });

    return isValid;
  }

  // Submission
  async handleSubmit(e) {
    e.preventDefault();

    if (!this.validate()) {
      this.announce('Please fix the errors before submitting');
      const firstError = this.container.querySelector('.form-field-error');
      if (firstError) {
        const input = firstError.querySelector('input, textarea, select');
        if (input) input.focus();
      }
      return;
    }

    const data = this.getData();

    if (this.onSubmit) {
      try {
        const submitBtn = this.container.querySelector('.form-submit-btn');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitting...';
        }

        const result = await this.onSubmit(data);

        if (result && result.success) {
          this.showSuccessMessage(result.message || this.schema.settings?.successMessage || 'Thank you!');
        } else {
          throw new Error(result?.message || 'Submission failed');
        }
      } catch (error) {
        this.announce(`Error: ${error.message}`);
        const submitBtn = this.container.querySelector('.form-submit-btn');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = this.schema.settings?.submitButtonText || 'Submit';
        }
      }
    }
  }

  updateSubmitButtonState() {
    const submitBtn = this.container.querySelector('.form-submit-btn');
    if (!submitBtn) return;

    // Don't update if button is already disabled during submission
    if (submitBtn.textContent === 'Submitting...') return;

    // Check if all required fields are valid
    let allRequiredValid = true;

    // For multi-page forms, only validate current page
    if (this.schema.settings?.multiPage) {
      const currentPage = this.schema.pages[this.currentPageIndex];
      if (currentPage && currentPage.fields) {
        currentPage.fields.forEach((field) => {
          if (field.required) {
            const fieldInfo = this.fieldElements.get(field.id);
            if (fieldInfo) {
              const value = this.getFieldValue(field.id);
              if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
                allRequiredValid = false;
              } else {
                // Also check if field has validation errors
                if (this.validationErrors.has(field.id)) {
                  allRequiredValid = false;
                }
              }
            } else {
              // Field not yet rendered, consider it invalid if required
              allRequiredValid = false;
            }
          }
        });
      }

      // Check repeatable sections on current page if any
      if (this.schema.repeatableSections) {
        this.schema.repeatableSections.forEach((section) => {
          const instances = this.repeatableInstances[section.id] || [];
          instances.forEach((instance, instanceIndex) => {
            section.fields.forEach((field) => {
              if (field.required) {
                const fieldId = `${section.id}[${instanceIndex}].${field.id}`;
                const fieldInfo = this.fieldElements.get(fieldId);
                if (fieldInfo) {
                  const value = this.getFieldValue(fieldId);
                  if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
                    allRequiredValid = false;
                  } else if (this.validationErrors.has(fieldId)) {
                    allRequiredValid = false;
                  }
                } else if (field.required) {
                  allRequiredValid = false;
                }
              }
            });
          });
        });
      }
    } else {
      // Single-page form - validate all fields
      this.fieldElements.forEach((fieldInfo, fieldId) => {
        // Check if fieldInfo exists and has field property
        if (!fieldInfo || !fieldInfo.field) return;
        const field = fieldInfo.field;
        if (field && field.required) {
          const value = this.getFieldValue(fieldId);
          if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
            allRequiredValid = false;
          } else if (this.validationErrors.has(fieldId)) {
            allRequiredValid = false;
          }
        }
      });

      // Check repeatable sections
      if (this.schema.repeatableSections) {
        this.schema.repeatableSections.forEach((section) => {
          const instances = this.repeatableInstances[section.id] || [];
          instances.forEach((instance, instanceIndex) => {
            section.fields.forEach((field) => {
              if (field.required) {
                const fieldId = `${section.id}[${instanceIndex}].${field.id}`;
                const fieldInfo = this.fieldElements.get(fieldId);
                if (fieldInfo) {
                  const value = this.getFieldValue(fieldId);
                  if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
                    allRequiredValid = false;
                  } else if (this.validationErrors.has(fieldId)) {
                    allRequiredValid = false;
                  }
                } else if (field.required) {
                  allRequiredValid = false;
                }
              }
            });
          });
        });
      }
    }

    // Update button state
    submitBtn.disabled = !allRequiredValid;
    if (allRequiredValid) {
      submitBtn.removeAttribute('aria-disabled');
      submitBtn.removeAttribute('title');
    } else {
      submitBtn.setAttribute('aria-disabled', 'true');
      submitBtn.title = 'Please complete all required fields';
    }
  }

  showSuccessMessage(message) {
    const form = this.container.querySelector('form');
    if (form) {
      form.style.display = 'none';
    }

    const successDiv = document.createElement('div');
    successDiv.className = 'form-success';
    successDiv.setAttribute('role', 'alert');
    successDiv.textContent = message;
    this.container.appendChild(successDiv);

    this.announce(message);
  }

  // Accessibility
  announce(message) {
    if (this.ariaLiveRegion) {
      this.ariaLiveRegion.textContent = message;
      // Clear after a moment so screen readers can re-announce if needed
      setTimeout(() => {
        this.ariaLiveRegion.textContent = '';
      }, 1000);
    }
  }
}

// Export for use in modules or global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormRuntime;
} else if (typeof window !== 'undefined') {
  window.FormRuntime = FormRuntime;
}





