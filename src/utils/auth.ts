const TokenKey = "Admin-Token";
const RefreshTokenKey = "Admin-Ref-Token";

export function getToken() {
  return localStorage.getItem(TokenKey);
}

export function setToken(token: string) {
  return localStorage.setItem(TokenKey, token);
}

export function removeToken() {
  return localStorage.removeItem(TokenKey);
}

export function getRefreshToken() {
  return localStorage.getItem(RefreshTokenKey);
}

export function setRefreshToken(token: string) {
  return localStorage.setItem(RefreshTokenKey, token);
}

export function removeRefreshToken() {
  return localStorage.removeItem(RefreshTokenKey);
}
