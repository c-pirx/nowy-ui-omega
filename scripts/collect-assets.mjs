import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const source = 'https://omega-mg.pl/';
const html = await fs.readFile(path.join(root, 'research/original.html'), 'utf8');
const privacyUrl = 'https://omega-mg.pl/polityka-prywatnosci/';
const widgetUrl = 'https://www.cik.org.pl/widget.js?id=28162&mobile=left&desktop=right';
const [privacySource, certificationWidget] = await Promise.all([privacyUrl,widgetUrl].map(async url=>{const r=await fetch(url);if(!r.ok)throw new Error(`${r.status} ${url}`);return {url:r.url,status:r.status,body:await r.text()};}));
const decodeEmail = hex => {const key=parseInt(hex.slice(0,2),16);return hex.slice(2).match(/../g).map(pair=>String.fromCharCode(parseInt(pair,16)^key)).join('');};
const decode = value => value.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n,16))).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])([\s\S]*?)\2/g)].map(m => [m[1], decode(m[3])]));
const clean = value => decode(value.replace(/<svg[\s\S]*?<\/svg>/gi, '').replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]+>/g, '').replace(/[\t ]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim());
const mkdir = p => fs.mkdir(path.join(root,p), {recursive:true});
await Promise.all(['research/styles', 'public/assets'].map(mkdir));
const links = [...html.matchAll(/<link\b[^>]*>/gi)].map(m => attrs(m[0]));
const css = await Promise.all(links.filter(a=>a.rel==='stylesheet').map(async (a, index) => {
  const r = await fetch(a.href); if(!r.ok) throw new Error(`${r.status} ${a.href}`);
  const body=await r.text(); const name=`${String(index+1).padStart(2,'0')}-${a.id}.css`;
  await fs.writeFile(path.join(root,'research/styles',name),body);
  return {source:a.href, local:`research/styles/${name}`, body};
}));
const images = [...html.matchAll(/<img\b[^>]*>/gi)].map(m=>attrs(m[0]));
const cssBackgrounds = css.flatMap(sheet => [...sheet.body.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)].map(m=>({source:new URL(m[2],sheet.source).href, stylesheet:sheet.local})).filter(a=>/\.(svg|png|jpe?g|webp)(?:[?#]|$)/i.test(a.source)));
const normalizedHtml = html.replace(/\\\//g,'/');
const imageSources = [...new Set([...normalizedHtml.matchAll(/https?:[^\s"<>]+?\.(?:svg|png|jpe?g|webp)/g)].map(m=>decode(m[0])).concat(cssBackgrounds.map(a=>a.source)))].filter(u=>u.startsWith(source));
const dimensions = buf => {
  if(buf.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return {width:buf.readUInt32BE(16),height:buf.readUInt32BE(20)};
  if(buf[0]===255&&buf[1]===216){let o=2;while(o<buf.length){if(buf[o]!==255){o++;continue;}const marker=buf[o+1];if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker))return {width:buf.readUInt16BE(o+7),height:buf.readUInt16BE(o+5)};if(marker===218)break;o+=2+buf.readUInt16BE(o+2);}}
  const svg=buf.toString('utf8'); if(svg.includes('<svg')){const tag=attrs(svg.match(/<svg[^>]*>/)?.[0]||'');const vb=tag.viewBox?.split(/[ ,]+/).map(Number);return {width:parseFloat(tag.width)||vb?.[2],height:parseFloat(tag.height)||vb?.[3],viewBox:tag.viewBox};}
  return {};
};
const assets = await Promise.all(imageSources.map(async url=>{
  const name=decodeURIComponent(path.basename(new URL(url).pathname)); const r=await fetch(url);if(!r.ok)throw new Error(`${r.status} ${url}`);
  const bytes=Buffer.from(await r.arrayBuffer());const local=`public/assets/${name}`;await fs.writeFile(path.join(root,local),bytes);
  return {source:url,local,webPath:`/assets/${name}`,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),...dimensions(bytes),imageElements:images.filter(i=>i.src===url),cssBackgrounds:cssBackgrounds.filter(i=>i.source===url)};
}));
const fontSources = css.filter(s=>s.source.includes('fonts.googleapis.com')).flatMap(sheet=>[...sheet.body.matchAll(/url\(([^)]+)\)/g)].map(m=>m[1].replace(/["']/g,'')));
const fonts = await Promise.all([...new Set(fontSources)].map(async url=>{const r=await fetch(url);if(!r.ok)throw new Error(`${r.status} ${url}`);const bytes=Buffer.from(await r.arrayBuffer());const name=path.basename(new URL(url).pathname);await fs.writeFile(path.join(root,'public/assets',name),bytes);return {source:url,local:`public/assets/${name}`,webPath:`/assets/${name}`,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};}));
// The original legacy Open Sans TTF response lacks Polish characters. Preserve the
// same font family using its official modern Latin / Latin Extended font files.
const modernFontSource='https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap';
const modernFontResponse=await fetch(modernFontSource,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'}});
if(!modernFontResponse.ok)throw new Error(`${modernFontResponse.status} ${modernFontSource}`);
const modernFontBody=await modernFontResponse.text();
const latinBlocks=[...modernFontBody.matchAll(/\/\* (latin(?:-ext)?) \*\/\s*(@font-face\s*\{[^}]+\})/g)].map(m=>({subset:m[1],css:m[2],source:m[2].match(/url\(([^)]+)\)/)[1]}));
const modernFontLocal='research/styles/31-open-sans-polish.css';
await fs.writeFile(path.join(root,modernFontLocal),latinBlocks.map(b=>`/* ${b.subset} */\n${b.css}`).join('\n'));
await Promise.all([...new Map(latinBlocks.map(b=>[b.source,b])).values()].map(async block=>{const r=await fetch(block.source);if(!r.ok)throw new Error(`${r.status} ${block.source}`);const bytes=Buffer.from(await r.arrayBuffer());const name=path.basename(new URL(block.source).pathname);await fs.writeFile(path.join(root,'public/assets',name),bytes);fonts.push({source:block.source,local:`public/assets/${name}`,webPath:`/assets/${name}`,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),family:'Open Sans',subset:block.subset,note:'Official WOFF2 variant of original font family; Latin Extended adds missing Polish glyphs.'});}));
const widgetDataImage=certificationWidget.body.match(/src="(data:image\/png;base64,[^"]+)"/)?.[1];
if(widgetDataImage){const bytes=Buffer.from(widgetDataImage.split(',')[1],'base64');await fs.writeFile(path.join(root,'public/assets/cik-widget-logo.png'),bytes);assets.push({source:widgetUrl,embeddedSource:widgetDataImage,local:'public/assets/cik-widget-logo.png',webPath:'/assets/cik-widget-logo.png',bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),...dimensions(bytes)});}
const headings = [...html.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map(m=>({level:+m[1][1],text:clean(m[2])}));
const paragraphs = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map(m=>clean(m[1])).filter(Boolean);
const anchors = [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)].map(m=>({...attrs(m[0].slice(0,m[0].indexOf('>')+1)),text:clean(m[0])}));
const listText = [...html.matchAll(/<span\b[^>]*class=["']elementor-icon-list-text["'][^>]*>([\s\S]*?)<\/span>/gi)].map(m=>clean(m[1]));
const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);
const inlineStyles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m=>m[1]).join('\n');
await fs.writeFile(path.join(root,'research/styles/00-inline.css'),inlineStyles);
const colors = Object.fromEntries([...new Set((inlineStyles+'\n'+css.filter(s=>/post-|calculator/.test(s.local)).map(s=>s.body).join('\n')).match(/#[0-9a-f]{3,8}\b/gi))].sort().map(color=>[color,[]]));
const sourceData={source,retrievedAt:new Date().toISOString(),title:clean(html.match(/<title>([\s\S]*?)<\/title>/)?.[1]||''),description:attrs(html.match(/<meta name="description"[^>]*>/)?.[0]||'').content,headings,paragraphs,listText,anchors,ids,images,cssBackgrounds,colors,fontStyles:css.filter(s=>s.source.includes('fonts.googleapis.com')),privacyUrl:'https://omega-mg.pl/polityka-prywatnosci/',reviews:{anchorInMenu:anchors.some(a=>a.href==='#opinie'),anchorTargetExists:ids.includes('opinie'),widgets:[...html.matchAll(/<iframe\b[^>]*>/gi)].map(m=>attrs(m[0])),scriptSources:[...html.matchAll(/<script\b[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(m=>decode(m[1]))}};
sourceData.palette={
  brand:{primary:'#D40000',secondary:'#5E4C3B',text:'#1F232A',source:'research/styles/06-elementor-post-333-css.css'},
  surfaces:{white:'#FFFFFF',light:'#F7F8F8',footer:'#242A36',source:['research/styles/00-inline.css','research/styles/18-elementor-post-479-css.css']},
  supporting:{body:'#67757F',footerText:'#CAD0DB',heroLead:'#E9EBEF'},
  note:'Astra and Elementor contain unused generic theme colors. Active primary/secondary are the red/brown Elementor overrides; calculator has a separate purple plugin default.'
};
sourceData.fontImprovements={source:modernFontSource,local:modernFontLocal,blocks:latinBlocks,note:'Original Open Sans legacy TTF lacks Polish glyphs; official WOFF2 Latin and Latin Extended preserve the family with correct language support.'};
sourceData.navigation=anchors.filter(a=>a.class==='menu-link').slice(0,5).map(({text,href})=>({text,href})).concat([{text:'Kalkulator',href:'#kalkulator'}]);
sourceData.contact={name:'Omega MG Monika Glonek',phone:'+48 505 448 081',phoneHref:'tel:+48505448081',email:decodeEmail('086a617d7a674867656d6f6925656f267864'),addressLines:['ul. Heleny i Jana Prześlaków 15C','43-600 Jaworzno'],nip:'6321808677',regon:'243006460',certificate:'Certyfikat Księgowy nr 54701/2012'};
sourceData.sections={
  hero:{title:headings[0].text,tagline:headings[1].text,ctas:[{text:'Kalkulator księgowości',href:'#kalkulator'},{text:'O nas',href:'#onas'}],image:'/assets/projekt-bez-nazwy-2.png'},
  about:{eyebrow:'O mnie',title:headings[3].text,lead:headings[4].text,paragraphs:paragraphs.slice(0,2),image:'/assets/dsc_1052-scaled.jpg'},
  services:{eyebrow:'Usługi',title:'Zakres naszych usług',intro:paragraphs[2],featured:[{number:'01.',title:'Prowadzenie ksiąg rachunkowych',body:paragraphs[3],image:'/assets/crop-woman-using-calculator-and-taking-notes-on-paper.jpg'},{number:'02.',title:'Kadry i płace',body:paragraphs[4],image:'/assets/crop-payroll-clerk-counting-money-while-sitting-at-table.jpg'}],full:{number:'03.',title:'Pełny zakres naszych usług',items:[0,2,4,6,8].map(i=>({title:listText[i],body:listText[i+1]})).concat(listText.slice(10,12).map(title=>({title}))),background:'/assets/heap-of-american-money-cash-and-vintage-light-box.jpg'}},
  reasons:{eyebrow:headings[13].text,title:headings[14].text,body:paragraphs[5],items:headings.slice(15,20).map((h,i)=>({title:h.text,body:paragraphs[6+i]}))},
  clients:{id:'opinie',eyebrow:'Współpraca',title:'Nasi klienci',images:[5,4,3,2,1].map(i=>({src:`/assets/logo-${i}.svg`,originalAlt:`logo ${i}`})),note:'No testimonial texts or ratings in original page. The Opinie anchor opens the clients carousel.'},
  calculatorBackground:'/assets/bg-01-free-img.jpg',
  contact:{eyebrow:'Zadzwoń do nas!',title:'kontakt'},
  footer:{body:paragraphs[14],services:listText.slice(15,19),logo:'/assets/projekt-bez-nazwy-2.png'}
};
sourceData.privacySource={url:privacySource.url,status:privacySource.status,html:privacySource.body,text:clean(privacySource.body.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,''))};
sourceData.certificationWidget={url:certificationWidget.url,status:certificationWidget.status,script:certificationWidget.body,profileUrl:'https://www.cik.org.pl/biuro/omega-monika-glonek-28162',title:'Certyfikowane Biuro Rachunkowe',criteria:['Uprawnienia: Certyfikat Księgowy nr 54701/2012','Ubezpieczenie OC: Leadenhall','Brak zaległości finansowych w BIG','Nienaganna opinia','Licencjonowany program księgowy: InsERT','Min. 2 lata doświadczenia (od 2017-08-02)'],additional:['Ostatnia weryfikacja wiedzy podatkowej: 2026 - czerwiec'],logo:'/assets/cik-widget-logo.png'};
await fs.writeFile(path.join(root,'research/content.json'),JSON.stringify(sourceData,null,2)+'\n');
await fs.writeFile(path.join(root,'research/asset-manifest.json'),JSON.stringify({source,retrievedAt:new Date().toISOString(),assets,fonts,stylesheets:css.map(({body,...rest})=>rest).concat([{source:modernFontSource,local:modernFontLocal}])},null,2)+'\n');
console.log(JSON.stringify({assets:assets.length,fonts:fonts.length,polishFontFiles:fonts.filter(f=>f.subset),headings:headings.length,paragraphs:paragraphs.length,serviceItems:sourceData.sections.services.full.items.length,brokenReviewsAnchor:!ids.includes('opinie')},null,2));
