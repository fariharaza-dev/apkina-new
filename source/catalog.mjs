import fs from 'node:fs';
const raw=JSON.parse(fs.readFileSync(new URL('../catalog-source.json',import.meta.url),'utf8'));
const details={
'ap3250':{image:'ap3250',tagline:'Your Colour. Your Creation.',type:'RGB LED Panel',tone:'ice',headline:'Small light.\nFull creative freedom.',lead:'Bring 360° colour, 21 effects and app control to your creative setup.',featured:['Power','Built-in battery','Colour temperature','Lighting effects','App control','Weight']},
'ap3150':{image:'ap3150',tagline:'Colour in Your Pocket',type:'Slim RGB LED Panel',tone:'ice',headline:'Made to go\nwhere inspiration goes.',lead:'A slim 11mm body brings adjustable white light and RGB colour to a compact, battery-powered panel.',featured:['Power','Built-in battery','Dimensions','Lighting effects','Colour adjustment','Weight']},
'ap336':{image:'ap336',tagline:'Light Every Detail',type:'LED Video Light',tone:'pearl',headline:'Find your light.\nCapture your moment.',lead:'336 LEDs and adjustable colour temperature in a compact panel for camera and creative setups.',featured:['Power','LED beads','Colour temperature','CRI','Input','Net weight']},
'ap475':{image:'ap475',tagline:'Colour on the Move',type:'RGB Stick Light',tone:'lavender',headline:'A world of colour.\nReady to go.',lead:'A portable 320g RGB stick light with 21 lighting effects and a built-in 5200mAh battery.',featured:['Power','Built-in battery','Lighting effects','Colour temperature','Weight','Luminous flux']},
'ap620':{image:'ap620',tagline:'Paint Your Story',type:'RGB Handheld Light',tone:'ice',headline:'Set the colour.\nShape the atmosphere.',lead:'Adjustable barndoors, full-colour light and app control give your lighting a new dimension.',featured:['Power','CRI','Lighting effects','Battery','PD/QC fast charge','Display']},
'ap1000':{image:'ap1000',tagline:'A Spectrum of Possibilities',type:'RGB Video Light',tone:'pearl',headline:'Make every\ncolour count.',lead:'Explore a full 360° colour range, adjustable white light and 24 effects with app control.',featured:['Power','Built-in battery','Lighting effects','Luminous flux','App control','Weight']},
'300w':{image:'300w',tagline:'Shape Your Vision',type:'Bi-Colour Video Light',tone:'pearl',headline:'Power your\nnext production.',lead:'300W of bi-colour light, 1–100% intensity control and a choice of six lighting effects.',featured:['Power','Colour temperature','CRI','Intensity','App control','Display']},
'sab234':{image:'sab234',tagline:'Your Steady Starting Point',type:'Camera Tripod',tone:'pearl',headline:'Frame your\nnext idea.',lead:'A lightweight, collapsible tripod for photography, live streaming and content creation.',featured:['Height range','Head movement','Carry bag'],render:true},
'np-f970-fast-smart-charger':{image:'charger',tagline:'Ready for the Next Take',type:'Battery Charger',tone:'pearl',headline:'Keep your\ncreativity powered.',lead:'A compact fast charger with LED indicators for Sony NP-F series batteries.',featured:['Battery compatibility','Charge indication']}
};
const scenes={
'ap3150':{title:'Make room for your next idea.',caption:'Direct compact lighting onto your tabletop subject.',alt:'AP3150 panel mounted above a tabletop camera, with both aimed at an off-white ceramic vase'},
'ap3250':{title:'Set the scene in colour.',caption:'Shape a glass still life with controlled violet fill.',alt:'AP3250 panel on a tabletop stand with its emitting front aimed at a glass vase, photographed from behind the light'},
'ap336':{title:'Ready for the next take.',caption:'Keep the camera and light focused on your interview subject.',alt:'AP336 panel mounted above a camera, with its emitting front and camera lens aimed at a seated adult man'},
'ap475':{title:'Create wherever you are.',caption:'Add colour to a ceramic and camera-lens still life.',alt:'AP475 stick light on its mini tripod directing cyan fill toward a ceramic vase and camera lens, with a camera aimed at the still life'},
'ap620':{title:'Put your ideas in a new light.',caption:'Shape a male portrait with light directed toward the subject.',alt:'An adult male lighting assistant holds the AP620 with its emitting opening aimed at a seated adult man, adding cyan light to his face and shoulder'},
'ap1000':{title:'Light your next story.',caption:'Bring controlled colour to your next male portrait.',alt:'AP1000 handheld video light aimed toward an adult male portrait subject'},
'300w':{title:'Behind every great frame.',caption:'Place your studio light where it shapes the subject.',alt:'300W bi-colour light on a studio stand, viewed from the side and rear with its front emitter aimed at a seated adult man'},
'sab234':{title:'Find your frame.',caption:'Support the camera while you compose a ceramic still life.',alt:'An adult male photographer uses a camera mounted on the SAB234 tripod, with its lens aimed toward ceramic vases on a studio table'},
'np-f970-fast-smart-charger':{title:'Prepare for what comes next.',caption:'Charge an NP-F battery while preparing the rest of your kit.',alt:'Single-slot NP-F charger with a battery seated in its charging rails and a connected power cable, beside a spare battery and camera'}
};
export const products=raw.products.map(p=>({...p,...details[p.slug],scene:{...scenes[p.slug],image:details[p.slug].image+'-in-use'}}));
export const categories=raw.categories;
export const bySlug=Object.fromEntries(products.map(p=>[p.slug,p]));
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const imageDescription=p=>p.slug==='ap1000'?'supplied product image':'studio product visualisation';
export const img=(p,cls='',eager=false)=>`<img class="product-cutout ${cls}" src="/assets/${p.image}.webp" alt="${esc(p.name)} — ${imageDescription(p)}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async">`;
