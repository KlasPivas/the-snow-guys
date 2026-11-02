/* The Snow Guys — interactions */
(function(){
'use strict';
var doc=document.documentElement; doc.classList.add('js');
var RM=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var hasG=typeof window.gsap!=='undefined';
var $=function(s,c){return (c||document).querySelector(s)}, $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
document.getElementById('yr').textContent=new Date().getFullYear();
document.body.classList.add('loading');

/* ---------- Snow particles (canvas 2D, parallax depth) ---------- */
function Snow(canvas,density){
  var ctx=canvas.getContext('2d'),w,h,dpr,flakes=[],mx=0,raf,visible=true;
  function size(){dpr=Math.min(window.devicePixelRatio||1,2);w=canvas.offsetWidth;h=canvas.offsetHeight;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    var n=Math.round(w*h/ (RM?40000:density));flakes=[];for(var i=0;i<n;i++)flakes.push(mk(true));}
  function mk(any){var z=Math.random();return{x:Math.random()*w,y:any?Math.random()*h:-10,z:z,r:.6+z*2.8,s:.3+z*1.4,o:.25+z*.7,p:Math.random()*6.28}}
  function draw(){ctx.clearRect(0,0,w,h);for(var i=0;i<flakes.length;i++){var f=flakes[i];
      if(!RM){f.y+=f.s;f.p+=.01;f.x+=Math.sin(f.p)*.4*f.z+mx*f.z*.6;}
      if(f.y>h+10){flakes[i]=mk(false);continue}if(f.x>w+10)f.x=-10;if(f.x<-10)f.x=w+10;
      ctx.beginPath();ctx.globalAlpha=f.o;ctx.fillStyle='#fff';ctx.arc(f.x,f.y,f.r,0,6.283);ctx.fill();}
    ctx.globalAlpha=1;if(!RM&&visible)raf=requestAnimationFrame(draw);}
  size();window.addEventListener('resize',size);
  window.addEventListener('mousemove',function(e){mx=(e.clientX/window.innerWidth-.5)*2});
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){visible=es[0].isIntersecting;cancelAnimationFrame(raf);if(visible)draw()}).observe(canvas);
  draw();
}
new Snow($('#snow'),5500); new Snow($('#snow2'),9000);

/* ---------- Smooth scroll (Lenis) ---------- */
var lenis=null;
if(!RM&&typeof window.Lenis!=='undefined'){
  lenis=new Lenis({duration:1.15,smoothWheel:true});
  if(hasG&&window.ScrollTrigger){lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(function(t){lenis.raf(t*1000)});gsap.ticker.lagSmoothing(0);}
  else{(function r(t){lenis.raf(t);requestAnimationFrame(r)})(0)}
}
function goTo(target){var el=$(target);if(!el)return;if(lenis)lenis.scrollTo(el,{offset:-80});else el.scrollIntoView({behavior:RM?'auto':'smooth'});}
$$('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var h=a.getAttribute('href');if(h.length>1){e.preventDefault();closeMenu();goTo(h)}})});

/* ---------- Nav ---------- */
var nav=$('#nav'),burger=$('#burger'),links=$('#navLinks');
function closeMenu(){links.classList.remove('open');burger.setAttribute('aria-expanded','false');if(lenis)lenis.start()}
burger.addEventListener('click',function(){var o=links.classList.toggle('open');burger.setAttribute('aria-expanded',o);if(lenis){o?lenis.stop():lenis.start()}});
window.addEventListener('scroll',function(){nav.classList.toggle('scrolled',window.scrollY>40)},{passive:true});

/* ---------- Split headline ---------- */
function splitWords(el){var html=el.innerHTML.split(/(<br>|<em>|<\/em>)/);var out='';
  html.forEach(function(part){if(/^<.*>$/.test(part)){out+=part;return}
    out+=part.split(/(\s+)/).map(function(w){return /^\s+$/.test(w)||!w?w:'<span class="w"><span>'+w+'</span></span>'}).join('')});
  el.innerHTML=out;return $$('.w>span',el);}
var heroWords=splitWords($('#heroTitle'));

/* ---------- Intro + animations ---------- */
function intro(){
  var loader=$('#loader');
  if(!hasG||RM){loader.style.display='none';document.body.classList.remove('loading');$$('.reveal').forEach(function(e){e.style.opacity=1;e.style.transform='none'});counters(true);return;}
  var tl=gsap.timeline();
  tl.from('.loader-word span',{yPercent:110,stagger:.12,duration:.7,ease:'power4.out'})
    .to('.loader-bar i',{width:'100%',duration:.9,ease:'power2.inOut'},'-=.4')
    .to('.loader-inner',{y:-40,opacity:0,duration:.5,ease:'power2.in'})
    .to(loader,{yPercent:-100,duration:.9,ease:'expo.inOut',onComplete:function(){loader.style.display='none';document.body.classList.remove('loading')}},'-=.2')
    .from(heroWords,{yPercent:120,rotate:6,stagger:.06,duration:1.1,ease:'expo.out'},'-=.45')
    .from('.reveal-hero',{y:30,opacity:0,stagger:.1,duration:.9,ease:'power3.out'},'-=.8')
    .from('.nav',{y:-80,opacity:0,duration:.9,ease:'expo.out'},'-=1')
    .from('.mtn',{yPercent:40,stagger:.1,duration:1.4,ease:'expo.out'},'-=1.2');
  scrollAnims();
}
function scrollAnims(){
  gsap.registerPlugin(ScrollTrigger);
  // parallax layers
  gsap.to('.mtn-3',{yPercent:-12,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('.mtn-2',{yPercent:-6,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('.hero-content',{y:120,opacity:.2,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('.hero-glow',{y:200,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  // generic reveals
  $$('.reveal').forEach(function(el){gsap.to(el,{opacity:1,y:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%'}})});
  // split headings
  $$('h2.split').forEach(function(h){var w=splitWords(h);gsap.from(w,{yPercent:110,stagger:.05,duration:.9,ease:'expo.out',scrollTrigger:{trigger:h,start:'top 85%'}})});
  // cards
  gsap.from('.card',{y:80,opacity:0,rotateX:-18,stagger:.1,duration:1,ease:'power3.out',scrollTrigger:{trigger:'.cards',start:'top 80%'}});
  // counters
  ScrollTrigger.create({trigger:'.stats',start:'top 80%',once:true,onEnter:function(){counters(false)}});
  // pinned horizontal process
  var mm=gsap.matchMedia();
  mm.add('(min-width: 761px)',function(){
    var track=$('.process-track');
    var dist=function(){return Math.max(0,track.scrollWidth-window.innerWidth+window.innerWidth*.08)};
    gsap.to(track,{x:function(){return -dist()},ease:'none',scrollTrigger:{trigger:'.process',start:'top top',end:function(){return '+='+dist()},pin:'.process-pin',scrub:1,invalidateOnRefresh:true}});
  });
  mm.add('(max-width: 760px)',function(){$('.process-track').style.cssText='flex-direction:column;width:auto;padding:0 4vw';gsap.from('.step',{y:60,opacity:0,stagger:.15,scrollTrigger:{trigger:'.process-track',start:'top 85%'}});return function(){$('.process-track').style.cssText=''}});
  window.addEventListener('load',function(){ScrollTrigger.refresh()});
}
function counters(instant){$$('[data-count]').forEach(function(el){var t=+el.dataset.count,s=el.dataset.suffix||'';
  if(instant||!hasG){el.textContent=t.toLocaleString()+s;return}
  var o={v:0};gsap.to(o,{v:t,duration:2.2,ease:'power3.out',onUpdate:function(){el.textContent=Math.round(o.v).toLocaleString()+s}})})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',intro);else intro();

/* ---------- Tilt cards + spotlight ---------- */
var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
$$('.tilt').forEach(function(c){c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  c.style.setProperty('--mx',x*100+'%');c.style.setProperty('--my',y*100+'%');
  if(!RM&&fine)c.style.transform='rotateY('+((x-.5)*12)+'deg) rotateX('+((.5-y)*12)+'deg) translateZ(0)';});
  c.addEventListener('mouseleave',function(){c.style.transform=''});c.style.transition='transform .4s ease-out, box-shadow .4s';});

/* ---------- Magnetic buttons + cursor ---------- */
if(fine&&!RM){
  $$('.magnetic').forEach(function(b){b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+(e.clientX-r.left-r.width/2)*.3+'px,'+(e.clientY-r.top-r.height/2)*.4+'px)'});
    b.addEventListener('mouseleave',function(){b.style.transition='transform .5s cubic-bezier(.3,1.6,.5,1)';b.style.transform='';setTimeout(function(){b.style.transition=''},500)})});
  document.body.classList.add('has-cursor');
  var curEl=$('.cursor'),dot=$('.cursor-dot'),ring=$('.cursor-ring'),x=0,y=0,rx=0,ry=0;
  window.addEventListener('mousemove',function(e){curEl.classList.add('on');x=e.clientX;y=e.clientY;dot.style.transform='translate('+x+'px,'+y+'px) translate(-50%,-50%)'});
  (function loop(){rx+=(x-rx)*.18;ry+=(y-ry)*.18;ring.style.transform='translate('+rx+'px,'+ry+'px) translate(-50%,-50%)';requestAnimationFrame(loop)})();
  document.addEventListener('mouseover',function(e){curEl.classList.toggle('hover',!!e.target.closest('a,button,label,summary,input,.card'))});
}

/* ---------- Quote calculator ---------- */
var Q={ptype:'res',freq:'season'},qEl=$('#qAmount'),shown=0;
$$('.seg').forEach(function(seg){$$('button',seg).forEach(function(b){b.addEventListener('click',function(){$$('button',seg).forEach(function(x){x.classList.remove('on')});b.classList.add('on');Q[seg.dataset.name]=b.dataset.v;calc()})})});
['cars','walk','salt','roof'].forEach(function(id){$('#'+id).addEventListener('input',calc)});
/* Example pricing model (CAD) — adjust to real rates */
function calc(){var cars=+$('#cars').value,com=Q.ptype==='com';
  $('#carsOut').textContent=com?(cars*5)+' spaces':cars+(cars>1?' cars':' car');
  var visit=(com?120:35)+cars*(com?40:10);
  if($('#walk').checked)visit+=com?40:15; if($('#salt').checked)visit+=com?60:15; if($('#roof').checked)visit+=com?250:120;
  var total=Q.freq==='season'?Math.round(visit*(com?14:11)/10)*10-1:visit;
  if(Q.freq==='season'&&$('#roof').checked)total-= Math.round(((com?250:120)*(com?14:11))*.7);
  $('#qLabel').textContent=Q.freq==='season'?'Estimated seasonal price (Nov–Apr)':'Estimated price per visit';
  $('#qNote').textContent='CAD, before HST. Example estimate only'+(Q.freq==='season'&&$('#roof').checked?' — roof clears billed per call-out.':'.');
  Q.total=total;animateNum(total);}
function animateNum(to){if(!hasG||RM){qEl.textContent=to.toLocaleString();shown=to;return}
  var o={v:shown};gsap.to(o,{v:to,duration:.8,ease:'power3.out',onUpdate:function(){qEl.textContent=Math.round(o.v).toLocaleString()},onComplete:function(){shown=to}});
  gsap.fromTo('.q-amount',{scale:1.06},{scale:1,duration:.5,ease:'back.out(3)'});}
calc();
$('#qBook').addEventListener('click',function(){var map={res:'Residential driveway',com:'Commercial lot'};var s=Q.freq==='season'?'Seasonal contract':map[Q.ptype];var r=$('input[name=service][value="'+s+'"]');if(r)r.checked=true;
  var n=$('textarea[name=notes]');n.value='Quote: $'+Q.total+' CAD ('+(Q.freq==='season'?'seasonal':'per visit')+'), '+$('#carsOut').textContent+($('#walk').checked?', walkway':'')+($('#salt').checked?', salting':'')+($('#roof').checked?', roof':'');});
$$('[data-plan]').forEach(function(a){a.addEventListener('click',function(){var m={'Per Visit':'Residential driveway','Seasonal Residential':'Seasonal contract','Commercial':'Commercial lot'};var r=$('input[name=service][value="'+m[a.dataset.plan]+'"]');if(r)r.checked=true})});

/* ---------- Booking form ---------- */
var form=$('#bform'),steps=$$('.bstep'),cur=0,prev=$('#bPrev'),next=$('#bNext');
var dateIn=$('input[name=date]');var today=new Date();today.setMinutes(today.getMinutes()-today.getTimezoneOffset());dateIn.min=today.toISOString().slice(0,10);
function show(i){steps.forEach(function(s,k){s.classList.toggle('on',k===i)});$$('.bsteps-label li').forEach(function(l,k){l.classList.toggle('on',k<=i)});
  $('#bprogBar').style.width=((i+1)/steps.length*100)+'%';prev.disabled=i===0;next.innerHTML=i===steps.length-1?'Submit booking <svg><use href="#i-check"/></svg>':'Continue <svg><use href="#i-arrow"/></svg>';cur=i;}
function err(step,msg){var e=$('.err',steps[step]);e.textContent=msg||'';return !msg}
function bad(el){el.classList.remove('bad');void el.offsetWidth;el.classList.add('bad');el.addEventListener('input',function(){el.classList.remove('bad')},{once:true})}
function validate(i){var f=form.elements;
  if(i===0)return err(0,f.service.value?'':'Please choose a service.');
  if(i===1){var m='';if(!f.address.value.trim()){bad(f.address);m='Please enter your street address.'}else if(!f.city.value.trim()){bad(f.city);m='Please enter your city.'}else if(!/^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/.test(f.postal.value.trim())){bad(f.postal);m='Please enter a valid Canadian postal code (e.g. M5H 2N2).'}return err(1,m)}
  if(i===2){var m2='';if(!f.date.value){bad(f.date);m2='Please pick a date.'}else if(f.date.value<dateIn.min){bad(f.date);m2='Date can’t be in the past.'}else if(!f.window.value)m2='Please choose a time window.';return err(2,m2)}
  if(i===3){var m3='';if(f.name.value.trim().length<2){bad(f.name);m3='Please enter your name.'}else if(f.phone.value.replace(/\D/g,'').length<10){bad(f.phone);m3='Please enter a valid phone number.'}else if(f.email.value&&!/^\S+@\S+\.\S+$/.test(f.email.value)){bad(f.email);m3='Email looks invalid.'}return err(3,m3)}
  return true;}
prev.addEventListener('click',function(){if(cur>0)show(cur-1)});
next.addEventListener('click',function(){if(!validate(cur))return;if(cur<steps.length-1)show(cur+1);else submit()});
form.addEventListener('submit',function(e){e.preventDefault()});
form.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.tagName!=='TEXTAREA'){e.preventDefault();next.click()}});
var FS_URL='https://formsubmit.co/ajax/klaspivas1810@gmail.com',BIZ_EMAIL='klaspivas1810@gmail.com';
var CALL_HTML=' Please call Eugene at <a href="tel:6474507833">(647) 450-7833</a> or Illya at <a href="tel:4379819357">(437) 981-9357</a>.';
function quoteInfo(){return{quote_estimate:'$'+Q.total+' CAD '+(Q.freq==='season'?'(seasonal, Nov–Apr)':'(per visit)')+', before HST',property_type:Q.ptype==='com'?'Commercial':'Residential',size:$('#carsOut').textContent,frequency:Q.freq==='season'?'Seasonal':'Per visit',walkway:$('#walk').checked?'Yes':'No',salting:$('#salt').checked?'Yes':'No',roof:$('#roof').checked?'Yes':'No'}}
function fsSend(payload){return fetch(FS_URL,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload)}).then(function(r){return r.json().catch(function(){return{}}).then(function(j){if(!r.ok||j.success===false||j.success==='false')throw new Error(j.message||'send failed');return j})})}
var sending=false;
function submit(){if(sending)return;var f=form.elements,data={service:f.service.value,address:f.address.value.trim()+', '+f.city.value.trim()+' '+f.postal.value.trim().toUpperCase(),postal_code:f.postal.value.trim().toUpperCase(),date:f.date.value,window:f.window.value,name:f.name.value.trim(),phone:f.phone.value.trim(),email:f.email.value.trim(),notes:f.notes.value.trim(),created:new Date().toISOString()};
  try{var all=JSON.parse(localStorage.getItem('snowguys_bookings')||'[]');all.push(data);localStorage.setItem('snowguys_bookings',JSON.stringify(all))}catch(e){}
  var body='New booking request — The Snow Guys\n\nService: '+data.service+'\nAddress: '+data.address+'\nDate: '+data.date+'\nTime window: '+data.window+'\nName: '+data.name+'\nPhone: '+data.phone+(data.email?'\nEmail: '+data.email:'')+(data.notes?'\nNotes: '+data.notes:'');
  $('#sendMail').href='mailto:'+BIZ_EMAIL+'?subject='+encodeURIComponent('Snow removal booking — '+data.name)+'&body='+encodeURIComponent(body);
  $('#sendSms').href='sms:6474507833?&body='+encodeURIComponent(body);
  $('#sendSms2').href='sms:4379819357?&body='+encodeURIComponent(body);
  var q=quoteInfo(),payload={_subject:'New booking — The Snow Guys',_template:'table',_captcha:'false',Service:data.service,Address:data.address,'Postal code':data.postal_code,Date:data.date,'Time window':data.window,Name:data.name,Phone:data.phone,Email:data.email||'—',Notes:data.notes||'—','Quote estimate':q.quote_estimate,'Calc: property':q.property_type,'Calc: size':q.size,'Calc: frequency':q.frequency,'Calc: walkway':q.walkway,'Calc: salting':q.salting,'Calc: roof':q.roof};
  if(data.email)payload._replyto=data.email;
  var se=$('#bSendErr');se.innerHTML='';sending=true;next.disabled=true;next.textContent='Sending…';
  fsSend(payload).then(function(){var d=$('#bdone');d.hidden=false;confetti();}).catch(function(){se.innerHTML='Sorry — we couldn’t send your booking right now (it’s saved on this device).'+CALL_HTML+' Or <a href="'+$('#sendMail').href.replace(/"/g,'&quot;')+'">email it to us</a>.';})
  .then(function(){sending=false;next.disabled=false;show(cur)});}
var qf=$('#qform');$('#qEmailToggle').addEventListener('click',function(){qf.hidden=!qf.hidden;qf.style.display=qf.hidden?'none':'grid';if(!qf.hidden)qf.elements.qname.focus()});qf.style.display='none';
qf.addEventListener('submit',function(e){e.preventDefault();var f=qf.elements,m=$('#qMsg'),n=f.qname.value.trim(),p=f.qphone.value.trim(),em=f.qemail.value.trim();
  if(n.length<2){m.textContent='Please enter your name.';return}
  if(!p&&!em){m.textContent='Please enter a phone number or email.';return}
  if(p&&p.replace(/\D/g,'').length<10){m.textContent='Please enter a valid phone number.';return}
  if(em&&!/^\S+@\S+\.\S+$/.test(em)){m.textContent='Email looks invalid.';return}
  var q=quoteInfo(),rec={type:'quote',name:n,phone:p,email:em,quote:q,created:new Date().toISOString()};
  try{var all=JSON.parse(localStorage.getItem('snowguys_quotes')||'[]');all.push(rec);localStorage.setItem('snowguys_quotes',JSON.stringify(all))}catch(x){}
  var payload={_subject:'New quote request — The Snow Guys',_template:'table',_captcha:'false',Name:n,Phone:p||'—',Email:em||'—','Quote estimate':q.quote_estimate,'Property type':q.property_type,Size:q.size,Frequency:q.frequency,Walkway:q.walkway,Salting:q.salting,Roof:q.roof};
  if(em)payload._replyto=em;
  var btn=$('#qSend');btn.disabled=true;btn.textContent='Sending…';m.textContent='';
  fsSend(payload).then(function(){m.innerHTML='Thanks! Your quote request was sent — we’ll be in touch soon.';qf.reset()}).catch(function(){m.innerHTML='Sorry — we couldn’t send that right now.'+CALL_HTML}).then(function(){btn.disabled=false;btn.textContent='Send quote request'});});
function confetti(){if(RM||!hasG)return;var d=$('#bdone');for(var i=0;i<40;i++){var c=document.createElement('i');c.className='confetti';c.style.background=['#7fd3ff','#4f8cff','#bfe9ff','#0a1730'][i%4];c.style.left='50%';c.style.top='35%';d.appendChild(c);
  gsap.to(c,{x:(Math.random()-.5)*500,y:(Math.random()-.3)*400,opacity:0,scale:Math.random()*1.5+.5,duration:1.4+Math.random(),ease:'power3.out',onComplete:function(){this.targets()[0].remove()}})}}
$('#bAgain').addEventListener('click',function(){form.reset();form.elements.city.value='Toronto';$('#bdone').hidden=true;show(0)});
show(0);

/* ---------- Testimonials carousel ---------- */
var track=$('.c-track'),slides=$$('.c-slide'),dots=$('#cDots'),ci=0,timer;
slides.forEach(function(_,i){var d=document.createElement('i');d.addEventListener('click',function(){go(i)});dots.appendChild(d)});
function go(i){ci=(i+slides.length)%slides.length;track.style.transform='translateX('+(-ci*100)+'%)';$$('i',dots).forEach(function(d,k){d.classList.toggle('on',k===ci)});clearInterval(timer);if(!RM)timer=setInterval(function(){go(ci+1)},6000)}
$('#cPrev').addEventListener('click',function(){go(ci-1)});$('#cNext').addEventListener('click',function(){go(ci+1)});
var sx=null;track.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
track.addEventListener('touchend',function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40)go(ci+(dx<0?1:-1));sx=null});
go(0);
})();
