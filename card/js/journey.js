/* Wedding Journey — the footprints are the story, the celebrations are the destinations, Pelli is the arrival.
   Everything is generated from EVENTS (data.js). No Math.random(): every composition is a deterministic profile. */
(()=>{
const sec=$('#journey'),body=$('#jbody'),world=$('#world');
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- order: the event flagged sevenBefore (Pelli) is the final destination.
   Set CLIMAX_LAST=false to walk the events in data order instead. ---------- */
const CLIMAX_LAST=true;
const list=EVENTS.slice(),ci=list.findIndex(e=>e.sevenBefore);
if(CLIMAX_LAST&&ci>-1)list.push(list.splice(ci,1)[0]);
const N=list.length,SEQ=['pA','pB','pC','pD','pE'];
const prof=list.map((_,i)=>i==N-1?'pF':SEQ[(i+(i/5|0))%5]);   /* never the same profile twice in a row */

/* ---------- environment per profile (layer syntax from core.js: mobile | tablet | desktop) ---------- */
const DEC={
 pA:['lotus-cluster.webp|x|w:30vw;l:-6vw;b:-1%;z:1|w:min(24vw,380px);l:-3vw;b:2%;z:1','temple-parrot.webp|w:20vw;r:3vw;t:5%;z:5|w:14vw;r:5vw|w:min(9vw,150px);r:5vw;t:8%;z:5'],
 pB: ['banana-leaves-corner.webp|w:40vw;r:-16vw;t:3%;z:1;rot:-8deg|w:34vw;r:-8vw;l:auto;rot:-8deg|w:min(24vw,360px);r:-6vw;l:auto;t:-3%;z:1;rot:-6deg', 'temple-parrot.webp|x|x|w:min(7vw,110px);r:9vw;b:9%;z:5'],
 pC:['lotus-1.webp|w:40vw;l:-10vw;b:1%;z:1|w:30vw;l:-6vw|w:min(22vw,340px);l:-4vw;b:-3%;z:1'],
 pD:['banana-leaves-corner.webp|x|w:28vw;r:-10vw;t:6%;z:1;f:1|w:min(16vw,250px);r:-6vw;t:-5%;z:1;f:1','temple-parrot.webp|x|x|w:min(7.5vw,120px);r:6vw;b:6%;z:5'],
 pE:['lotus-2.webp|w:36vw;r:-8vw;b:0;z:1|w:28vw|w:min(17vw,270px);r:-4vw;b:-2%;z:1','temple-parrot.webp|x|w:12vw;l:3vw;t:5%;z:5|w:min(8vw,130px);l:5vw;t:6%;z:5'],
 pF:['lotus-cluster.webp|w:44vw;l:-14vw;b:0;z:1|w:32vw|w:min(24vw,380px);l:-4vw;b:-1%;z:1','lotus-2.webp|w:38vw;r:-12vw;b:0;z:1|w:28vw|w:min(21vw,340px);r:-3vw;b:0;z:1','temple-parrot.webp|w:18vw;l:4vw;t:2%;z:5|w:12vw|w:min(8vw,130px);l:9vw;t:5%;z:5']};

/* ---------- desktop path: waypoints after entry; the last one is the exit. [ref a=artwork s=stop, fx, fy] ---------- */
const PT={
 pA:[['a',-.22,.6],['a',.3,1.14],['s',.66,.985]],
 pB:[['s',.545,.42],['a',.72,1.12],['s',.34,.985]],
 pC:[['s',.37,.4],['a',.35,1.13],['s',.5,.985]],
 pD:[['s',.49,.46],['a',.6,1.1],['s',.3,.985]],
 pE:[['a',-.1,.5],['a',.4,1.1],['s',.62,.985]],
 pF:[['a',-.07,.3],['a',.28,.99],['a',.5,1.04]]};   /* converges on the Pelli artwork */
/* deterministic "hand-walked" tables */
const ROT=[-8,-4,3,7,-5],SC=[1,.94,1.05,.97,1.02],WB=[0,2,-1,3,-2],FO=[.38,.42,.36,.44,.4],PO=[.8,.86,.78,.9,.84],BEND=[.02,-.03,.025,-.02,.03],XO=[.22,.5,.78,.5],MX=[4,10,2,8,5,9];

/* ---------- render the stops ---------- */
const stopHTML=(e,i)=>{const cl=i==N-1;return`<a class="stop ${prof[i]}${cl?' cl':''} ${i%2?'tl':'tr'}" href="#/event/${esc(e.k)}" data-k="${esc(e.k)}" style="--mx:${MX[i%6]}vw" aria-label="${esc(e.n)}, ${esc(e.date)}, ${esc(e.time)}. Enter celebration">
 ${L(DEC[prof[i]])}
 <div class="st-art"><img src="${esc(e.art)}" alt="Illustration of the ${esc(e.n)}"></div>
 <div class="st-txt">${cl&&e.node?`<img class="node" src="${esc(e.node)}" alt="" aria-hidden="true">`:''}<div class="tt">${esc(e.t)}</div><div class="en">${esc(e.n)}</div><div class="wh">${esc(e.date)} · ${esc(e.time)}</div>${e.desc?`<p class="ds">${esc(e.desc)}</p>`:''}<span class="go" aria-hidden="true">Enter celebration →</span></div></a>`};
body.innerHTML=N?list.map(stopHTML).join(''):'<p class="jempty">The celebrations will be announced soon.</p>';
sec.insertAdjacentHTML('beforeend','<div class="trail" aria-hidden="true"></div>');flush();
const stops=$$('#jbody .stop'),tr=sec.querySelector('.trail');
let segs=[],cur=-1;

/* ---------- footprints: sampled along one continuous path, positions stored as % so they follow the layout ---------- */
const rel=(el,b)=>{const r=el.getBoundingClientRect();return{l:r.left-b.left,t:r.top-b.top,w:r.width,h:r.height}};
function trail(){
 tr.textContent='';segs=[];if(!N)return;
 const b=sec.getBoundingClientRect(),W=b.width,H=b.height,desk=W>=1100,tab=W>=700;
 const sp=desk?62:tab?50:40,fh=desk?40:tab?34:30,gap=sp*.16,h=rel(sec.querySelector('.hd'),b);
 const P=[{x:W/2,y:h.t+h.h+(desk?26:18),s:0}];
 stops.forEach((el,i)=>{const S=rel(el,b),A=rel(el.querySelector('.st-art'),b),T=rel(el.querySelector('.st-txt'),b);let q;
  if(desk)q=PT[prof[i]].map(([r,fx,fy])=>{const R=r=='a'?A:S;return[R.l+fx*R.w,R.t+fy*R.h]});
  else{const px=P[P.length-1].x,inx=Math.min(Math.max(px,A.l+.1*A.w),A.l+.9*A.w),lane=A.l+(i%2?.93:.07)*A.w;
   q=i==N-1?[[inx,A.t+.04*A.h],[A.l+.5*A.w,A.t+1.03*A.h]]:[[inx,A.t+.04*A.h],[lane,A.t+.97*A.h],[lane,T.t+T.h],[XO[i%4]*W,S.t+.985*S.h]]}
  q.forEach(p=>P.push({x:p[0],y:p[1],s:i}))});
 const pts=[];   /* dense polyline of vertical-tangent béziers: it flows down the page and bends by profile, never a straight line */
 for(let k=0;k<P.length-1;k++){const a=P[k],c=P[k+1],dy=c.y-a.y,bd=BEND[k%5]*W,n=Math.max(4,Math.ceil(Math.hypot(c.x-a.x,dy)/8)),x1=a.x+bd,y1=a.y+dy*.55,x2=c.x-bd*.5,y2=c.y-dy*.45;
  for(let j=k?1:0;j<=n;j++){const t=j/n,u=1-t;pts.push({x:u*u*u*a.x+3*u*u*t*x1+3*u*t*t*x2+t*t*t*c.x,y:u*u*u*a.y+3*u*u*t*y1+3*u*t*t*y2+t*t*t*c.y,s:c.s})}}
 const cum=[0];for(let k=1;k<pts.length;k++)cum.push(cum[k-1]+Math.hypot(pts[k].x-pts[k-1].x,pts[k].y-pts[k-1].y));
 const frag=document.createDocumentFragment(),cnt={};let j=1;
 for(let n=0,d=sp*.5;d<cum[cum.length-1];n++,d+=sp*(.88+.24*(((n*3)%5)/4))){
  while(cum[j]<d)j++;
  const a=pts[j-1],c=pts[j],t=(d-cum[j-1])/((cum[j]-cum[j-1])||1),dx=c.x-a.x,dy=c.y-a.y,l=Math.hypot(dx,dy)||1,side=n%2?1:-1,off=side*(gap+WB[n%5]*.6);
  const x=a.x+dx*t-dy/l*off,y=a.y+dy*t+dx/l*off,s=c.s,f=document.createElement('i');cnt[s]=(cnt[s]||0)+1;
  f.style.cssText=`left:${(x/W*100).toFixed(2)}%;top:${(y/H*100).toFixed(2)}%;--w:${(fh*24/44).toFixed(1)}px;--r:${(Math.atan2(dy,dx)*180/Math.PI-90+ROT[n%5]).toFixed(1)}deg;--sx:${side>0?-SC[n%5]:SC[n%5]};--sc:${SC[n%5]};--f:${FO[n%5]};--p:${PO[n%5]};--d:${(cnt[s]%14)*45}ms`;
  (segs[s]=segs[s]||[]).push(f);f._c=null;frag.append(f)}
 tr.append(frag);paint()}
/* the path comes alive as it is walked: ahead = faint, here = warm, behind = settled */
function paint(){segs.forEach((arr,s)=>{const c=s<cur?'past':(s==cur||(cur<0&&s==0))?'near':'';arr.forEach(f=>{if(f._c!==c){f._c=c;f.className='fp '+c}})})}
/* perf: read every rect first, write classes after. The old version interleaved
   getBoundingClientRect() with classList.add() inside one loop, forcing a full style
   recalculation per stop on every observer callback (layout thrash while scrolling). */
let mq=0;
function measure(){if(mq)return;mq=requestAnimationFrame(()=>{mq=0;const vh=innerHeight;let best=-2;
 const rects=stops.map(el=>el.getBoundingClientRect());
 const first=rects[0];
 rects.forEach((r,i)=>{const vis=Math.min(r.bottom,vh)-Math.max(r.top,0);if(vis/Math.min(vh,r.height)>=.5){best=i}});
 if(best==-2)best=first&&first.top>vh*.6?-1:cur;
 stops.forEach((el,i)=>{const r=rects[i],vis=Math.min(r.bottom,vh)-Math.max(r.top,0);if(vis/Math.min(vh,r.height)>=.5&&!el.classList.contains('on'))el.classList.add('on')});
 if(best!=cur){stops.forEach((s,i)=>s.classList.toggle('cur',i==best));cur=best;paint()}})}

/* ---------- wiring: IntersectionObserver only, no scroll handlers ---------- */
let rt;const sched=()=>{clearTimeout(rt);rt=setTimeout(()=>{trail();measure()},120)};
if('IntersectionObserver'in window&&N){sec.classList.add('rv');const io=new IntersectionObserver(measure,{threshold:[0,.2,.4,.5,.6,.8,1]});stops.forEach(s=>io.observe(s))}
stops.forEach(el=>{const im=el.querySelector('.st-art img'),set=()=>{el.querySelector('.st-art').style.setProperty('--ar',im.naturalWidth/im.naturalHeight);sched()};im.complete&&im.naturalWidth?set():im.addEventListener('load',set)});
addEventListener('resize',sched);addEventListener('load',sched);document.fonts&&document.fonts.ready.then(sched);trail();measure();

/* ---------- celebration chapters (same data, same worlds.css compositions) ---------- */
/* Dress code pill: small woman + man icons act as bullets either side of the dress code, coloured to the event's vibe. */
const DRESS={
 haldi:{w:['#F6C6D8','#BDE5D3','#FCE9A8'],m:['#FBD3BC','#FFF2DC','#CFE3F5'],t:'#E2A72E'},
 mehendi:{w:['#2E8B57','#1F6B43','#BFE3A5'],m:['#3C9A62','#F5EBD8','#E2A72E'],t:'#E2A72E'},
 sangeeth:{w:['#17120F','#17120F','#2A2320'],m:['#17120F','#17120F','#2A2320'],t:'#D9A400'},
 pellikuthuru:{w:['#C0392B','#E2A72E','#F28C28'],m:['#F5EBD8','#F5EBD8','#6A1E2B'],t:'#E2A72E'},
 pellikoduku:{w:['#2F5D9B','#E2A72E','#F5EBD8'],m:['#F5EBD8','#F5EBD8','#C0392B'],t:'#E2A72E'},
 pelli:{w:['#D1274B','#F5C400','#F28C28'],m:['#F5EBD8','#F5EBD8','#6A1E2B'],t:'#C99A1E'}
},DRESS_DEFAULT={w:['#C0392B','#E2A72E','#F5C400'],m:['#F5EBD8','#F5EBD8','#6A1E2B'],t:'#E2A72E'};
function dressIcons(k){
 const d=DRESS[k]||DRESS_DEFAULT,[s,b,p]=d.w,[kr,pt,st]=d.m,t=d.t,sk='#C48A63',hr='#2B1B14';
 const her=`<svg class="dc-ic" viewBox="28 8 84 170" aria-hidden="true" focusable="false"><path d="M52 80H88L110 162Q70 174 30 162Z" fill="${s}"/><path d="M30 162Q70 174 110 162" fill="none" stroke="${t}" stroke-width="4"/><rect x="66" y="38" width="8" height="12" fill="${sk}"/><path d="M54 48Q70 42 86 48L88 82H52Z" fill="${b}"/><path d="M52 80H88" stroke="${t}" stroke-width="3"/><path d="M56 50L46 96L54 98L62 62Z" fill="${sk}"/><path d="M58 46C92 54 100 92 94 128L102 130C110 90 100 50 66 38Z" fill="${p}"/><circle cx="70" cy="28" r="12" fill="${sk}"/><path d="M58 28Q58 12 70 12Q82 12 82 28Q76 19 70 19Q64 19 58 28Z" fill="${hr}"/><circle cx="70" cy="11" r="6" fill="${hr}"/></svg>`;
 const him=`<svg class="dc-ic" viewBox="132 10 76 158" aria-hidden="true" focusable="false"><path d="M150 112H190L186 160H174L170 130L166 160H154Z" fill="${pt}"/><ellipse cx="160" cy="163" rx="9" ry="4" fill="${hr}"/><ellipse cx="180" cy="163" rx="9" ry="4" fill="${hr}"/><rect x="166" y="38" width="8" height="12" fill="${sk}"/><path d="M148 48Q170 40 192 48L198 116H142Z" fill="${kr}"/><path d="M142 116H198" stroke="${t}" stroke-width="3"/><path d="M148 48L134 104L144 108L156 66Z" fill="${kr}"/><path d="M192 48L206 104L196 108L184 66Z" fill="${kr}"/><circle cx="139" cy="108" r="5" fill="${sk}"/><circle cx="201" cy="108" r="5" fill="${sk}"/><path d="M170 44V90" stroke="${t}" stroke-width="2"/>${[58,70,82].map(y=>`<circle cx="170" cy="${y}" r="1.8" fill="${t}"/>`).join('')}<path d="M150 46Q170 58 190 46L188 56Q170 70 152 56Z" fill="${st}"/><path d="M160 60L156 112H164L168 62Z" fill="${st}"/><circle cx="170" cy="28" r="12" fill="${sk}"/><path d="M158 27Q158 13 170 13Q182 13 182 27Q176 19 170 19Q164 19 158 27Z" fill="${hr}"/></svg>`;

 const suit=`<svg class="dc-ic" viewBox="0 -24 80 194" aria-hidden="true" focusable="false"><path d="M19 92H61L58 160H45L40 112L35 160H22Z" fill="#17120F"/><path d="M20 159H36L37 165Q28 168 17 166Z" fill="#0B0807"/><path d="M44 159H60L63 166Q52 168 43 165Z" fill="#0B0807"/><path d="M28 8Q18 11 17 24L18 56V94H62V56L63 24Q62 11 52 8L40 14Z" fill="#17120F"/><path d="M16 22Q8 28 7 50L5 76L12 78L15 56Q16 45 17 34Z" fill="#17120F"/><path d="M64 22Q72 28 73 50L75 76L68 78L65 56Q64 45 63 34Z" fill="#17120F"/><rect x="36" y="-4" width="8" height="12" fill="${sk}"/><circle cx="40" cy="-10" r="12" fill="${sk}"/><path d="M28 -11Q28 -25 40 -25Q52 -25 52 -11Q46 -19 40 -19Q34 -19 28 -11Z" fill="${hr}"/><path d="M32 5L40 13L48 5L46 14L40 54L34 14Z" fill="#F7F2E8"/><path d="M28 9L33 7L40 54L26 31Z" fill="#2A2320"/><path d="M52 9L47 7L40 54L54 31Z" fill="#2A2320"/><path d="M38 13H42L43 19L41.5 50H38.5L37 19Z" fill="#0B0807"/><path d="M54 37H62V40H54Z" fill="${t}"/></svg>`;
 return [her,k=='sangeeth'?suit:him]}
let wcur=null,tick=null,jy=0;
const enc=encodeURIComponent,ics=d=>d.toISOString().replace(/[-:]|\.\d{3}/g,'');
const pin='<svg class="pin" viewBox="0 0 20 28" fill="currentColor" aria-hidden="true"><path d="M10 0C4.5 0 0 4.4 0 9.8 0 17 10 28 10 28s10-11 10-18.2C20 4.4 15.5 0 10 0zm0 13.5a3.7 3.7 0 110-7.4 3.7 3.7 0 010 7.4z"/></svg>';
function openWorld(k,push){
 const e=EVENTS.find(x=>x.k==k);if(!e)return;
 if(!wcur)jy=push===false&&!scrollY?sec.offsetTop:scrollY;wcur=e;clearInterval(tick);
 const t0=new Date(e.when),t1=new Date(t0.getTime()+(e.mins||120)*6e4),title=`${e.n} — Harika & Prem`;
 const gcal=`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${enc(title)}&dates=${ics(t0)}/${ics(t1)}&details=${enc(e.desc||'')}&location=${enc(e.venue||'')}`;
 const head=`<div class="tel">${esc(e.t)}</div><h3>${esc(e.n)}</h3>`;
 const info=`<p class="dt">${esc(e.date)} · ${esc(e.time)}</p><p class="dsc">${esc(e.desc)}</p><p class="dsc">${pin}${esc(e.venue)}</p>${e.dress?`<div class="dc dc-${esc(e.k)}" role="group" aria-label="Dress code: ${esc(e.dress)}"><span class="dc-k">Dress code</span><span class="dc-pill">${dressIcons(e.k)[0]}<b class="dc-v">${esc(e.dress)}</b>${dressIcons(e.k)[1]}</span></div>`:''}
  <div class="cds" role="timer" aria-label="Countdown to ${esc(e.n)}"><div><b data-c="0">--</b>days</div><div><b data-c="1">--</b>hours</div><div><b data-c="2">--</b>minutes</div></div>
  <p class="acts"><a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${enc(e.venue||'')}">Google Maps</a><a class="btn alt" target="_blank" rel="noopener" href="${gcal}">Google Calendar</a><button class="btn alt" data-ics>Apple Calendar (.ics)</button></p>`;
 const hero=`<img class="hero" src="${esc(e.hero||e.art)}" alt="Illustration of the ${esc(e.n)}">`;
 const inner=e.cls=='w-vindu'?`<div class="col"><div class="hd">${head}</div><div class="txt">${info}</div></div>${hero}`
  :e.cls=='w-pelli'?`<div class="ctitle">${head}</div>${e.node?`<img class="knot" src="${esc(e.node)}" alt="" aria-hidden="true">`:''}${hero}<div class="txt ctr">${info}</div>`
  :`${hero}<div class="txt">${head}${info}</div>`;
 world.className=e.cls+' ev-'+e.k;
 world.innerHTML=`<div class="wr">${L(WORLD_ENV[e.k])}${L(e.extras)}<button class="back btn alt" data-back>← Continue the Wedding Journey</button><div class="in">${inner}</div></div>`;flush();
 const cd=()=>{const v=left(t0);world.querySelectorAll('[data-c]').forEach(b=>b.textContent=+b.dataset.c?pad(v[b.dataset.c]):v[0])};cd();tick=setInterval(cd,1000);
 world.querySelector('[data-back]').onclick=()=>closeWorld();
 world.querySelector('[data-ics]').onclick=()=>{const s=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Harika & Prem//EN','BEGIN:VEVENT',`UID:${e.k}@harika-prem`,`DTSTAMP:${ics(new Date())}`,`DTSTART:${ics(t0)}`,`DTEND:${ics(t1)}`,`SUMMARY:${title}`,`DESCRIPTION:${(e.desc||'').replace(/\n/g,' ')}`,`LOCATION:${e.venue||''}`,'END:VEVENT','END:VCALENDAR'].join('\r\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([s],{type:'text/calendar'}));a.download=e.k+'.ics';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)};
 if(push!==false)history.pushState({w:1},'','#/event/'+e.k);
 document.documentElement.style.overflow='hidden';world.scrollTop=0;
 requestAnimationFrame(()=>{world.classList.add('on');world.querySelector('[data-back]').focus({preventScroll:true})});
 /* The Pelli is the ceremony itself: as its page opens, akshintalu (blessed rice) and petals shower down once, then stop.
    Waits for the circular reveal to start, and skips if the guest has left again or prefers reduced motion. */
 if(e.k=='pelli'&&!(matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)&&typeof rain=='function'){
  setTimeout(()=>{if(wcur!==e)return;rain('akshintalu-particle.webp',90,14,4);rain('petal.webp',24,24,4.5)},500);
  setTimeout(()=>{if(wcur!==e)return;rain('petal.webp',16,20,4)},1900)}}
function closeWorld(pop){
 if(!wcur)return;const k=wcur.k;wcur=null;clearInterval(tick);world.classList.remove('on');
 document.documentElement.style.overflow='';scrollTo({top:jy,behavior:'instant'});   /* back to where the guest was walking */
 setTimeout(()=>{if(!wcur)world.innerHTML=''},1300);
 const a=sec.querySelector(`[data-k="${k}"]`);a&&a.focus({preventScroll:true});
 if(!pop)history.state&&history.state.w?history.back():history.replaceState(null,'','#journey')}
body.addEventListener('click',ev=>{const a=ev.target.closest('a.stop');if(!a||ev.metaKey||ev.ctrlKey||ev.shiftKey)return;ev.preventDefault();openWorld(a.dataset.k)});
addEventListener('popstate',()=>{const m=location.hash.match(/^#\/event\/(.+)$/);m?openWorld(decodeURIComponent(m[1]),false):closeWorld(true)});
addEventListener('keydown',ev=>{if(ev.key=='Escape')closeWorld()});
{const m=location.hash.match(/^#\/event\/(.+)$/);m&&openWorld(decodeURIComponent(m[1]),false)}
})();