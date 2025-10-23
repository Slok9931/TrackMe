// Simple in-memory token store for demo purposes
// In production, use Redis or a database
const tokenStore: Map<string, any> = new Map();

export const generateToken = (user: any): string => {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  tokenStore.set(token, user);
  // Set expiration
  setTimeout(() => {
    tokenStore.delete(token);
  }, 24 * 60 * 60 * 1000); // 24 hours
  return token;
};

export const getUserFromToken = (token: string): any => {
  return tokenStore.get(token) || null;
};

export const deleteToken = (token: string): void => {
  tokenStore.delete(token);
};
