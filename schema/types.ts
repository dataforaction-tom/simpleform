/**
 * TypeScript type definitions for Form Builder schema
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'number'
  | 'tel'
  | 'url'
  | 'date'
  | 'time'
  | 'datetime'
  | 'select'
  | 'radio'
  | 'checkboxes'
  | 'file'
  | 'hidden'
  | 'richtext'
  | 'header'
  | 'paragraph';

export type ConditionalOperator =
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'lessThan'
  | 'contains'
  | 'notContains';

export type ConditionalLogicOperator = 'AND' | 'OR';

export type LayoutWidth = 'full' | 'half' | 'third' | 'twoThirds';

export type Theme = 'default' | 'dark';

export type CalculatedFieldFormat = 'number' | 'currency' | 'percentage';

export type SkipActionType = 'skipToPage' | 'enableField' | 'disableField';

export interface FieldOption {
  value: string;
  label: string;
}

export interface Validation {
  required?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  minDate?: string;
  maxDate?: string;
  fileSizeLimit?: number;
  fileTypes?: string[];
  message?: string;
  crossField?: {
    field: string;
    operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'after' | 'before';
  };
}

export interface ConditionalRule {
  field: string;
  operator: ConditionalOperator;
  value?: string | number | boolean;
}

export interface ConditionalDisplay {
  rules: ConditionalRule[];
  logic?: ConditionalLogicOperator;
}

export interface Layout {
  width?: LayoutWidth;
  order?: number;
}

export interface FormField {
  id: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  defaultValue?: string | number | boolean | string[];
  validation?: Validation;
  options?: FieldOption[];
  conditionalDisplay?: ConditionalDisplay;
  layout?: Layout;
  level?: number; // For header type: 1-6
}

export interface FormPage {
  id: string;
  title?: string;
  fields: FormField[];
}

export interface FormSettings {
  multiPage?: boolean;
  progressBar?: boolean;
  saveProgress?: boolean;
  submitButtonText?: string;
  successMessage?: string;
  theme?: Theme;
}

export interface RepeatableSection {
  id: string;
  title?: string;
  addButtonText?: string;
  removeButtonText?: string;
  minInstances?: number;
  maxInstances?: number;
  fields: FormField[];
}

export interface CalculatedField {
  id: string;
  expression: string;
  format?: CalculatedFieldFormat;
  decimalPlaces?: number;
}

export interface SkipAction {
  type: SkipActionType;
  target: string;
}

export interface SkipRule {
  condition: ConditionalRule;
  action: SkipAction;
}

export interface ConditionalLogic {
  skipRules?: SkipRule[];
}

export interface FormSchema {
  formId: string;
  version: string;
  title: string;
  description?: string;
  settings?: FormSettings;
  pages: FormPage[];
  repeatableSections?: RepeatableSection[];
  calculatedFields?: CalculatedField[];
  conditionalLogic?: ConditionalLogic;
}

// Helper types for form data
export type FormDataValue = string | number | boolean | File | string[] | null;

export interface FormData {
  [fieldId: string]: FormDataValue;
}

export interface ValidationError {
  fieldId: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// Connector types
export interface ConnectorConfig {
  [key: string]: unknown;
}

export interface ConnectorResponse {
  success: boolean;
  message: string;
  id?: string;
}

export interface FormConnector {
  authenticate?(): Promise<void>;
  submit(formData: FormData): Promise<ConnectorResponse>;
  validate?(formData: FormData): Promise<ValidationResult>;
}






