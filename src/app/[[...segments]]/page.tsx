import type { Metadata } from 'next';
import CatalogApp from '../../catalog-app';
import { seededListings, seededDealers } from '../../data';

type Props={params:Promise<{segments?:string[]}>};
export const dynamicParams=false;
export function generateStaticParams(){
 const pages=['motorky','motorka','bazary','oblibene','moje','sprava','prodat','pridat','upravit','tarify','porovnani'];
 return [{segments:[]},...pages.map(p=>({segments:[p]})),...seededListings.filter(a=>a.status!=='draft').map(a=>({segments:['motorka',a.id]})),...seededDealers.map(d=>({segments:['bazar',d.slug]}))];
}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {segments=[]}=await params;
 const listing=segments[0]==='motorka'?seededListings.find(a=>a.id===segments[1]):undefined;
 const dealer=segments[0]==='bazar'?seededDealers.find(d=>d.slug===segments[1]):undefined;
 const labels:Record<string,string>={motorky:'Inzerce motorek',motorka:'Detail inzerátu',bazary:'Prodejci',oblibene:'Oblíbené motorky',moje:'Moje inzeráty',sprava:'Moje inzeráty',prodat:'Prodat motorku',pridat:'Prodat motorku',upravit:'Upravit inzerát',tarify:'Inzerce a tarify',porovnani:'Porovnání motorek'};
 const title=listing?.title||dealer?.name||labels[segments[0]||'motorky']||'Motorky';
 const description=listing?`Ukázkový inzerát: ${listing.title}, ${listing.year}, ${listing.km} km, ${listing.price} Kč. Ilustrační údaje, nejde o reálnou nabídku.`:dealer?`${dealer.name} – ukázka nabídky prodejce v ${dealer.city}.`:'Katalog motorek s podrobnými filtry. Dva soukromé inzeráty zdarma, firemní profily. Funkční prototyp bez připojené databáze.';
 const path='/motobazar/'+(segments.length?segments.join('/'):'motorky')+'/';
 return {title,description,alternates:{canonical:path},openGraph:{title:title+' | MotoBazar',description,type:'website',locale:'cs_CZ',url:path}};
}
export default async function Page({params}:Props){const {segments=[]}=await params;return <CatalogApp initialRoute={segments.join('/')||'motorky'}/>;}
