export const validateContact = (
  errors: Record<string, string | null>,
  field: string,
  contact: { contactName?: string; email: string | null; phone: string | null }
) => {
  if (field.startsWith('contacts') && !contact.contactName)
    errors[`${field}.contactName`] = 'Proszę podać nazwę kontaktu';

  if (!contact.email && !contact.phone) {
    const error = 'Proszę podać chociaż jedną formę kontaktu';
    errors[`${field}.email`] = error;
    errors[`${field}.phone`] = error;
  } else {
    if (contact.email) errors[`${field}.email`] = validateEmail(contact.email);
    if (contact.phone) errors[`${field}.phone`] = validatePhone(contact.phone);
  }
};

export const validateField = (
  errors: Record<string, string | null>,
  field: string,
  value: string,
  errorMessage: string
) => {
  if (!value) errors[field] = errorMessage;
  else if (value.length > 64) errors[field] = `Maksymalna liczba znaków to 64`;
  else errors[field] = null;
};

export const validateZipCode = (
  errors: Record<string, string | null>,
  zipCode: string
) => {
  errors['zipCode'] = /^\d{2}-\d{3}$/.test(zipCode)
    ? null
    : 'Proszę podaać poprawny kod pocztowy';
};

export const validateEmail = (email: string) => {
  if (email.length > 64) return 'Maksymalna liczba znaków to 64';
  if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(email))
    return 'Proszę podać poprawny adres email';
  return null;
};

export const validatePhone = (phone: string) =>
  /^\+?[\d\- ]{7,20}$/.test(phone)
    ? null
    : 'Proszę podać poprawny numer telefonu';
