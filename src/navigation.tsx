import React, { type AnchorHTMLAttributes } from 'react';

export const BASE='/motobazar';
/** Real, directly loadable routes; keep links from the older hash-based demo working. */
export function hrefFor(value:string):string {
  if(!value.startsWith('#'))return value;
  if(value==='#main')return value;
  const [raw,query='']=value.slice(1).split('?');
  const [page,...parts]=raw.split('/');
  const id=parts.join('/');
  const target=page==='sprava'?'moje':page==='pridat'?'prodat':page||'motorky';
  const params=new URLSearchParams(query);
  // User-created demo listings exist only in local storage, so use a prerendered route.
  if((target==='upravit'||target==='motorka')&&id&&(target==='upravit'||id.startsWith('local-'))){
    params.set('id',decodeURIComponent(id));
    return `${BASE}/${target}/${params.size?'?'+params:''}`;
  }
  return `${BASE}/${target}/${id?encodeURIComponent(decodeURIComponent(id))+'/':''}${params.size?'?'+params:''}`;
}
export function currentRouteString():string {
  if(typeof window==='undefined')return 'motorky';
  let path=window.location.pathname;
  if(path===BASE||path.startsWith(BASE+'/'))path=path.slice(BASE.length);
  path=path.replace(/^\/+|\/+$/g,'')||'motorky';
  const params=new URLSearchParams(window.location.search),id=params.get('id');
  if(id&&['motorka','upravit'].includes(path)){path+='/'+encodeURIComponent(id);params.delete('id');}
  return path+(params.size?'?'+params:'');
}
export function navigate(value:string):void {window.location.assign(hrefFor(value));}
export function Link({href='',onClick,children,...props}:AnchorHTMLAttributes<HTMLAnchorElement>){
  return <a {...props} href={hrefFor(href)} onClick={e=>{
    onClick?.(e);
    if(e.defaultPrevented)return;
    if(typeof window!=='undefined'&&window.location.pathname.includes('/motorka/')&&href.startsWith('#motorky')){
      try{sessionStorage.setItem('motobazar:restore-catalog','1');}catch{}
    }
  }}>{children}</a>;
}
