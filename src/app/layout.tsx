import type { Metadata, Viewport } from 'next';
import '../catalog.css';

export const metadata:Metadata={
  metadataBase:new URL('https://xaspi7.github.io'),
  title:{default:'Inzerce motorek | MotoBazar',template:'%s | MotoBazar'},
  description:'Katalog motorek, filtry, soukromá inzerce a stránky prodejců. Funkční demo.',
  robots:{index:false,follow:false},
  icons:{icon:'/motobazar/favicon.svg'},
};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:[{media:'(prefers-color-scheme: light)',color:'#ffffff'},{media:'(prefers-color-scheme: dark)',color:'#121518'}]};
const themeScript=`(()=>{let p='system';try{p=localStorage.getItem('motobazar:theme:v1')||'system'}catch{}const dark=p==='dark'||(p!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=dark?'dark':'light';})();`;
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="cs" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:themeScript}}/><link rel="preconnect" href="https://images.unsplash.com"/></head><body>{children}<noscript><p style={{padding:'1rem'}}>Pro filtry, oblíbené a správu inzerátů zapni JavaScript. Veřejné nabídky jsou dostupné i bez něj.</p></noscript></body></html>;
}
