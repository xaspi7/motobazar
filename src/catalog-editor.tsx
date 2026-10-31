import React from 'react';
import { brands, categories, type Dealer } from './data';
import { REGIONS, CONDITIONS, TRANSMISSIONS, FUELS, PRIVATE_OWNER, publicationError, validateAd, compressPhoto, money, num, type Ad } from './catalog-model';
import { Icon, Field, Photo, Options } from './catalog-components';

interface Props {initial:Ad;ads:Ad[];dealers:Dealer[];profile:string;onProfile:(s:string)=>void;onSave:(a:Ad)=>boolean;}
interface State {ad:Ad;step:number;errors:Record<string,string>;busy:boolean;uploadError:string;ack:boolean;}
export default class Editor extends React.Component<Props,State>{
 state:State={ad:{...this.props.initial,gallery:[...this.props.initial.gallery]},step:1,errors:{},busy:false,uploadError:'',ack:false};
 dirty=false; mounted=false;
 beforeUnload=(e:BeforeUnloadEvent)=>{if(this.dirty){e.preventDefault();e.returnValue='';}};
 componentDidMount(){this.mounted=true;window.addEventListener('beforeunload',this.beforeUnload);}
 componentWillUnmount(){this.mounted=false;window.removeEventListener('beforeunload',this.beforeUnload);}
 componentDidUpdate(prev:Props){if(prev.profile!==this.props.profile){const d=this.props.dealers.find(d=>d.id===this.props.profile);this.setState(s=>({ad:{...s.ad,dealerId:d?.id||null,ownerKey:this.props.profile,sellerName:d?.name||s.ad.sellerName}}));}}
 patch=(key:keyof Ad,value:unknown)=>{this.dirty=true;this.setState(s=>({ad:{...s.ad,[key]:value},errors:{...s.errors,[key]:''}}));};
 changeBrand=(value:string)=>{this.dirty=true;this.setState(s=>({ad:{...s.ad,brand:value,model:'',title:value},errors:{...s.errors,brand:''}}));};
 next=()=>{
  const errors=validateAd(this.state.ad,this.state.step);
  if(Object.keys(errors).length){this.setState({errors},()=>document.querySelector<HTMLElement>('.has-error input,.has-error select,.has-error textarea,.mc-editor-errors')?.focus());return;}
  this.setState(s=>({step:Math.min(3,s.step+1),errors:{}}),()=>document.querySelector<HTMLElement>('.mc-step-heading')?.focus());window.scrollTo({top:0,behavior:'smooth'});
 };
 save=(draft:boolean)=>{
  const ad={...this.state.ad,status:draft?'draft' as const:'active' as const,title:this.state.ad.title.trim()||'Rozpracovaný inzerát',image:this.state.ad.gallery[0]||'',updatedAt:new Date().toISOString()};
  if(!draft){const errors=validateAd(ad);if(!this.state.ack)errors.ack='Potvrď uložení do ukázky.';const cap=publicationError(this.props.ads,ad);if(cap)errors.limit=cap;if(Object.keys(errors).length){this.setState({errors});return;}}
  if(this.props.onSave(ad))this.dirty=false;
 };
 upload=async(files:FileList|null)=>{
  if(!files)return;const available=8-this.state.ad.gallery.length;
  if(files.length>available){this.setState({uploadError:'Lze přidat nejvýše 8 fotografií.'});return;}
  this.setState({busy:true,uploadError:''});const uploaded:string[]=[];let error='';
  for(const file of Array.from(files)){try{uploaded.push(await compressPhoto(file));}catch(e){error=e instanceof Error?e.message:'Fotografii nelze nahrát.';}}
  if(!this.mounted)return;this.dirty=true;this.setState(s=>({ad:{...s.ad,gallery:[...s.ad.gallery,...uploaded]},busy:false,uploadError:error,errors:{...s.errors,gallery:''}}));
 };
 move=(index:number,delta:number)=>{const gallery=[...this.state.ad.gallery];const target=index+delta;if(target<0||target>=gallery.length)return;[gallery[index],gallery[target]]=[gallery[target],gallery[index]];this.patch('gallery',gallery);};
 render(){
  const {ad,step,errors,busy}=this.state;
  const own=this.props.ads.filter(a=>a.ownerKey===PRIVATE_OWNER&&a.status==='active'&&a.id!==ad.id).length;
  const numberField=(key:'year'|'price'|'km'|'power'|'engine',label:string,required=false)=><Field label={label+(required?' *':'')} error={errors[key]}><input name={key} type="number" inputMode="numeric" min="0" step="1" value={ad[key]===0&&key!=='km'?'':ad[key]} onChange={e=>this.patch(key,e.target.value===''?0:Number(e.target.value))}/></Field>;
  return <div className="mc-editor"><div className="mc-page-top"><div><a className="mc-back" href="#motorky"><Icon name="back" size={17}/>Zpět na motorky</a><h1>{ad.id?'Upravit inzerát':'Prodat motorku'}</h1></div><button className="mc-btn subtle" disabled={busy} onClick={()=>this.save(true)}><Icon name="document" size={17}/>Uložit koncept</button></div>
  {!ad.id&&<div className="mc-account-choices" role="group" aria-label="Typ prodejce"><button className={!ad.dealerId?'selected':''} onClick={()=>this.props.onProfile(PRIVATE_OWNER)}><Icon name="user"/><span><strong>Soukromý prodejce</strong><small>2 aktivní inzeráty zdarma</small></span><i/></button><button className={ad.dealerId?'selected':''} onClick={()=>this.props.onProfile(this.props.dealers[0].id)}><Icon name="shop"/><span><strong>Bazar / prodejce</strong><small>Tarif podle počtu inzerátů</small></span><i/></button></div>}
  <div className="mc-stepper" aria-label="Postup vložení">{['Motorka','Fotky a popis','Kontakt a kontrola'].map((name,i)=><button key={name} className={step===i+1?'active':step>i+1?'done':''} disabled={i+1>step} onClick={()=>this.setState({step:i+1,errors:{}})} aria-current={step===i+1?'step':undefined}><b>{step>i+1?<Icon name="check" size={15}/>:i+1}</b><span>{name}</span></button>)}</div>
  <div className="mc-editor-layout"><form className="mc-editor-panel" noValidate onSubmit={e=>{e.preventDefault();step<3?this.next():this.save(false);}}>
  <h2 className="mc-step-heading" tabIndex={-1}>{step===1?'Údaje o motorce':step===2?'Fotografie a popis':'Kontakt a kontrola'}</h2>
  {Object.keys(errors).some(k=>errors[k])&&<div className="mc-editor-errors mc-alert" role="alert" tabIndex={-1}>Zkontroluj označená pole.{errors.limit&&<p>{errors.limit}</p>}</div>}
  {step===1&&<div className="mc-form-grid">
    <Field label="Značka *" error={errors.brand}><select name="brand" value={ad.brand} onChange={e=>this.changeBrand(e.target.value)}><Options items={brands} empty="Vybrat značku"/></select></Field>
    <Field label="Model *" error={errors.model}><input name="model" list="mc-known-models" value={ad.model} maxLength={100} onChange={e=>{const model=e.target.value;this.patch('model',model);this.patch('title',(ad.brand+' '+model).trim());}} placeholder="Např. CB750 Hornet"/><datalist id="mc-known-models">{[...new Set(this.props.ads.filter(a=>a.brand===ad.brand).map(a=>a.model))].map(m=><option key={m} value={m}/>)}</datalist></Field>
    <Field label="Typ motorky *" error={errors.category}><select name="category" value={ad.category} onChange={e=>this.patch('category',e.target.value)}><Options items={categories} empty="Vybrat typ"/></select></Field>
    <Field label="Název inzerátu *" error={errors.title} className="wide"><input name="title" value={ad.title} maxLength={100} onChange={e=>this.patch('title',e.target.value)}/></Field>
    {numberField('price','Cena (Kč)',true)}{numberField('year','Rok výroby',true)}{numberField('km','Najeto (km)',true)}{numberField('engine','Objem (cm³)')}{numberField('power','Výkon (kW)')}
    <Field label="Stav"><select value={ad.condition} onChange={e=>this.patch('condition',e.target.value)}><Options items={CONDITIONS} empty="Vybrat stav"/></select></Field>
    <Field label="Převodovka"><select value={ad.transmission} onChange={e=>this.patch('transmission',e.target.value)}><Options items={TRANSMISSIONS} empty="Neuvedeno"/></select></Field>
    <Field label="Palivo"><select value={ad.fuel} onChange={e=>this.patch('fuel',e.target.value)}><Options items={FUELS} empty="Neuvedeno"/></select></Field>
    <Field label="Barva"><input value={ad.color} maxLength={60} onChange={e=>this.patch('color',e.target.value)}/></Field>
    <Field label="Kraj *" error={errors.region}><select name="region" value={ad.region} onChange={e=>this.patch('region',e.target.value)}><Options items={REGIONS} empty="Vybrat kraj"/></select></Field>
    <Field label="Město *" error={errors.city}><input name="city" value={ad.city} maxLength={80} autoComplete="address-level2" onChange={e=>this.patch('city',e.target.value)}/></Field>
    <Field label="VIN (volitelné)" error={errors.vin}><input value={ad.vin} maxLength={17} autoCapitalize="characters" onChange={e=>this.patch('vin',e.target.value.toUpperCase().replace(/\s/g,''))}/></Field>
  </div>}
  {step===2&&<>
    <div className="mc-upload-info"><span>{ad.gallery.length} / 8 fotografií</span><small>JPG, PNG, WebP · do 10 MB / foto</small></div>
    <label className={'mc-upload '+(errors.gallery?'has-error':'')}><Icon name="upload" size={26}/><strong>{busy?'Zpracovávám fotografie…':'Vybrat fotografie'}</strong><span>První fotografie bude hlavní.</span><input aria-label="Nahrát fotografie" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy||ad.gallery.length>=8} onChange={e=>{this.upload(e.target.files);e.target.value='';}}/></label>
    {(errors.gallery||this.state.uploadError)&&<p className="mc-error" role="alert">{errors.gallery||this.state.uploadError}</p>}
    <div className="mc-uploaded">{ad.gallery.map((src,i)=><div key={i}><Photo src={src} alt={'Fotografie '+(i+1)}/>{i===0&&<b>Hlavní</b>}<div><button type="button" disabled={!i||busy} aria-label={'Posunout fotografii '+(i+1)+' doleva'} onClick={()=>this.move(i,-1)}><Icon name="back" size={15}/></button><button type="button" disabled={i===ad.gallery.length-1||busy} aria-label={'Posunout fotografii '+(i+1)+' doprava'} onClick={()=>this.move(i,1)}><Icon name="arrow" size={15}/></button><button type="button" disabled={busy} aria-label={'Odebrat fotografii '+(i+1)} onClick={()=>this.patch('gallery',ad.gallery.filter((_,n)=>n!==i))}><Icon name="trash" size={15}/></button></div></div>)}</div>
    <Field label="Popis inzerátu *" error={errors.description}><textarea name="description" value={ad.description} minLength={20} maxLength={5000} rows={6} onChange={e=>this.patch('description',e.target.value)} placeholder="Stav, údržba, výbava, důvod prodeje…"/><small>{ad.description.length} / 5 000</small></Field>
    <div className="mc-form-grid two"><Field label="Servis a dostupné doklady"><textarea rows={3} maxLength={1500} value={ad.service} onChange={e=>this.patch('service',e.target.value)} placeholder="Kdy a co bylo provedeno, jaké doklady máš."/></Field><Field label="Známé vady a poškození"><textarea rows={3} maxLength={1500} value={ad.defects} onChange={e=>this.patch('defects',e.target.value)} placeholder="Popiš vady a přidej jejich fotografie."/></Field></div>
  </>}
  {step===3&&<>
    <div className="mc-review"><Photo src={ad.gallery[0]||''}/><div><h3>{ad.title}</h3><strong>{money(ad.price)}</strong><span>{ad.year} · {num(ad.km)} km · {ad.city}</span></div><button type="button" className="mc-icon-btn" onClick={()=>this.setState({step:1})} aria-label="Upravit údaje"><Icon name="edit"/></button></div>
    <div className="mc-form-grid two"><Field label="Jméno / název prodejce *" error={errors.sellerName} className="wide"><input name="sellerName" autoComplete="name" maxLength={100} value={ad.sellerName} onChange={e=>this.patch('sellerName',e.target.value)}/></Field><Field label="Telefon *" error={errors.phone}><input name="phone" type="tel" autoComplete="tel" value={ad.phone} maxLength={20} onChange={e=>this.patch('phone',e.target.value)} placeholder="+420"/></Field><Field label="E-mail *" error={errors.email}><input name="email" type="email" autoComplete="email" value={ad.email} maxLength={150} onChange={e=>this.patch('email',e.target.value)}/></Field></div>
    <div className="mc-demo-note"><Icon name="info"/><p>Toto je veřejná ukázka webu. Inzerát ani kontakt se neodesílají na server; zůstanou pouze v tomto prohlížeči. Použij zkušební údaje.</p></div>
    <label className="mc-check"><input type="checkbox" checked={this.state.ack} onChange={e=>this.setState({ack:e.target.checked,errors:{...errors,ack:''}})}/>Rozumím, uložit inzerát do dema.</label>{errors.ack&&<p className="mc-error">{errors.ack}</p>}
  </>}
  <div className="mc-editor-actions">{step>1?<button type="button" className="mc-btn subtle" onClick={()=>this.setState(s=>({step:s.step-1,errors:{}}))}><Icon name="back" size={17}/>Zpět</button>:<span className="mc-help">* Povinné údaje</span>}<button type="submit" className="mc-btn primary" disabled={busy}>{step===3?'Zveřejnit v demu':'Pokračovat'}<Icon name={step===3?'check':'arrow'} size={18}/></button></div>
  </form><aside className="mc-editor-summary"><h3>Tvůj inzerát</h3><div className="mc-summary-plan"><Icon name={ad.dealerId?'shop':'user'}/><div><strong>{ad.dealerId?'Bazar / prodejce':'Soukromý prodejce'}</strong><small>{ad.dealerId?'Ukázka firemního účtu':`${own} / 2 aktivní inzeráty`}</small></div></div><dl><div><dt>Zveřejnění</dt><dd>{ad.dealerId?'Demo tarifu':'Zdarma'}</dd></div><div><dt>Fotografie</dt><dd>{ad.gallery.length} / 8</dd></div><div><dt>Stav</dt><dd>Koncept</dd></div></dl><p>Bez plateb. Všechny změny se teď ukládají jen v tomto prohlížeči.</p><a href="#tarify">Podmínky inzerce<Icon name="arrow" size={15}/></a></aside></div></div>;
 }
}
