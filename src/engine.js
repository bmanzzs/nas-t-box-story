(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var root=$('.player'), frame=$('.frame'), stage=$('.stage'), capEl=$('.cap'), poster=$('.poster');
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- fit the 1920x1080 frame ---------- */
function fit(){var r=frame.getBoundingClientRect();if(!r.width||!r.height)return;stage.style.setProperty('--s',Math.min(r.width/1920,r.height/1080));if(window.__ticks)window.__ticks()}
window.addEventListener('resize',fit);fit();
if(window.ResizeObserver){try{new ResizeObserver(fit).observe(frame)}catch(_){}}

/* ---------- scene table ---------- */
var scenes=$$('.scene').map(function(el,i){
  return {el:el,i:i,dur:parseFloat(el.dataset.dur||'8'),act:el.dataset.act||'',mx:el.dataset.mx,
    items:$$('[data-at]',el).filter(function(e){return !e.classList.contains('vo')}).map(function(e){
      return {e:e,at:parseFloat(e.dataset.at),off:e.dataset.off?parseFloat(e.dataset.off):1e9,on:null,count:e.dataset.count,gone:e.dataset.gone?parseFloat(e.dataset.gone):1e9}}),
    caps:$$('.vo',el).map(function(e){return {at:parseFloat(e.dataset.at||'0'),text:e.textContent.trim()}}).sort(function(a,b){return a.at-b.at}),
    hooks:window.SceneHooks&&window.SceneHooks[el.id]};
});
var starts=[],total=0;scenes.forEach(function(s){starts.push(total);total+=s.dur});
var T=0,playing=false,cur=-1,capIdx=-2,last=0,started=false;

/* ---------- transport UI ---------- */
var bar=$('.bar'),fill=$('.bar .fill'),lcdT=$('#lcd-t'),lcdL=$('#lcd-l'),btnPlay=$('#b-play'),btnSnd=$('#b-snd'),btnCap=$('#b-cap'),btnVo=$('#b-vo'),btnFs=$('#b-fs');
(function ticks(){var seen={},els=[];scenes.forEach(function(s,i){if(s.act&&!seen[s.act]){seen[s.act]=1;var t=document.createElement('div');t.className='tick';t.style.left=(starts[i]/total*100)+'%';var sp=document.createElement('span');sp.textContent=s.act;t.appendChild(sp);bar.appendChild(t);els.push(sp)}});
  /* hide an act label when the next act starts before it ends */
  window.__ticks=function(){els.forEach(function(sp,i){sp.style.visibility='visible';var n=els[i+1];if(n&&sp.getBoundingClientRect().right+6>n.getBoundingClientRect().left)sp.style.visibility='hidden'})};
  setTimeout(window.__ticks,400)})();
function fmt(t){t=Math.max(0,Math.floor(t));return Math.floor(t/60)+':'+('0'+(t%60)).slice(-2)}
function icon(p){return p?'<svg viewBox="0 0 16 16"><path d="M3 2h4v12H3zM9 2h4v12H9z"/></svg>':'<svg viewBox="0 0 16 16"><path d="M3 1.5v13l11-6.5z"/></svg>'}

/* ---------- number roll-ups ---------- */
function roll(it,now){var e=it.e,to=parseFloat(it.count),dec=(it.count.split('.')[1]||'').length,d=parseFloat(e.dataset.roll||'1.2');
  var k=Math.min(1,Math.max(0,(now-it.at)/d));k=1-Math.pow(1-k,3);var v=(parseFloat(e.dataset.from||'0')+(to-parseFloat(e.dataset.from||'0'))*k);
  var s=v.toFixed(dec);if(e.dataset.comma)s=s.replace(/\B(?=(\d{3})+(?!\d))/g,',');e.textContent=(e.dataset.pre||'')+s+(e.dataset.post||'')}

/* ---------- render one moment ---------- */
function show(i,t,hard){
  if(i!==cur){
    if(cur>=0){scenes[cur].el.classList.remove('active');if(scenes[cur].hooks&&scenes[cur].hooks.leave)scenes[cur].hooks.leave()}
    var s=scenes[i];s.el.classList.toggle('cut',!!hard);s.el.classList.add('active');
    s.items.forEach(function(it){it.on=null});cur=i;capIdx=-2;
    if(s.hooks&&s.hooks.enter)s.hooks.enter(s.el);
    lcdL.textContent=('0'+(i+1)).slice(-2)+'/'+scenes.length;
    Score.level(s.mx===undefined?1:parseFloat(s.mx));
  }
  var sc=scenes[i];
  for(var k=0;k<sc.items.length;k++){var it=sc.items[k],on=t>=it.at&&t<it.off;
    if(on!==it.on){it.on=on;it.e.classList.toggle('on',on)}
    if(it.gone<1e9)it.e.classList.toggle('gone',t>=it.gone);
    if(it.count&&on)roll(it,t)}
  var ci=-1;for(var c=0;c<sc.caps.length;c++){if(t>=sc.caps[c].at)ci=c}
  if(ci!==capIdx){capIdx=ci;var txt=ci>=0?sc.caps[ci].text:'';
    if(txt){capEl.innerHTML='<span></span>';capEl.firstChild.textContent=txt;capEl.classList.add('show');Voice.say(txt)}else{capEl.classList.remove('show')}}
  if(sc.hooks&&sc.hooks.tick)sc.hooks.tick(t,sc.dur);
  fill.style.width=(T/total*100)+'%';lcdT.textContent=fmt(T)+' / '+fmt(total);
}
function locate(){var i=scenes.length-1;for(var k=0;k<scenes.length;k++){if(T<starts[k]+scenes[k].dur){i=k;break}}return i}
function loop(now){
  var dt=Math.min(.1,(now-last)/1000);last=now;
  if(playing){
    var i=locate(),end=starts[i]+scenes[i].dur;
    if(T+dt>=end&&Voice.busy()){T=end-.02}else{T+=dt}
    if(T>=total){T=total-.01;setPlaying(false)}
    i=locate();show(i,T-starts[i]);
  }
  requestAnimationFrame(loop);
}
function setPlaying(p){playing=p;root.classList.toggle('paused',!p);btnPlay.innerHTML=icon(p);btnPlay.setAttribute('aria-label',p?'Pause':'Play');
  if(p){Score.resume()}else{Score.pause();Voice.stop()}}
function seek(t,hard){T=Math.max(0,Math.min(total-.01,t));Voice.stop();var i=locate();show(i,T-starts[i],hard)}
function begin(){if(!started){started=true;poster.classList.add('hide');Score.init()}setPlaying(true)}
window.Movie={seek:function(t){seek(t,true)},goto:function(n,off){seek(starts[n]+(off||0),true)},scenes:scenes,starts:starts,total:function(){return total},play:begin,pause:function(){setPlaying(false)},
  byId:function(id,off){for(var i=0;i<scenes.length;i++){if(scenes[i].el.id===id){seek(starts[i]+(off||0),true);return i}}return -1}};

$('.play').addEventListener('click',begin);
btnPlay.addEventListener('click',function(){if(!started){begin()}else{if(T>=total-.05)seek(0,true);setPlaying(!playing)}});
bar.addEventListener('click',function(e){var r=bar.getBoundingClientRect();if(!started){started=true;poster.classList.add('hide');Score.init();setPlaying(true)}seek((e.clientX-r.left)/r.width*total,true)});
frame.addEventListener('click',function(e){if(started&&!e.target.closest('button,a'))setPlaying(!playing)});
function toggle(btn,fn){btn.addEventListener('click',function(){var v=btn.getAttribute('aria-pressed')!=='true';btn.setAttribute('aria-pressed',v);fn(v)})}
toggle(btnSnd,function(v){Score.mute(!v)});
toggle(btnCap,function(v){root.classList.toggle('nocap',!v)});
toggle(btnVo,function(v){Voice.enable(v)});
btnFs.addEventListener('click',function(){var d=document,el=root;try{if(!d.fullscreenElement){(el.requestFullscreen||el.webkitRequestFullscreen).call(el)['catch'](function(){})}else{d.exitFullscreen()}}catch(_){}});
document.addEventListener('fullscreenchange',function(){setTimeout(fit,60)});
document.addEventListener('keydown',function(e){
  if(e.target.closest&&e.target.closest('input,textarea'))return;
  if(e.key===' '||e.key==='k'){e.preventDefault();btnPlay.click()}
  else if(e.key==='ArrowRight'){if(started)seek(starts[Math.min(scenes.length-1,cur+1)],true)}
  else if(e.key==='ArrowLeft'){if(started){var back=(T-starts[cur]<1.5&&cur>0)?cur-1:cur;seek(starts[back],true)}}
  else if(e.key==='m'){btnSnd.click()} else if(e.key==='c'){btnCap.click()} else if(e.key==='f'){btnFs.click()}
});
document.addEventListener('visibilitychange',function(){if(document.hidden&&playing)setPlaying(false)});

/* ---------- optional read-aloud (browser voice) ---------- */
var Voice=(function(){var on=false,ok=('speechSynthesis' in window)&&('SpeechSynthesisUtterance' in window),voice=null,speaking=false;
  function pick(){try{var vs=speechSynthesis.getVoices();voice=vs.filter(function(v){return /en[-_]US/i.test(v.lang)&&/natural|online|google|aria|guy|davis/i.test(v.name)})[0]||vs.filter(function(v){return /^en/i.test(v.lang)})[0]||null}catch(_){}}
  if(ok){pick();try{speechSynthesis.onvoiceschanged=pick}catch(_){}}else{btnVo.hidden=true}
  return {enable:function(v){on=v&&ok;if(!on)this.stop()},
    say:function(t){if(!on||!playing)return;try{speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(t.replace(/\$(\d[\d,]*)/g,'$1 dollars'));if(voice)u.voice=voice;u.rate=1.08;u.pitch=.95;speaking=true;u.onend=u.onerror=function(){speaking=false};speechSynthesis.speak(u)}catch(_){speaking=false}},
    busy:function(){return on&&speaking},stop:function(){speaking=false;if(ok){try{speechSynthesis.cancel()}catch(_){}}}};
})();

/* ---------- generated score (no audio files) ---------- */
var Score=(function(){
  var ctx=null,master,bus,delay,lp,lvl=1,want=1,muted=false,step=0,next=0,timer=null,noise=null,padVoices=[];
  var BPM=84,S=60/BPM/4;
  var CH=[[38,53,57,60,64],[34,53,58,62,65],[41,53,57,60,64],[36,52,55,60,62]]; // Dm9, Bbmaj7, Fmaj7, Cadd9 (bass first)
  function hz(m){return 440*Math.pow(2,(m-69)/12)}
  function env(g,t,a,peak,d){g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d)}
  function pad(ch,t,len){
    padVoices.forEach(function(v){try{v.g.gain.cancelScheduledValues(t);v.g.gain.setTargetAtTime(.0001,t,.5);v.o.forEach(function(o){o.stop(t+3)})}catch(_){}});padVoices=[];
    ch.slice(1).forEach(function(m,i){var g=ctx.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.05,t+1.6);g.connect(lp);
      var os=[-6,6].map(function(c){var o=ctx.createOscillator();o.type=i%2?'triangle':'sawtooth';o.frequency.value=hz(m);o.detune.value=c+i*2;o.connect(g);o.start(t);return o});padVoices.push({g:g,o:os})});
  }
  function pluck(m,t,v){var o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.value=hz(m);env(g,t,.006,v,.5);o.connect(g);g.connect(bus);g.connect(delay);o.start(t);o.stop(t+.7)}
  function bass(m,t){var o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=220;o.type='sawtooth';o.frequency.value=hz(m);env(g,t,.01,.16,.22);o.connect(f);f.connect(g);g.connect(bus);o.start(t);o.stop(t+.35)}
  function kick(t){var o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(118,t);o.frequency.exponentialRampToValueAtTime(42,t+.13);env(g,t,.004,.5,.3);o.connect(g);g.connect(bus);o.start(t);o.stop(t+.4)}
  function hat(t,v){var s=ctx.createBufferSource(),g=ctx.createGain(),f=ctx.createBiquadFilter();s.buffer=noise;f.type='highpass';f.frequency.value=7500;env(g,t,.002,v,.05);s.connect(f);f.connect(g);g.connect(bus);s.start(t);s.stop(t+.08)}
  function boom(t){var o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(70,t);o.frequency.exponentialRampToValueAtTime(30,t+1.2);env(g,t,.02,.5,1.8);o.connect(g);g.connect(bus);o.start(t);o.stop(t+2.2)}
  function sched(){
    if(!ctx||ctx.state!=='running')return;
    while(next<ctx.currentTime+.25){
      lvl+=(want-lvl)*.2;var L=lvl,bar=Math.floor(step/16),s16=step%16,ch=CH[Math.floor(bar/2)%4],t=next;
      if(step%32===0){pad(ch,t,32*S);lp.frequency.setTargetAtTime(500+L*450,t,1.5)}
      if(L>.6&&s16%4===2&&Math.random()<.75)pluck(ch[1+((step>>2)%4)]+12,t,.05+.02*L);
      if(L>1.5){if(s16===0||s16===8)kick(t);if(s16%4===2)hat(t,.03+.01*L)}
      if(L>2.3){if(s16%2===0)pluck(ch[1+((s16>>1)*3)%4]+12,t,.05);if(s16%4===0||s16===6||s16===14)bass(ch[0],t)}
      if(L>3.2&&s16%2===1)hat(t,.02);
      next+=S;step++;
    }
  }
  return {
    init:function(){if(ctx)return;try{var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ctx=new AC();
        master=ctx.createGain();master.gain.value=muted?0:.55;var comp=ctx.createDynamicsCompressor();bus=ctx.createGain();bus.connect(comp);comp.connect(master);master.connect(ctx.destination);
        lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=900;lp.Q.value=.6;lp.connect(bus);
        delay=ctx.createDelay(1);delay.delayTime.value=S*3;var fb=ctx.createGain();fb.gain.value=.34;var dg=ctx.createGain();dg.gain.value=.4;delay.connect(fb);fb.connect(delay);delay.connect(dg);dg.connect(bus);
        var n=ctx.createBuffer(1,ctx.sampleRate*.2,ctx.sampleRate),d=n.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;noise=n;
        next=ctx.currentTime+.1;timer=setInterval(sched,60)}catch(_){ctx=null}},
    level:function(v){if(v<0){if(ctx&&ctx.state==='running'&&!muted)boom(ctx.currentTime+.05);v=0}want=v},
    mute:function(m){muted=m;if(ctx)master.gain.setTargetAtTime(m?0:.55,ctx.currentTime,.08)},
    pause:function(){if(ctx&&ctx.state==='running')ctx.suspend()},
    resume:function(){if(ctx&&ctx.state==='suspended'){ctx.resume().then(function(){next=Math.max(next,ctx.currentTime+.05)})}}
  };
})();

btnPlay.innerHTML=icon(false);
lcdT.textContent='0:00 / '+fmt(total);lcdL.textContent='00/'+scenes.length;
var m=/[#&]t=(\d+)/.exec(location.hash||'');
requestAnimationFrame(function(n){last=n;requestAnimationFrame(loop)});
/* first frame behind the poster */
show(0,0,true);
})();
