export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateVideoFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 1024 * 1024 * 1024; // 1GB
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 1GB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only MP4, WebM, and OGG video formats are supported' };
  }

  return { valid: true };
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are supported' };
  }

  return { valid: true };
};
