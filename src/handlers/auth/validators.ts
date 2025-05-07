export const isValidEmail = (email: string): boolean => {
  const trimmed = email.trim();
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
  return (
    trimmed.length > 0 &&
    trimmed.length <= 100 &&
    emailRegex.test(trimmed)
  );
};

export const isValidUsername = (username: string): boolean => {
  const trimmed = username.trim();
  return trimmed.length >= 3 && trimmed.length <= 20;
};

export const isValidPassword = (password: string): boolean => {
  const trimmed = password.trim();
  return trimmed.length >= 6 && trimmed.length <= 20;
};
