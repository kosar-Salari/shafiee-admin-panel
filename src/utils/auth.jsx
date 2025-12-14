const TOKEN_KEY = 'admin_token';
const ADMIN_INFO_KEY = 'admin_info';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function setAdminInfo(info) {
  localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(info));
}

export function getAdminInfo() {
  const data = localStorage.getItem(ADMIN_INFO_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function clearAdminInfo() {
  localStorage.removeItem(ADMIN_INFO_KEY);
}
