const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],pad=n=>String(n).padStart(2,'0');
/* responsive environment layers → generated per-breakpoint CSS */
let LN=0,CSSA='';const KEY={w:'width',l:'left',r:'right',t:'top',b:'bottom',z:'z-index',rot:'rotate',o:'opacity'};
const P=s=>s=='x'?'display:none':s.split(';').filter(Boolean).map(p=>{const[k,v]=p.split(':');return k=='f'?'transform:scaleX(-1)':KEY[k]+':'+v+(k=='z'?'!important':'')}).join(';');
const tier=(id,c,mq)=>c?`@media(min-width:${mq}px){.${id}{${c=='x'?'display:none':'display:block;left:auto;right:auto;top:auto;bottom:auto;'+P(c)}}}`:'';
const L=a=>(a||[]).map(x=>{const[f,...c]=x.split('|'),id='ly'+LN++;CSSA+=`.${id}{${P(c[0])}}`+tier(id,c[1],700)+tier(id,c[2],1100);return`<img class="d ${id}" src="${f}" alt="" loading="lazy" decoding="async">`}).join('');
const flush=()=>{if(CSSA){document.head.insertAdjacentHTML('beforeend','<style>'+CSSA+'</style>');CSSA=''}};
const rain=(src,n,w,dur=3)=>{for(let i=0;i<n;i++){const e=document.createElement('img');e.src=src;e.className='fall';e.style.cssText=`left:${Math.random()*100}vw;width:${w*(.6+Math.random()*.8)}px;--dx:${Math.random()*120-60}px;--r:${Math.random()*720}deg;animation-duration:${dur+Math.random()*3}s;animation-delay:${Math.random()*1.4}s`;document.body.append(e);setTimeout(()=>e.remove(),9000)}};
const lit=el=>{el.classList.add('lit');setTimeout(()=>el.classList.remove('lit'),3000)};
const left=t=>{const s=Math.max(0,t-Date.now())/1e3;return[Math.floor(s/86400),Math.floor(s%86400/3600),Math.floor(s%3600/60)]};
let store={};try{store=JSON.parse(localStorage.getItem('rk')||'{}')}catch(_){}
const save=()=>{try{localStorage.setItem('rk',JSON.stringify(store))}catch(_){}};
Object.entries(SCENES).forEach(([id,l])=>{const s=$('#'+id);if(s)s.insertAdjacentHTML('afterbegin',L(l))});flush();
