export type Listing = {id:number; brand:string; model:string; title:string; year:number; price:number; km:number; power:number; category:string; city:string; color:string; seller:string; sellerType:'Soukromý prodejce'|'Motobazar'; added:string; image:string; gallery:string[]; description:string; tags:string[]; engine:number};
const photos = [
'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&q=85',
'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&q=85',
'https://images.unsplash.com/photo-1558980664-10e7170b5f1d?w=1200&q=85',
'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=1200&q=85',
'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&q=85',
'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=1200&q=85',
'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=1200&q=85',
'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200&q=85',
];
const entries: Omit<Listing,'image'|'gallery'|'description'|'tags'|'engine'|'sellerType'|'color'>[] = [
{id:1,brand:'Suzuki',model:'GSX-R 600',title:'Suzuki GSX-R 600',year:2008,price:134900,km:32000,power:92,category:'Sportovní',city:'Praha',seller:'Moto Point Praha',added:'Dnes'},
{id:2,brand:'Kawasaki',model:'Ninja ZX-6R',title:'Kawasaki Ninja ZX-6R',year:2019,price:239000,km:14800,power:95,category:'Sportovní',city:'Brno',seller:'Soukromý prodejce',added:'Dnes'},
{id:3,brand:'Honda',model:'CBR 600 RR',title:'Honda CBR 600 RR',year:2007,price:119000,km:41200,power:88,category:'Sportovní',city:'Ostrava',seller:'Moto Centrum Ostrava',added:'Včera'},
{id:4,brand:'BMW',model:'R 1250 GS',title:'BMW R 1250 GS Adventure',year:2021,price:315000,km:28500,power:100,category:'Cestovní',city:'Plzeň',seller:'Bavaria Moto',added:'Včera'},
{id:5,brand:'Yamaha',model:'MT-07',title:'Yamaha MT-07',year:2020,price:169000,km:16200,power:54,category:'Naháče',city:'České Budějovice',seller:'Soukromý prodejce',added:'Před 2 dny'},
{id:6,brand:'KTM',model:'690 SMC R',title:'KTM 690 SMC R',year:2022,price:219000,km:8900,power:55,category:'Supermoto',city:'Hradec Králové',seller:'Ready2Ride',added:'Před 2 dny'},
{id:7,brand:'Honda',model:'CB750 Hornet',title:'Honda CB750 Hornet',year:2023,price:159000,km:10700,power:67,category:'Naháče',city:'Praha',seller:'Soukromý prodejce',added:'Před 3 dny'},
{id:8,brand:'Triumph',model:'Street Triple 765',title:'Triumph Street Triple RS',year:2021,price:229000,km:11900,power:90,category:'Naháče',city:'Liberec',seller:'Brit Moto',added:'Před 3 dny'},
{id:9,brand:'Ducati',model:'Monster 821',title:'Ducati Monster 821',year:2018,price:175000,km:22000,power:80,category:'Naháče',city:'Olomouc',seller:'Soukromý prodejce',added:'Před 4 dny'},
{id:10,brand:'Yamaha',model:'Tenere 700',title:'Yamaha Ténéré 700',year:2022,price:229900,km:14100,power:54,category:'Cestovní',city:'Zlín',seller:'Moto Zlín',added:'Před 4 dny'},
{id:11,brand:'Kawasaki',model:'Z900',title:'Kawasaki Z900',year:2020,price:168000,km:18700,power:92,category:'Naháče',city:'Pardubice',seller:'Soukromý prodejce',added:'Před 5 dny'},
{id:12,brand:'Suzuki',model:'GSX-R 750',title:'Suzuki GSX-R 750',year:2011,price:155000,km:35000,power:110,category:'Sportovní',city:'Jihlava',seller:'Moto Garage',added:'Před 5 dny'},
];
export const listings:Listing[] = entries.map((v,i)=>({...v, sellerType:v.seller==='Soukromý prodejce'?'Soukromý prodejce':'Motobazar',image:photos[i%photos.length],gallery:[photos[i%photos.length],photos[(i+1)%photos.length],photos[(i+2)%photos.length]],description:`${v.title} • ${v.year}. Ukázkový inzerát vytvořený pro předvedení webu. Před nákupem si vždy vyžádejte servisní historii, VIN a domluvte osobní prohlídku stroje.`,tags:i%3===0?['Servisní knížka','Možnost prohlídky']:i%3===1?['Po servisu','ČR původ']:['Garagovaná','Doložené doklady'],engine:i===5?690:i===3?1254:i===6?755:Math.max(600,Math.round(v.power*9)),color:i%3===0?'Modrá':i%3===1?'Černá':'Červená'}));
export const money=(n:number)=>new Intl.NumberFormat('cs-CZ').format(n)+' Kč';
export const number=(n:number)=>new Intl.NumberFormat('cs-CZ').format(n);
export const categories=['Všechny','Sportovní','Naháče','Cestovní','Enduro','Chopper','Skútry','Supermoto'];
export const brands=['Všechny značky',...Array.from(new Set(listings.map(x=>x.brand))).sort()];