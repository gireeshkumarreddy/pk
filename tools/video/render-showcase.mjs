/**
 * Deterministic 40-second artwork animation of the OG website.
 * Uses the site's own assets and compositions; no browser or streaming playback.
 * Runtime: @napi-rs/canvas, ffmpeg. Render output is intentionally outside the site.
 * Usage: node --expose-gc tools/video/render-showcase.mjs /absolute/output.mp4 [--stills]
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'canvas-runtime.cjs') : import.meta.url);
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const out = path.resolve(process.argv[2] || '/tmp/OG-Cinematic-Showcase-40s.mp4');
fs.mkdirSync(path.dirname(out), { recursive: true });
const W = 1920, H = 1080, FPS = 60, DURATION = 40;
const segmentArg=process.argv.find(a=>a.startsWith('--segment-start='));
const segmentStart=segmentArg?Number(segmentArg.split('=')[1]):0;
const segmentDuration=segmentArg?2:DURATION;
// Native raster caches grow during long renders. Independent two-second workers
// keep memory bounded; a continuous absolute timeline keeps joins frame-exact.
if(!segmentArg&&!process.argv.includes('--stills')){
  const temp=fs.mkdtempSync(path.join(path.dirname(out),'render-chunks-'));
  const parts=[];
  for(let start=0;start<DURATION;start+=2){
    const part=path.join(temp,`part-${String(start).padStart(2,'0')}.mp4`);parts.push(part);
    const child=spawn(process.execPath,['--expose-gc',fileURLToPath(import.meta.url),part,`--segment-start=${start}`],{stdio:'inherit'});
    const [code]=await once(child,'close');if(code!==0)throw new Error(`Section ${start} failed: ${code}`);
    console.log(`Rendered ${start+2}s / ${DURATION}s`);
  }
  const manifest=path.join(temp,'concat.txt');fs.writeFileSync(manifest,parts.map(p=>`file '${p.replaceAll("'","'\\''")}'`).join('\n'));
  const join=spawn('ffmpeg',['-y','-hide_banner','-loglevel','warning','-f','concat','-safe','0','-i',manifest,'-c','copy','-movflags','+faststart','-metadata','title=OG — Cinematic Website Showcase','-metadata','comment=40-second deterministic animation of the website artwork and layouts; not a live browser recording.',out],{stdio:'inherit'});
  const [code]=await once(join,'close');if(code!==0)throw new Error(`Join failed: ${code}`);
  fs.rmSync(temp,{recursive:true});
  console.log(JSON.stringify({output:out,width:W,height:H,fps:FPS,duration:DURATION,frames:DURATION*FPS,bytes:fs.statSync(out).size}));
  process.exit(0);
}
const C = { paper:'#eeeae4', ink:'#11100f', red:'#da271b' };
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/urw-base35/NimbusSans-Regular.otf', 'OG Sans');
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/urw-base35/NimbusRoman-Italic.otf', 'OG Serif');
const names = ['OG011.webp','og-dual-guns.jpg','og-portrait.jpg','og-truck.jpg','OG007.webp','OG008.webp','OG009.png','OG002.jpg','OG013.webp','OG015.webp','OG016.jpg','og-title-original.png'];
const assets = Object.fromEntries(await Promise.all(names.map(async n => [n, await loadImage(path.join(root,'public/media',n))])));
const canvas = createCanvas(W,H), ctx = canvas.getContext('2d');
const logo = createCanvas(1400,704), lc = logo.getContext('2d');
lc.drawImage(assets['og-title-original.png'],570,295,1400,704,0,0,1400,704);
const marks = { red:logo };
for (const [name,color] of [['paper',C.paper],['ink',C.ink]]) {
  const c=createCanvas(1400,704), x=c.getContext('2d'); x.drawImage(logo,0,0);
  x.globalCompositeOperation='source-in'; x.fillStyle=color; x.fillRect(0,0,1400,704); marks[name]=c;
}
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const phase=(t,a,b)=>clamp((t-a)/(b-a));
const ease=v=>v*v*(3-2*v);
const smooth=(t,a,b)=>ease(phase(t,a,b));
const inOut=v=>v<.5?4*v*v*v:1-Math.pow(-2*v+2,3)/2;
const fade=(t,a,b,c,d)=>smooth(t,a,b)*(1-smooth(t,c,d));
const rad=v=>v*Math.PI/180;
function fill(color,x=0,y=0,w=W,h=H){ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}
function layer(alpha,fn){if(alpha<=0)return;ctx.save();ctx.globalAlpha*=clamp(alpha);fn();ctx.restore();}
function clip(x,y,w,h,fn){ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();fn();ctx.restore();}
function image(name,x,y,w,h,zoom=1,px=.5,py=.5){
  const im=assets[name], target=w/h, source=im.width/im.height;
  let sw=source>target?im.height*target:im.width, sh=source>target?im.height:im.width/target;
  sw/=zoom;sh/=zoom;const sx=(im.width-sw)*px,sy=(im.height-sh)*py;
  ctx.drawImage(im,sx,sy,sw,sh,x,y,w,h);
}
function mark(x,y,w,tone='red',rotation=0){ctx.save();ctx.translate(x,y);ctx.rotate(rad(rotation));ctx.drawImage(marks[tone],-w/2,-w*704/1400/2,w,w*704/1400);ctx.restore();}
function text(value,x,y,size=24,color=C.paper,{align='left',serif=false,tracking=0}={}){
  ctx.font=`${size}px "${serif?'OG Serif':'OG Sans'}"`;ctx.fillStyle=color;ctx.textBaseline='alphabetic';ctx.textAlign=align;
  if(!tracking){ctx.fillText(value,x,y);return;}
  const chars=[...value], widths=chars.map(c=>ctx.measureText(c).width), total=widths.reduce((a,b)=>a+b,0)+(chars.length-1)*tracking;
  let left=x-(align==='center'?total/2:align==='right'?total:0);ctx.textAlign='left';
  chars.forEach((c,i)=>{ctx.fillText(c,left,y);left+=widths[i]+tracking;});
}
function shade(x,y,w,h,direction='left',strength=.65){
  const g=direction==='left'?ctx.createLinearGradient(x,y,x+w,y):ctx.createLinearGradient(x,y,x,y+h);
  g.addColorStop(0,direction==='left'?`rgba(10,7,4,${strength})`:'rgba(10,7,4,0)');
  g.addColorStop(1,direction==='left'?'rgba(10,7,4,0)':`rgba(10,7,4,${strength})`);
  ctx.fillStyle=g;ctx.fillRect(x,y,w,h);
}
function header(t,tone='paper',alpha=1){layer(alpha,()=>{
  text('A SUJEETH FILM',68,63,17,C[tone],{tracking:1.5});mark(W/2,53,91,tone);
  text('INDEX',1740,63,17,C[tone],{tracking:1.5});ctx.strokeStyle=C[tone];ctx.lineWidth=1;
  for(const y of [50,60]){ctx.beginPath();ctx.moveTo(1820,y);ctx.lineTo(1855,y);ctx.stroke();}
});}
function hero(t,alpha=1){
  image('OG011.webp',0,0,W,H,1.015+.018*phase(t,2,7),.5,.5);shade(0,0,W,H,'left',.62);shade(0,500,W,580,'bottom',.3);
  layer(alpha*smooth(t,1.65,3.1),()=>{
    const y=26*(1-smooth(t,1.7,3));text('PAWAN KALYAN',96,338+y,17,C.paper,{tracking:2.2});
    text('Some names',96,467+y,150);text('become',96,613+y,150);text('legends.',664,613+y,154,C.paper,{serif:true});
    for(const [i,s] of ['THEY','CALL','HIM'].entries())text(s,96,705+i*18+y,14,C.paper,{tracking:1});
    mark(302,729+y,190);
    text('SCROLL TO ENTER HIS WORLD',96,1007,15,C.paper,{tracking:1.5});ctx.strokeStyle=C.paper;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(420,1002);ctx.lineTo(505,1002);ctx.stroke();
    text('WATCH THE TRAILER',1814,1007,15,C.paper,{align:'right',tracking:1.5});
  });
}
const orbitNames=['og-dual-guns.jpg','OG007.webp','OG015.webp','OG009.png','OG002.jpg','og-truck.jpg','OG008.webp','OG011.webp','OG013.webp','OG016.jpg'];
function orbit(t){
  const appear=smooth(t,6.4,8.7), turn=-210*phase(t,8.1,13.7), leave=smooth(t,13.5,15.5);
  ctx.save();ctx.translate(W/2,H/2);ctx.rotate(rad(turn));
  orbitNames.forEach((name,i)=>{
    const a=i/10*Math.PI*2-Math.PI/2, scale=lerp(2.1,1,appear)*lerp(1,.7,leave);
    const w=(i%3===0?310:258)*scale, h=w/1.65;
    const r=lerp(1.65,1,appear)+leave*.5, x=Math.cos(a)*790*r,y=Math.sin(a)*440*r;
    layer(appear*(1-leave),()=>{ctx.save();ctx.translate(x,y);ctx.rotate(rad((i%2===0?14:-14)*phase(t,8.1,13.7)));ctx.scale(1-.065*phase(t,8.1,13.7),1);image(name,-w/2,-h/2,w,h);ctx.restore();});
  });ctx.restore();
}
function crescent(t){
  const a=fade(t,9.05,9.7,12.9,13.7), r=lerp(266,395,smooth(t,9.5,13.7));
  layer(a,()=>{ctx.save();ctx.translate(W/2,H/2);ctx.rotate(rad(lerp(-70,360,smooth(t,9.5,13.7))));ctx.lineWidth=52;ctx.strokeStyle=C.red;ctx.beginPath();ctx.arc(0,0,r,rad(40),rad(298));ctx.stroke();ctx.restore();});
}
function journey(t){
  fill(C.paper);
  const red=smooth(t,12.1,14.1)*(1-smooth(t,17,18.6));
  if(red>0){ctx.save();ctx.beginPath();ctx.arc(W/2,lerp(H/2,H/4,smooth(t,17,18.6)),Math.hypot(W,H)*red,0,Math.PI*2);ctx.clip();fill(C.red);ctx.restore();}
  orbit(t);crescent(t);
  layer(fade(t,9.0,9.7,15.8,17),()=>mark(W/2,H/2,570,'red',-360*smooth(t,9.1,13.7)));
  if(t<9.7){
    const p=smooth(t,6.1,8.65), vanish=smooth(t,8.6,9.7), size=lerp(1,.47,p)*(1-.8*vanish);
    layer(1-vanish,()=>{ctx.save();ctx.translate(W/2,H/2);ctx.scale(size,size);ctx.rotate(rad(-28*vanish));
      ctx.beginPath();ctx.arc(0,0,lerp(Math.hypot(W,H),H*.44,p),0,Math.PI*2);ctx.clip();ctx.translate(-W/2,-H/2);hero(t,1-smooth(t,6.1,6.9));ctx.restore();});
  }
  layer(fade(t,13.05,14,15.4,16.1),()=>{
    text('THE RETURN OF OJAS GAMBHEERA',W/2,436,16,C.paper,{align:'center',tracking:2.4});
    text('A name buried in silence.',W/2,547,100,C.paper,{align:'center'});
    text('A storm that never died.',W/2,649,100,C.paper,{align:'center'});
  });
  layer(fade(t,15.8,16.45,17.15,17.7),()=>{
    text('The storm returns.',W/2,547,122,C.paper,{align:'center'});
    text('THEY CALL HIM OG',W/2,610,17,C.paper,{align:'center',tracking:2.8});
  });
  if(t>17.3) portrait(t);
}
function portrait(t){
  const enter=smooth(t,17.4,18.6), y=281+H*.55*(1-enter), x=720,w=480,h=518;
  layer(enter,()=>{
    ctx.strokeStyle='#99928a';ctx.lineWidth=1;ctx.strokeRect(x-48,y-52-24*smooth(t,18.6,19.4),w*.82,h*.9);
    text('+',x-54,y-45-24*smooth(t,18.6,19.4),17,'#99928a');
    clip(x,y,w,h,()=>{
      image('og-dual-guns.jpg',x,y,w,h,1+.025*phase(t,19,23),.5,.5);
      layer(1-smooth(t,21,21.6),()=>image('og-portrait.jpg',x,y,w,h,1,.76,.5));
      const maskY=y-h*1.02*smooth(t,19.15,20.2);fill(C.red,x,maskY,w,h);
      if(maskY+h>y){clip(x,y,w,h,()=>{text('Some storms',x+48,maskY+95,53);text('never leave.',x+48,maskY+151,53);text('They wait.',x+48,maskY+207,53);text('01 — THE RETURN',x+48,maskY+h-45,14,C.paper,{tracking:1.1});});}
    });
    text('THE MAN BEHIND THE NAME',96,548,14,'#79736d',{tracking:1.6});text('OJAS',1400,535,14,'#79736d',{tracking:1.6});text('GAMBHEERA',1400,558,14,'#79736d',{tracking:1.6});
    for(const [i,s] of ['The man.','The myth.','The storm.'].entries())layer(smooth(t,19.85+i*.2,20.65+i*.2),()=>text(s,423,400+i*110+40*(1-smooth(t,19.85+i*.2,20.65+i*.2)),110,C.ink));
  });
}
function wide(t){
  image('og-dual-guns.jpg',0,0,W,H,1+.035*phase(t,22.3,26.5),.5,.46);
  ctx.save();ctx.translate(W,0);ctx.scale(-1,1);shade(0,0,W,H,'left',.5);ctx.restore();shade(0,700,W,380,'bottom',.5);
  layer(smooth(t,22.65,23.5),()=>{
    text('SILENCE HAS AN EXPIRY DATE.',1190,258,16,C.paper,{tracking:2});
    text('And then,',1190,382,105);text('there was',1190,487,105);text('OG.',1660,487,111,C.paper,{serif:true});
    text('A world of shadows.',1190,555,24);text('A name that echoes through it.',1190,591,24);
    text('POWER STAR PAWAN KALYAN',96,1000,15,C.paper,{tracking:1.5});text('THEY CALL HIM OG',1824,1000,15,C.paper,{align:'right',tracking:1.5});
  });
}
function world(t){
  fill(C.ink);const p=smooth(t,26.3,28.85), leave=smooth(t,28.4,29.4);
  layer(1-smooth(t,27.3,28.5),()=>{
    text('A WORLD IN FRAGMENTS',96,371,17,C.paper,{tracking:2});
    text('Quiet menace.',96,472,80);text('Unmistakable power.',96,553,80);text('One original.',96,642,89,C.red,{serif:true});
    text('THE FILMS, THE SOUND, THE RETURN.',96,714,15,C.paper,{tracking:1.4});
  });
  const poses=[[.48,.13,-5],[.77,.15,4],[.65,.39,-3],[.81,.65,3],[.48,.74,-5]];
  ['OG007.webp','OG008.webp','OG011.webp','og-dual-guns.jpg','OG009.png'].forEach((name,i)=>{
    const [x,y,r]=poses[i],q=smooth(t,26.1+i*.08,28.65+i*.08),w=lerp(250,720,q),h=w/1.7;
    layer(1-leave,()=>{ctx.save();ctx.translate(lerp(x*W+125,W/2,q),lerp(y*H+74,245+i*128,q)+leave*150);ctx.rotate(rad(r*(1-q)));image(name,-w/2,-h/2,w,h);ctx.restore();});
  });
}
function chapters(t){
  fill(C.ink);const offset=lerp(-100,2600,phase(t,28.8,35.7));
  const chapters=[['Hungry Cheetah','THE FIRST GLIMPSE','OG011.webp'],['Firestorm','THE SOUND OF OG','og-dual-guns.jpg'],['They Call Him OG','THE OFFICIAL TRAILER','og-truck.jpg']];
  ctx.save();ctx.translate(0,-offset);
  for(const [i,[title,label,name]] of chapters.entries()){
    const y=160+i*980; if(y-offset>H+200||y+900-offset<0)continue;
    text(`0${i+1}`,96,y,16,C.red,{tracking:1.2});text(label,151,y,15,C.paper,{tracking:1.5});text('DVV ENTERTAINMENT',1824,y,15,C.paper,{align:'right',tracking:1.5});
    image(name,96,y+145,1728,620,1.015+.035*phase(t,28.8+i*2.2,31+i*2.2),.5,.5);
    text(title,145,y+164,175);fill('rgba(17,16,15,.65)',1580,y+667,203,64);text('PLAY FILM',1681,y+707,15,C.paper,{align:'center',tracking:1.5});
    text(i===0?'A silence. A silhouette. A name that needs no introduction.':i===1?'The calm ends here. Music by Thaman S.':'Pawan Kalyan. Emraan Hashmi. A film by Sujeeth.',96,y+811,21,'#c1bab3');text('WATCH',1824,y+811,15,C.paper,{align:'right',tracking:1.5});
  }ctx.restore();
}
function footer(t){
  fill(C.red);const p=smooth(t,35.1,38.9), scroll=lerp(0,730,p);
  ctx.save();ctx.translate(0,-scroll);text('PAWAN KALYAN IN',W/2,163,17,C.ink,{align:'center',tracking:2.5});
  text('THEY CALL HIM',W/2,269,17,C.ink,{align:'center',tracking:6});mark(W/2,542,890,'ink');
  const x=192,y=866,w=1536,h=864;
  clip(x,y,w,h,()=>{
    image('og-dual-guns.jpg',x,y,w,h,1.025+.045*phase(t,35.5,40),.5,.46);
    shade(x,y+h*.35,w,h*.65,'bottom',.72);
    layer(.9,()=>{text('THEY CALL HIM',x+w-210,y+h-239,16,C.paper,{align:'center',tracking:3});mark(x+w-210,y+h-137,318);});
  });
  text('WATCH THE TRAILER',830,1795,16,C.ink,{align:'center',tracking:1.2});text('BACK TO THE BEGINNING',1140,1795,16,C.ink,{align:'center',tracking:1.2});
  text('A FILM BY SUJEETH          MUSIC BY THAMAN S          DVV ENTERTAINMENT',W/2,1873,14,C.ink,{align:'center',tracking:1.5});ctx.restore();
}
function revealUp(t,a,b,draw){const p=smooth(t,a,b);if(p<=0)return;ctx.save();ctx.translate(0,H*(1-p));draw();ctx.restore();}
function render(t){
  ctx.resetTransform();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  if(t<6.1){hero(t);header(t,'paper',smooth(t,1.8,2.8));}
  else {journey(t);header(t,t<7.2?'paper':t<12.8?'ink':t<17.5?'paper':'ink');}
  if(t>=22.1){revealUp(t,22.1,23.05,()=>wide(t));header(t,'paper');}
  if(t>=25.35){revealUp(t,25.35,26.25,()=>world(t));header(t,'paper');}
  if(t>=28.7){revealUp(t,28.7,29.5,()=>chapters(t));header(t,'paper');}
  if(t>=34.65){revealUp(t,34.65,35.65,()=>footer(t));header(t,t<35.4?'paper':'ink');}
  // The same branded title opening, with its mark travelling into the header.
  if(t<2.8){
    const wipe=smooth(t,1.9,2.8);clip(0,0,W,H*(1-wipe),()=>{
      fill(C.ink);const p=smooth(t,1.05,2.05),a=smooth(t,.05,.7);layer(a,()=>mark(W/2,lerp(H/2,53,p)+22*(1-a),lerp(560,91,p)));
      layer(1-smooth(t,1.05,1.6),()=>{fill(C.red,W/2-165,H/2+193,330*smooth(t,.2,1.5),2);text('THEY CALL HIM',W/2,H/2+245,16,C.paper,{align:'center',tracking:4});});
    });
  }
  fill(C.red,0,H-3,W*t/DURATION,3);
}
if(process.argv.includes('--stills')){
  for(const t of [0.65,2.8,5,7.5,9.8,11.3,13.6,16.6,18.8,20.5,22,24.4,26.8,28.4,30.2,32.4,34.3,36,38,39.7]){
    render(t);fs.writeFileSync(path.join(path.dirname(out),`review-${t.toFixed(2)}.jpg`),canvas.toBuffer('image/jpeg',92));
  }
  console.log('Review stills rendered.');process.exit(0);
}
const ff=spawn('ffmpeg',['-y','-hide_banner','-loglevel','warning','-f','rawvideo','-pixel_format','rgba','-video_size',`${W}x${H}`,'-framerate',String(FPS),'-i','pipe:0','-an','-c:v','libx264','-threads','4','-preset','medium','-crf','18','-pix_fmt','yuv420p','-r',String(FPS),'-movflags','+faststart','-metadata','title=OG — Cinematic Website Showcase','-metadata','comment=40-second deterministic animation of the website artwork and layouts; not a live browser recording.',out],{stdio:['pipe','ignore','inherit']});
ff.stdin.on('error',e=>{console.error(e);process.exitCode=1;});
const done=once(ff,'close');
for(let i=0;i<segmentDuration*FPS;i++){
  render(segmentStart+i/FPS);const data=ctx.getImageData(0,0,W,H).data;
  if(!ff.stdin.write(Buffer.from(data.buffer,data.byteOffset,data.byteLength)))await once(ff.stdin,'drain');
  if(i%30===0)global.gc?.();
}
ff.stdin.end();const [code]=await done;if(code!==0)throw new Error(`ffmpeg exited ${code}`);
if(!segmentArg)console.log(JSON.stringify({output:out,width:W,height:H,fps:FPS,duration:segmentDuration,frames:segmentDuration*FPS,bytes:fs.statSync(out).size}));
