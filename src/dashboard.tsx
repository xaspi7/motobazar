import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowDownRight, ArrowLeft, ArrowRight, Check, ChevronDown, CirclePause,
  ClipboardList, ExternalLink, Image as ImageIcon, LayoutDashboard, Pencil,
  Plus, Search, Settings2, Trash2, X,
} from 'lucide-react';
import {
  brands, categories, fallbackImage, formatUpdated, money, number,
  type Dealer, type Listing, type ListingStatus,
} from './data';
import { SelectMenu } from './components';

type DashboardTab = 'overview' | 'listings' | 'profile';

export function Dashboard({
  dealers, selectedDealerId, listings, onSelectDealer, onSaveListing,
  onDeleteListing, onSaveDealer, onPublic, onNotice,
}: {
  dealers: Dealer[];
  selectedDealerId: string;
  listings: Listing[];
  onSelectDealer: (id: string) => void;
  onSaveListing: (listing: Listing) => void;
  onDeleteListing: (id: string) => void;
  onSaveDealer: (dealer: Dealer) => void;
  onPublic: (slug: string) => void;
  onNotice: (message: string) => void;
}) {
  const dealer = dealers.find((value) => value.id === selectedDealerId) ?? dealers[0];
  const own = useMemo(() => listings.filter((item) => item.dealerId === dealer.id), [listings, dealer.id]);
  const [tab, setTab] = useState<DashboardTab>('overview');
  const [editing, setEditing] = useState<Listing | 'new' | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | ListingStatus>('all');
  const [search, setSearch] = useState('');
  const shown = own.filter((item) => {
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchText = `${item.title} ${item.brand} ${item.model}`.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchText;
  });

  useEffect(() => { setSearch(''); setStatusFilter('all'); }, [selectedDealerId]);

  const activeCount = own.filter((item) => item.status === 'active').length;
  const draftCount = own.filter((item) => item.status === 'draft').length;
  const soldCount = own.filter((item) => item.status === 'sold').length;

  function changeStatus(item: Listing, status: ListingStatus) {
    onSaveListing({ ...item, status, updatedAt: new Date().toISOString() });
    onNotice(status === 'active' ? 'Inzerát je znovu aktivní.' : status === 'draft' ? 'Inzerát je pozastavený.' : 'Motorka je označená jako prodaná.');
  }

  function remove(item: Listing) {
    if (!window.confirm(`Opravdu smazat „${item.title}“? Tato změna se projeví jen v tomto prohlížeči.`)) return;
    onDeleteListing(item.id);
    onNotice('Inzerát odstraněn z tohoto dema.');
  }

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="sidebar-topline"><span className="status-dot" /> DEALER / STUDIO</div>
        <div className="dealer-switcher">
          <SelectMenu
            label="UKÁZKOVÝ BAZAR"
            value={dealer.id}
            onChange={onSelectDealer}
            options={dealers.map((entry) => ({ value: entry.id, label: entry.name, meta: entry.city }))}
          />
        </div>
        <nav className="dashboard-nav" aria-label="Správa bazaru">
          <button type="button" className={tab === 'overview' ? 'selected' : ''} onClick={() => setTab('overview')}><LayoutDashboard size={17} /> Přehled <ArrowRight size={15} /></button>
          <button type="button" className={tab === 'listings' ? 'selected' : ''} onClick={() => setTab('listings')}><ClipboardList size={17} /> Inzeráty <span>{own.length}</span></button>
          <button type="button" className={tab === 'profile' ? 'selected' : ''} onClick={() => setTab('profile')}><Settings2 size={17} /> Profil bazaru <ArrowRight size={15} /></button>
        </nav>
        <div className="sidebar-bottom">
          <span className="sidebar-bottom-title">NEVEŘEJNÁ SPRÁVA JEŠTĚ VE VÝVOJI</span>
          <p>Teď jde o veřejně přístupné demo. Žádná hesla, sdílená databáze ani skutečné účty.</p>
          <button type="button" onClick={() => onPublic(dealer.slug)}>Otevřít stránku bazaru <ExternalLink size={15} /></button>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-breadcrumb"><span>DEMO ADMINISTRACE</span> / {dealer.name}</div>

        <div className="dashboard-title-row">
          <div>
            <div className="eyebrow-alt">{tab === 'overview' ? '00 / PŘEHLED' : tab === 'listings' ? '01 / INZERCE' : '02 / PROFIL'}</div>
            <h1>{tab === 'overview' ? 'Na jednom místě.' : tab === 'listings' ? 'Vaše inzeráty.' : 'Vaše značka.'}</h1>
          </div>
          {tab !== 'profile' && <button className="primary-button dashboard-add" type="button" onClick={() => setEditing('new')}><Plus size={19} /> NOVÝ INZERÁT</button>}
        </div>

        {tab === 'overview' && (
          <>
            <div className="stat-grid">
              <button type="button" onClick={() => { setTab('listings'); setStatusFilter('active'); }}><span>AKTIVNÍ</span><strong>{number(activeCount).padStart(2, '0')}</strong><small>ZOBRAZUJÍ SE NA WEBU <ArrowDownRight size={15} /></small></button>
              <button type="button" onClick={() => { setTab('listings'); setStatusFilter('draft'); }}><span>ROZPRACOVANÉ</span><strong>{number(draftCount).padStart(2, '0')}</strong><small>NEJSOU ZVEŘEJNĚNÉ <ArrowDownRight size={15} /></small></button>
              <button type="button" onClick={() => { setTab('listings'); setStatusFilter('sold'); }}><span>PRODANÉ</span><strong>{number(soldCount).padStart(2, '0')}</strong><small>ULOŽENÉ V HISTORII <ArrowDownRight size={15} /></small></button>
            </div>
            <div className="admin-section-head"><div><span className="eyebrow-alt">POSLEDNÍ ZMĚNY</span><h2>Aktuální nabídka</h2></div><button type="button" onClick={() => setTab('listings')}>SPRAVOVAT VŠE <ArrowRight size={17} /></button></div>
            <div className="admin-list">
              {own.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5).map((item) => (
                <AdminRow key={item.id} item={item} onEdit={() => setEditing(item)} onToggle={() => changeStatus(item, item.status === 'active' ? 'draft' : 'active')} onDelete={() => remove(item)} />
              ))}
            </div>
            <div className="admin-smallprint">Změny jsou uložené pouze v tomto prohlížeči. Neovlivňují žádné skutečné inzeráty.</div>
          </>
        )}

        {tab === 'listings' && (
          <>
            <div className="admin-controls">
              <div className="admin-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Hledat ve vlastní nabídce…" aria-label="Hledat v nabídce bazaru" /></div>
              <div className="admin-tabs" role="group" aria-label="Stav inzerátů">
                {([['all', 'Vše'], ['active', 'Aktivní'], ['draft', 'Koncepty'], ['sold', 'Prodané']] as const).map(([value, label]) => <button type="button" key={value} className={statusFilter === value ? 'active' : ''} onClick={() => setStatusFilter(value)}>{label}</button>)}
              </div>
            </div>
            <div className="admin-list">
              {shown.length > 0 ? shown.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map((item) => (
                <AdminRow key={item.id} item={item} onEdit={() => setEditing(item)} onToggle={() => changeStatus(item, item.status === 'active' ? 'draft' : 'active')} onDelete={() => remove(item)} />
              )) : (
                <div className="admin-empty"><strong>Tady zatím nic není.</strong><p>Zkus jiný filtr nebo přidej první inzerát.</p><button type="button" onClick={() => setEditing('new')}>PŘIDAT MOTORKU <Plus size={18} /></button></div>
              )}
            </div>
          </>
        )}

        {tab === 'profile' && (
          <DealerProfileEditor
            key={dealer.id}
            dealer={dealer}
            onSave={(updated) => { onSaveDealer(updated); onNotice('Profil bazaru uložený v tomto prohlížeči.'); }}
            onPublic={() => onPublic(dealer.slug)}
          />
        )}
      </main>

      {editing !== null && (
        <ListingEditor
          key={editing === 'new' ? `new-${dealer.id}` : editing.id}
          dealer={dealer}
          initial={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(updated) => {
            onSaveListing(updated);
            setEditing(null);
            onNotice('Inzerát uložený. Změna je vidět na stránce bazaru.');
            setTab('listings');
            setStatusFilter('all');
          }}
        />
      )}
    </div>
  );
}

function AdminRow({ item, onEdit, onToggle, onDelete }: { item: Listing; onEdit: () => void; onToggle: () => void; onDelete: () => void }) {
  return (
    <article className="admin-row">
      <div className="admin-product">
        <img src={item.image || fallbackImage} onError={(event) => { event.currentTarget.src = fallbackImage; }} alt="Ilustrační fotografie motocyklu" />
        <div><strong>{item.title}</strong><span>{item.year} / {number(item.km)} KM · UPRAVENO {formatUpdated(item.updatedAt)}</span></div>
      </div>
      <div className="admin-price">{money(item.price)}</div>
      <span className={`status-badge status-${item.status}`}>{item.status === 'active' ? 'AKTIVNÍ' : item.status === 'draft' ? 'KONCEPT' : 'PRODÁNO'}</span>
      <div className="admin-row-actions">
        <button title="Upravit" aria-label={`Upravit ${item.title}`} type="button" onClick={onEdit}><Pencil size={17} /></button>
        <button title={item.status === 'active' ? 'Pozastavit' : 'Aktivovat'} aria-label={`${item.status === 'active' ? 'Pozastavit' : 'Aktivovat'} ${item.title}`} type="button" onClick={onToggle}>{item.status === 'active' ? <CirclePause size={17} /> : <Check size={17} />}</button>
        <button title="Smazat" aria-label={`Smazat ${item.title}`} type="button" className="danger" onClick={onDelete}><Trash2 size={17} /></button>
      </div>
    </article>
  );
}

type EditorFields = {
  title: string;
  brand: string;
  model: string;
  category: string;
  price: string;
  year: string;
  km: string;
  power: string;
  engine: string;
  city: string;
  image: string;
  description: string;
  status: ListingStatus;
};

function ListingEditor({ dealer, initial, onClose, onSave }: { dealer: Dealer; initial: Listing | null; onClose: () => void; onSave: (listing: Listing) => void }) {
  const [fields, setFields] = useState<EditorFields>({
    title: initial?.title ?? '', brand: initial?.brand ?? 'Honda', model: initial?.model ?? '',
    category: initial?.category ?? 'Naháče', price: String(initial?.price ?? ''),
    year: String(initial?.year ?? ''), km: String(initial?.km ?? ''),
    power: String(initial?.power ?? ''), engine: String(initial?.engine ?? ''),
    city: initial?.city ?? dealer.city, image: initial?.image ?? '',
    description: initial?.description ?? '', status: initial?.status ?? 'draft',
  });

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onEscape);
    return () => { document.body.style.overflow = original; window.removeEventListener('keydown', onEscape); };
  }, [onClose]);

  const update = (key: keyof EditorFields, value: string) => setFields((prev) => ({ ...prev, [key]: value }));
  const field = (name: keyof EditorFields, label: string, type: 'text' | 'number' | 'url' = 'text', required = false) => (
    <label className="editor-field"><span>{label}</span><input type={type} min={type === 'number' ? 0 : undefined} value={fields[name]} onChange={(event) => update(name, event.target.value)} required={required} /></label>
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = fields.title.trim();
    const year = Number(fields.year);
    const price = Number(fields.price);
    if (!title || !fields.brand || !fields.model.trim() || year < 1950 || year > 2100 || price <= 0) return;
    const image = fields.image.trim() || fallbackImage;
    onSave({
      id: initial?.id ?? `m-user-${Date.now()}`,
      dealerId: dealer.id,
      title,
      brand: fields.brand,
      model: fields.model.trim(),
      category: fields.category,
      year,
      price,
      km: Number(fields.km) || 0,
      power: Number(fields.power) || 0,
      engine: Number(fields.engine) || 0,
      city: fields.city.trim() || dealer.city,
      image,
      gallery: [image],
      description: fields.description.trim(),
      status: fields.status,
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <div className="editor-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="editor-drawer" role="dialog" aria-modal="true" aria-labelledby="listing-editor-title">
        <div className="drawer-top"><div className="eyebrow-alt">DEALER / INZERÁT</div><button type="button" aria-label="Zavřít editor" onClick={onClose}><X size={21} /></button></div>
        <form onSubmit={submit}>
          <div className="drawer-header"><h2 id="listing-editor-title">{initial ? 'Upravit motorku.' : 'Nová motorka.'}</h2><p>Vyplň základní údaje. Zbytek nech na motorce.</p></div>
          <div className="editor-grid">
            <div className="editor-full">{field('title', 'NÁZEV INZERÁTU', 'text', true)}</div>
            <label className="editor-field"><span>ZNAČKA</span><select value={fields.brand} onChange={(e) => update('brand', e.target.value)}>{brands.map((brand) => <option key={brand}>{brand}</option>)}</select></label>
            {field('model', 'MODEL', 'text', true)}
            <label className="editor-field"><span>KATEGORIE</span><select value={fields.category} onChange={(e) => update('category', e.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
            {field('city', 'MĚSTO', 'text', true)}
            {field('price', 'CENA (KČ)', 'number', true)}
            {field('year', 'ROK VÝROBY', 'number', true)}
            {field('km', 'NAJETO (KM)', 'number')}
            {field('engine', 'OBJEM (CM³)', 'number')}
            {field('power', 'VÝKON (KW)', 'number')}
            <label className="editor-field"><span>STAV INZERÁTU</span><select value={fields.status} onChange={(e) => update('status', e.target.value as ListingStatus)}><option value="draft">Koncept – skrytý</option><option value="active">Aktivní – veřejný</option><option value="sold">Prodaný – v archivu</option></select></label>
            <div className="editor-full">{field('image', 'URL FOTOGRAFIE (NEPOVINNÉ)', 'url')}</div>
            <div className="editor-full"><label className="editor-field"><span>POPIS</span><textarea rows={4} value={fields.description} onChange={(e) => update('description', e.target.value)} placeholder="Stav, servis, výbava a další informace…" /></label></div>
          </div>
          <div className="photo-preview"><ImageIcon size={20} /><span>Fotky jsou v demu jen ilustrační. V ostré verzi sem přidáme nahrávání souborů.</span></div>
          <div className="editor-actions"><button type="button" className="secondary-button" onClick={onClose}><ArrowLeft size={17} /> ZRUŠIT</button><button className="primary-button" type="submit"><Check size={18} /> ULOŽIT INZERÁT</button></div>
        </form>
      </section>
    </div>
  );
}

function DealerProfileEditor({ dealer, onSave, onPublic }: { dealer: Dealer; onSave: (dealer: Dealer) => void; onPublic: () => void }) {
  const [name, setName] = useState(dealer.name);
  const [city, setCity] = useState(dealer.city);
  const [tagline, setTagline] = useState(dealer.tagline);
  const [description, setDescription] = useState(dealer.description);
  const [accent, setAccent] = useState(dealer.accent);
  const colors = ['#d9ef5d', '#ff674d', '#a9c5ff', '#ffcc76', '#d6a8ff'];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({ ...dealer, name: name.trim(), city: city.trim(), tagline: tagline.trim(), description: description.trim(), accent });
  }

  return (
    <div className="dealer-profile-editor">
      <form onSubmit={submit} className="profile-fields">
        <label className="editor-field"><span>NÁZEV BAZARU</span><input value={name} required onChange={(e) => setName(e.target.value)} /></label>
        <label className="editor-field"><span>MĚSTO</span><input value={city} required onChange={(e) => setCity(e.target.value)} /></label>
        <label className="editor-field"><span>KRÁTKÝ MOTTO</span><input value={tagline} required onChange={(e) => setTagline(e.target.value)} /></label>
        <label className="editor-field"><span>O BAZARU</span><textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <div className="profile-color-row"><span>BARVA PROFILU</span><div>{colors.map((color) => <button key={color} type="button" className={accent === color ? 'selected' : ''} style={{ background: color }} onClick={() => setAccent(color)} aria-label={`Barva ${color}`}>{accent === color && <Check size={16} />}</button>)}</div></div>
        <div className="profile-save-actions"><button className="primary-button" type="submit"><Check size={18} /> ULOŽIT PROFIL</button><button type="button" className="secondary-button" onClick={onPublic}>NÁHLED WEBU <ArrowRight size={17} /></button></div>
      </form>
      <div className="profile-preview" style={{ ['--dealer-accent' as string]: accent }}><span>ŽIVÝ NÁHLED</span><div className="profile-preview-monogram">{dealer.monogram}</div><p>BAZAR / {city.toUpperCase()}</p><h2>{name}</h2><strong>{tagline}</strong><div className="profile-preview-arrow"><ArrowDownRight size={32} /></div></div>
    </div>
  );
}
