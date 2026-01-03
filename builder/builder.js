/**
 * Form Builder Application
 */

class FormBuilder {
  constructor() {
    this.currentSchema = this.getDefaultSchema();
    this.selectedField = null;
    this.selectedFieldElement = null;

    this.init();
  }

  init() {
    try {
      this.setupEventListeners();
      this.loadSchema(this.currentSchema);
      // Delay drag and drop setup to ensure DOM is ready
      setTimeout(() => {
        this.setupDragAndDrop();
      }, 100);
    } catch (error) {
      console.error('Error in FormBuilder.init:', error);
    }
  }

  getDefaultSchema() {
    return {
      formId: `form-${Date.now()}`,
      version: '1.0',
      title: 'My Form',
      description: '',
      settings: {
        multiPage: false,
        progressBar: true,
        submitButtonText: 'Submit',
        successMessage: 'Thank you for your submission!',
        theme: 'default',
      },
      pages: [
        {
          id: 'page1',
          title: '',
          fields: [],
        },
      ],
    };
  }

  getDefaultApiEndpoint(connectorType) {
    // Try to detect current deployment URL
    const currentOrigin = window.location.origin;
    
    // If running on Vercel, use current origin
    if (currentOrigin.includes('vercel.app') || currentOrigin.includes('localhost')) {
      return `${currentOrigin}/api/connectors/${connectorType}`;
    }
    
    // Default placeholder
    return `https://your-app.vercel.app/api/connectors/${connectorType}`;
  }

  generateApiRequestBody(connectorType, config) {
    // Generate the request body structure for API calls
    // This will be stringified in the template
    const baseBody = {
      formData: 'data' // This will be replaced with actual data in the template
    };

    switch (connectorType) {
      case 'airtable':
        return `{
          formData: data,
          baseId: ${JSON.stringify(config.baseId || '')},
          tableName: ${JSON.stringify(config.tableName || '')},
          fieldMapping: ${JSON.stringify(config.fieldMapping || null)}
        }`;
      
      case 'google-sheets':
        return `{
          formData: data,
          spreadsheetId: ${JSON.stringify(config.spreadsheetId || '')},
          sheetName: ${JSON.stringify(config.sheetName || 'Sheet1')},
          fieldMapping: ${JSON.stringify(config.fieldMapping || null)},
          createSheet: ${config.createSheet ? 'true' : 'false'}
        }`;
      
      case 'notion':
        return `{
          formData: data,
          databaseId: ${JSON.stringify(config.databaseId || '')},
          propertyMapping: ${JSON.stringify(config.propertyMapping || null)}
        }`;
      
      case 'email':
        return `{
          formData: data,
          provider: ${JSON.stringify(config.provider || 'sendgrid')},
          to: ${JSON.stringify(config.to || '')},
          from: ${JSON.stringify(config.from || '')},
          subject: ${JSON.stringify(config.subject || 'Form Submission')},
          template: ${JSON.stringify(config.template || null)}
        }`;
      
      default:
        return `{ formData: data }`;
    }
  }

  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;
        if (tab) {
          this.switchTab(tab);
        }
      });
    });

    // JSON Editor
    const jsonEditor = document.getElementById('json-editor');
    if (jsonEditor) {
      jsonEditor.addEventListener('input', () => {
        this.handleJSONChange();
      });
    }

    // Import/Export
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');
    const exportBtn = document.getElementById('export-btn');
    const previewBtn = document.getElementById('preview-btn');

    if (importBtn && importFile) {
      importBtn.addEventListener('click', () => {
        importFile.click();
      });
      importFile.addEventListener('change', (e) => {
        this.handleImport(e);
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.handleExport();
      });
    }

    if (previewBtn) {
      previewBtn.addEventListener('click', () => {
        this.switchTab('preview');
      });
    }

    // Share button
    const shareBtn = document.getElementById('share-btn');
    const shareModal = document.getElementById('share-modal');
    const closeShareModal = document.getElementById('close-share-modal');

    if (shareBtn && shareModal) {
      shareBtn.addEventListener('click', () => {
        this.showShareModal();
      });
    }

    if (closeShareModal && shareModal) {
      closeShareModal.addEventListener('click', () => {
        shareModal.style.display = 'none';
      });
    }

    // Close modal on outside click
    if (shareModal) {
      shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
          shareModal.style.display = 'none';
        }
      });
    }

    // Form settings
    const formTitle = document.getElementById('form-title');
    const formDescription = document.getElementById('form-description');
    const multiPage = document.getElementById('multi-page');
    const progressBar = document.getElementById('progress-bar');

    if (formTitle) {
      formTitle.addEventListener('input', (e) => {
        this.currentSchema.title = e.target.value;
        this.updatePreview();
      });
    }

    if (formDescription) {
      formDescription.addEventListener('input', (e) => {
        this.currentSchema.description = e.target.value;
      });
    }

    if (multiPage) {
      multiPage.addEventListener('change', (e) => {
        if (!this.currentSchema.settings) {
          this.currentSchema.settings = {};
        }
        this.currentSchema.settings.multiPage = e.target.checked;
        
        // Show/hide multi-page controls
        const multiPageControls = document.getElementById('multi-page-controls');
        if (multiPageControls) {
          multiPageControls.style.display = e.target.checked ? 'block' : 'none';
        }
        
        // Initialize pages if enabling multi-page
        if (e.target.checked) {
          this.initializeMultiPage();
        }
        
        this.updatePagesList();
        this.updatePreview();
        this.updateJSONEditor();
      });
    }

    // Multi-page controls
    const addPageBtn = document.getElementById('add-page-btn');
    const currentPageSelect = document.getElementById('current-page-select');
    
    if (addPageBtn) {
      addPageBtn.addEventListener('click', () => {
        this.addPage();
      });
    }
    
    if (currentPageSelect) {
      currentPageSelect.addEventListener('change', (e) => {
        this.switchToPage(e.target.value);
      });
    }

    if (progressBar) {
      progressBar.addEventListener('change', (e) => {
        if (!this.currentSchema.settings) {
          this.currentSchema.settings = {};
        }
        this.currentSchema.settings.progressBar = e.target.checked;
        this.updatePreview();
      });
    }

    // Styling options
    const formTheme = document.getElementById('form-theme');
    const formPrimaryColor = document.getElementById('form-primary-color');
    const formTextColor = document.getElementById('form-text-color');
    const formBgColor = document.getElementById('form-bg-color');
    const formBorderColor = document.getElementById('form-border-color');
    const formFontFamily = document.getElementById('form-font-family');
    const formBorderRadius = document.getElementById('form-border-radius');
    const borderRadiusValue = document.getElementById('border-radius-value');

    if (formTheme) {
      formTheme.addEventListener('change', (e) => {
        if (!this.currentSchema.settings) {
          this.currentSchema.settings = {};
        }
        this.currentSchema.settings.theme = e.target.value;
        this.updatePreview();
      });
    }

    if (formPrimaryColor) {
      formPrimaryColor.addEventListener('input', (e) => {
        this.saveAndApplyStyle('primaryColor', e.target.value);
        this.updateFormStyle('--form-color-primary', e.target.value);
      });
    }

    if (formTextColor) {
      formTextColor.addEventListener('input', (e) => {
        this.saveAndApplyStyle('textColor', e.target.value);
        this.updateFormStyle('--form-color-text', e.target.value);
      });
    }

    if (formBgColor) {
      formBgColor.addEventListener('input', (e) => {
        this.saveAndApplyStyle('backgroundColor', e.target.value);
        this.updateFormStyle('--form-color-background', e.target.value);
      });
    }

    if (formBorderColor) {
      formBorderColor.addEventListener('input', (e) => {
        this.saveAndApplyStyle('borderColor', e.target.value);
        this.updateFormStyle('--form-color-border', e.target.value);
      });
    }

    if (formFontFamily) {
      formFontFamily.addEventListener('change', (e) => {
        this.saveAndApplyStyle('fontFamily', e.target.value);
        this.updateFormStyle('--form-font-family', e.target.value);
      });
    }

    if (formBorderRadius && borderRadiusValue) {
      formBorderRadius.addEventListener('input', (e) => {
        const value = e.target.value;
        borderRadiusValue.textContent = `${value}px`;
        this.saveAndApplyStyle('borderRadius', `${value}px`);
        this.updateFormStyle('--form-border-radius', `${value}px`);
      });
    }

    // Load saved styles
    this.loadSavedStyles();

    // Templates
    document.querySelectorAll('.template-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const template = e.target.dataset.template;
        if (template) {
          this.loadTemplate(template);
        }
      });
    });

    // Repeatable sections
    const addRepeatableBtn = document.getElementById('add-repeatable-section');
    if (addRepeatableBtn) {
      addRepeatableBtn.addEventListener('click', () => {
        this.addRepeatableSection();
      });
    }

    this.renderRepeatableSectionsList();
  }

  saveAndApplyStyle(property, value) {
    // Save to schema for persistence
    if (!this.currentSchema.settings) {
      this.currentSchema.settings = {};
    }
    if (!this.currentSchema.settings.customStyles) {
      this.currentSchema.settings.customStyles = {};
    }
    this.currentSchema.settings.customStyles[property] = value;
    
    // Apply to preview immediately
    this.updateFormStyle(this.getCSSVariableName(property), value);
    
    // Update JSON editor to show changes
    this.updateJSONEditor();
    
    // Re-apply styles after preview update
    setTimeout(() => {
      this.applyCustomStylesToPreview();
    }, 50);
  }

  getCSSVariableName(property) {
    const mapping = {
      'primaryColor': '--form-color-primary',
      'textColor': '--form-color-text',
      'backgroundColor': '--form-color-background',
      'borderColor': '--form-color-border',
      'fontFamily': '--form-font-family',
      'borderRadius': '--form-border-radius',
    };
    return mapping[property] || property;
  }

  loadSavedStyles() {
    const customStyles = this.currentSchema.settings?.customStyles;
    if (!customStyles) return;

    // Apply saved styles to preview
    Object.keys(customStyles).forEach(property => {
      const cssVar = this.getCSSVariableName(property);
      const value = customStyles[property];
      this.updateFormStyle(cssVar, value);
    });

    // Update form controls
    if (customStyles.primaryColor) {
      const input = document.getElementById('form-primary-color');
      if (input) input.value = customStyles.primaryColor;
    }
    if (customStyles.textColor) {
      const input = document.getElementById('form-text-color');
      if (input) input.value = customStyles.textColor;
    }
    if (customStyles.backgroundColor) {
      const input = document.getElementById('form-bg-color');
      if (input) input.value = customStyles.backgroundColor;
    }
    if (customStyles.borderColor) {
      const input = document.getElementById('form-border-color');
      if (input) input.value = customStyles.borderColor;
    }
    if (customStyles.fontFamily) {
      const select = document.getElementById('form-font-family');
      if (select) select.value = customStyles.fontFamily;
    }
    if (customStyles.borderRadius) {
      const slider = document.getElementById('form-border-radius');
      const display = document.getElementById('border-radius-value');
      if (slider && display) {
        const value = parseInt(customStyles.borderRadius);
        slider.value = value;
        display.textContent = `${value}px`;
      }
    }
  }

  updateFormStyle(property, value) {
    const previewContainer = document.getElementById('form-preview');
    if (previewContainer) {
      const formElement = previewContainer.querySelector('.form-runtime');
      if (formElement) {
        formElement.style.setProperty(property, value);
      }
    }
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach((content) => {
      content.classList.toggle('active', content.id === `${tabName}-tab`);
    });

    if (tabName === 'preview') {
      this.updatePreview();
    } else if (tabName === 'json') {
      this.updateJSONEditor();
    } else if (tabName === 'connectors') {
      this.loadConnectorConfig();
    }
  }

  handleJSONChange() {
    const jsonEditor = document.getElementById('json-editor');
    const errorsDiv = document.getElementById('json-errors');

    try {
      const schema = JSON.parse(jsonEditor.value);
      this.currentSchema = schema;
      this.loadSchema(schema);
      errorsDiv.classList.remove('show');
      this.updatePreview();
    } catch (error) {
      errorsDiv.textContent = `JSON Error: ${error.message}`;
      errorsDiv.classList.add('show');
    }
  }

  updateJSONEditor() {
    const jsonEditor = document.getElementById('json-editor');
    jsonEditor.value = JSON.stringify(this.currentSchema, null, 2);
  }

  loadSchema(schema) {
    this.currentSchema = schema;
    this.updateJSONEditor();
    this.updateFormSettings();
    this.renderFormCanvas();
    this.updatePreview();
  }

  updateFormSettings() {
    const formTitle = document.getElementById('form-title');
    const formDescription = document.getElementById('form-description');
    const multiPage = document.getElementById('multi-page');
    const progressBar = document.getElementById('progress-bar');
    const formTheme = document.getElementById('form-theme');

    if (formTitle) formTitle.value = this.currentSchema.title || '';
    if (formDescription) formDescription.value = this.currentSchema.description || '';
    if (multiPage) {
      multiPage.checked = this.currentSchema.settings?.multiPage || false;
      // Show/hide multi-page controls
      const multiPageControls = document.getElementById('multi-page-controls');
      if (multiPageControls) {
        multiPageControls.style.display = multiPage.checked ? 'block' : 'none';
      }
    }
    if (progressBar) progressBar.checked = this.currentSchema.settings?.progressBar !== false;
    if (formTheme) formTheme.value = this.currentSchema.settings?.theme || 'default';
    
    // Update pages list if multi-page is enabled
    if (multiPage && multiPage.checked) {
      this.updatePagesList();
    }
  }

  initializeMultiPage() {
    // Ensure we have at least one page
    if (!this.currentSchema.pages || this.currentSchema.pages.length === 0) {
      this.currentSchema.pages = [{ id: 'page1', title: 'Page 1', fields: [] }];
    }
    
    // Ensure all pages have IDs
    this.currentSchema.pages.forEach((page, index) => {
      if (!page.id) {
        page.id = `page${index + 1}`;
      }
      if (!page.title) {
        page.title = `Page ${index + 1}`;
      }
    });
  }

  updatePagesList() {
    const pagesList = document.getElementById('pages-list');
    const currentPageSelect = document.getElementById('current-page-select');
    if (!pagesList || !currentPageSelect) return;

    if (!this.currentSchema.pages || this.currentSchema.pages.length === 0) {
      pagesList.innerHTML = '<p style="color:#999;font-size:0.875rem;">No pages</p>';
      currentPageSelect.innerHTML = '';
      return;
    }

    // Update pages list
    pagesList.innerHTML = '';
    this.currentSchema.pages.forEach((page, index) => {
      const pageItem = document.createElement('div');
      pageItem.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:0.5rem;margin:0.25rem 0;background:#f5f5f5;border-radius:4px;';
      pageItem.innerHTML = `
        <span style="font-weight:500;">${page.title || page.id || `Page ${index + 1}`}</span>
        <div>
          <button type="button" class="edit-page-btn" data-page-id="${page.id}" style="background:none;border:none;cursor:pointer;color:#0066cc;margin-right:0.5rem;">Edit</button>
          ${this.currentSchema.pages.length > 1 ? `<button type="button" class="remove-page-btn" data-page-id="${page.id}" style="background:none;border:none;cursor:pointer;color:#cc0000;">×</button>` : ''}
        </div>
      `;
      
      const editBtn = pageItem.querySelector('.edit-page-btn');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          this.editPage(page.id);
        });
      }
      
      const removeBtn = pageItem.querySelector('.remove-page-btn');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          this.removePage(page.id);
        });
      }
      
      pagesList.appendChild(pageItem);
    });

    // Update page selector
    currentPageSelect.innerHTML = '';
    this.currentSchema.pages.forEach((page, index) => {
      const option = document.createElement('option');
      option.value = page.id;
      option.textContent = page.title || page.id || `Page ${index + 1}`;
      if (index === 0) option.selected = true;
      currentPageSelect.appendChild(option);
    });
  }

  addPage() {
    if (!this.currentSchema.pages) {
      this.currentSchema.pages = [];
    }
    
    const pageNumber = this.currentSchema.pages.length + 1;
    const newPage = {
      id: `page${pageNumber}`,
      title: `Page ${pageNumber}`,
      fields: [],
    };
    
    this.currentSchema.pages.push(newPage);
    this.updatePagesList();
    this.switchToPage(newPage.id);
    this.updateJSONEditor();
    this.updatePreview();
  }

  removePage(pageId) {
    if (!this.currentSchema.pages || this.currentSchema.pages.length <= 1) {
      alert('Cannot remove the last page. Forms must have at least one page.');
      return;
    }

    const pageIndex = this.currentSchema.pages.findIndex(p => p.id === pageId);
    if (pageIndex === -1) return;

    // Move fields to first page if removing a page with fields
    const pageToRemove = this.currentSchema.pages[pageIndex];
    if (pageToRemove.fields && pageToRemove.fields.length > 0) {
      if (confirm(`This page has ${pageToRemove.fields.length} field(s). Move them to Page 1?`)) {
        if (!this.currentSchema.pages[0].fields) {
          this.currentSchema.pages[0].fields = [];
        }
        this.currentSchema.pages[0].fields.push(...pageToRemove.fields);
      }
    }

    this.currentSchema.pages.splice(pageIndex, 1);
    
    // Switch to first page
    this.switchToPage(this.currentSchema.pages[0].id);
    this.updatePagesList();
    this.updateJSONEditor();
    this.updatePreview();
  }

  switchToPage(pageId) {
    const page = this.currentSchema.pages.find(p => p.id === pageId);
    if (!page) return;

    // Update selector
    const currentPageSelect = document.getElementById('current-page-select');
    if (currentPageSelect) {
      currentPageSelect.value = pageId;
    }

    // Re-render canvas with this page's fields
    this.renderFormCanvas();
  }

  editPage(pageId) {
    const page = this.currentSchema.pages.find(p => p.id === pageId);
    if (!page) return;

    const newTitle = prompt('Enter page title:', page.title || page.id);
    if (newTitle !== null && newTitle.trim() !== '') {
      page.title = newTitle.trim();
      this.updatePagesList();
      this.updateJSONEditor();
      this.updatePreview();
    }
  }

  getCurrentPage() {
    const currentPageSelect = document.getElementById('current-page-select');
    if (!currentPageSelect || !this.currentSchema.pages) {
      return this.currentSchema.pages?.[0];
    }
    
    const pageId = currentPageSelect.value;
    return this.currentSchema.pages.find(p => p.id === pageId) || this.currentSchema.pages[0];
  }

  renderFormCanvas() {
    const canvas = document.getElementById('form-canvas');
    if (!canvas) return;
    
    canvas.innerHTML = '';

    if (!this.currentSchema.pages || this.currentSchema.pages.length === 0) {
      canvas.innerHTML = '<div class="canvas-drop-zone"><p>Drag fields here or click to add</p></div>';
      return;
    }

    const currentPage = this.getCurrentPage();
    if (!currentPage) {
      canvas.innerHTML = '<div class="canvas-drop-zone"><p>Drag fields here or click to add</p></div>';
      return;
    }

    // Show page title if multi-page
    if (this.currentSchema.settings?.multiPage) {
      const pageHeader = document.createElement('div');
      pageHeader.style.cssText = 'padding:0.75rem;background:#f0f7ff;border:1px solid #0066cc;border-radius:4px;margin-bottom:0.5rem;';
      pageHeader.innerHTML = `<strong>${currentPage.title || currentPage.id}</strong>`;
      canvas.appendChild(pageHeader);
    }

    if (!currentPage.fields || currentPage.fields.length === 0) {
      const dropZone = document.createElement('div');
      dropZone.className = 'canvas-drop-zone';
      dropZone.innerHTML = '<p>Drag fields here or click to add</p>';
      canvas.appendChild(dropZone);
    } else {
      currentPage.fields.forEach((field, index) => {
        const fieldElement = this.createFieldElement(field, index);
        if (fieldElement) {
          canvas.appendChild(fieldElement);
        }
      });
    }

    // Setup drag and drop for reordering
    this.setupFieldReordering();
  }

  createFieldElement(field, index) {
    if (!field) return null;
    
    const div = document.createElement('div');
    div.className = 'form-field-item';
    div.dataset.fieldIndex = index;
    div.dataset.fieldId = field.id;
    div.draggable = true; // Make field draggable for reordering

    // Drag handle icon
    const dragHandle = document.createElement('span');
    dragHandle.className = 'field-drag-handle';
    dragHandle.textContent = '☰';
    dragHandle.style.cssText = 'cursor:move;margin-right:0.5rem;color:#999;font-size:1.2rem;user-select:none;';
    dragHandle.setAttribute('draggable', 'false'); // Prevent handle from interfering
    div.appendChild(dragHandle);

    const label = document.createElement('div');
    label.className = 'field-label';
    label.textContent = `${(field.type || 'text').toUpperCase()}: ${field.label || field.id || 'Untitled'}`;
    label.style.flex = '1';
    div.appendChild(label);

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.className = 'field-remove-btn';
    removeBtn.type = 'button';
    removeBtn.style.cssText = 'background:none;border:none;cursor:pointer;font-size:1.5rem;color:#999;padding:0;width:24px;height:24px;line-height:24px;flex-shrink:0;';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.removeField(index);
    });
    div.appendChild(removeBtn);

    // Add click handler - make sure it works even with draggable
    let isDragging = false;
    let mouseDownTime = 0;
    let mouseDownX = 0;
    let mouseDownY = 0;

    div.addEventListener('mousedown', (e) => {
      mouseDownTime = Date.now();
      mouseDownX = e.clientX;
      mouseDownY = e.clientY;
      isDragging = false;
    });

    div.addEventListener('mousemove', (e) => {
      if (mouseDownTime > 0) {
        const deltaX = Math.abs(e.clientX - mouseDownX);
        const deltaY = Math.abs(e.clientY - mouseDownY);
        if (deltaX > 5 || deltaY > 5) {
          isDragging = true;
        }
      }
    });

    div.addEventListener('click', (e) => {
      // Don't select if clicking drag handle or remove button
      const isRemoveBtn = e.target === removeBtn || 
                          removeBtn.contains(e.target) || 
                          e.target.className === 'field-remove-btn' ||
                          e.target.closest('.field-remove-btn');
      const isDragHandle = e.target === dragHandle || 
                          dragHandle.contains(e.target) || 
                          e.target.className === 'field-drag-handle' ||
                          e.target.closest('.field-drag-handle');
      
      // Only select if it was a click (not a drag) and not on special buttons
      if (!isRemoveBtn && !isDragHandle && !isDragging && (Date.now() - mouseDownTime < 300)) {
        e.stopPropagation();
        e.preventDefault();
        this.selectField(field, div);
      }
      isDragging = false;
      mouseDownTime = 0;
    });

    return div;
  }

  selectField(field, element) {
    // Deselect previous
    if (this.selectedFieldElement) {
      this.selectedFieldElement.classList.remove('selected');
    }

    // Select new
    this.selectedField = field;
    this.selectedFieldElement = element;
    element.classList.add('selected');

    // Show field config panel
    this.showFieldConfig(field);
  }

  showFieldConfig(field) {
    const configPanel = document.getElementById('field-config');
    const configContent = document.getElementById('field-config-content');
    if (!configPanel || !configContent) return;
    
    configPanel.style.display = 'block';

    const escapedId = (field.id || '').replace(/"/g, '&quot;');
    const escapedLabel = (field.label || '').replace(/"/g, '&quot;');
    const escapedPlaceholder = (field.placeholder || '').replace(/"/g, '&quot;');

    configContent.innerHTML = `
      <div class="config-group">
        <label>Field ID</label>
        <input type="text" id="config-field-id" value="${escapedId}">
      </div>
      <div class="config-group">
        <label>Label</label>
        <input type="text" id="config-field-label" value="${escapedLabel}">
      </div>
      <div class="config-group">
        <label>Placeholder</label>
        <input type="text" id="config-field-placeholder" value="${escapedPlaceholder}">
      </div>
      <div class="config-group">
        <label>
          <input type="checkbox" id="config-field-required" ${field.required ? 'checked' : ''}>
          Required
        </label>
      </div>
      ${this.getFieldTypeSpecificConfig(field)}
      ${this.getConditionalLogicConfig(field)}
      <button class="btn btn-primary" id="save-field-config" type="button">Save</button>
    `;

    // Add event listeners
    const saveBtn = document.getElementById('save-field-config');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveFieldConfig(field);
      });
    }

    // Add option management for select/radio/checkboxes
    if (field.type === 'select' || field.type === 'radio' || field.type === 'checkboxes') {
      const addOptionBtn = document.getElementById('add-option');
      if (addOptionBtn) {
        addOptionBtn.addEventListener('click', () => {
          const optionsDiv = document.getElementById('field-options');
          if (optionsDiv) {
            const newOption = document.createElement('div');
            newOption.style.cssText = 'display:flex;gap:0.5rem;margin-bottom:0.5rem;';
            newOption.innerHTML = `
              <input type="text" placeholder="Value" class="option-value" value="">
              <input type="text" placeholder="Label" class="option-label" value="">
              <button type="button" class="remove-option" style="background:none;border:none;cursor:pointer;color:#999;">×</button>
            `;
            optionsDiv.appendChild(newOption);
            
            // Add remove listener
            const removeBtn = newOption.querySelector('.remove-option');
            if (removeBtn) {
              removeBtn.addEventListener('click', () => {
                newOption.remove();
              });
            }
          }
        });
      }

      // Add remove listeners to existing options
      document.querySelectorAll('.remove-option').forEach((btn) => {
        if (!btn.closest('.conditional-rule')) {
          btn.addEventListener('click', (e) => {
            e.target.closest('div').remove();
          });
        }
      });
    }

    // Add conditional logic management
    this.setupConditionalLogicHandlers(field);
  }

  setupConditionalLogicHandlers(field) {
    const addRuleBtn = document.getElementById('add-conditional-rule');
    if (addRuleBtn) {
      addRuleBtn.addEventListener('click', () => {
        const rulesDiv = document.getElementById('conditional-rules');
        if (rulesDiv) {
          // Remove "no rules" message if present
          if (rulesDiv.querySelector('p')) {
            rulesDiv.innerHTML = '';
          }

          const availableFields = this.getAllFieldIds().filter(id => id !== field.id);
          const fieldsOptions = availableFields.map(id => `<option value="${id}">${id}</option>`).join('');

          const newRule = document.createElement('div');
          newRule.className = 'conditional-rule';
          newRule.style.cssText = 'display:flex;gap:0.5rem;margin-bottom:0.5rem;align-items:center;padding:0.5rem;background:#f5f5f5;border-radius:4px;';
          newRule.innerHTML = `
            <select class="rule-field" style="flex:1;">
              <option value="">Select field...</option>
              ${fieldsOptions}
            </select>
            <select class="rule-operator" style="flex:1;">
              <option value="equals">equals</option>
              <option value="notEquals">not equals</option>
              <option value="contains">contains</option>
              <option value="notContains">not contains</option>
              <option value="greaterThan">greater than</option>
              <option value="lessThan">less than</option>
            </select>
            <input type="text" class="rule-value" placeholder="Value" style="flex:1;">
            <button type="button" class="remove-rule" style="background:none;border:none;cursor:pointer;color:#999;">×</button>
          `;
          rulesDiv.appendChild(newRule);

          // Add remove listener
          const removeBtn = newRule.querySelector('.remove-rule');
          if (removeBtn) {
            removeBtn.addEventListener('click', () => {
              newRule.remove();
              // Show "no rules" message if no rules left
              if (rulesDiv.querySelectorAll('.conditional-rule').length === 0) {
                rulesDiv.innerHTML = '<p style="color:#999;font-size:0.875rem;">No rules. This field is always visible.</p>';
              }
              // Hide logic selector if less than 2 rules
              const logicSelect = document.getElementById('conditional-logic');
              if (logicSelect && rulesDiv.querySelectorAll('.conditional-rule').length < 2) {
                logicSelect.closest('div').style.display = 'none';
              }
            });
          }

          // Show logic selector if we have 2+ rules
          if (rulesDiv.querySelectorAll('.conditional-rule').length >= 2) {
            const logicDiv = document.getElementById('conditional-logic')?.closest('div');
            if (logicDiv) logicDiv.style.display = 'block';
          }
        }
      });
    }

    // Add remove listeners to existing rules
    document.querySelectorAll('.remove-rule').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const rule = e.target.closest('.conditional-rule');
        if (rule) {
          rule.remove();
          const rulesDiv = document.getElementById('conditional-rules');
          if (rulesDiv && rulesDiv.querySelectorAll('.conditional-rule').length === 0) {
            rulesDiv.innerHTML = '<p style="color:#999;font-size:0.875rem;">No rules. This field is always visible.</p>';
          }
          const logicSelect = document.getElementById('conditional-logic');
          if (logicSelect && rulesDiv && rulesDiv.querySelectorAll('.conditional-rule').length < 2) {
            logicSelect.closest('div').style.display = 'none';
          }
        }
      });
    });
  }

  getFieldTypeSpecificConfig(field) {
    if (field.type === 'select' || field.type === 'radio' || field.type === 'checkboxes') {
      const options = field.options || [{ value: 'option1', label: 'Option 1' }, { value: 'option2', label: 'Option 2' }];
      const optionsHTML = options
        .map(
          (opt) => {
            const escapedValue = (opt.value || '').replace(/"/g, '&quot;');
            const escapedLabel = (opt.label || '').replace(/"/g, '&quot;');
            return `
        <div style="display:flex;gap:0.5rem;margin-bottom:0.5rem;">
          <input type="text" placeholder="Value" class="option-value" value="${escapedValue}">
          <input type="text" placeholder="Label" class="option-label" value="${escapedLabel}">
          <button type="button" class="remove-option" style="background:none;border:none;cursor:pointer;color:#999;">×</button>
        </div>
      `;
          }
        )
        .join('');
      return `
        <div class="config-group">
          <label>Options</label>
          <div id="field-options">${optionsHTML}</div>
          <button type="button" class="btn btn-secondary" id="add-option" style="margin-top:0.5rem;">Add Option</button>
        </div>
      `;
    }
    return '';
  }

  getConditionalLogicConfig(field) {
    const conditionalDisplay = field.conditionalDisplay || { rules: [], logic: 'AND' };
    const rules = conditionalDisplay.rules || [];
    
    // Get all available fields for the dropdown
    const availableFields = this.getAllFieldIds().filter(id => id !== field.id);
    const fieldsOptions = availableFields.map(id => `<option value="${id}">${id}</option>`).join('');

    const rulesHTML = rules.map((rule, index) => {
      const escapedValue = (rule.value || '').replace(/"/g, '&quot;');
      return `
        <div class="conditional-rule" data-rule-index="${index}" style="display:flex;gap:0.5rem;margin-bottom:0.5rem;align-items:center;padding:0.5rem;background:#f5f5f5;border-radius:4px;">
          <select class="rule-field" style="flex:1;">
            <option value="">Select field...</option>
            ${fieldsOptions}
          </select>
          <select class="rule-operator" style="flex:1;">
            <option value="equals" ${rule.operator === 'equals' ? 'selected' : ''}>equals</option>
            <option value="notEquals" ${rule.operator === 'notEquals' ? 'selected' : ''}>not equals</option>
            <option value="contains" ${rule.operator === 'contains' ? 'selected' : ''}>contains</option>
            <option value="notContains" ${rule.operator === 'notContains' ? 'selected' : ''}>not contains</option>
            <option value="greaterThan" ${rule.operator === 'greaterThan' ? 'selected' : ''}>greater than</option>
            <option value="lessThan" ${rule.operator === 'lessThan' ? 'selected' : ''}>less than</option>
          </select>
          <input type="text" class="rule-value" placeholder="Value" value="${escapedValue}" style="flex:1;">
          <button type="button" class="remove-rule" style="background:none;border:none;cursor:pointer;color:#999;">×</button>
        </div>
      `;
    }).join('');

    return `
      <div class="config-group" style="margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid #ddd;">
        <label><strong>Conditional Logic</strong></label>
        <p style="font-size:0.875rem;color:#666;margin:0.5rem 0;">Show this field when:</p>
        <div id="conditional-rules">
          ${rulesHTML || '<p style="color:#999;font-size:0.875rem;">No rules. This field is always visible.</p>'}
        </div>
        <button type="button" class="btn btn-secondary" id="add-conditional-rule" style="margin-top:0.5rem;">Add Rule</button>
        ${rules.length > 1 ? `
          <div style="margin-top:0.5rem;">
            <label>Logic:</label>
            <select id="conditional-logic" style="margin-left:0.5rem;">
              <option value="AND" ${conditionalDisplay.logic === 'AND' ? 'selected' : ''}>AND (all rules must match)</option>
              <option value="OR" ${conditionalDisplay.logic === 'OR' ? 'selected' : ''}>OR (any rule can match)</option>
            </select>
          </div>
        ` : ''}
      </div>
    `;
  }

  getAllFieldIds() {
    const fields = [];
    if (this.currentSchema.pages) {
      this.currentSchema.pages.forEach(page => {
        if (page.fields) {
          page.fields.forEach(field => {
            if (field.id) fields.push(field.id);
          });
        }
      });
    }
    return fields;
  }

  saveFieldConfig(field) {
    field.id = document.getElementById('config-field-id').value;
    field.label = document.getElementById('config-field-label').value;
    field.placeholder = document.getElementById('config-field-placeholder').value;
    field.required = document.getElementById('config-field-required').checked;

    // Handle options
    if (field.type === 'select' || field.type === 'radio' || field.type === 'checkboxes') {
      const optionValues = Array.from(document.querySelectorAll('.option-value'));
      const optionLabels = Array.from(document.querySelectorAll('.option-label'));
      field.options = optionValues
        .map((val, i) => ({
          value: val.value,
          label: optionLabels[i].value,
        }))
        .filter((opt) => opt.value && opt.label);
    }

    // Handle conditional logic
    const rules = Array.from(document.querySelectorAll('.conditional-rule'));
    if (rules.length > 0) {
      field.conditionalDisplay = {
        rules: rules.map(rule => {
          const fieldSelect = rule.querySelector('.rule-field');
          const operatorSelect = rule.querySelector('.rule-operator');
          const valueInput = rule.querySelector('.rule-value');
          return {
            field: fieldSelect?.value || '',
            operator: operatorSelect?.value || 'equals',
            value: valueInput?.value || '',
          };
        }).filter(rule => rule.field && rule.value),
        logic: document.getElementById('conditional-logic')?.value || 'AND',
      };
      // Remove conditionalDisplay if no valid rules
      if (field.conditionalDisplay.rules.length === 0) {
        delete field.conditionalDisplay;
      }
    } else {
      delete field.conditionalDisplay;
    }

    this.renderFormCanvas();
    this.updateJSONEditor();
    this.updatePreview();
  }

  setupDragAndDrop() {
    // Field palette items - use event delegation in case items are added later
    const palette = document.getElementById('field-palette');
    if (palette) {
      palette.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('field-palette-item') || e.target.closest('.field-palette-item')) {
          const item = e.target.classList.contains('field-palette-item') ? e.target : e.target.closest('.field-palette-item');
          e.dataTransfer.setData('field-type', item.dataset.type);
          e.dataTransfer.effectAllowed = 'copy';
        }
      });
    }

    // Canvas drop zone - wait for it to exist
    const setupCanvasDrop = () => {
      const canvas = document.getElementById('form-canvas');
      if (!canvas) {
        setTimeout(setupCanvasDrop, 100);
        return;
      }

      canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Check if dragging a field item (reordering) or new field from palette
        const draggedField = document.querySelector('.form-field-item.dragging');
        if (draggedField) {
          e.dataTransfer.dropEffect = 'move';
          this.handleFieldDragOver(e, canvas);
        } else {
          e.dataTransfer.dropEffect = 'copy';
          canvas.classList.add('drag-over');
        }
      });

      canvas.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!canvas.contains(e.relatedTarget)) {
          canvas.classList.remove('drag-over');
          this.clearDragIndicators();
        }
      });

      canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        canvas.classList.remove('drag-over');
        this.clearDragIndicators();
        
        const fieldType = e.dataTransfer.getData('field-type');
        const draggedIndex = e.dataTransfer.getData('field-index');
        
        if (draggedIndex !== '') {
          // Reordering existing field
          this.handleFieldDrop(e, parseInt(draggedIndex));
        } else if (fieldType) {
          // Adding new field from palette
          this.addField(fieldType);
        }
      });

      // Click to add field
      canvas.addEventListener('click', (e) => {
        if (e.target.classList.contains('canvas-drop-zone') || e.target.closest('.canvas-drop-zone')) {
          // Simple prompt to add a text field
          this.addField('text');
        }
      });
    };

    setupCanvasDrop();
  }

  setupFieldReordering() {
    const canvas = document.getElementById('form-canvas');
    if (!canvas) return;

    const fieldItems = canvas.querySelectorAll('.form-field-item');
    const currentPage = this.getCurrentPage();
    if (!currentPage || !currentPage.fields) return;
    
    fieldItems.forEach((item) => {
      const fieldIndex = parseInt(item.dataset.fieldIndex);
      if (!currentPage.fields || !currentPage.fields[fieldIndex]) return;
      
      const field = currentPage.fields[fieldIndex];
      const removeBtn = item.querySelector('.field-remove-btn');
      const dragHandle = item.querySelector('.field-drag-handle');
      
      // Setup drag for reordering
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('field-index', item.dataset.fieldIndex);
        e.dataTransfer.setData('page-id', currentPage.id);
        e.dataTransfer.effectAllowed = 'move';
        item.classList.add('dragging');
        e.dataTransfer.setDragImage(item, 0, 0);
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        this.clearDragIndicators();
      });

      // Re-add click handler (in case it was lost)
      item.addEventListener('click', (e) => {
        // Don't select if clicking drag handle or remove button
        if (e.target !== removeBtn && 
            !removeBtn?.contains(e.target) && 
            e.target !== dragHandle && 
            !dragHandle?.contains(e.target) &&
            e.target.className !== 'field-remove-btn' &&
            e.target.className !== 'field-drag-handle') {
          this.selectField(field, item);
        }
      });
    });
  }

  handleFieldDragOver(e, canvas) {
    const dragging = canvas.querySelector('.form-field-item.dragging');
    if (!dragging) return;

    const afterElement = this.getDragAfterElement(canvas, e.clientY);
    const fieldItems = canvas.querySelectorAll('.form-field-item:not(.dragging)');
    
    // Clear previous indicators
    this.clearDragIndicators();

    if (afterElement == null) {
      // Drop at end
      const dropIndicator = document.createElement('div');
      dropIndicator.className = 'drop-indicator';
      dropIndicator.style.cssText = 'height:2px;background:#0066cc;margin:0.5rem 0;border-radius:1px;';
      canvas.appendChild(dropIndicator);
    } else {
      // Drop before element
      const dropIndicator = document.createElement('div');
      dropIndicator.className = 'drop-indicator';
      dropIndicator.style.cssText = 'height:2px;background:#0066cc;margin:0.5rem 0;border-radius:1px;';
      canvas.insertBefore(dropIndicator, afterElement);
    }
  }

  getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.form-field-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  handleFieldDrop(e, draggedIndex) {
    const canvas = document.getElementById('form-canvas');
    if (!canvas) return;

    const pageId = e.dataTransfer.getData('page-id');
    const currentPage = this.getCurrentPage();
    if (!currentPage || !currentPage.fields) return;
    
    // Only allow drop if it's on the same page
    if (pageId && currentPage.id !== pageId) {
      return;
    }

    const afterElement = this.getDragAfterElement(canvas, e.clientY);

    // Remove dragged field from array
    const draggedField = currentPage.fields.splice(draggedIndex, 1)[0];

    // Insert at new position
    if (afterElement == null) {
      // Insert at end
      currentPage.fields.push(draggedField);
    } else {
      // Insert before element
      const afterIndex = parseInt(afterElement.dataset.fieldIndex);
      const insertIndex = afterIndex > draggedIndex ? afterIndex - 1 : afterIndex;
      currentPage.fields.splice(insertIndex, 0, draggedField);
    }

    // Re-render canvas
    this.renderFormCanvas();
    this.updateJSONEditor();
    this.updatePreview();
  }

  clearDragIndicators() {
    const canvas = document.getElementById('form-canvas');
    if (canvas) {
      const indicators = canvas.querySelectorAll('.drop-indicator');
      indicators.forEach(indicator => indicator.remove());
    }
  }

  addField(type) {
    if (!this.currentSchema.pages || this.currentSchema.pages.length === 0) {
      this.currentSchema.pages = [{ id: 'page1', title: '', fields: [] }];
    }

    const page = this.getCurrentPage() || this.currentSchema.pages[0];
    if (!page.fields) {
      page.fields = [];
    }
    
    const fieldId = `field_${Date.now()}`;
    const newField = {
      id: fieldId,
      type: type,
      label: this.getFieldTypeLabel(type),
      required: false,
    };

    // Add default options for select/radio/checkboxes
    if (type === 'select' || type === 'radio' || type === 'checkboxes') {
      newField.options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ];
    }

    page.fields.push(newField);
    this.renderFormCanvas();
    this.updateJSONEditor();
    this.updatePreview();
  }

  getFieldTypeLabel(type) {
    const labels = {
      text: 'Text Input',
      textarea: 'Textarea',
      email: 'Email',
      number: 'Number',
      tel: 'Phone',
      url: 'URL',
      date: 'Date',
      select: 'Select',
      radio: 'Radio Buttons',
      checkboxes: 'Checkboxes',
      file: 'File Upload',
      header: 'Header',
      paragraph: 'Paragraph',
    };
    return labels[type] || type;
  }

  removeField(index) {
    const page = this.getCurrentPage();
    if (page && page.fields) {
      page.fields.splice(index, 1);
      this.renderFormCanvas();
      this.updateJSONEditor();
      this.updatePreview();
    }
  }

  updatePreview() {
    const previewContainer = document.getElementById('form-preview');
    if (!previewContainer) return;

    previewContainer.innerHTML = '';

    try {
      if (typeof FormRuntime !== 'undefined') {
        // Create a wrapper div to hold title/description and form
        const wrapper = document.createElement('div');
        wrapper.className = 'form-preview-wrapper';
        
        // Show title and description before form
        if (this.currentSchema.title || this.currentSchema.description) {
          const header = document.createElement('div');
          header.className = 'form-preview-header';
          header.style.cssText = 'margin-bottom: 1.5rem; padding: 1rem; background: #f9f9f9; border-radius: 4px;';
          if (this.currentSchema.title) {
            const titleEl = document.createElement('h1');
            titleEl.textContent = this.currentSchema.title;
            titleEl.style.cssText = 'margin: 0 0 0.5rem 0; font-size: 1.5rem; font-weight: 600;';
            header.appendChild(titleEl);
          }
          if (this.currentSchema.description) {
            const descEl = document.createElement('p');
            descEl.textContent = this.currentSchema.description;
            descEl.style.cssText = 'margin: 0; color: #666; line-height: 1.5;';
            header.appendChild(descEl);
          }
          wrapper.appendChild(header);
        }

        // Create a container for the form runtime
        const formContainer = document.createElement('div');
        formContainer.className = 'form-runtime-container';
        wrapper.appendChild(formContainer);
        previewContainer.appendChild(wrapper);

        const form = new FormRuntime({
          schema: this.currentSchema,
          container: formContainer,
          theme: this.currentSchema.settings?.theme || 'default',
          onSubmit: async (data) => {
            console.log('Form submitted:', data);
            return { success: true, message: 'Preview submission (not saved)' };
          },
        });
        form.render();
        
        // Apply custom styles after rendering
        setTimeout(() => {
          this.applyCustomStylesToPreview();
        }, 200);
      } else {
        previewContainer.innerHTML = '<p>Form Runtime not loaded</p>';
      }
    } catch (error) {
      previewContainer.innerHTML = `<p style="color:red;">Error rendering preview: ${error.message}</p>`;
    }
  }

  applyCustomStylesToPreview() {
    const customStyles = this.currentSchema.settings?.customStyles;
    if (!customStyles) return;

    const previewContainer = document.getElementById('form-preview');
    if (!previewContainer) return;

    // Find the form runtime container - this is where we'll apply the CSS variables
    let formElement = previewContainer.querySelector('.form-runtime-container');
    if (!formElement) {
      formElement = previewContainer.querySelector('.form-runtime');
    }
    if (!formElement) {
      // Try finding the form element itself
      formElement = previewContainer.querySelector('form');
    }
    if (!formElement) {
      // Last resort - apply to the wrapper
      formElement = previewContainer.querySelector('.form-preview-wrapper');
    }
    if (!formElement) return;

    // Apply custom styles as CSS variables to the form runtime container
    // This ensures all child elements inherit the variables
    Object.keys(customStyles).forEach(property => {
      const cssVar = this.getCSSVariableName(property);
      const value = customStyles[property];
      if (cssVar && value) {
        formElement.style.setProperty(cssVar, value);
        // Also apply to the form element if it exists
        const form = formElement.querySelector('form');
        if (form) {
          form.style.setProperty(cssVar, value);
        }
      }
    });
  }

  handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const schema = JSON.parse(event.target.result);
        this.loadSchema(schema);
      } catch (error) {
        alert(`Error importing file: ${error.message}`);
      }
    };
    reader.readAsText(file);
  }

  handleExport() {
    const json = JSON.stringify(this.currentSchema, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.currentSchema.formId || 'form'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  renderRepeatableSectionsList() {
    const list = document.getElementById('repeatable-sections-list');
    if (!list) return;

    list.innerHTML = '';

    if (!this.currentSchema.repeatableSections || this.currentSchema.repeatableSections.length === 0) {
      list.innerHTML = '<p style="color:#999;font-size:0.875rem;margin-top:0.5rem;">No repeatable sections</p>';
      return;
    }

    this.currentSchema.repeatableSections.forEach((section, index) => {
      const item = document.createElement('div');
      item.className = 'repeatable-section-item';
      item.style.cssText = 'padding:0.5rem;margin:0.5rem 0;background:#fff;border:1px solid #ddd;border-radius:4px;cursor:pointer;';
      item.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:500;">${section.title || section.id || 'Untitled Section'}</span>
          <button type="button" class="remove-repeatable-section" data-index="${index}" style="background:none;border:none;cursor:pointer;color:#999;">×</button>
        </div>
      `;
      
      item.addEventListener('click', (e) => {
        if (!e.target.classList.contains('remove-repeatable-section')) {
          this.editRepeatableSection(section, index);
        }
      });

      const removeBtn = item.querySelector('.remove-repeatable-section');
      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.removeRepeatableSection(index);
        });
      }

      list.appendChild(item);
    });
  }

  addRepeatableSection() {
    if (!this.currentSchema.repeatableSections) {
      this.currentSchema.repeatableSections = [];
    }

    const sectionId = `section_${Date.now()}`;
    const newSection = {
      id: sectionId,
      title: 'New Section',
      addButtonText: 'Add Another',
      removeButtonText: 'Remove',
      minInstances: 1,
      maxInstances: 10,
      fields: [],
    };

    this.currentSchema.repeatableSections.push(newSection);
    this.renderRepeatableSectionsList();
    this.editRepeatableSection(newSection, this.currentSchema.repeatableSections.length - 1);
    this.updateJSONEditor();
  }

  removeRepeatableSection(index) {
    if (this.currentSchema.repeatableSections) {
      this.currentSchema.repeatableSections.splice(index, 1);
      this.renderRepeatableSectionsList();
      this.updateJSONEditor();
      this.updatePreview();
      
      // Hide config panel if it was showing this section
      const configPanel = document.getElementById('repeatable-section-config');
      if (configPanel) {
        configPanel.style.display = 'none';
      }
    }
  }

  editRepeatableSection(section, index) {
    const configPanel = document.getElementById('repeatable-section-config');
    const configContent = document.getElementById('repeatable-section-config-content');
    if (!configPanel || !configContent) return;

    // Hide field config if open
    const fieldConfig = document.getElementById('field-config');
    if (fieldConfig) fieldConfig.style.display = 'none';

    configPanel.style.display = 'block';

    const escapedId = (section.id || '').replace(/"/g, '&quot;');
    const escapedTitle = (section.title || '').replace(/"/g, '&quot;');
    const escapedAddBtn = (section.addButtonText || 'Add Another').replace(/"/g, '&quot;');
    const escapedRemoveBtn = (section.removeButtonText || 'Remove').replace(/"/g, '&quot;');

    // Get fields HTML
    const fieldsHTML = section.fields.map((field, fieldIndex) => {
      const escapedFieldLabel = (field.label || field.id || 'Untitled').replace(/"/g, '&quot;');
      return `
        <div class="repeatable-field-item" data-field-index="${fieldIndex}" style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem;margin:0.25rem 0;background:#f5f5f5;border-radius:4px;">
          <span>${escapedFieldLabel}</span>
          <button type="button" class="remove-repeatable-field" data-field-index="${fieldIndex}" style="background:none;border:none;cursor:pointer;color:#999;">×</button>
        </div>
      `;
    }).join('') || '<p style="color:#999;font-size:0.875rem;">No fields. Drag fields here to add.</p>';

    configContent.innerHTML = `
      <div class="config-group">
        <label>Section ID</label>
        <input type="text" id="repeatable-section-id" value="${escapedId}">
      </div>
      <div class="config-group">
        <label>Section Title</label>
        <input type="text" id="repeatable-section-title" value="${escapedTitle}">
      </div>
      <div class="config-group">
        <label>Add Button Text</label>
        <input type="text" id="repeatable-section-add-btn" value="${escapedAddBtn}">
      </div>
      <div class="config-group">
        <label>Remove Button Text</label>
        <input type="text" id="repeatable-section-remove-btn" value="${escapedRemoveBtn}">
      </div>
      <div class="config-group">
        <label>Min Instances</label>
        <input type="number" id="repeatable-section-min" value="${section.minInstances || 1}" min="0">
      </div>
      <div class="config-group">
        <label>Max Instances</label>
        <input type="number" id="repeatable-section-max" value="${section.maxInstances || 10}" min="1">
      </div>
      <div class="config-group" style="margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid #ddd;">
        <label><strong>Fields in Section</strong></label>
        <div id="repeatable-section-fields" style="min-height:100px;max-height:300px;overflow-y:auto;margin-top:0.5rem;padding:0.5rem;background:#fff;border:1px solid #ddd;border-radius:4px;">
          ${fieldsHTML}
        </div>
        <p style="font-size:0.875rem;color:#666;margin-top:0.5rem;">Drag fields from the palette to add them to this section</p>
      </div>
      <button class="btn btn-primary" id="save-repeatable-section" type="button" style="margin-top:1rem;">Save Section</button>
    `;

    // Setup drop zone for fields
    const fieldsDiv = document.getElementById('repeatable-section-fields');
    if (fieldsDiv) {
      fieldsDiv.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        fieldsDiv.style.background = '#f0f7ff';
      });
      fieldsDiv.addEventListener('dragleave', () => {
        fieldsDiv.style.background = '#fff';
      });
      fieldsDiv.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        fieldsDiv.style.background = '#fff';
        const fieldType = e.dataTransfer.getData('field-type');
        if (fieldType) {
          this.addFieldToRepeatableSection(section, fieldType);
        }
      });
    }

    // Save button
    const saveBtn = document.getElementById('save-repeatable-section');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveRepeatableSection(section, index);
      });
    }

    // Remove field buttons
    document.querySelectorAll('.remove-repeatable-field').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const fieldIndex = parseInt(e.target.dataset.fieldIndex);
        section.fields.splice(fieldIndex, 1);
        this.editRepeatableSection(section, index);
      });
    });
  }

  addFieldToRepeatableSection(section, fieldType) {
    if (!section.fields) {
      section.fields = [];
    }

    const fieldId = `${section.id}_field_${Date.now()}`;
    const newField = {
      id: fieldId,
      type: fieldType,
      label: this.getFieldTypeLabel(fieldType),
      required: false,
    };

    if (fieldType === 'select' || fieldType === 'radio' || fieldType === 'checkboxes') {
      newField.options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ];
    }

    section.fields.push(newField);
    this.editRepeatableSection(section, this.currentSchema.repeatableSections.indexOf(section));
    this.updateJSONEditor();
  }

  saveRepeatableSection(section, index) {
    section.id = document.getElementById('repeatable-section-id').value;
    section.title = document.getElementById('repeatable-section-title').value;
    section.addButtonText = document.getElementById('repeatable-section-add-btn').value;
    section.removeButtonText = document.getElementById('repeatable-section-remove-btn').value;
    section.minInstances = parseInt(document.getElementById('repeatable-section-min').value) || 1;
    section.maxInstances = parseInt(document.getElementById('repeatable-section-max').value) || 10;

    this.renderRepeatableSectionsList();
    this.updateJSONEditor();
    this.updatePreview();
  }

  loadConnectorConfig() {
    const connectorType = document.getElementById('connector-type');
    const configPanel = document.getElementById('connector-config-panel');
    if (!connectorType || !configPanel) return;

    // Load saved connector config
    const savedConnector = this.currentSchema.connector || {};
    if (savedConnector.type) {
      connectorType.value = savedConnector.type;
    }

    connectorType.addEventListener('change', (e) => {
      this.showConnectorConfig(e.target.value, savedConnector.config || {});
    });

    // Show initial config if connector is set
    if (savedConnector.type) {
      this.showConnectorConfig(savedConnector.type, savedConnector.config || {});
    } else {
      configPanel.innerHTML = '<p style="color:#999;">Select a connector to configure it</p>';
    }
  }

  showConnectorConfig(type, savedConfig = {}) {
    const configPanel = document.getElementById('connector-config-panel');
    if (!configPanel) return;

    if (!type) {
      configPanel.innerHTML = '<p style="color:#999;">Select a connector to configure it</p>';
      return;
    }

    let configHTML = '';

    switch (type) {
      case 'csv':
        configHTML = `
          <div class="config-group">
            <label>Filename</label>
            <input type="text" id="connector-csv-filename" value="${savedConfig.filename || 'form-responses.csv'}" placeholder="responses.csv">
          </div>
          <div class="config-group">
            <label>Date Format</label>
            <select id="connector-csv-date-format">
              <option value="ISO" ${savedConfig.dateFormat === 'ISO' ? 'selected' : ''}>ISO (YYYY-MM-DD)</option>
              <option value="US" ${savedConfig.dateFormat === 'US' ? 'selected' : ''}>US (MM/DD/YYYY)</option>
              <option value="EU" ${savedConfig.dateFormat === 'EU' ? 'selected' : ''}>EU (DD/MM/YYYY)</option>
            </select>
          </div>
        `;
        break;

      case 'webhook':
        configHTML = `
          <div class="config-group">
            <label>Webhook URL</label>
            <input type="url" id="connector-webhook-url" value="${savedConfig.url || ''}" placeholder="https://api.example.com/webhook">
          </div>
          <div class="config-group">
            <label>Method</label>
            <select id="connector-webhook-method">
              <option value="POST" ${savedConfig.method === 'POST' ? 'selected' : ''}>POST</option>
              <option value="PUT" ${savedConfig.method === 'PUT' ? 'selected' : ''}>PUT</option>
            </select>
          </div>
          <div class="config-group">
            <label>Retry Attempts</label>
            <input type="number" id="connector-webhook-retries" value="${savedConfig.retryAttempts || 3}" min="0" max="10">
          </div>
        `;
        break;

      case 'google-sheets':
        const sheetsApiEndpoint = savedConfig.apiEndpoint || this.getDefaultApiEndpoint('google-sheets');
        configHTML = `
          <div class="config-group">
            <label>API Endpoint</label>
            <input type="url" id="connector-sheets-api-endpoint" value="${sheetsApiEndpoint}" placeholder="https://your-app.vercel.app/api/connectors/google-sheets">
            <p style="font-size:0.875rem;color:#666;margin-top:0.25rem;">Your Vercel API endpoint for Google Sheets</p>
          </div>
          <div class="config-group">
            <label>Spreadsheet ID</label>
            <input type="text" id="connector-sheets-id" value="${savedConfig.spreadsheetId || ''}" placeholder="Enter spreadsheet ID">
            <p style="font-size:0.875rem;color:#666;margin-top:0.25rem;">Get this from the Google Sheets URL</p>
          </div>
          <div class="config-group">
            <label>Sheet Name</label>
            <input type="text" id="connector-sheets-name" value="${savedConfig.sheetName || 'Sheet1'}" placeholder="Sheet1">
          </div>
          <div class="config-group">
            <label>
              <input type="checkbox" id="connector-sheets-create" ${savedConfig.createSheet ? 'checked' : ''}>
              Create sheet if it doesn't exist
            </label>
          </div>
          <p style="color:#666;font-size:0.875rem;margin-top:1rem;">Note: Set GOOGLE_SHEETS_ACCESS_TOKEN in Vercel environment variables.</p>
        `;
        break;

      case 'airtable':
        const airtableApiEndpoint = savedConfig.apiEndpoint || this.getDefaultApiEndpoint('airtable');
        configHTML = `
          <div class="config-group">
            <label>API Endpoint</label>
            <input type="url" id="connector-airtable-api-endpoint" value="${airtableApiEndpoint}" placeholder="https://your-app.vercel.app/api/connectors/airtable">
            <p style="font-size:0.875rem;color:#666;margin-top:0.25rem;">Your Vercel API endpoint for Airtable</p>
          </div>
          <div class="config-group">
            <label>Base ID</label>
            <input type="text" id="connector-airtable-base" value="${savedConfig.baseId || ''}" placeholder="Enter Airtable base ID">
          </div>
          <div class="config-group">
            <label>Table Name</label>
            <input type="text" id="connector-airtable-table" value="${savedConfig.tableName || ''}" placeholder="Table 1">
          </div>
          <p style="color:#666;font-size:0.875rem;margin-top:1rem;">Note: Set AIRTABLE_API_KEY in Vercel environment variables.</p>
        `;
        break;

      case 'notion':
        const notionApiEndpoint = savedConfig.apiEndpoint || this.getDefaultApiEndpoint('notion');
        configHTML = `
          <div class="config-group">
            <label>API Endpoint</label>
            <input type="url" id="connector-notion-api-endpoint" value="${notionApiEndpoint}" placeholder="https://your-app.vercel.app/api/connectors/notion">
            <p style="font-size:0.875rem;color:#666;margin-top:0.25rem;">Your Vercel API endpoint for Notion</p>
          </div>
          <div class="config-group">
            <label>Database ID</label>
            <input type="text" id="connector-notion-db" value="${savedConfig.databaseId || ''}" placeholder="Enter Notion database ID">
          </div>
          <p style="color:#666;font-size:0.875rem;margin-top:1rem;">Note: Set NOTION_API_KEY in Vercel environment variables.</p>
        `;
        break;

      case 'email':
        const emailApiEndpoint = savedConfig.apiEndpoint || this.getDefaultApiEndpoint('email');
        configHTML = `
          <div class="config-group">
            <label>API Endpoint</label>
            <input type="url" id="connector-email-api-endpoint" value="${emailApiEndpoint}" placeholder="https://your-app.vercel.app/api/connectors/email">
            <p style="font-size:0.875rem;color:#666;margin-top:0.25rem;">Your Vercel API endpoint for Email</p>
          </div>
          <div class="config-group">
            <label>Provider</label>
            <select id="connector-email-provider">
              <option value="sendgrid" ${savedConfig.provider === 'sendgrid' ? 'selected' : ''}>SendGrid</option>
              <option value="mailgun" ${savedConfig.provider === 'mailgun' ? 'selected' : ''}>Mailgun</option>
            </select>
          </div>
          <div class="config-group">
            <label>To (Recipient)</label>
            <input type="email" id="connector-email-to" value="${savedConfig.to || ''}" placeholder="recipient@example.com">
          </div>
          <div class="config-group">
            <label>From (Sender)</label>
            <input type="email" id="connector-email-from" value="${savedConfig.from || ''}" placeholder="sender@example.com">
          </div>
          <div class="config-group">
            <label>Subject</label>
            <input type="text" id="connector-email-subject" value="${savedConfig.subject || 'Form Submission'}" placeholder="Form Submission">
          </div>
          <p style="color:#666;font-size:0.875rem;margin-top:1rem;">Note: Set SENDGRID_API_KEY or MAILGUN_API_KEY in Vercel environment variables.</p>
        `;
        break;
    }

    configHTML += `
      <button class="btn btn-primary" id="save-connector-config" type="button" style="margin-top:1rem;">Save Connector</button>
    `;

    configPanel.innerHTML = configHTML;

    // Save button
    const saveBtn = document.getElementById('save-connector-config');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveConnectorConfig(type);
      });
    }
  }

  saveConnectorConfig(type) {
    if (!this.currentSchema.connector) {
      this.currentSchema.connector = {};
    }

    this.currentSchema.connector.type = type;
    this.currentSchema.connector.config = {};

    switch (type) {
      case 'csv':
        this.currentSchema.connector.config.filename = document.getElementById('connector-csv-filename').value;
        this.currentSchema.connector.config.dateFormat = document.getElementById('connector-csv-date-format').value;
        break;

      case 'webhook':
        this.currentSchema.connector.config.url = document.getElementById('connector-webhook-url').value;
        this.currentSchema.connector.config.method = document.getElementById('connector-webhook-method').value;
        this.currentSchema.connector.config.retryAttempts = parseInt(document.getElementById('connector-webhook-retries').value) || 3;
        break;

      case 'google-sheets':
        this.currentSchema.connector.config.apiEndpoint = document.getElementById('connector-sheets-api-endpoint').value;
        this.currentSchema.connector.config.spreadsheetId = document.getElementById('connector-sheets-id').value;
        this.currentSchema.connector.config.sheetName = document.getElementById('connector-sheets-name').value;
        this.currentSchema.connector.config.createSheet = document.getElementById('connector-sheets-create').checked;
        break;

      case 'airtable':
        this.currentSchema.connector.config.apiEndpoint = document.getElementById('connector-airtable-api-endpoint').value;
        this.currentSchema.connector.config.baseId = document.getElementById('connector-airtable-base').value;
        this.currentSchema.connector.config.tableName = document.getElementById('connector-airtable-table').value;
        break;

      case 'notion':
        this.currentSchema.connector.config.apiEndpoint = document.getElementById('connector-notion-api-endpoint').value;
        this.currentSchema.connector.config.databaseId = document.getElementById('connector-notion-db').value;
        break;

      case 'email':
        this.currentSchema.connector.config.apiEndpoint = document.getElementById('connector-email-api-endpoint').value;
        this.currentSchema.connector.config.provider = document.getElementById('connector-email-provider').value;
        this.currentSchema.connector.config.to = document.getElementById('connector-email-to').value;
        this.currentSchema.connector.config.from = document.getElementById('connector-email-from').value;
        this.currentSchema.connector.config.subject = document.getElementById('connector-email-subject').value;
        break;
    }

    this.updateJSONEditor();
    alert('Connector configuration saved!');
  }

  showShareModal() {
    const shareModal = document.getElementById('share-modal');
    if (!shareModal) return;

    shareModal.style.display = 'flex';

    // Generate iframe code (will be updated after saving)
    const iframeCode = document.getElementById('iframe-code');
    const shareableUrl = document.getElementById('shareable-url');
    const saveStatus = document.getElementById('save-status');

    // Setup download standalone
    const downloadBtn = document.getElementById('download-standalone');
    if (downloadBtn) {
      downloadBtn.onclick = () => this.downloadStandaloneHTML();
    }

    // Setup copy iframe
    const copyIframe = document.getElementById('copy-iframe');
    if (copyIframe) {
      copyIframe.onclick = () => {
        if (iframeCode) {
          iframeCode.select();
          document.execCommand('copy');
          copyIframe.textContent = 'Copied!';
          setTimeout(() => {
            copyIframe.textContent = 'Copy Code';
          }, 2000);
        }
      };
    }

    // Setup save and get URL
    const saveAndGetUrlBtn = document.getElementById('save-and-get-url');
    if (saveAndGetUrlBtn) {
      saveAndGetUrlBtn.onclick = () => this.saveFormAndGetUrl();
    }

    // If form already has a saved URL, show it
    if (this.currentSchema.savedUrl) {
      if (shareableUrl) {
        shareableUrl.value = this.currentSchema.savedUrl;
        this.generateQRCode(this.currentSchema.savedUrl);
      }
      if (iframeCode) {
        const formId = this.currentSchema.formId || 'form';
        iframeCode.value = `<iframe src="${this.currentSchema.savedUrl}" width="100%" height="600" frameborder="0"></iframe>`;
      }
    }
  }

  async saveFormAndGetUrl() {
    const saveBtn = document.getElementById('save-and-get-url');
    const shareableUrl = document.getElementById('shareable-url');
    const saveStatus = document.getElementById('save-status');
    const iframeCode = document.getElementById('iframe-code');

    if (!saveBtn || !shareableUrl || !saveStatus) return;

    // Disable button and show loading
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    saveStatus.textContent = '';
    saveStatus.style.color = '';

    try {
      // Get base URL
      const baseUrl = window.location.origin;
      
      // Save form via API
      const response = await fetch(`${baseUrl}/api/forms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schema: this.currentSchema,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to save form' }));
        throw new Error(error.message || 'Failed to save form');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to save form');
      }

      // Store URL in schema
      this.currentSchema.savedUrl = result.url;
      this.currentSchema.formId = result.id;

      // Display URL
      shareableUrl.value = result.url;
      saveStatus.textContent = '✓ Form saved successfully!';
      saveStatus.style.color = '#4caf50';

      // Generate QR code
      this.generateQRCode(result.url);

      // Update iframe code
      if (iframeCode) {
        iframeCode.value = `<iframe src="${result.url}" width="100%" height="600" frameborder="0"></iframe>`;
      }

      // Update JSON editor
      this.updateJSONEditor();

      // Copy URL to clipboard
      shareableUrl.select();
      document.execCommand('copy');
      saveStatus.textContent = '✓ Form saved! URL copied to clipboard.';
    } catch (error) {
      console.error('Error saving form:', error);
      saveStatus.textContent = `✗ Error: ${error.message}`;
      saveStatus.style.color = '#f44336';
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save & Get URL';
    }
  }

  async downloadStandaloneHTML() {
    try {
      // Read runtime files
      const runtimeJS = await fetch('../runtime/form-runtime.js').then(r => r.text()).catch(() => '');
      const runtimeCSS = await fetch('../runtime/form-runtime.css').then(r => r.text()).catch(() => '');

      // Get connector code and generate submission handler
      let connectorScript = '';
      let onSubmitHandler = '';
      
      if (this.currentSchema.connector && this.currentSchema.connector.type) {
        const connectorType = this.currentSchema.connector.type;
        const connectorConfig = this.currentSchema.connector.config || {};

        if (connectorType === 'csv') {
          // CSV is client-side, embed connector code
          try {
            const connectorCode = await fetch('../connectors/csv-export.js').then(r => r.text()).catch(() => '');
            if (connectorCode) {
              connectorScript = `
      <script>
        ${connectorCode}
        
        // Initialize CSV connector
        const connectorConfig = ${JSON.stringify(connectorConfig)};
        const connector = new CSVExportConnector(connectorConfig);
      </script>`;
              onSubmitHandler = `
        if (connector) {
          try {
            const result = await connector.submit(data);
            return result;
          } catch (error) {
            return { success: false, message: error.message };
          }
        }`;
            }
          } catch (error) {
            console.warn('Could not load CSV connector code:', error);
          }
        } else if (connectorType === 'webhook') {
          // Webhook uses existing connector (no API endpoint needed)
          try {
            const connectorCode = await fetch('../connectors/webhook.js').then(r => r.text()).catch(() => '');
            if (connectorCode) {
              connectorScript = `
      <script>
        ${connectorCode}
        
        // Initialize webhook connector
        const connectorConfig = ${JSON.stringify(connectorConfig)};
        const connector = new WebhookConnector(connectorConfig);
      </script>`;
              onSubmitHandler = `
        if (connector) {
          try {
            const result = await connector.submit(data);
            return result;
          } catch (error) {
            return { success: false, message: error.message };
          }
        }`;
            }
          } catch (error) {
            console.warn('Could not load webhook connector code:', error);
          }
        } else {
          // Other connectors use API endpoints
          const apiEndpoint = connectorConfig.apiEndpoint;
          if (apiEndpoint) {
            // Generate API call based on connector type
            const requestBody = this.generateApiRequestBody(connectorType, connectorConfig);
            onSubmitHandler = `
        try {
          const response = await fetch('${apiEndpoint}', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(${requestBody})
          });
          
          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Request failed' }));
            return { success: false, message: error.message || 'Submission failed' };
          }
          
          const result = await response.json();
          return result;
        } catch (error) {
          return { success: false, message: error.message || 'Network error' };
        }`;
          } else {
            onSubmitHandler = `
        console.warn('API endpoint not configured for ${connectorType} connector');
        return { success: false, message: 'Connector not properly configured. Please set API endpoint.' };`;
          }
        }
      }

      const formSchema = JSON.stringify(this.currentSchema, null, 2);

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.currentSchema.title || 'Form'}</title>
  <style>
    ${runtimeCSS}
    body {
      font-family: var(--form-font-family);
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
  </style>
</head>
<body>
  <h1>${this.currentSchema.title || 'Form'}</h1>
  ${this.currentSchema.description ? `<p>${this.currentSchema.description}</p>` : ''}
  <div id="form-container"></div>

  <script>
    ${runtimeJS}
  </script>
  ${connectorScript}
  <script>
    const formSchema = ${formSchema};
    
    const form = new FormRuntime({
      schema: formSchema,
      container: '#form-container',
      theme: formSchema.settings?.theme || 'default',
      onSubmit: async (data) => {
        ${onSubmitHandler}
        console.log('Form submitted:', data);
        return { success: true, message: 'Thank you for your submission!' };
      }
    });
    
    form.render();
  </script>
</body>
</html>`;

      // Download
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.currentSchema.formId || 'form'}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating standalone HTML:', error);
      alert(`Error: ${error.message}`);
    }
  }

  generateQRCode(url) {
    const container = document.getElementById('qr-code-container');
    if (!container) return;

    // Simple QR code using a service (or could use a library)
    container.innerHTML = `
      <p style="font-size:0.875rem;color:#666;margin-bottom:0.5rem;">Scan to open form:</p>
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}" alt="QR Code" style="border:1px solid #ddd;padding:0.5rem;background:#fff;">
    `;
  }

  async loadTemplate(templateName) {
    try {
      // Try different naming patterns
      const possiblePaths = [
        `examples/${templateName}-form.json`,
        `examples/${templateName}.json`,
        `builder/examples/${templateName}-form.json`,
        `builder/examples/${templateName}.json`,
      ];

      let schema = null;
      let lastError = null;

      for (const path of possiblePaths) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            schema = await response.json();
            break;
          }
        } catch (error) {
          lastError = error;
          continue;
        }
      }

      if (!schema) {
        throw new Error(`Template "${templateName}" not found. Tried: ${possiblePaths.join(', ')}`);
      }

      this.loadSchema(schema);
      this.switchTab('gui');
      console.log(`Template "${templateName}" loaded successfully`);
    } catch (error) {
      console.error('Error loading template:', error);
      alert(`Error loading template: ${error.message}`);
    }
  }
}

// Initialize builder when DOM is ready
(function() {
  function initBuilder() {
    try {
      window.formBuilder = new FormBuilder();
      console.log('Form Builder initialized');
    } catch (error) {
      console.error('Error initializing Form Builder:', error);
      alert('Error initializing Form Builder. Check console for details.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBuilder);
  } else {
    initBuilder();
  }
})();

