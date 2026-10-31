import type { Listing } from './data';

export type Page = 'home' | 'catalog' | 'detail' | 'dealers' | 'dealer' | 'favorites' | 'compare' | 'dashboard';
export type Sort = 'newest' | 'cheapest' | 'expensive' | 'least-km';
export type Filters = { query: string; brand: string; model: string; category: string; minPrice: string; price: string; year: string; km: string; city: string; seller: string };
export const emptyFilters: Filters = { query:'',brand:'',model:'',category:'',minPrice:'',price:'',year:'',km:'',city:'',seller:'' };
export const fold = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function parseLocation(hash: string) {
  const [raw, search = ''] = hash.replace(/^#\/?/,'').split('?');
  let path = raw;
  try { path = decodeURIComponent(raw); } catch { /* Malformed shared links must not crash the app. */ }
  const params = new URLSearchParams(search);
  const filters = { ...emptyFilters };
  (Object.keys(filters) as (keyof Filters)[]).forEach(k => { filters[k] = (params.get(k) || '').slice(0,160); });
  (['minPrice','price','year','km'] as const).forEach(k => { if (!/^\d{1,9}$/.test(filters[k])) filters[k] = ''; });
  const pages: Record<string,Page> = {motorky:'catalog',bazary:'dealers',oblibene:'favorites',porovnani:'compare',sprava:'dashboard'};
  const page: Page = path.startsWith('motorka/') ? 'detail' : path.startsWith('bazar/') ? 'dealer' : pages[path] || 'home';
  return { page, id: path.includes('/') ? path.slice(path.indexOf('/')+1) : '', filters };
}
export function filterQuery(filters: Filters): string {
  const params = new URLSearchParams();
  (Object.keys(emptyFilters) as (keyof Filters)[]).forEach(k => { if(filters[k]) params.set(k,filters[k]); });
  return params.toString() ? `?${params}` : '';
}
export function countFilters(filters: Filters): number { return Object.values(filters).filter(Boolean).length; }
export function filterListings(items: Listing[], f: Filters, sort: Sort = 'newest'): Listing[] {
  const words = fold(f.query.trim()).split(/\s+/).filter(Boolean);
  return items.filter(item => {
    if(item.status !== 'active') return false;
    if(f.brand && item.brand !== f.brand) return false;
    if(f.model && item.model !== f.model) return false;
    if(f.category && item.category !== f.category) return false;
    if(f.minPrice && item.price < Number(f.minPrice)) return false;
    if(f.price && item.price > Number(f.price)) return false;
    if(f.year && item.year < Number(f.year)) return false;
    if(f.km && item.km > Number(f.km)) return false;
    if(f.city && item.city !== f.city) return false;
    if(f.seller === 'dealer' && !item.dealerId) return false;
    if(f.seller === 'private' && item.dealerId) return false;
    const text=fold(`${item.title} ${item.brand} ${item.model} ${item.city} ${item.category}`);
    return words.every(word => text.includes(word));
  }).sort((a,b) => sort==='cheapest' ? a.price-b.price : sort==='expensive' ? b.price-a.price : sort==='least-km' ? a.km-b.km : b.updatedAt.localeCompare(a.updatedAt));
}
export function imageAtWidth(src: string, width: number): string {
  try { const url=new URL(src); if(url.hostname==='images.unsplash.com') { url.searchParams.set('w',String(width)); url.searchParams.set('q','80'); return url.toString(); } } catch { /* Local / uploaded images keep their original URL. */ }
  return src;
}
export function safeRead(key: string, fallback: string): string { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } }
export function safeWrite(key: string, value: string): boolean { try { localStorage.setItem(key,value); return true; } catch { return false; } }
export function readCompare(): string[] { try { const v=JSON.parse(safeRead('motobazar:compare:v1','[]'));return Array.isArray(v)?[...new Set(v.filter((x):x is string=>typeof x==='string'))].slice(0,3):[]; } catch { return []; } }
