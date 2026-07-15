// lib/validation.ts
// Form validation helpers for the PROSERVICE intake form

export interface ValidationError {
  field: string;
  message: string;
}

export type StepErrors = Record<string, string>;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

export function validateStep1(data: any): StepErrors {
  const errors: StepErrors = {};

  if (!String(data.business_name || '').trim()) {
    errors.business_name = 'Business name is required';
  }
  if (!String(data.contact_name || '').trim()) {
    errors.contact_name = 'Your name is required';
  }
  if (!String(data.phone_number || '').trim()) {
    errors.phone_number = 'Phone number is required';
  } else if (!isValidPhone(String(data.phone_number))) {
    errors.phone_number = 'Please enter a valid phone number';
  }
  if (!String(data.email_address || '').trim()) {
    errors.email_address = 'Email address is required';
  } else if (!isValidEmail(String(data.email_address))) {
    errors.email_address = 'Please enter a valid email address';
  } else if (String(data.email_address).trim().toLowerCase() !== String(data.confirm_email_address || '').trim().toLowerCase()) {
    errors.confirm_email_address = 'Email addresses must match';
  }
  if (!String(data.occupation || '').trim()) {
    errors.occupation = 'Please select or enter your business type';
  }

  return errors;
}

export function validateStep2(data: any): StepErrors {
  const errors: StepErrors = {};

  if (!String(data.main_services || '').trim()) {
    errors.main_services = 'Please describe your main services';
  }
  if (!String(data.main_cta || '').trim()) {
    errors.main_cta = 'Please select the main action for customers';
  }

  return errors;
}

export function validateStep3(_data: any): StepErrors {
  // Step 3 is optional — differentiator and testimonials are strongly encouraged but not required
  return {};
}

export function validateStep4(data: any): StepErrors {
  const errors: StepErrors = {};

  if (!String(data.selected_website_look || '').trim()) {
    errors.selected_website_look = 'Please select a website style';
  }

  return errors;
}

export function validateStep5(data: any): StepErrors {
  const errors: StepErrors = {};

  if (!String(data.main_city || '').trim()) {
    errors.main_city = 'Please enter your main city or town';
  }

  return errors;
}

export function validateStep6(data: any): StepErrors {
  const errors: StepErrors = {};

  if (!String(data.contact_number_to_show || '').trim() && !String(data.phone_number || '').trim()) {
    errors.contact_number_to_show = 'Please confirm the phone number to show on your website';
  }

  return errors;
}

export function validateStep7(_data: any): StepErrors {
  // Step 7 is fully optional
  return {};
}

export function validateStepByIndex(stepIndex: number, data: any): StepErrors {
  switch (stepIndex) {
    case 0: return validateStep1(data);
    case 1: return validateStep2(data);
    case 2: return validateStep3(data);
    case 3: return validateStep4(data);
    case 4: return validateStep5(data);
    case 5: return validateStep6(data);
    case 6: return validateStep7(data);
    default: return {};
  }
}

export function validateAllSteps(data: any): StepErrors {
  return {
    ...validateStep1(data),
    ...validateStep2(data),
    ...validateStep3(data),
    ...validateStep4(data),
    ...validateStep5(data),
    ...validateStep6(data),
    ...validateStep7(data),
  };
}

export function hasErrors(errors: StepErrors): boolean {
  return Object.keys(errors).length > 0;
}
