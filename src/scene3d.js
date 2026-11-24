/* Live exploded view of duct v11, built from the real print model (model/duct_v11.glb, millimetres). */
window.SceneHooks=window.SceneHooks||{};
(function(){
var st={init:false,ok:false,parts:{},labels:[]},el,R,scene,cam,air,airN=520,airSeed=[],rotors=[],ghosts=[];
function fail(){st.failed=true;if(el)el.classList.add('no3d')}
function ease(k){k=Math.max(0,Math.min(1,k));return k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2}
function mat(c,o){o=o||{};return new THREE.MeshStandardMaterial({color:c,roughness:o.r===undefined?.72:o.r,metalness:o.m||0,transparent:true,opacity:1,side:THREE.DoubleSide})}
function fan(x0){
  var g=new THREE.Group(),sh=new THREE.Shape(),s=60,r=9;
  sh.moveTo(-s+r,-s);sh.lineTo(s-r,-s);sh.quadraticCurveTo(s,-s,s,-s+r);sh.lineTo(s,s-r);sh.quadraticCurveTo(s,s,s-r,s);sh.lineTo(-s+r,s);sh.quadraticCurveTo(-s,s,-s,s-r);sh.lineTo(-s,-s+r);sh.quadraticCurveTo(-s,-s,-s+r,-s);
  var h=new THREE.Path();h.absarc(0,0,56.5,0,Math.PI*2,true);sh.holes.push(h);
  g.add(new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:25,bevelEnabled:false,curveSegments:40}),mat(0x1c1c20,{r:.5})));
  var rot=new THREE.Group();rot.position.z=12.5;
  var hub=new THREE.Mesh(new THREE.CylinderGeometry(20,20,15,32),mat(0x121214,{r:.4}));hub.rotation.x=Math.PI/2;rot.add(hub);
  for(var k=0;k<7;k++){var b=new THREE.Mesh(new THREE.BoxGeometry(36,22,1.8),mat(0x232328,{r:.5})),a=k/7*Math.PI*2,p=new THREE.Group();
    b.position.x=37;b.rotation.x=.62;p.rotation.z=a;p.add(b);rot.add(p)}
  g.add(rot);rotors.push(rot);g.rotation.y=Math.PI/2;g.position.set(x0,-27.5,0);return g;
}
function card(yc){
  var g=new THREE.Group(),body=new THREE.Mesh(new THREE.BoxGeometry(262,36,108),mat(0x131316,{r:.45,m:.3}));g.add(body);
  var stripe=new THREE.Mesh(new THREE.BoxGeometry(150,36.6,30),mat(0xcdb67e,{r:.35,m:.55}));stripe.position.set(-10,0,39.5);g.add(stripe);
  g.position.set(-166-131,yc,0);return g;
}
function build(){
  if(st.init)return;st.init=true;
  if(!window.THREE||!THREE.GLTFLoader||!window.fetch){fail();return}
  try{
    R=new THREE.WebGLRenderer({canvas:el.querySelector('canvas'),antialias:true,alpha:true});R.setPixelRatio(1);R.setSize(1920,1080,false);
    if(THREE.sRGBEncoding)R.outputEncoding=THREE.sRGBEncoding;
    scene=new THREE.Scene();cam=new THREE.PerspectiveCamera(27,16/9,10,6000);
    scene.add(new THREE.HemisphereLight(0xfff4e0,0x1a1612,.62));
    var key=new THREE.DirectionalLight(0xffffff,1.1);key.position.set(300,500,600);scene.add(key);
    var rim=new THREE.DirectionalLight(0xe0c98a,.9);rim.position.set(-600,200,-400);scene.add(rim);
    var cool=new THREE.PointLight(0x62cbe2,.9,900);cool.position.set(160,-20,120);scene.add(cool);
  }catch(e){fail();return}
  fetch('model/duct_v11.glb').then(function(r){if(!r.ok)throw 0;return r.arrayBuffer()}).then(function(buf){
    new THREE.GLTFLoader().parse(buf,'',function(g){
      /* as built: black duct and adapter, white straightener, rails and pins */
      var colors={adapter:[0x242428,.6],duct:[0x2b2b30,.78],rail_frame:[0xe9e4d8,.6],straightener:[0xe9e4d8,.6],pin:[0xe9e4d8,.6],screw:[0xaab0b6,.3,.85],eps_cable:[0x3a3a40,.6],plug:[0x101012,.5]};
      var groups={};
      g.scene.traverse(function(o){if(!o.isMesh)return;var n=(o.name||(o.parent&&o.parent.name)||'').replace(/_g$/,'');var key=Object.keys(colors).filter(function(k){return n.indexOf(k)===0})[0]||'duct';
        var c=colors[key];o.geometry.computeVertexNormals();o.material=mat(c[0],{r:c[1],m:c[2]||0});(groups[key]=groups[key]||[]).push(o)});
      scene.add(g.scene);
      var fa=fan(-33),fb=fan(-78),c1=card(-3.5),c2=card(-64.5);scene.add(fa,fb,c1,c2);
      /* explode offsets (mm): everything slides toward the case front (+x); screws lift out */
      st.parts={duct:{o:groups.duct,d:[0,0,0]},rail_frame:{o:groups.rail_frame,d:[55,0,0]},fanB:{o:[fb],d:[120,0,0]},pin:{o:groups.pin,d:[165,0,0]},
        straightener:{o:groups.straightener,d:[225,0,0]},fanA:{o:[fa],d:[300,0,0]},adapter:{o:groups.adapter,d:[375,0,0]},
        screw:{o:groups.screw,d:[0,0,70]},eps_cable:{o:groups.eps_cable,d:[0,0,0]},plug:{o:groups.plug,d:[0,0,0]},cards:{o:[c1,c2],d:[-70,0,0]}};
      Object.keys(st.parts).forEach(function(k){var p=st.parts[k];p.o=p.o||[];p.base=p.o.map(function(o){return o.position.clone()});
        var box=new THREE.Box3();p.o.forEach(function(o){box.expandByObject(o)});p.c=box.getCenter(new THREE.Vector3());p.top=box.max.y;p.bot=box.min.y});
      st.parts.cards.c.x=-166-70;                      /* label the cards near their intake end */
      ['duct','fanA','fanB','cards','adapter','rail_frame','straightener'].forEach(function(k){st.parts[k].o.forEach(function(o){o.traverse(function(m){if(m.isMesh)ghosts.push(m.material)})})});
      /* intake air */
      var pos=new Float32Array(airN*3);for(var i=0;i<airN;i++){var a=Math.random()*Math.PI*2,rr=Math.sqrt(Math.random())*52;airSeed.push([Math.cos(a)*rr,Math.sin(a)*rr,Math.random(),Math.random()<.5?0:1,(Math.random()-.5)*26,(Math.random()-.5)*84])}
      var bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.BufferAttribute(pos,3));
      air=new THREE.Points(bg,new THREE.PointsMaterial({color:0x8fe3f5,size:9,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false}));air.renderOrder=5;scene.add(air);
      st.labels=Array.prototype.slice.call(el.querySelectorAll('[data-part]'));
      st.ok=true;el.classList.add('has3d');
    },fail);
  })['catch'](fail);
}
var v=null;
function tick(t,dur){
  if(!st.ok)return;
  v=v||new THREE.Vector3();
  var e=1-ease((t-dur*.42)/(dur*.26));               /* 1 = exploded, 0 = assembled */
  var intro=ease(t/2.2);
  Object.keys(st.parts).forEach(function(k){var p=st.parts[k];p.o.forEach(function(o,i){o.position.set(p.base[i].x+p.d[0]*e,p.base[i].y+p.d[1]*e,p.base[i].z+p.d[2]*e)})});
  rotors.forEach(function(r){r.rotation.z=-t*(5+(1-e)*9)});
  var ang=-.62+.5*(t/dur)+(1-e)*.18,dist=1010+290*e,cx=-170+110*e;
  cam.position.set(cx+Math.sin(ang)*dist,150+60*e,Math.cos(ang)*dist);cam.lookAt(cx,-30,0);
  var a=ease((t-dur*.7)/1.5),gh=1-.62*a;             /* shell turns to glass while the air runs */
  for(var q=0;q<ghosts.length;q++){ghosts[q].opacity=gh;ghosts[q].depthWrite=gh>.98}
  if(air){air.material.opacity=a*.95;var P=air.geometry.attributes.position.array,L=600;
    for(var i=0;i<airN;i++){var s=airSeed[i],x=110-((t*190+s[2]*L)%L),k=Math.max(0,Math.min(1,(-83-x)/83)),yc=s[3]?-64.5:-3.5;
      var y0=-27.5+s[1],z0=s[0],y1=yc+s[4]*.9,z1=s[5]*.5,m=x>-83?0:ease(k);
      P[i*3]=x;P[i*3+1]=y0+(y1-y0)*m;P[i*3+2]=z0+(z1-z0)*m}
    air.geometry.attributes.position.needsUpdate=true}
  R.render(scene,cam);
  st.labels.forEach(function(L){var p=st.parts[L.dataset.part];if(!p)return;var below=L.classList.contains('below');
    v.set(p.c.x+p.d[0]*e,(below?p.bot-10:p.top+10)+p.d[1]*e,p.c.z+p.d[2]*e).project(cam);
    L.style.left=((v.x*.5+.5)*1920)+'px';L.style.top=((-v.y*.5+.5)*1080)+'px';L.style.opacity=(intro*Math.max(0,(e-.55)/.45)).toFixed(3)});
}
window.SceneHooks['s-explode']={enter:function(node){el=node;build()},tick:tick};
})();
