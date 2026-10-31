import { seededListings, seededDealers, type Listing, type Dealer } from './data';

export type Ad = Listing & {
  region: string; condition: string; transmission: string; fuel: string; color: string;
  vin: string; service: string; defects: string; sellerName: string; phone: string;
  email: string; ownerKey: string; illustrative: boolean;
};
export type Filters = {
  query: string; brand: string; model: string; category: string;
  minPrice: string; price: string; year: string; maxYear: string;
  minKm: string; km: string; minEngine: string; engine: string;
  minPower: string; power: string; region: string; seller: string;
  condition: string; transmission: string; fuel: string; photos: string;
};
export type Sort = 'newest' | 'cheapest' | 'expensive' | 'least-km' | 'year';
export type Route = { page: string; id: string; params: URLSearchParams };
export const EMPTY: Filters = {query:'',brand:'',model:'',category:'',minPrice:'',price:'',year:'',maxYear:'',minKm:'',km:'',minEngine:'',engine:'',minPower:'',power:'',region:'',seller:'',condition:'',transmission:'',fuel:'',photos:''};
export const REGIONS = ['Hlavní město Praha','Středočeský','Jihočeský','Plzeňský','Karlovarský','Ústecký','Liberecký','Královéhradecký','Pardubický','Vysočina','Jihomoravský','Olomoucký','Zlínský','Moravskoslezský'];
export const CONDITIONS = ['Ojetá','Nová','Předváděcí','Havarovaná'];
export const TRANSMISSIONS = ['Manuální','Automatická','Poloautomatická'];
export const FUELS = ['Benzín','Elektřina','Jiné'];
export const PRIVATE_OWNER = 'local-private';
export const PRIVATE_LIMIT = 2;
export const AD_KEY = 'motobazar:catalog:ads:v4';
export const DEALER_KEY = 'motobazar:catalog:dealers:v4';
export const FAVORITE_KEY = 'motobazar:demo-favorites:v3';
export const COMPARE_KEY = 'motobazar:compare:v2';
export const PROFILE_KEY = 'motobazar:profile:v4';
export const money = (n:number) => new Intl.NumberFormat('cs-CZ',{maximumFractionDigits:0}).format(n)+' Kč';
export const num = (n:number) => new Intl.NumberFormat('cs-CZ').format(n);
export const fold = (s:string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function readJSON<T>(key:string, fallback:T):T { try { const s=localStorage.getItem(key); return s ? JSON.parse(s) as T : fallback; } catch { return fallback; } }
export function writeJSON(key:string,value:unknown):void { localStorage.setItem(key,JSON.stringify(value)); }
export function readIds(key:string):string[] {const x=readJSON<unknown>(key,[]); return Array.isArray(x)?x.filter((s):s is string=>typeof s==='string'):[];}
export const regionFor = (city:string) => ({Praha:REGIONS[0],Brno:REGIONS[10],Liberec:REGIONS[6],'Plzeň':REGIONS[3],Ostrava:REGIONS[13],'České Budějovice':REGIONS[2]}[city]||'');
export function safePhoto(src:unknown):string {
  if(typeof src!=='string')return '';
  if(/^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(src))return src;
  try {const u=new URL(src);return u.protocol==='https:'?u.href:'';}catch{return '';}
}
export function normalizeAd(i:Listing & Partial<Ad>):Ad {
  const fixture=/^m-\d+$/.test(i.id);
  return {...i,region:i.region??regionFor(i.city),condition:i.condition??(fixture?CONDITIONS[0]:''),transmission:i.transmission??'',fuel:i.fuel??'',color:i.color??'',vin:i.vin??'',service:i.service??'',defects:i.defects??'',sellerName:i.sellerName??'',phone:i.phone??'',email:i.email??'',ownerKey:i.ownerKey??'',illustrative:i.illustrative??fixture,image:safePhoto(i.image),gallery:(Array.isArray(i.gallery)?i.gallery:[]).map(safePhoto).filter(Boolean)};
}
export function validAd(x:unknown):x is Listing & Partial<Ad> {
  if(!x||typeof x!=='object')return false;
  const a=x as Listing;
  return ['id','title','brand','model','category','city','description','updatedAt'].every(k=>typeof (a as unknown as Record<string,unknown>)[k]==='string')&&[a.year,a.price,a.km,a.power,a.engine].every(v=>typeof v==='number'&&Number.isFinite(v)&&v>=0)&&['active','draft','sold'].includes(a.status);
}
export function loadAds():Ad[] {
  const current=readJSON<unknown>(AD_KEY,null),legacy=readJSON<unknown>('motobazar:demo-listings:v3',null);
  const source=Array.isArray(current)?current:Array.isArray(legacy)?legacy:seededListings;
  return source.filter(validAd).map(i=>normalizeAd(i));
}
export function loadDealers():Dealer[] {
  const current=readJSON<unknown>(DEALER_KEY,null),legacy=readJSON<unknown>('motobazar:demo-dealers:v3',null);
  const x=Array.isArray(current)?current:Array.isArray(legacy)?legacy:seededDealers;
  const good=x.filter((d):d is Dealer=>!!d&&typeof d==='object'&&typeof d.id==='string'&&typeof d.name==='string'&&typeof d.slug==='string'&&typeof d.city==='string'&&Array.isArray(d.focus));
  return good.length?good:seededDealers;
}
export const RANGE_KEYS = [['minPrice','price','Cena'],['year','maxYear','Rok výroby'],['minKm','km','Nájezd'],['minEngine','engine','Objem'],['minPower','power','Výkon']] as const;
export function filterErrors(f:Filters):string[] {
  const errors:string[]=[];
  for(const [min,max,label] of RANGE_KEYS){
    for(const k of [min,max])if(f[k]!==''&&(!Number.isFinite(Number(f[k]))||Number(f[k])<0))errors.push(label+': zadej nezáporné číslo.');
    if(f[min]!==''&&f[max]!==''&&Number(f[min])>Number(f[max]))errors.push(label+': hodnota od nesmí být vyšší než do.');
  }
  return errors;
}
export function matchingAds(ads:Ad[],f:Filters,sort:Sort='newest'):Ad[] {
  if(filterErrors(f).length)return [];
  const q=fold(f.query.trim());
  const inRange=(value:number,lo:string,hi:string)=>(lo===''||value>=Number(lo))&&(hi===''||value<=Number(hi));
  const result=ads.filter(a=>a.status==='active'&&(!f.brand||a.brand===f.brand)&&(!f.model||a.model===f.model)&&(!f.category||a.category===f.category)&&(!f.region||a.region===f.region)&&(!f.seller||(f.seller==='dealer'?!!a.dealerId:!a.dealerId))&&(!f.condition||a.condition===f.condition)&&(!f.transmission||a.transmission===f.transmission)&&(!f.fuel||a.fuel===f.fuel)&&(!f.photos||!!a.image)&&inRange(a.price,f.minPrice,f.price)&&inRange(a.year,f.year,f.maxYear)&&inRange(a.km,f.minKm,f.km)&&inRange(a.engine,f.minEngine,f.engine)&&inRange(a.power,f.minPower,f.power)&&(!q||q.split(/\s+/).every(w=>fold([a.title,a.brand,a.model,a.description,a.city,a.category].join(' ')).includes(w))));
  return result.sort((a,b)=>sort==='cheapest'?a.price-b.price:sort==='expensive'?b.price-a.price:sort==='least-km'?a.km-b.km:sort==='year'?b.year-a.year:b.updatedAt.localeCompare(a.updatedAt));
}
export function filterChips(f:Filters):{label:string;keys:(keyof Filters)[]}[] {
  const out:{label:string;keys:(keyof Filters)[]}[]=[];
  for(const [key,label] of [['query','Hledání'],['category','Typ'],['brand','Značka'],['model','Model'],['region','Kraj'],['condition','Stav'],['transmission','Převodovka'],['fuel','Palivo']] as const)if(f[key])out.push({label:label+': '+f[key],keys:key==='brand'?['brand','model']:[key]});
  for(const [lo,hi,label] of RANGE_KEYS)if(f[lo]||f[hi])out.push({label:label+': '+(f[lo]?num(Number(f[lo])):'0')+'–'+(f[hi]?num(Number(f[hi])):'∞'),keys:[lo,hi]});
  if(f.seller)out.push({label:f.seller==='private'?'Soukromí prodejci':'Bazary',keys:['seller']});
  if(f.photos)out.push({label:'S fotografií',keys:['photos']});
  return out;
}
export function parseRoute(hash:string):Route {
  const clean=hash.replace(/^#\/?/,'');const [path,query='']=clean.split('?');const parts=path.split('/');let id='';try{id=decodeURIComponent(parts.slice(1).join('/'));}catch{}
  return {page:parts[0]||'motorky',id,params:new URLSearchParams(query)};
}
export function filtersFrom(params:URLSearchParams):Filters {const f={...EMPTY};for(const k of Object.keys(f) as (keyof Filters)[]){f[k]=(params.get(k)||'').slice(0,200);}return f;}
export function catalogHash(f:Filters,sort:Sort='newest',page=1):string {const p=new URLSearchParams();for(const [k,v] of Object.entries(f))if(v)p.set(k,v);if(sort!=='newest')p.set('sort',sort);if(page>1)p.set('page',String(page));return '#motorky'+(p.size?'?'+p:'');}
export function readSort(params:URLSearchParams):Sort {const s=params.get('sort');return ['newest','cheapest','expensive','least-km','year'].includes(s||'')?s as Sort:'newest';}
export function newAd(profile:string,dealers:Dealer[]):Ad {
  const d=dealers.find(d=>d.id===profile);
  return {id:'',dealerId:d?.id||null,title:'',brand:'',model:'',category:'',year:0,price:0,km:0,power:0,engine:0,city:d?.city||'',image:'',gallery:[],description:'',status:'draft',updatedAt:new Date().toISOString(),region:regionFor(d?.city||''),condition:CONDITIONS[0],transmission:'',fuel:FUELS[0],color:'',vin:'',service:'',defects:'',sellerName:d?.name||'',phone:'',email:'',ownerKey:d?.id||PRIVATE_OWNER,illustrative:false};
}
export function canManage(a:Ad,profile:string):boolean {return a.ownerKey===profile||(profile!==PRIVATE_OWNER&&a.dealerId===profile);}
export function publicationError(ads:Ad[],a:Ad):string {
  const used=ads.filter(x=>x.id!==a.id&&x.ownerKey===a.ownerKey&&x.status==='active').length;
  if(!a.dealerId&&used>=PRIVATE_LIMIT)return 'Soukromý účet může mít nejvýše 2 aktivní inzeráty. Jeden nejprve pozastav nebo označ jako prodaný.';
  return '';
}
export function validateAd(a:Ad,step=3):Record<string,string> {
  const e:Record<string,string>={};
  if(step>=1){
    if(!a.brand.trim())e.brand='Vyber značku.';
    if(!a.model.trim())e.model='Doplň model.';
    if(!a.category)e.category='Vyber typ motorky.';
    if(a.title.trim().length<3)e.title='Doplň název inzerátu.';
    if(!Number.isFinite(a.price)||a.price<=0)e.price='Zadej cenu vyšší než 0.';
    if(!Number.isInteger(a.year)||a.year<1900||a.year>new Date().getFullYear()+1)e.year='Zadej platný rok.';
    if(!Number.isFinite(a.km)||a.km<0)e.km='Nájezd musí být nezáporné číslo.';
    if(!a.region)e.region='Vyber kraj.';
    if(!a.city.trim())e.city='Doplň město.';
    if(!Number.isFinite(a.engine)||!Number.isFinite(a.power)||a.engine<0||a.power<0)e.power='Technické hodnoty musí být nezáporná čísla.';
    if(a.vin&&!/^[A-HJ-NPR-Z0-9]{17}$/i.test(a.vin))e.vin='VIN má 17 znaků, bez I, O a Q. U starších strojů ho zatím vynech.';
  }
  if(step>=2){if(!a.gallery.length)e.gallery='Přidej alespoň jednu fotografii.';if(a.description.trim().length<20)e.description='Popis musí mít alespoň 20 znaků.';}
  if(step>=3){if(a.sellerName.trim().length<2)e.sellerName='Doplň jméno.';if(!/^[+\d\s()-]{9,20}$/.test(a.phone)||a.phone.replace(/\D/g,'').length<9)e.phone='Zadej platný telefon.';if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email))e.email='Zadej platný e-mail.';}
  return e;
}
export async function compressPhoto(file:File):Promise<string> {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Podporované formáty: JPG, PNG a WebP.');
  if(file.size>10*1024*1024)throw new Error('Fotografie je větší než 10 MB.');
  const url=URL.createObjectURL(file);
  try{return await new Promise<string>((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>{const scale=Math.min(1,1200/Math.max(img.naturalWidth,img.naturalHeight));const canvas=document.createElement('canvas');canvas.width=Math.round(img.naturalWidth*scale);canvas.height=Math.round(img.naturalHeight*scale);const ctx=canvas.getContext('2d');if(!ctx){reject(new Error('Fotografii nelze zpracovat.'));return;}ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',0.72));};
    img.onerror=()=>reject(new Error('Fotografii nelze otevřít.'));img.src=url;
  });}finally{URL.revokeObjectURL(url);}
}
