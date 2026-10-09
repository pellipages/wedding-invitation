/* Blessings (akshata → petals → words) and RSVP */
$('#bsend').onclick=()=>{const m=$('#bm').value.trim();if(!m)return;const who=$('#anon').checked||!$('#bn').value?'Anonymous':$('#bn').value;
 (store.blessings=store.blessings||[]).push({who,m,at:Date.now()});save();
 rain('akshintalu-particle.webp',80,12,4);setTimeout(()=>rain('petal.webp',14,24,5),700);lit($('#blessings'));
 const f=$('#bform');f.style.transition='opacity 1s';f.style.opacity=0;setTimeout(()=>f.style.display='none',1000);
 $('#bt').innerHTML=`Your blessings have been received.<br><span style="font-family:var(--serif);font-style:italic;font-size:20px;color:var(--ink)">— ${who}</span>`};
// $$('[data-r]').forEach(b=>b.onclick=()=>{store.rsvp={name:$('#rn').value,guests:$('#rg').value,r:b.dataset.r};save();$('#rt').textContent=`Thank you${$('#rn').value?', '+$('#rn').value:''} — noted as ${b.dataset.r}.`;if(b.dataset.r[0]=='j'){rain('petal.webp',12,22,4);lit($('#rsvp'))}});
// $('#share').onclick=()=>{const d={title:'Harika & Prem — Wedding',text:'You are invited to our wedding.',url:location.href};navigator.share?navigator.share(d).catch(()=>{}):navigator.clipboard&&navigator.clipboard.writeText(location.href).then(()=>$('#rt').textContent='Link copied.')};
