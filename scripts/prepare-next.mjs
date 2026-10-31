// One-time, idempotent migration of the existing catalogue to prerenderable Next.js pages.
// Source is committed back after the verified build; no browser-only code runs during SSR.
import fs from 'node:fs';
const path='src/catalog-app.tsx';
let s=fs.readFileSync(path,'utf8');
if(!s.includes('NEXT_CATALOG_V1')){
 s="'use client';\n// NEXT_CATALOG_V1\nimport { Link as AppLink, navigate, currentRouteString, hrefFor } from './navigation';\nimport { seededListings, seededDealers } from './data';\nimport { normalizeAd } from './catalog-model';\n"+s;
 s=s.replace('export default function CatalogApp(){',"export default function CatalogApp({initialRoute='motorky'}:{initialRoute?:string}){");
 s=s.replace('useState(()=>parseRoute(location.hash))','useState(()=>parseRoute(initialRoute))');
 s=s.replace('useState(loadAds),[dealers,setDealers]=useState(loadDealers)','useState(()=>seededListings.map(normalizeAd)),[dealers,setDealers]=useState(()=>seededDealers)');
 s=s.replace(/const \[profile,setProfile\]=useState\(\(\)=>\{.*?\}\);/, 'const [profile,setProfile]=useState(PRIVATE_OWNER);');
 s=s.replace("useState<'list'|'grid'>(()=>readJSON('motobazar:view:v4','list')==='grid'?'grid':'list')","useState<'list'|'grid'>('list')");
 s=s.replace("useState(()=>readIds(FAVORITE_KEY)),[compared,setCompared]=useState(()=>readIds(COMPARE_KEY).slice(0,3))","useState<string[]>([]),[compared,setCompared]=useState<string[]>([])");
 s=s.replace("useState<'light'|'dark'>(()=>document.documentElement.dataset.theme==='dark'?'dark':'light')","useState<'light'|'dark'>('light')");
 const start=s.indexOf(' useEffect(()=>{\n  const onHash=');
 const end=s.indexOf(' useEffect(()=>{const a=ads.find',start);
 if(start<0||end<0)throw new Error('Cannot locate old router effect');
 s=s.slice(0,start)+` useEffect(()=>{
  const loaded=loadAds(), ds=loadDealers();setAds(loaded);setDealers(ds);
  const p=readJSON(PROFILE_KEY,PRIVATE_OWNER);setProfile(typeof p==='string'&&(p===PRIVATE_OWNER||ds.some(d=>d.id===p))?p:PRIVATE_OWNER);
  setSaved(readIds(FAVORITE_KEY));setCompared(readIds(COMPARE_KEY).slice(0,3));
  setView(readJSON('motobazar:view:v4','list')==='grid'?'grid':'list');
  setPreference(document.documentElement.dataset.theme==='dark'?'dark':'light',false);
  if(location.hash&&/^#(?:motorky|motorka|bazary|bazar|oblibene|sprava|moje|prodat|upravit|porovnani|tarify)(?:[/?]|$)/.test(location.hash)){
   location.replace(hrefFor(location.hash));return;
  }
  const next=parseRoute(currentRouteString());setRoute(next);previous.current=next;
  if(['motorky','oblibene'].includes(next.page)){const f=filtersFrom(next.params);setFilters(f);setDraft({...f});setSort(readSort(next.params));}
  try{
   lastCatalog.current=sessionStorage.getItem('motobazar:last-catalog')||'#motorky';
   if(next.page==='motorky'){
    lastCatalog.current='#'+currentRouteString();
    sessionStorage.setItem('motobazar:last-catalog',lastCatalog.current);
    if(sessionStorage.getItem('motobazar:restore-catalog')==='1'){
     sessionStorage.removeItem('motobazar:restore-catalog');
     const y=Number(sessionStorage.getItem('motobazar:catalog-scroll'))||0;
     requestAnimationFrame(()=>requestAnimationFrame(()=>window.scrollTo(0,y)));
    }
   }
  }catch{}
  const onExit=()=>{if(next.page==='motorky')try{sessionStorage.setItem('motobazar:catalog-scroll',String(window.scrollY));}catch{}};
  window.addEventListener('pagehide',onExit);
  const media=matchMedia('(prefers-color-scheme: dark)');
  const onMedia=(e:MediaQueryListEvent)=>{let p='system';try{p=localStorage.getItem('motobazar:theme:v1')||'system';}catch{}if(p==='system')setPreference(e.matches?'dark':'light',false);};media.addEventListener('change',onMedia);
  document.documentElement.dataset.ready='true';
  return ()=>{window.removeEventListener('pagehide',onExit);media.removeEventListener('change',onMedia);if(timer.current)clearTimeout(timer.current);};
 },[initialRoute]);
`+s.slice(end);
 s=s.replace("const hash=catalogHash(next,nextSort,page);if(location.hash!==hash)location.hash=hash;", "const hash=catalogHash(next,nextSort,page).replace('#motorky',route.page==='oblibene'?'#oblibene':'#motorky');navigate(hash);");
 s=s.replace("location.hash='#moje';", "setTimeout(()=>navigate('#moje'),0);");
 s=s.replace("location.hash='#upravit/'+ad.id;", "navigate('#upravit/'+ad.id);");
 s=s.replace(/<a(?=\s|>)/g,'<AppLink').replace(/<\/a>/g,'</AppLink>');
 fs.writeFileSync(path,s);
}
for(const file of ['src/catalog-components.tsx','src/catalog-editor.tsx']){
 let s=fs.readFileSync(file,'utf8');
 if(!s.includes("from './navigation'")){
  s="import { Link as AppLink } from './navigation';\n"+s;
  s=s.replace(/<a(?=\s|>)/g,'<AppLink').replace(/<\/a>/g,'</AppLink>');
  fs.writeFileSync(file,s);
 }
}
// The same source is now safe on the server and in the browser.
