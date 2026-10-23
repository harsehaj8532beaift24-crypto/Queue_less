import { INITIAL_VENUES, INITIAL_USER_TOKENS } from '../data/initialData';

const KEYS = {
  VENUES: 'queueless_venues_v1',
  USER_TOKENS: 'queueless_user_tokens_v1',
  NOTIFICATIONS: 'queueless_notifications_v1',
  THEME: 'queueless_theme_v1',
};

export function getStoredVenues() {
  try {
    const data = localStorage.getItem(KEYS.VENUES);
    return data ? JSON.parse(data) : INITIAL_VENUES;
  } catch (err) {
    console.error('Error reading venues from localStorage:', err);
    return INITIAL_VENUES;
  }
}

export function saveStoredVenues(venues) {
  try {
    localStorage.setItem(KEYS.VENUES, JSON.stringify(venues));
  } catch (err) {
    console.error('Error saving venues to localStorage:', err);
  }
}

export function getStoredUserTokens() {
  try {
    const data = localStorage.getItem(KEYS.USER_TOKENS);
    return data ? JSON.parse(data) : INITIAL_USER_TOKENS;
  } catch (err) {
    console.error('Error reading user tokens from localStorage:', err);
    return INITIAL_USER_TOKENS;
  }
}

export function saveStoredUserTokens(tokens) {
  try {
    localStorage.setItem(KEYS.USER_TOKENS, JSON.stringify(tokens));
  } catch (err) {
    console.error('Error saving user tokens to localStorage:', err);
  }
}

export function getStoredTheme() {
  try {
    return localStorage.getItem(KEYS.THEME) || 'dark';
  } catch {
    return 'dark';
  }
}

export function saveStoredTheme(theme) {
  try {
    localStorage.setItem(KEYS.THEME, theme);
  } catch (err) {
    console.error('Error saving theme to localStorage:', err);
  }
}
