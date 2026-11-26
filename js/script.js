const langBtn=document.getElementById('langBtn');let lang='ms';
langBtn.addEventListener('click',()=>{lang=lang==='ms'?'en':'ms';document.documentElement.lang=lang;langBtn.textContent=lang==='ms'?'EN':'BM';document.querySelectorAll('[data-ms][data-en]').forEach(el=>{el.textContent=el.dataset[lang]});});
document.getElementById('themeBtn').addEventListener('click',()=>document.body.classList.toggle('dark'));
document.getElementById('year').textContent=new Date().getFullYear();
const filterButtons=document.querySelectorAll('[data-filter]'),projects=document.querySelectorAll('.project');
filterButtons.forEach(btn=>btn.addEventListener('click',()=>{filterButtons.forEach(b=>b.classList.remove('active'));btn.classList.add('active');projects.forEach(p=>p.classList.toggle('hidden',btn.dataset.filter!=='all'&&p.dataset.category!==btn.dataset.filter));}));
const dlg=document.getElementById('projectDialog');
projects.forEach(p=>p.addEventListener('click',()=>{document.getElementById('dialogCategory').textContent=p.querySelector('.category').textContent;document.getElementById('dialogTitle').textContent=p.querySelector('h3').textContent;document.getElementById('dialogText').textContent=lang==='ms'?p.dataset.detailMs:p.dataset.detailEn;dlg.showModal();}));
document.getElementById('closeDialog').addEventListener('click',()=>dlg.close());
dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});

const galleryDialog=document.getElementById('galleryDialog');
document.querySelectorAll('.gallery-item').forEach(item=>item.addEventListener('click',()=>{document.getElementById('galleryDialogImage').src=item.dataset.image;document.getElementById('galleryDialogCaption').textContent=lang==='ms'?item.dataset.captionMs:item.dataset.captionEn;galleryDialog.showModal()}));
document.getElementById('closeGallery').addEventListener('click',()=>galleryDialog.close());
galleryDialog.addEventListener('click',e=>{if(e.target===galleryDialog)galleryDialog.close()});

/* ===== Spotify-style player ===== */
const audio=document.getElementById('spAudio'),tracks=[...document.querySelectorAll('.track')];
const spTitle=document.getElementById('spTitle'),spArtist=document.getElementById('spArtist'),spPlay=document.getElementById('spPlay'),spSeek=document.getElementById('spSeek'),spCur=document.getElementById('spCur'),spDur=document.getElementById('spDur'),spVol=document.getElementById('spVol');
let idx=0;
const fmt=s=>isFinite(s)?Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'):'0:00';
function loadTrack(i,play){
 idx=(i+tracks.length)%tracks.length;const t=tracks[idx];
 tracks.forEach(x=>x.classList.toggle('active',x===t));
 audio.src=t.dataset.src;spTitle.textContent=t.dataset.title;spArtist.textContent=t.dataset.artist;
 spSeek.value=0;spCur.textContent='0:00';spDur.textContent='0:00';
 if(play)audio.play().catch(()=>{});
}
audio.volume=Number(spVol.value);
tracks.forEach((t,i)=>t.addEventListener('click',()=>loadTrack(i,true)));
spPlay.addEventListener('click',()=>{audio.paused?audio.play().catch(()=>{}):audio.pause()});
document.getElementById('spNext').addEventListener('click',()=>loadTrack(idx+1,true));
document.getElementById('spPrev').addEventListener('click',()=>loadTrack(idx-1,true));
audio.addEventListener('play',()=>spPlay.textContent='❚❚');
audio.addEventListener('pause',()=>spPlay.textContent='▶');
audio.addEventListener('ended',()=>loadTrack(idx+1,true));
audio.addEventListener('loadedmetadata',()=>{spDur.textContent=fmt(audio.duration);tracks[idx].classList.remove('missing')});
audio.addEventListener('timeupdate',()=>{spCur.textContent=fmt(audio.currentTime);if(audio.duration)spSeek.value=audio.currentTime/audio.duration*100});
audio.addEventListener('error',()=>tracks[idx].classList.add('missing'));
spSeek.addEventListener('input',()=>{if(audio.duration)audio.currentTime=spSeek.value/100*audio.duration});
spVol.addEventListener('input',()=>{audio.volume=Number(spVol.value)});
loadTrack(0,false);
// Autoplay: try now; browsers often block it, so start on the visitor's first tap/key
audio.play().catch(()=>{
 const start=()=>{if(audio.paused&&!audio.error)audio.play().catch(()=>{})};
 ['pointerdown','keydown','touchstart'].forEach(ev=>window.addEventListener(ev,start,{once:true,passive:true}));
});

/* ===== Video: autoplay muted; pause music if viewer turns video sound on ===== */
const videos=document.querySelectorAll('.media-video');
videos.forEach(v=>{v.play().catch(()=>{});v.addEventListener('volumechange',()=>{if(!v.muted&&v.volume>0)audio.pause()})});

/* ===== Smooth reveal on scroll ===== */
const revealEls=document.querySelectorAll('.section,footer');
if('IntersectionObserver' in window){
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.08});
 revealEls.forEach(el=>{el.classList.add('reveal');io.observe(el)});
}

/* ===== Slideshow ===== */
(function(){
 const root=document.getElementById('slideshow');if(!root)return;
 const slides=[...root.querySelectorAll('.ss-slide')],thumbs=[...root.querySelectorAll('.ss-thumb')],count=document.getElementById('ssCount'),bar=document.getElementById('ssBar'),playBtn=document.getElementById('ssPlay'),thumbBox=document.getElementById('ssThumbs');
 const DELAY=5000;let cur=0,playing=!window.matchMedia('(prefers-reduced-motion: reduce)').matches,timer=null,start=0,hover=false;
 function show(i){
  cur=(i+slides.length)%slides.length;
  slides.forEach((s,k)=>s.classList.toggle('active',k===cur));
  thumbs.forEach((t,k)=>t.classList.toggle('active',k===cur));
  count.textContent=(cur+1)+' / '+slides.length;
  const t=thumbs[cur];thumbBox.scrollTo({left:t.offsetLeft-thumbBox.clientWidth/2+t.clientWidth/2,behavior:'smooth'});
  restart();
 }
 function tick(now){
  if(!playing||hover||document.hidden){start=now-(parseFloat(bar.style.width)||0)/100*DELAY;timer=requestAnimationFrame(tick);return;}
  const p=Math.min((now-start)/DELAY,1);bar.style.width=(p*100)+'%';
  if(p>=1){show(cur+1);return;}
  timer=requestAnimationFrame(tick);
 }
 function restart(){cancelAnimationFrame(timer);bar.style.width='0%';start=performance.now();if(playing)timer=requestAnimationFrame(tick);}
 function setPlaying(v){playing=v;playBtn.textContent=v?'❚❚':'▶';if(v)restart();else cancelAnimationFrame(timer);}
 root.querySelector('.ss-prev').addEventListener('click',()=>show(cur-1));
 root.querySelector('.ss-next').addEventListener('click',()=>show(cur+1));
 playBtn.addEventListener('click',()=>setPlaying(!playing));
 thumbs.forEach((t,k)=>t.addEventListener('click',()=>show(k)));
 root.addEventListener('mouseenter',()=>hover=true);root.addEventListener('mouseleave',()=>hover=false);
 root.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')show(cur-1);else if(e.key==='ArrowRight')show(cur+1);});
 let sx=null;
 root.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});
 root.addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40)show(cur+(dx<0?1:-1));sx=null;});
 slides.forEach(s=>s.addEventListener('click',()=>{
  document.getElementById('galleryDialogImage').src=s.dataset.image;
  document.getElementById('galleryDialogCaption').textContent=lang==='ms'?s.dataset.captionMs:s.dataset.captionEn;
  galleryDialog.showModal();
 }));
 setPlaying(playing);
})();
