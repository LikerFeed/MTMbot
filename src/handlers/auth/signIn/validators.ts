export const isValidEmail = (email: string): boolean => {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length < 1 || trimmed.length > 100) return false;
  const atIndex = trimmed.indexOf("@");
  const dotIndex = trimmed.lastIndexOf(".");
  return atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < trimmed.length - 1;
};

export const isValidPassword = (password: string): boolean => {
  if (typeof password !== "string") return false;
  const trimmed = password.trim();
  return trimmed.length >= 6 && trimmed.length <= 20;
};
