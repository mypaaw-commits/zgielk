(()=>{
'use strict';
const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
if(location.protocol==='file:'){document.querySelector('header a').href='index.html';document.querySelector('header a').textContent='↻ Gra';}
const data=window.BUBBLE_DATA,World=BubbleEngine.World;let world=new World(data.level,data.settings),paused=false,editing=false,ready=false,held=new Set(),last=0,accumulator=0;
const tileImage=new Image(),actors=new Image();tileImage.src='assets/tiles.png';actors.src='assets/actors.png';
const background=document.createElement('canvas');background.width=256;background.height=240;const bg=background.getContext('2d');
function tile(target,id,x,y){const index=256+id;target.drawImage(tileImage,(index%16)*8,Math.floor(index/16)*8,8,8,x,y,8,8);}
function rebuild(){bg.fillStyle='#000';bg.fillRect(0,0,256,240);world.level.tiles.forEach((id,i)=>tile(bg,id,(i%32)*8,Math.floor(i/32)*8));}
function status(){
 $('status').textContent=editing?'Edytor: klikaj kafelki. Gra jest zatrzymana.':world.state==='gameover'?'Koniec gry. Enter lub „Od początku”.':world.state==='complete'?'Plansza ukończona. Pozostałe etapy nie są jeszcze odtworzone.':paused?'Pauza.':`Punkty ${world.score} · życia ${world.lives} · przeciwnicy ${world.enemies.filter(e=>e.mode!=='dead').length}`;
 $('pause').textContent=paused?'Graj':'Pauza';
}
function sprite(index,row,x,y){ctx.drawImage(actors,index*16,row*16,16,16,Math.round(x),Math.round(y),16,16);}
function digits(text,x,y){for(const c of text){tile(ctx,Number(c),x,y);x+=8;}}
function render(){
 ctx.drawImage(background,0,0);ctx.fillStyle='#000';ctx.fillRect(0,0,256,24);digits(String(world.score).padStart(5,'0'),32,16);digits(String(world.lives).padStart(2,'0'),112,24);digits(String(Math.max(0,Math.ceil(world.timer/60))).padStart(2,'0'),224,16);
 for(const f of world.fruit)sprite(16,1,f.x,f.y);
 for(const e of world.enemies)if(e.mode==='free'){
  const index=e.vx<0?([0,1][Math.floor(world.tick/8)%2]):([15,14][Math.floor(world.tick/8)%2]);sprite(index,1,e.x,e.y);
 }
 for(const b of world.bubbles){if(b.enemy)sprite([4,5][Math.floor(world.tick/8)%2],1,b.x,b.y);else sprite([11,12][Math.floor(world.tick/8)%2],1,b.x,b.y);}
 const p=world.player;
 if(world.state!=='gameover'&&(p.invulnerable===0||world.tick%8<5)){
  const cycle=Math.floor(world.tick/8)%4;let index=p.dir>0?[6,0,2,5][cycle]:[7,9,8,10][cycle];if(!p.ground)index=p.dir>0?3:12;if(p.cooldown>11)index=p.dir>0?1:11;sprite(index,0,p.x,p.y);
 }
 ctx.font='7px monospace';ctx.textAlign='center';for(const e of world.effects){ctx.fillStyle='#fff3ae';ctx.fillText(e.text,e.x+8,e.y);}
 if(world.state!=='playing'){ctx.fillStyle='#061c16d9';ctx.fillRect(18,88,220,61);ctx.fillStyle='#baf7b7';ctx.font='11px monospace';ctx.fillText(world.state==='complete'?'PLANSZA UKONCZONA':'GAME OVER',128,112);ctx.font='7px monospace';ctx.fillText('ENTER: JESZCZE RAZ',128,132);}
 if(editing){ctx.strokeStyle='#d4ffb52c';ctx.lineWidth=.3;for(let x=0;x<=256;x+=8){ctx.beginPath();ctx.moveTo(x,24);ctx.lineTo(x,224);ctx.stroke();}for(let y=24;y<=224;y+=8){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke();}}
 status();
}
function input(){return {left:held.has('ArrowLeft')||held.has('KeyA'),right:held.has('ArrowRight')||held.has('KeyD'),jump:held.has('KeyX')||held.has('ArrowUp'),fire:held.has('KeyZ')||held.has('Space')};}
function restart(){world.reset();accumulator=0;paused=false;editing=false;$('editor').setAttribute('aria-pressed','false');canvas.focus();}
window.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if(['ArrowLeft','ArrowRight','ArrowUp','KeyA','KeyD','KeyX','KeyZ','Space','Enter'].includes(e.code)){e.preventDefault();held.add(e.code);if(e.code==='Enter'&&world.state!=='playing')restart();}});
window.addEventListener('keyup',e=>held.delete(e.code));window.addEventListener('blur',()=>held.clear());document.addEventListener('visibilitychange',()=>{if(document.hidden){held.clear();paused=true;status();}});
$('pause').onclick=()=>{paused=!paused;canvas.focus();};$('restart').onclick=restart;
$('editor').onclick=()=>{editing=!editing;$('editor').setAttribute('aria-pressed',String(editing));held.clear();};
canvas.addEventListener('pointerdown',event=>{canvas.focus();if(!editing)return;const r=canvas.getBoundingClientRect(),x=Math.floor((event.clientX-r.left)*256/r.width/8),y=Math.floor((event.clientY-r.top)*240/r.height/8);if(y<3||y>27||x<0||x>31)return;const i=y*32+x;world.level.solid[i]=1-world.level.solid[i];world.level.tiles[i]=world.level.solid[i]?138:38;rebuild();$('edit-message').textContent='Plansza zmieniona. Pobierz JSON, aby zachować wariant.';});
for(const b of document.querySelectorAll('[data-key]')){b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);held.add(b.dataset.key);};for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>held.delete(b.dataset.key));}
for(const [id,key] of [['speed','playerSpeed'],['jump','jumpSpeed'],['bubble','bubbleSpeed']]){const control=$(id);control.value=world.config[key];$(id+'-value').value=control.value;control.oninput=()=>{world.config[key]=Number(control.value);$(id+'-value').value=control.value;};}
function download(value){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='bubble-level.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
$('export').onclick=()=>download({format:'native-bubble-level-v1',level:world.level,settings:world.config});
function restore(level,settings){const checked=BubbleEngine.validateLevel(level),config={...data.settings};for(const key of Object.keys(config)){if(settings?.[key]!==undefined){const n=settings[key];if(typeof n!=='number'||!Number.isFinite(n)||n<=0||n>100000)throw Error('Nieprawidłowy parametr: '+key);config[key]=n;}}world=new World(checked,config);window.nativeBubble.world=world;paused=false;editing=false;held.clear();$('editor').setAttribute('aria-pressed','false');for(const [id,key] of [['speed','playerSpeed'],['jump','jumpSpeed'],['bubble','bubbleSpeed']]){$(id).value=config[key];$(id+'-value').value=config[key];}rebuild();}
$('import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>100000)throw Error('Limit 100 kB.');const doc=JSON.parse(await file.text());if(doc.format!=='native-bubble-level-v1')throw Error('Nieprawidłowy format poziomu.');restore(doc.level,doc.settings);$('edit-message').textContent='Wczytano własny wariant.';}catch(error){$('edit-message').textContent=error.message;}finally{e.target.value='';}};
$('restore').onclick=()=>{restore(data.level,data.settings);$('edit-message').textContent='Przywrócono układ z pakietu.';};
window.nativeBubble={world,restart,render,step:n=>{for(let i=0;i<n;i++)world.step(input());render();}};
function loop(time){if(!last)last=time;accumulator+=Math.min(100,time-last);last=time;if(ready){while(accumulator>=1000/60){if(!paused&&!editing)world.step(input());accumulator-=1000/60;}render();}requestAnimationFrame(loop);}
Promise.all([tileImage.decode(),actors.decode()]).then(()=>{ready=true;rebuild();canvas.focus();}).catch(()=>$('status').textContent='Brak grafik. Rozpakuj całą paczkę przed otwarciem index.html.');requestAnimationFrame(loop);
})();
