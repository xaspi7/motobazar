import { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowDownRight, ArrowRight, Check, ChevronDown, Heart, MapPin,
  Search, SlidersHorizontal, X,
} from 'lucide-react';
import { brands, categories, fallbackImage, money, number, type Dealer, type Listing } from './data';

export type Filters = {
  query: string;
  brand: string;
  category: string;
  price: string;
  year: string;
  km: string;
};

export const initialFilters: Filters = {
  query: '', brand: '', category: '', price: '', year: '', km: '',
};

interface MenuOption { value: string; label: string; meta?: string }

export function SelectMenu({
  label, value, options, onChange, className = '',
}: {
  label: string;
  value: string;
  options: MenuOption[];
  onChange: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const id = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (host.current && !host.current.contains(event.target as Node)) setOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onEscape);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  const choose = (option: MenuOption) => {
    onChange(option.value);
    setOpen(false);
  };

  return (
    <div ref={host} className={`field-menu ${className}`}>
      <span className="field-caption">{label}</span>
      <button
        className="menu-value"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => { setOpen((prev) => !prev); setFocused(Math.max(0, options.findIndex((o) => o.value === value))); }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (!open) { setOpen(true); return; }
            setFocused((prev) => Math.max(0, Math.min(options.length - 1, prev + (event.key === 'ArrowDown' ? 1 : -1))));
          }
          if (event.key === 'Enter' && open) { event.preventDefault(); choose(options[focused]); }
        }}
      >
        <span>{selected?.label || 'Vybrat'}</span>
        <ChevronDown size={15} strokeWidth={2.2} className={open ? 'turned' : ''} />
      </button>
      {open && (
        <div id={id} className="menu-options" role="listbox" aria-label={label}>
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`menu-option ${option.value === value || focused === index ? 'is-focused' : ''}`}
              onMouseEnter={() => setFocused(index)}
              onClick={() => choose(option)}
            >
              <span>{option.label}</span>
              {option.meta && <small>{option.meta}</small>}
              {option.value === value && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchInput({
  query, onChange, onSearch, items,
}: {
  query: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  items: Listing[];
}) {
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [focused, setFocused] = useState(-1);
  const host = useRef<HTMLDivElement>(null);

  const suggestions = [...new Set(items.map((item) => item.title))]
    .filter((title) => title.toLocaleLowerCase('cs-CZ').includes(query.trim().toLocaleLowerCase('cs-CZ')))
    .slice(0, 5);

  useEffect(() => {
    if (!suggestionsOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (host.current && !host.current.contains(event.target as Node)) setSuggestionsOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [suggestionsOpen]);

  return (
    <div className="search-input-wrap" ref={host}>
      <Search size={22} strokeWidth={1.7} />
      <input
        type="search"
        value={query}
        aria-label="Hledat motorku podle modelu nebo místa"
        onFocus={() => setSuggestionsOpen(true)}
        onChange={(event) => { onChange(event.target.value); setFocused(-1); setSuggestionsOpen(true); }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && suggestions.length) {
            event.preventDefault(); setFocused((prev) => Math.min(suggestions.length - 1, prev + 1));
          }
          if (event.key === 'ArrowUp' && suggestions.length) {
            event.preventDefault(); setFocused((prev) => Math.max(-1, prev - 1));
          }
          if (event.key === 'Escape') setSuggestionsOpen(false);
          if (event.key === 'Enter') {
            if (focused >= 0 && suggestions[focused]) onChange(suggestions[focused]);
            setSuggestionsOpen(false);
            onSearch();
          }
        }}
        placeholder="Značka, model nebo město…"
      />
      {query && (
        <button type="button" className="search-clear" aria-label="Vymazat hledání" onClick={() => { onChange(''); setSuggestionsOpen(true); }}>
          <X size={16} />
        </button>
      )}
      {suggestionsOpen && query.trim().length > 0 && suggestions.length > 0 && (
        <div className="search-suggestions" role="listbox" aria-label="Návrhy motorek">
          <div className="suggestions-heading">PODOBNÉ MODELY</div>
          {suggestions.map((title, index) => (
            <button
              type="button"
              role="option"
              aria-selected={focused === index}
              key={title}
              className={focused === index ? 'active' : ''}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => { onChange(title); setSuggestionsOpen(false); onSearch(); }}
            >
              <Search size={15} /> {title} <ArrowRight size={14} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SearchDock({
  filters, onChange, onSearch, items, compact = false,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  onSearch: () => void;
  items: Listing[];
  compact?: boolean;
}) {
  const [advanced, setAdvanced] = useState(false);
  const change = (key: keyof Filters, value: string) => onChange({ ...filters, [key]: value });
  const brandOptions = [{ value: '', label: 'Všechny značky' }, ...brands.map((brand) => ({ value: brand, label: brand }))];
  const categoryOptions = [{ value: '', label: 'Všechny typy' }, ...categories.map((category) => ({ value: category, label: category }))];
  return (
    <div className={`search-dock ${compact ? 'search-dock-compact' : ''}`}>
      <div className="search-main-row">
        <SearchInput
          query={filters.query}
          onChange={(value) => change('query', value)}
          onSearch={onSearch}
          items={items}
        />
        <button className="search-action" type="button" onClick={onSearch}>
          HLEDAT <ArrowRight size={20} />
        </button>
      </div>
      <div className="search-fields-row">
        <SelectMenu label="ZNAČKA" value={filters.brand} options={brandOptions} onChange={(value) => change('brand', value)} />
        <SelectMenu label="TYP MOTORKY" value={filters.category} options={categoryOptions} onChange={(value) => change('category', value)} />
        <label className="search-numeric">
          <span className="field-caption">CENA DO</span>
          <div className="numeric-inner">
            <input
              aria-label="Maximální cena v korunách"
              inputMode="numeric"
              value={filters.price}
              onChange={(event) => change('price', event.target.value.replace(/[^\d]/g, ''))}
              placeholder="Bez limitu"
            />
            <span>KČ</span>
          </div>
        </label>
        <button className={`advanced-trigger ${advanced ? 'active' : ''}`} type="button" onClick={() => setAdvanced((prev) => !prev)} aria-expanded={advanced}>
          <SlidersHorizontal size={17} /> DALŠÍ FILTRY <span>{advanced ? '−' : '+'}</span>
        </button>
      </div>
      {advanced && (
        <div className="advanced-row">
          <label>
            <span className="field-caption">ROK OD</span>
            <input inputMode="numeric" value={filters.year} placeholder="Libovolný" onChange={(e) => change('year', e.target.value.replace(/[^\d]/g, ''))} />
          </label>
          <label>
            <span className="field-caption">MAX. KM</span>
            <input inputMode="numeric" value={filters.km} placeholder="Bez limitu" onChange={(e) => change('km', e.target.value.replace(/[^\d]/g, ''))} />
          </label>
          <button type="button" onClick={() => onChange(initialFilters)} className="reset-filters">VYMAZAT FILTRY <X size={15} /></button>
        </div>
      )}
    </div>
  );
}

export function ListingCard({
  item, dealer, favorite, onFavorite, onOpen, onDealer,
}: {
  item: Listing;
  dealer?: Dealer;
  favorite: boolean;
  onFavorite: (id: string) => void;
  onOpen: (id: string) => void;
  onDealer: (slug: string) => void;
}) {
  return (
    <article className="listing-card">
      <div className="listing-cover">
        <button className="cover-button" type="button" onClick={() => onOpen(item.id)} aria-label={`Zobrazit ${item.title}`}>
          <img src={item.image || fallbackImage} onError={(event) => { event.currentTarget.src = fallbackImage; }} loading="lazy" alt={`Ilustrační foto – ${item.title}`} />
        </button>
        <div className="photo-indicator">FOTO ILUSTRAČNÍ</div>
        <button type="button" className={`save-button ${favorite ? 'is-saved' : ''}`} onClick={() => onFavorite(item.id)} aria-label={favorite ? `Odebrat ${item.title} z oblíbených` : `Uložit ${item.title}`}>
          <Heart size={17} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="listing-details">
        <div className="listing-meta"><span>{item.brand.toUpperCase()}</span><span>{item.year}</span></div>
        <button className="listing-title-button" type="button" onClick={() => onOpen(item.id)}><h3>{item.title}</h3></button>
        <div className="listing-price">{money(item.price)}</div>
        <div className="listing-foot-facts"><span>{number(item.km)} KM</span><span>{item.engine} CM³</span><span><MapPin size={12} /> {item.city.toUpperCase()}</span></div>
        <div className="listing-footer">
          {dealer ? (
            <button type="button" className="dealer-inline" onClick={() => onDealer(dealer.slug)}>{dealer.name} <ArrowDownRight size={14} /></button>
          ) : <span className="dealer-inline muted">SOUKROMÝ PRODEJCE</span>}
          <button type="button" className="arrow-action" onClick={() => onOpen(item.id)} aria-label={`Detail motorky ${item.title}`}><ArrowRight size={19} /></button>
        </div>
      </div>
    </article>
  );
}

export function SectionHeader({ kicker, title, action, onAction }: { kicker: string; title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="section-header">
      <div><p className="micro-kicker">{kicker}</p><h2>{title}</h2></div>
      {action && onAction && <button className="line-action" type="button" onClick={onAction}>{action} <ArrowRight size={18} /></button>}
    </div>
  );
}
