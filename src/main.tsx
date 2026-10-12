import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDown, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight,
  Check, ChevronLeft, ChevronRight, Heart, MapPin, Menu, MoveUpRight,
  Search, ShieldAlert, SlidersHorizontal, X,
} from 'lucide-react';
import {
  categories, fallbackImage, formatUpdated, getDealer, money, number, seededDealers, seededListings,
  type Dealer, type Listing,
} from './data';
import { readDealers, readFavorites, readListings, resetDemo, saveDealers, saveFavorites, saveListings } from './storage';
import { initialFilters, ListingCard, SearchDock, SectionHeader, SelectMenu, type Filters } from './components';
import { Dashboard } from './dashboard';
import './style.css';

type Route = { page: 'home' | 'catalog' | 'dealers' | 'dealer' | 'detail' | 'favorites' | 'dashboard'; id?: string };
type Sort = 'newest' | 'cheapest' | 'expensive' | 'least-km';

function parseRoute(): Route {
  const raw = decodeURIComponent(window.location.hash.replace(/^#\/?/, ''));
  if (raw === 'motorky') return { page: 'catalog' };
  if (raw === 'bazary') return { page: 'dealers' };
  if (raw === 'oblibene') return { page: 'favorites' };
  if (raw === 'sprava') return { page: 'dashboard' };
  if (raw.startsWith('bazar/')) return { page: 'dealer', id: raw.slice(6) };
  if (raw.startsWith('motorka/')) return { page: 'detail', id: raw.slice(8) };
  return { page: 'home' };
}

const routeToHash = (page: Route['page'], id?: string) => {
  const root: Record<Route['page'], string> = {
    home: '', catalog: 'motorky', dealers: 'bazary', dealer: `bazar/${id ?? ''}`,
    detail: `motorka/${id ?? ''}`, favorites: 'oblibene', dashboard: 'sprava',
  };
  return root[page];
};

function App() {
  const [route, setRoute] = useState<Route>(parseRoute);
  const [listings, setListings] = useState<Listing[]>(readListings);
  const [dealers, setDealers] = useState<Dealer[]>(readDealers);
  const [favorites, setFavorites] = useState<string[]>(readFavorites);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [sort, setSort] = useState<Sort>('newest');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dealerId, setDealerId] = useState(() => window.localStorage.getItem('motobazar:demo-selected-dealer') || 'ride-lab');
  const [imageIndex, setImageIndex] = useState(0);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    const onChange = () => { setRoute(parseRoute()); setMobileMenuOpen(false); setImageIndex(0); window.scrollTo({ top: 0, behavior: 'auto' }); };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  useEffect(() => { try { saveListings(listings); } catch { /* Storage can be disabled. */ } }, [listings]);
  useEffect(() => { try { saveDealers(dealers); } catch { /* Storage can be disabled. */ } }, [dealers]);
  useEffect(() => { try { saveFavorites(favorites); } catch { /* Storage can be disabled. */ } }, [favorites]);
  useEffect(() => { try { window.localStorage.setItem('motobazar:demo-selected-dealer', dealerId); } catch { /* Storage can be disabled. */ } }, [dealerId]);
  useEffect(() => () => { if (toastTimer.current !== null) window.clearTimeout(toastTimer.current); }, []);

  const go = (page: Route['page'], id?: string) => {
    const nextHash = routeToHash(page, id);
    if (window.location.hash.replace(/^#/, '') !== nextHash) window.location.hash = nextHash ? `#${nextHash}` : '#';
    setRoute({ page, id });
    setMobileMenuOpen(false);
    setImageIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const notify = (message: string) => {
    setToast(message);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 3500);
  };

  const activeListings = useMemo(() => listings.filter((item) => item.status === 'active'), [listings]);
  const visibleListings = useMemo(() => {
    const query = filters.query.trim().toLocaleLowerCase('cs-CZ');
    const available = activeListings.filter((item) => {
      if (filters.brand && item.brand !== filters.brand) return false;
      if (filters.category && item.category !== filters.category) return false;
      if (filters.price && item.price > Number(filters.price)) return false;
      if (filters.year && item.year < Number(filters.year)) return false;
      if (filters.km && item.km > Number(filters.km)) return false;
      if (!query) return true;
      const dealer = getDealer(dealers, item.dealerId);
      return [item.title, item.brand, item.model, item.city, dealer?.name ?? ''].some((field) => field.toLocaleLowerCase('cs-CZ').includes(query));
    });
    if (sort === 'cheapest') return available.sort((a, b) => a.price - b.price);
    if (sort === 'expensive') return available.sort((a, b) => b.price - a.price);
    if (sort === 'least-km') return available.sort((a, b) => a.km - b.km);
    return available.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [activeListings, dealers, filters, sort]);

  const favoriteListings = activeListings.filter((item) => favorites.includes(item.id));
  const openedListing = activeListings.find((item) => item.id === route.id);
  const openedDealer = dealers.find((dealer) => dealer.slug === route.id);
  const chosenDealer = dealers.find((dealer) => dealer.id === dealerId) ?? dealers[0];

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]);
  };

  const setQuickFilter = (category: string) => { setFilters({ ...initialFilters, category: category === 'Všechny' ? '' : category }); go('catalog'); };
  const onSaveListing = (value: Listing) => {
    setListings((prev) => prev.some((item) => item.id === value.id) ? prev.map((item) => item.id === value.id ? value : item) : [value, ...prev]);
  };
  const onSaveDealer = (value: Dealer) => setDealers((prev) => prev.map((dealer) => dealer.id === value.id ? value : dealer));

  const Header = () => (
    <header className="site-header">
      <div className="header-inner">
        <button className="site-wordmark" type="button" onClick={() => go('home')} aria-label="MotoBazar – domů">
          <span className="logo-glyph" aria-hidden="true"><i /><i /><i /></span>
          <span className="logo-type">MOTO<span>BAZAR</span><sup>®</sup></span>
        </button>
        <nav className={`primary-nav ${mobileMenuOpen ? 'nav-open' : ''}`} aria-label="Hlavní navigace">
          <button className={route.page === 'catalog' ? 'active' : ''} onClick={() => go('catalog')}>MOTORKY</button>
          <button className={route.page === 'dealers' || route.page === 'dealer' ? 'active' : ''} onClick={() => go('dealers')}>BAZARY</button>
          <button className={route.page === 'favorites' ? 'active' : ''} onClick={() => go('favorites')}>ULOŽENÉ <span className="saved-count">{favorites.length}</span></button>
        </nav>
        <div className="header-actions">
          <button type="button" className="admin-entry" onClick={() => go('dashboard')}>PRO PRODEJCE <ArrowUpRight size={16} /></button>
          <button type="button" className="mobile-menu-button" aria-label={mobileMenuOpen ? 'Zavřít menu' : 'Otevřít menu'} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((prev) => !prev)}>{mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>
    </header>
  );

  const renderCards = (items: Listing[]) => (
    <div className="listing-grid">
      {items.map((item) => (
        <ListingCard key={item.id} item={item} dealer={getDealer(dealers, item.dealerId)} favorite={favorites.includes(item.id)} onFavorite={toggleFavorite} onOpen={(id) => go('detail', id)} onDealer={(slug) => go('dealer', slug)} />
      ))}
    </div>
  );

  const dealerCard = (dealer: Dealer, index: number) => {
    const count = activeListings.filter((item) => item.dealerId === dealer.id).length;
    return <button type="button" key={dealer.id} className="dealer-card" onClick={() => go('dealer', dealer.slug)} style={{ '--dealer-accent': dealer.accent } as React.CSSProperties}>
      <div className="dealer-card-top"><span>{String(index + 1).padStart(2, '0')} / BAZAR</span><ArrowUpRight size={24} /></div>
      <div className="dealer-monogram">{dealer.monogram}</div>
      <div className="dealer-card-info"><div className="dealer-card-location"><MapPin size={14} /> {dealer.city.toUpperCase()} · {count} MOTOREK</div><h3>{dealer.name}</h3><p>{dealer.tagline}</p></div>
    </button>;
  };

  return (
    <div className="site-shell">
      <div className="utility-strip"><span>MOTOBAZAR / CZ</span><span>INZERCE MOTOREK BEZ BALASTU.</span><span>VERZE 01 — DEMO</span></div>
      <Header />

      <main id="main-content">
        {route.page === 'home' && (
          <>
            <section className="hero-section">
              <div className="hero-content">
                <div className="hero-serial"><span className="serial-square" /> TRH S MOTORKAMI / 01</div>
                <h1>NAJDI<br /><em>TEN SVŮJ.</em></h1>
                <p>Motorky. Přehledně. Bez oklik.</p>
                <div className="hero-lower"><span>PROJEĎ NABÍDKU <ArrowDown size={17} /></span><span className="hero-symbol">M<span>\</span>B</span></div>
              </div>
              <div className="hero-visual">
                <img src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1600&q=85" alt="Motocykl – ilustrační fotografie" />
                <span className="hero-visual-caption">/ SVOBODA NA DVOU KOLECH</span>
                <div className="hero-visual-number">01<span>/04</span></div>
              </div>
            </section>

            <div className="hero-search-wrap">
              <SearchDock filters={filters} onChange={setFilters} onSearch={() => go('catalog')} items={activeListings} />
            </div>

            <div className="browse-rail">
              <span>PROHLÉDNOUT PODLE TYPU</span>
              <div className="browse-rail-links">
                {['Sportovní', 'Naháče', 'Enduro / Adventure', 'Cestovní'].map((category, index) => (
                  <button key={category} type="button" onClick={() => setQuickFilter(category)}><span>0{index + 1}</span>{category.toUpperCase()} <ArrowUpRight size={16} /></button>
                ))}
              </div>
            </div>

            <section className="content-section">
              <SectionHeader kicker="01 / KATALOG" title="PRÁVĚ V NABÍDCE" action="VŠECHNY MOTORKY" onAction={() => go('catalog')} />
              {renderCards(activeListings.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6))}
            </section>

            <section className="dealer-feature-section">
              <div className="feature-copy"><span className="eyebrow-alt">02 / PRODEJCI</span><h2>BAZARY,<br /><em>CO MAJÍ STYL.</em></h2><p>Vlastní stránka. Jedna správa. Žádný zmatek.</p><button type="button" onClick={() => go('dealers')}>PROHLÉDNOUT BAZARY <ArrowUpRight size={20} /></button></div>
              <div className="feature-dealers">{dealers.slice(0, 2).map((dealer, index) => dealerCard(dealer, index))}</div>
            </section>
          </>
        )}

        {route.page === 'catalog' && (
          <>
            <section className="page-heading"><div className="page-heading-top"><span>01 / KATALOG</span><span>{number(activeListings.length)} UKÁZKOVÝCH NABÍDEK</span></div><h1>VŠECHNY <em>MOTORKY.</em></h1></section>
            <div className="catalog-search"><SearchDock filters={filters} onChange={setFilters} onSearch={() => window.scrollTo({ top: 400, behavior: 'smooth' })} compact items={activeListings} /></div>
            <section className="catalog-results content-section">
              <div className="results-bar">
                <div className="results-left"><span className="results-label">VÝSLEDKY / {String(visibleListings.length).padStart(2, '0')}</span>{Object.values(filters).some(Boolean) && <button className="clear-action" onClick={() => setFilters(initialFilters)}>VYMAZAT FILTRY <X size={15} /></button>}</div>
                <div className="sort-area"><SelectMenu label="ŘADIT" value={sort} onChange={(value) => setSort(value as Sort)} options={[{value:'newest',label:'Nejnovější'},{value:'cheapest',label:'Nejlevnější'},{value:'expensive',label:'Nejdražší'},{value:'least-km',label:'Nejméně km'}]} /></div>
              </div>
              {visibleListings.length ? renderCards(visibleListings) : <div className="empty-results"><Search size={32}/><h2>NIC TU NENÍ.</h2><p>Zkus trochu povolit filtry.</p><button type="button" className="primary-button" onClick={() => setFilters(initialFilters)}>VYMAZAT FILTRY <ArrowRight size={18}/></button></div>}
            </section>
          </>
        )}

        {route.page === 'favorites' && (
          <section className="content-section standalone-section"><SectionHeader kicker="03 / OBLÍBENÉ" title="TVŮJ VÝBĚR." action="ZPĚT DO KATALOGU" onAction={() => go('catalog')} />
            {favoriteListings.length ? renderCards(favoriteListings) : <div className="empty-results"><Heart size={30} /><h2>JEŠTĚ NIC.</h2><p>Ulož si motorky srdíčkem. Zůstanou tady v tomhle prohlížeči.</p><button className="primary-button" type="button" onClick={() => go('catalog')}>PROCHÁZET MOTORKY <ArrowRight size={18}/></button></div>}
          </section>
        )}

        {route.page === 'dealers' && (
          <section className="content-section dealers-page standalone-section">
            <div className="page-heading page-heading-inner"><div className="page-heading-top"><span>02 / PRODEJCI</span><span>{String(dealers.length).padStart(2, '0')} BAZARY / DEMO</span></div><h1>TI, CO <em>PRODÁVAJÍ.</em></h1><p>Každý bazar má svůj vlastní prostor. Bez uniformních šablon.</p></div>
            <div className="dealer-directory">{dealers.map((dealer, index) => dealerCard(dealer, index))}</div>
            <div className="dealer-cta-inline"><span>MÁŠ VLASTNÍ MOTOBAZAR?</span><button type="button" onClick={() => go('dashboard')}>VYZKOUŠET SPRÁVU NABÍDKY <ArrowUpRight size={18} /></button></div>
          </section>
        )}

        {route.page === 'dealer' && openedDealer && (
          <>
            <section className="dealer-page-hero" style={{ '--dealer-accent': openedDealer.accent } as React.CSSProperties}>
              <div className="dealer-hero-info"><button className="back-on-dark" onClick={() => go('dealers')}><ArrowLeft size={16} /> VŠECHNY BAZARY</button><span className="dealer-hero-kicker">PARTNERSKÝ PROFIL / DEMO — {openedDealer.city.toUpperCase()}</span><h1>{openedDealer.name}</h1><p>{openedDealer.tagline}</p><div className="dealer-hero-bottom"><span><MapPin size={16}/> {openedDealer.city.toUpperCase()}</span><span>{String(activeListings.filter((item)=>item.dealerId===openedDealer.id).length).padStart(2,'0')} / MOTOREK V NABÍDCE</span></div></div>
              <div className="dealer-hero-emblem"><span>{openedDealer.monogram}</span><ArrowUpRight size={46} /></div>
            </section>
            <section className="dealer-public-main content-section">
              <div className="dealer-about"><div><span className="eyebrow-alt">01 / O BAZARU</span><h2>VÍME, CO<br/>JEZDÍ.</h2></div><p>{openedDealer.description}</p><button type="button" onClick={() => go('dashboard')}>OTEVŘÍT DEMO SPRÁVY <ArrowUpRight size={17}/></button></div>
              <SectionHeader kicker="02 / NABÍDKA" title="MOTORKY BAZARU" />
              {(() => {const items = activeListings.filter((item) => item.dealerId === openedDealer.id); return items.length ? renderCards(items) : <div className="empty-results"><h2>TEĎ ŽÁDNÉ MOTORKY.</h2><p>Nové inzeráty se objeví po zveřejnění v demo správě.</p></div>;})()}
            </section>
          </>
        )}

        {route.page === 'detail' && openedListing && (
          <section className="detail-page standalone-section">
            <div className="detail-crumb"><button onClick={() => go('catalog')}><ArrowLeft size={16}/> ZPĚT NA MOTORKY</button><span>DETAIL / {openedListing.brand.toUpperCase()}</span></div>
            <div className="detail-topbar"><div><div className="eyebrow-alt">{openedListing.category.toUpperCase()} / {openedListing.year}</div><h1>{openedListing.title}</h1></div><button className={`detail-fav ${favorites.includes(openedListing.id) ? 'saved' : ''}`} onClick={() => toggleFavorite(openedListing.id)}><Heart size={21} fill={favorites.includes(openedListing.id) ? 'currentColor' : 'none'}/> {favorites.includes(openedListing.id) ? 'ULOŽENO' : 'ULOŽIT'}</button></div>
            <div className="detail-layout"><div className="detail-gallery"><div className="detail-main-image"><img src={openedListing.gallery[imageIndex] || openedListing.image || fallbackImage} alt={`Ilustrační fotografie ${openedListing.title}`} onError={(event) => { event.currentTarget.src = fallbackImage; }}/><span>FOTO JE ILUSTRAČNÍ</span>{openedListing.gallery.length > 1 && <div className="gallery-buttons"><button onClick={()=>setImageIndex((prev)=>(prev-1+openedListing.gallery.length)%openedListing.gallery.length)} aria-label="Předchozí fotografie"><ChevronLeft size={20}/></button><button onClick={()=>setImageIndex((prev)=>(prev+1)%openedListing.gallery.length)} aria-label="Další fotografie"><ChevronRight size={20}/></button></div>}</div><div className="detail-thumbs">{openedListing.gallery.map((src,index)=><button type="button" key={`${src}-${index}`} className={imageIndex===index?'active':''} onClick={()=>setImageIndex(index)}><img src={src||fallbackImage} alt={`${openedListing.title} fotografie ${index+1}`} onError={(e)=>{e.currentTarget.src=fallbackImage;}} /></button>)}</div><div className="detail-description"><span className="eyebrow-alt">POPIS / DEMO</span><p>{openedListing.description || 'Bez dalšího popisu.'}</p></div></div>
              <aside className="detail-aside"><div className="detail-price"><span>CENA</span><strong>{money(openedListing.price)}</strong></div><div className="technical-list">{[['ROK VÝROBY',String(openedListing.year)],['NAJETO',`${number(openedListing.km)} km`],['VÝKON',`${openedListing.power} kW`],['OBJEM',`${openedListing.engine} cm³`],['LOKALITA',openedListing.city],['UPRAVENO',formatUpdated(openedListing.updatedAt)]].map(([name,value])=><div key={name}><span>{name}</span><strong>{value}</strong></div>)}</div><div className="detail-seller"><span>PRODEJCE</span><strong>{getDealer(dealers,openedListing.dealerId)?.name||'SOUKROMÝ PRODEJCE'}</strong><small>{openedListing.city}</small>{openedListing.dealerId && <button type="button" onClick={()=>go('dealer',getDealer(dealers,openedListing.dealerId)?.slug)}>PROFIL BAZARU <ArrowUpRight size={17}/></button>}</div><button className="detail-contact" type="button" onClick={()=>notify('Kontaktování prodejců doplníme po spuštění skutečné inzerce.')}><ArrowUpRight size={19}/> KONTAKTOVAT PRODEJCE</button><p className="detail-note"><ShieldAlert size={15}/> Demo: fotky a technické údaje nejsou prověřené.</p></aside></div>
          </section>
        )}

        {route.page === 'dashboard' && (
          <Dashboard
            dealers={dealers}
            selectedDealerId={chosenDealer.id}
            listings={listings}
            onSelectDealer={setDealerId}
            onSaveListing={onSaveListing}
            onDeleteListing={(id) => setListings((prev) => prev.filter((item) => item.id !== id))}
            onSaveDealer={onSaveDealer}
            onPublic={(slug) => go('dealer', slug)}
            onNotice={notify}
          />
        )}

        {(route.page === 'detail' && !openedListing || route.page === 'dealer' && !openedDealer) && <section className="empty-results standalone-section"><h1>STRÁNKA NENALEZENA.</h1><button className="primary-button" onClick={() => go('home')}>ZPĚT NA ÚVOD <ArrowRight size={18}/></button></section>}
      </main>

      <footer className="site-footer"><div className="footer-logo">MOTO<span>BAZAR.</span></div><div><span>MADE FOR THE RIDE.</span><small>Jde o funkční prototyp. Nabídky, bazary a fotografie jsou ukázkové.</small></div><div className="footer-actions"><button type="button" onClick={() => go('dashboard')}>DEMO ADMINISTRACE <MoveUpRight size={16}/></button><button type="button" onClick={() => { if (window.confirm('Vrátit ukázková data do původního stavu?')) { resetDemo(); setListings(seededListings); setDealers(seededDealers); setFavorites([]); notify('Ukázková data obnovena.'); } }}>RESET DEMO DAT</button></div></footer>
      {toast && <div className="toast" role="status"><Check size={17}/>{toast}<button type="button" aria-label="Zavřít oznámení" onClick={() => setToast('')}><X size={15}/></button></div>}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
