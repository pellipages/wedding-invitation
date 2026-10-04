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
 pA:['lotus-cluster.png|x|w:30vw;l:-6vw;b:-1%;z:1|w:min(24vw,380px);l:-3vw;b:2%;z:1','temple-parrot.png|w:20vw;r:3vw;t:5%;z:5|w:14vw;r:5vw|w:min(9vw,150px);r:5vw;t:8%;z:5'],
 pB: ['banana-leaves-corner.png|w:40vw;r:-16vw;t:3%;z:1;rot:-8deg|w:34vw;r:-8vw;l:auto;rot:-8deg|w:min(24vw,360px);r:-6vw;l:auto;t:-3%;z:1;rot:-6deg', 'temple-parrot.png|x|x|w:min(7vw,110px);r:9vw;b:9%;z:5'],
 pC:['lotus-1.png|w:40vw;l:-10vw;b:1%;z:1|w:30vw;l:-6vw|w:min(22vw,340px);l:-4vw;b:-3%;z:1'],
 pD:['banana-leaves-corner.png|x|w:28vw;r:-10vw;t:6%;z:1;f:1|w:min(16vw,250px);r:-6vw;t:-5%;z:1;f:1','temple-parrot.png|x|x|w:min(7.5vw,120px);r:6vw;b:6%;z:5'],
 pE:['lotus-2.png|w:36vw;r:-8vw;b:0;z:1|w:28vw|w:min(17vw,270px);r:-4vw;b:-2%;z:1','temple-parrot.png|x|w:12vw;l:3vw;t:5%;z:5|w:min(8vw,130px);l:5vw;t:6%;z:5'],
 pF:['lotus-cluster.png|w:44vw;l:-14vw;b:0;z:1|w:32vw|w:min(24vw,380px);l:-4vw;b:-1%;z:1','lotus-2.png|w:38vw;r:-12vw;b:0;z:1|w:28vw|w:min(21vw,340px);r:-3vw;b:0;z:1','temple-parrot.png|w:18vw;l:4vw;t:2%;z:5|w:12vw|w:min(8vw,130px);l:9vw;t:5%;z:5']};

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
function measure(){const vh=innerHeight;let best=-2;
 stops.forEach((el,i)=>{const r=el.getBoundingClientRect(),vis=Math.min(r.bottom,vh)-Math.max(r.top,0);if(vis/Math.min(vh,r.height)>=.5){el.classList.add('on');best=i}});
 if(best==-2)best=stops[0]&&stops[0].getBoundingClientRect().top>vh*.6?-1:cur;
 if(best!=cur){stops.forEach((s,i)=>s.classList.toggle('cur',i==best));cur=best;paint()}}

/* ---------- wiring: IntersectionObserver only, no scroll handlers ---------- */
let rt;const sched=()=>{clearTimeout(rt);rt=setTimeout(()=>{trail();measure()},120)};
if('IntersectionObserver'in window&&N){sec.classList.add('rv');const io=new IntersectionObserver(measure,{threshold:[0,.2,.4,.5,.6,.8,1]});stops.forEach(s=>io.observe(s))}
stops.forEach(el=>{const im=el.querySelector('.st-art img'),set=()=>{el.querySelector('.st-art').style.setProperty('--ar',im.naturalWidth/im.naturalHeight);sched()};im.complete&&im.naturalWidth?set():im.addEventListener('load',set)});
addEventListener('resize',sched);addEventListener('load',sched);document.fonts&&document.fonts.ready.then(sched);trail();measure();

/* ---------- celebration chapters (same data, same worlds.css compositions) ---------- */
let wcur=null,tick=null,jy=0;
const enc=encodeURIComponent,ics=d=>d.toISOString().replace(/[-:]|\.\d{3}/g,'');
const pin='<svg class="pin" viewBox="0 0 20 28" fill="currentColor" aria-hidden="true"><path d="M10 0C4.5 0 0 4.4 0 9.8 0 17 10 28 10 28s10-11 10-18.2C20 4.4 15.5 0 10 0zm0 13.5a3.7 3.7 0 110-7.4 3.7 3.7 0 010 7.4z"/></svg>';
function openWorld(k,push){
 const e=EVENTS.find(x=>x.k==k);if(!e)return;
 if(!wcur)jy=push===false&&!scrollY?sec.offsetTop:scrollY;wcur=e;clearInterval(tick);
 const t0=new Date(e.when),t1=new Date(t0.getTime()+(e.mins||120)*6e4),title=`${e.n} — Harika & Prem`;
 const gcal=`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${enc(title)}&dates=${ics(t0)}/${ics(t1)}&details=${enc(e.desc||'')}&location=${enc(e.venue||'')}`;
 const head=`<div class="tel">${esc(e.t)}</div><h3>${esc(e.n)}</h3>`;
 const info=`<p class="dt">${esc(e.date)} · ${esc(e.time)}</p><p class="dsc">${esc(e.desc)}</p><p class="dsc">${pin}${esc(e.venue)}</p>
  <div class="cds" role="timer" aria-label="Countdown to ${esc(e.n)}"><div><b data-c="0">--</b>days</div><div><b data-c="1">--</b>hours</div><div><b data-c="2">--</b>minutes</div></div>
  <p class="acts"><a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${enc(e.venue||'')}">Google Maps</a><a class="btn alt" target="_blank" rel="noopener" href="${gcal}">Google Calendar</a><button class="btn alt" data-ics>Apple Calendar (.ics)</button></p>`;
 const hero=`<img class="hero" src="${esc(e.hero||e.art)}" alt="Illustration of the ${esc(e.n)}">`;
 const inner=e.cls=='w-vindu'?`<div class="col"><div class="hd">${head}</div><div class="txt">${info}</div></div>${hero}`
  :e.cls=='w-pelli'?`<div class="ctitle">${head}</div>${e.node?`<img class="knot" src="${esc(e.node)}" alt="" aria-hidden="true">`:''}${hero}<div class="txt ctr">${info}</div>`
  :`${hero}<div class="txt">${head}${info}</div>`;
 world.className=e.cls;
 world.innerHTML=`<div class="wr">${L(WORLD_ENV[e.k])}${L(e.extras)}<button class="back btn alt" data-back>← Continue the Wedding Journey</button><div class="in">${inner}</div></div>`;flush();
 const cd=()=>{const v=left(t0);world.querySelectorAll('[data-c]').forEach(b=>b.textContent=+b.dataset.c?pad(v[b.dataset.c]):v[0])};cd();tick=setInterval(cd,1000);
 world.querySelector('[data-back]').onclick=()=>closeWorld();
 world.querySelector('[data-ics]').onclick=()=>{const s=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Harika & Prem//EN','BEGIN:VEVENT',`UID:${e.k}@harika-prem`,`DTSTAMP:${ics(new Date())}`,`DTSTART:${ics(t0)}`,`DTEND:${ics(t1)}`,`SUMMARY:${title}`,`DESCRIPTION:${(e.desc||'').replace(/\n/g,' ')}`,`LOCATION:${e.venue||''}`,'END:VEVENT','END:VCALENDAR'].join('\r\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([s],{type:'text/calendar'}));a.download=e.k+'.ics';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)};
 if(push!==false)history.pushState({w:1},'','#/event/'+e.k);
 document.documentElement.style.overflow='hidden';world.scrollTop=0;
 requestAnimationFrame(()=>{world.classList.add('on');world.querySelector('[data-back]').focus({preventScroll:true})})}
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