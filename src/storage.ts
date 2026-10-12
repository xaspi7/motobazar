import { seededDealers, seededListings, type Dealer, type Listing } from './data';

const LISTING_KEY = 'motobazar:demo-listings:v3';
const DEALER_KEY = 'motobazar:demo-dealers:v3';
const FAVORITES_KEY = 'motobazar:demo-favorites:v3';

function readJSON<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

export const readListings = (): Listing[] => readJSON<Listing[]>(LISTING_KEY, seededListings);
export const saveListings = (listings: Listing[]) => window.localStorage.setItem(LISTING_KEY, JSON.stringify(listings));
export const readDealers = (): Dealer[] => readJSON<Dealer[]>(DEALER_KEY, seededDealers);
export const saveDealers = (dealers: Dealer[]) => window.localStorage.setItem(DEALER_KEY, JSON.stringify(dealers));
export const readFavorites = (): string[] => readJSON<string[]>(FAVORITES_KEY, []);
export const saveFavorites = (ids: string[]) => window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
export const resetDemo = () => {
  window.localStorage.removeItem(LISTING_KEY);
  window.localStorage.removeItem(DEALER_KEY);
  window.localStorage.removeItem(FAVORITES_KEY);
};
