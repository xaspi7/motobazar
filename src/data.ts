export type ListingStatus = 'active' | 'draft' | 'sold';

export interface Dealer {
  id: string;
  slug: string;
  name: string;
  city: string;
  tagline: string;
  description: string;
  focus: string[];
  monogram: string;
  accent: string;
}

export interface Listing {
  id: string;
  dealerId: string | null;
  title: string;
  brand: string;
  model: string;
  category: string;
  year: number;
  price: number;
  km: number;
  power: number;
  engine: number;
  city: string;
  image: string;
  gallery: string[];
  description: string;
  status: ListingStatus;
  updatedAt: string;
}

export const categories = [
  'Sportovní', 'Naháče', 'Cestovní', 'Enduro / Adventure', 'Supermoto', 'Cruiser', 'Skútry',
] as const;

export const brands = [
  'Aprilia', 'BMW', 'Ducati', 'Honda', 'Husqvarna', 'Kawasaki', 'KTM',
  'Suzuki', 'Triumph', 'Yamaha', 'Jiné',
];

export const seededDealers: Dealer[] = [
  {
    id: 'ride-lab', slug: 'ride-lab', name: 'RIDE LAB', city: 'Praha',
    tagline: 'Stroje, které má smysl vidět naživo.',
    description: 'Výběr silničních a sportovních motorek. Přímý přehled nabídky, žádné zbytečnosti.',
    focus: ['Sportovní', 'Naháče'], monogram: 'RL', accent: '#d9ef5d',
  },
  {
    id: 'dva-valce', slug: 'dva-valce', name: 'DVA VÁLCE', city: 'Brno',
    tagline: 'Na silnici i za jejím koncem.',
    description: 'Motorky na víkendové výlety, delší cesty a objevování nových tras.',
    focus: ['Adventure', 'Cestovní'], monogram: 'DV', accent: '#ff674d',
  },
  {
    id: 'north-motors', slug: 'north-motors', name: 'NORTH MOTORS', city: 'Liberec',
    tagline: 'Poctivý výběr pro každý kilometr.',
    description: 'Sportovní motorky a výrazné naháče na jednom místě.',
    focus: ['Sportovní', 'Naháče'], monogram: 'NM', accent: '#a9c5ff',
  },
  {
    id: 'moto-garage', slug: 'moto-garage', name: 'MOTO GARAGE', city: 'Plzeň',
    tagline: 'Dobrý stroj nepotřebuje dlouhý příběh.',
    description: 'Různorodý výběr motorek s přehlednými informacemi ke každému kusu.',
    focus: ['Cestovní', 'Sportovní'], monogram: 'MG', accent: '#ffcc76',
  },
];

const photos = {
  sport1: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=82',
  sport2: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=82',
  sport3: 'https://images.unsplash.com/photo-1558980664-10e7170b5f1d?auto=format&fit=crop&w=1200&q=82',
  touring: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=1200&q=82',
  naked: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=82',
  enduro: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1200&q=82',
};

interface SeedInput extends Omit<Listing, 'gallery' | 'description' | 'status' | 'updatedAt'> {
  status?: ListingStatus;
  description?: string;
  updatedAt?: string;
}

const raw: SeedInput[] = [
  { id: 'm-101', dealerId: 'ride-lab', title: 'Suzuki GSX-R 600', brand: 'Suzuki', model: 'GSX-R 600', category: 'Sportovní', year: 2008, price: 134900, km: 32000, power: 92, engine: 599, city: 'Praha', image: photos.sport1 },
  { id: 'm-102', dealerId: 'north-motors', title: 'Kawasaki Ninja ZX-6R', brand: 'Kawasaki', model: 'Ninja ZX-6R', category: 'Sportovní', year: 2019, price: 239000, km: 14800, power: 95, engine: 636, city: 'Liberec', image: photos.sport2 },
  { id: 'm-103', dealerId: null, title: 'Honda CBR 600 RR', brand: 'Honda', model: 'CBR 600 RR', category: 'Sportovní', year: 2007, price: 119000, km: 41200, power: 88, engine: 599, city: 'Ostrava', image: photos.sport3 },
  { id: 'm-104', dealerId: 'dva-valce', title: 'BMW R 1250 GS', brand: 'BMW', model: 'R 1250 GS', category: 'Cestovní', year: 2021, price: 315000, km: 28500, power: 100, engine: 1254, city: 'Brno', image: photos.touring },
  { id: 'm-105', dealerId: 'ride-lab', title: 'Yamaha MT-07', brand: 'Yamaha', model: 'MT-07', category: 'Naháče', year: 2020, price: 169000, km: 16200, power: 54, engine: 689, city: 'Praha', image: photos.naked },
  { id: 'm-106', dealerId: 'dva-valce', title: 'KTM 690 SMC R', brand: 'KTM', model: '690 SMC R', category: 'Supermoto', year: 2022, price: 219000, km: 8900, power: 55, engine: 693, city: 'Brno', image: photos.enduro },
  { id: 'm-107', dealerId: null, title: 'Honda CB750 Hornet', brand: 'Honda', model: 'CB750 Hornet', category: 'Naháče', year: 2023, price: 159000, km: 10700, power: 67, engine: 755, city: 'Praha', image: photos.naked },
  { id: 'm-108', dealerId: 'north-motors', title: 'Triumph Street Triple 765 RS', brand: 'Triumph', model: 'Street Triple 765 RS', category: 'Naháče', year: 2021, price: 229000, km: 11900, power: 90, engine: 765, city: 'Liberec', image: photos.sport2 },
  { id: 'm-109', dealerId: 'ride-lab', title: 'Ducati Monster 821', brand: 'Ducati', model: 'Monster 821', category: 'Naháče', year: 2018, price: 175000, km: 22000, power: 80, engine: 821, city: 'Praha', image: photos.naked },
  { id: 'm-110', dealerId: 'dva-valce', title: 'Yamaha Ténéré 700', brand: 'Yamaha', model: 'Ténéré 700', category: 'Enduro / Adventure', year: 2022, price: 229900, km: 14100, power: 54, engine: 689, city: 'Brno', image: photos.enduro },
  { id: 'm-111', dealerId: 'north-motors', title: 'Kawasaki Z900', brand: 'Kawasaki', model: 'Z900', category: 'Naháče', year: 2020, price: 168000, km: 18700, power: 92, engine: 948, city: 'Liberec', image: photos.sport3 },
  { id: 'm-112', dealerId: 'ride-lab', title: 'Suzuki GSX-R 750', brand: 'Suzuki', model: 'GSX-R 750', category: 'Sportovní', year: 2011, price: 155000, km: 35000, power: 110, engine: 750, city: 'Praha', image: photos.sport1 },
  { id: 'm-113', dealerId: 'moto-garage', title: 'Honda Africa Twin 1100', brand: 'Honda', model: 'Africa Twin 1100', category: 'Enduro / Adventure', year: 2022, price: 289000, km: 22300, power: 75, engine: 1084, city: 'Plzeň', image: photos.touring },
  { id: 'm-114', dealerId: 'moto-garage', title: 'BMW S 1000 RR', brand: 'BMW', model: 'S 1000 RR', category: 'Sportovní', year: 2020, price: 369000, km: 13200, power: 152, engine: 999, city: 'Plzeň', image: photos.sport3, status: 'draft' },
  { id: 'm-115', dealerId: 'moto-garage', title: 'Yamaha YZF-R6', brand: 'Yamaha', model: 'YZF-R6', category: 'Sportovní', year: 2009, price: 119900, km: 40200, power: 91, engine: 599, city: 'Plzeň', image: photos.sport2, status: 'sold' },
  { id: 'm-116', dealerId: 'ride-lab', title: 'Kawasaki Z650', brand: 'Kawasaki', model: 'Z650', category: 'Naháče', year: 2021, price: 144000, km: 19700, power: 50, engine: 649, city: 'Praha', image: photos.naked, status: 'draft' },
];

export const seededListings: Listing[] = raw.map((item, index) => ({
  ...item,
  gallery: [item.image],
  description: item.description ?? `Ukázková nabídka modelu ${item.title}. Parametry i fotografie slouží k předvedení webu, nikoliv jako podklad ke koupi.`,
  status: item.status ?? 'active',
  updatedAt: item.updatedAt ?? new Date(2026, 9, 12 - Math.min(index, 10), 12, 0).toISOString(),
}));

export const money = (value: number) => `${new Intl.NumberFormat('cs-CZ').format(value)} Kč`;
export const number = (value: number) => new Intl.NumberFormat('cs-CZ').format(value);
export const fallbackImage = '/motobazar/placeholder-moto.svg';

export function getDealer(dealers: Dealer[], id: string | null): Dealer | undefined {
  return id ? dealers.find((dealer) => dealer.id === id) : undefined;
}

export function formatUpdated(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '—';
  return new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' }).format(parsed);
}
