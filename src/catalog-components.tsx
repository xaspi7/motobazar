import React, { type ReactNode } from 'react';
import { brands, categories, fallbackImage, type Dealer } from './data';
import { REGIONS, CONDITIONS, TRANSMISSIONS, FUELS, money, num, type Ad, type Filters } from './catalog-model';

const paths:Record<string,string>={
 search:'m21 21-5-5 M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0',
 heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8',
 sun:'M12 1v2 M12 21v2 M1 12h2 M21 12h2 M4 4l2 2 M18 18l2 2 M4 20l2-2 M18 6l2-2 M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0',
 moon:'M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10',
 plus:'M12 5v14 M5 12h14',close:'m6 6 12 12 M6 18 18 6',arrow:'M4 12h16 m-6-6 6 6-6 6',back:'M20 12H4 m6-6-6 6 6 6',down:'m6 9 6 6 6-6',
 pin:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0 M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
 filter:'M3 7h10 M17 7h4 M3 17h4 M11 17h10 M13 4v6 M7 14v6',
 grid:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',list:'M9 6h12 M9 12h12 M9 18h12 M3 6h1 M3 12h1 M3 18h1',
 check:'m5 12 4 4L19 6',compare:'M4 7h16 m-4-4 4 4-4 4 M20 17H4 m4-4-4 4 4 4',
 shop:'M3 9h18L19 3H5L3 9 M4 9v12h16V9 M9 21v-7h6v7 M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0',
 message:'M21 15a3 3 0 0 1-3 3H7l-5 4V5a3 3 0 0 1 3-3h13a3 3 0 0 1 3 3v10 M6 7h11 M6 12h8',
 share:'M12 16V3 m-4 4 4-4 4 4 M6 10H4v11h16V10h-2',
 clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 6v6l4 2',info:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 11v6 M12 7v.1',
 expand:'M8 3H3v5 M16 3h5v5 M21 16v5h-5 M3 16v5h5',
 user:'M17 7a5 5 0 1 1-10 0 5 5 0 0 1 10 0 M3 22v-3a9 9 0 0 1 18 0v3',
 camera:'M4 6h4l2-3h4l2 3h4a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2 M17 13a5 5 0 1 1-10 0 5 5 0 0 1 10 0',
 edit:'m15 4 5 5 M4 20l1-6L17 2l5 5L10 19l-6 1',trash:'M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7',
 upload:'M12 16V3 m-5 5 5-5 5 5 M3 15v6h18v-6',document:'M14 2H4v20h16V8l-6-6v6h6 M8 12h8 M8 16h8'
};
export function Icon({name,size=20}:{name:string;size?:number}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]||paths.info}/></svg>;}
export const date=(s:string)=>{const d=new Date(s);return Number.isNaN(+d)?'':d.toLocaleDateString('cs-CZ',{day:'numeric',month:'numeric',year:'numeric'});};
export const countLabel=(n:number)=>n===1?'inzerát':n>=2&&n<=4?'inzeráty':'inzerátů';
export function Photo({src,alt='',large=false,eager=false}:{src:string;alt?:string;large?:boolean;eager?:boolean}){
 let url=src;try{const u=new URL(src);if(u.hostname==='images.unsplash.com'){u.searchParams.set('w',large?'1200':'480');u.searchParams.set('q','80');url=u.href;}}catch{}
 return <img src={url||fallbackImage} alt={alt} width={large?1200:480} height={large?900:320} loading={eager?'eager':'lazy'} decoding="async" onError={e=>{if(e.currentTarget.dataset.failed)return;e.currentTarget.dataset.failed='1';e.currentTarget.src=fallbackImage;}}/>;
}
let fieldSequence=0;
export class Field extends React.Component<{label:string;error?:string;children:ReactNode;className?:string}>{
 id='mc-field-'+(++fieldSequence);
 render(){const {label,error,children,className=''}=this.props;const controls=React.Children.map(children,child=>React.isValidElement(child)&&['input','select','textarea'].includes(String(child.type))?React.cloneElement(child as React.ReactElement<Record<string,unknown>>,{'aria-label':label,'aria-invalid':!!error,'aria-describedby':error?this.id+'-error':undefined}):child);return <label className={'mc-field '+className+(error?' has-error':'')}><span>{label}</span>{controls}{error&&<small id={this.id+'-error'} className="mc-error">{error}</small>}</label>;}
}
export function Options({items,empty='Všechny'}:{items:readonly string[];empty?:string}){return <><option value="">{empty}</option>{items.map(s=><option key={s} value={s}>{s}</option>)}</>;}
function Range({label,lo,hi,onLo,onHi}:{label:string;lo:string;hi:string;onLo:(s:string)=>void;onHi:(s:string)=>void}){return <fieldset className={'mc-range'+(lo&&hi&&Number(lo)>Number(hi)?' has-error':'')}><legend>{label}</legend><div><input type="number" min="0" step="1" inputMode="numeric" value={lo} onChange={e=>onLo(e.target.value)} aria-label={label+' od'} placeholder="Od"/><span aria-hidden="true">–</span><input type="number" min="0" step="1" inputMode="numeric" value={hi} onChange={e=>onHi(e.target.value)} aria-label={label+' do'} placeholder="Do"/></div></fieldset>;}
export function FilterFields({value,onChange,ads,advanced=false}:{value:Filters;onChange:(f:Filters)=>void;ads:Ad[];advanced?:boolean}){
 const patch=(k:keyof Filters,v:string)=>onChange({...value,[k]:v,...(k==='brand'?{model:''}:{})});
 const models=[...new Set(ads.filter(a=>!value.brand||a.brand===value.brand).map(a=>a.model))].sort((a,b)=>a.localeCompare(b,'cs'));
 return <><div className="mc-filter-grid">
  <Field label="Typ motorky"><select value={value.category} onChange={e=>patch('category',e.target.value)}><Options items={categories} empty="Všechny typy"/></select></Field>
  <Field label="Značka"><select value={value.brand} onChange={e=>patch('brand',e.target.value)}><Options items={brands} empty="Všechny značky"/></select></Field>
  <Field label="Model"><select value={value.model} onChange={e=>patch('model',e.target.value)}><Options items={models} empty="Všechny modely"/></select></Field>
  <Range label="Rok výroby" lo={value.year} hi={value.maxYear} onLo={v=>patch('year',v)} onHi={v=>patch('maxYear',v)}/>
  <Range label="Cena (Kč)" lo={value.minPrice} hi={value.price} onLo={v=>patch('minPrice',v)} onHi={v=>patch('price',v)}/>
  <Range label="Najeto (km)" lo={value.minKm} hi={value.km} onLo={v=>patch('minKm',v)} onHi={v=>patch('km',v)}/>
  <Range label="Objem (cm³)" lo={value.minEngine} hi={value.engine} onLo={v=>patch('minEngine',v)} onHi={v=>patch('engine',v)}/>
  <Range label="Výkon (kW)" lo={value.minPower} hi={value.power} onLo={v=>patch('minPower',v)} onHi={v=>patch('power',v)}/>
  <Field label="Kraj"><select value={value.region} onChange={e=>patch('region',e.target.value)}><Options items={REGIONS} empty="Celá ČR"/></select></Field>
  <Field label="Stav"><select value={value.condition} onChange={e=>patch('condition',e.target.value)}><Options items={CONDITIONS} empty="Všechny stavy"/></select></Field>
  <Field label="Prodejce"><select value={value.seller} onChange={e=>patch('seller',e.target.value)}><option value="">Všichni</option><option value="private">Soukromí prodejci</option><option value="dealer">Bazary / prodejci</option></select></Field>
  <Field label="Převodovka"><select value={value.transmission} onChange={e=>patch('transmission',e.target.value)}><Options items={TRANSMISSIONS}/></select></Field>
 </div>{advanced&&<div className="mc-filter-extra"><Field label="Palivo"><select value={value.fuel} onChange={e=>patch('fuel',e.target.value)}><Options items={FUELS}/></select></Field><label className="mc-check"><input type="checkbox" checked={value.photos==='1'} onChange={e=>patch('photos',e.target.checked?'1':'')}/>Pouze s fotografií</label><span className="mc-help">Chybí-li u inzerátu zvolený údaj, nebude ve výsledcích.</span></div>}</>;
}
export class Modal extends React.Component<{title:string;onClose:()=>void;children:ReactNode;kind?:string}>{
 dialog:HTMLDialogElement|null=null; opener:HTMLElement|null=null; overflow='';
 componentDidMount(){this.opener=document.activeElement as HTMLElement;this.overflow=document.body.style.overflow;document.body.style.overflow='hidden';this.dialog?.showModal();}
 componentWillUnmount(){this.dialog?.close();document.body.style.overflow=this.overflow;const el=this.opener;requestAnimationFrame(()=>{if(el?.isConnected)el.focus({preventScroll:true});});}
 render(){return <dialog ref={el=>{this.dialog=el;}} className={'mc-modal '+(this.props.kind||'')} aria-label={this.props.title} onCancel={e=>{e.preventDefault();this.props.onClose();}} onClick={e=>{if(e.target!==e.currentTarget)return;const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)this.props.onClose();}}><header><h2>{this.props.title}</h2><button type="button" className="mc-icon-btn" aria-label="Zavřít" onClick={this.props.onClose} autoFocus><Icon name="close"/></button></header>{this.props.children}</dialog>;}
}
export function Row({ad,dealer,saved,compared,onSave,onCompare,index=5}:{ad:Ad;dealer?:Dealer;saved:boolean;compared:boolean;onSave:()=>void;onCompare:()=>void;index?:number}){
 const href='#motorka/'+encodeURIComponent(ad.id);
 return <article className="mc-row">
 <div className="mc-row-image"><a href={href} tabIndex={-1} aria-hidden="true"><Photo src={ad.image} eager={index<4}/></a>{ad.illustrative?<span className="mc-image-note">Ilustrační foto</span>:<span className="mc-image-note"><Icon name="camera" size={13}/>{ad.gallery.length}</span>}<button className={'mc-heart '+(saved?'selected':'')} aria-label={(saved?'Odebrat z oblíbených: ':'Uložit: ')+ad.title} aria-pressed={saved} onClick={onSave}><Icon name="heart" size={19}/></button></div>
 <div className="mc-row-main"><div className="mc-row-heading"><h2><a href={href}>{ad.title}</a></h2>{ad.status==='sold'&&<span className="mc-badge">Prodáno</span>}</div><strong className="mc-mobile-price">{money(ad.price)}</strong><div className="mc-row-specs"><span>{ad.year}</span><span>{num(ad.km)} km</span><span>{num(ad.engine)} cm³</span><span>{ad.power} kW</span></div><p className="mc-row-description">{ad.description}</p><div className="mc-row-meta"><span><Icon name="pin" size={14}/>{ad.city}</span><span className="mc-seller-meta"><Icon name={dealer?'shop':'user'} size={14}/>{dealer?<a href={'#bazar/'+dealer.slug}>{dealer.name}</a>:'Soukromý prodejce'}</span><button className={'mc-compare-link '+(compared?'selected':'')} onClick={onCompare} aria-pressed={compared} aria-label={(compared?'Odebrat z porovnání: ':'Porovnat: ')+ad.title}><Icon name="compare" size={16}/><span>{compared?'V porovnání':'Porovnat'}</span></button></div></div>
 <div className="mc-row-side"><strong>{money(ad.price)}</strong><a className="mc-detail-link" href={href}>Zobrazit detail<Icon name="arrow" size={17}/></a><time dateTime={ad.updatedAt}>{date(ad.updatedAt)}</time></div><p className="mc-mobile-description">{ad.description}</p>
 </article>;
}
