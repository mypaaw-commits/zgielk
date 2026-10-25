/* Independent game simulation. No ROM loader, CPU interpreter, PPU or emulator. */
(function(root){
'use strict';
const overlap=(a,b,pad=0)=>a.x+14-pad>b.x+pad&&a.x+pad<b.x+14-pad&&a.y+14-pad>b.y+pad&&a.y+pad<b.y+14-pad;
function validateLevel(l){
 if(!l||l.width!==32||l.height!==30||l.tileSize!==8||!Array.isArray(l.tiles)||l.tiles.length!==960||!Array.isArray(l.solid)||l.solid.length!==960)throw Error('Plansza musi mieć 32×30 kafelków po 8 pikseli.');
 if(l.tiles.some(v=>!Number.isInteger(v)||v<0||v>255)||l.solid.some(v=>v!==0&&v!==1))throw Error('Nieprawidłowe kafelki lub kolizje.');
 for(const a of [l.player,...(l.enemies||[])])if(!a||!Number.isFinite(a.x)||!Number.isFinite(a.y)||a.x<0||a.x>240||a.y<24||a.y>240)throw Error('Nieprawidłowy punkt startu.');
 if(!Array.isArray(l.enemies)||l.enemies.length>24)throw Error('Limit 24 przeciwników.');return JSON.parse(JSON.stringify(l));
}
class World{
 constructor(level,settings){this.config={...settings};this.level=validateLevel(level);this.reset();}
 reset(){this.tick=0;this.score=0;this.lives=this.config.lives;this.timer=this.config.roundFrames;this.state='playing';this.bubbles=[];this.fruit=[];this.effects=[];this.spawn();this.enemies=this.level.enemies.map((s,i)=>({...s,vx:i%2?this.config.enemySpeed:-this.config.enemySpeed,vy:0,ground:false,mode:'free',id:i,age:0}));this.jumpHeld=false;}
 spawn(){this.player={...this.level.player,vx:0,vy:0,ground:false,dir:1,cooldown:0,invulnerable:150};}
 move(a){
  a.x+=a.vx;a.x=Math.max(16,Math.min(224,a.x));a.vy=Math.min(this.config.maxFall,a.vy+this.config.gravity);
  const previous=a.y;a.y+=a.vy;a.ground=false;
  if(a.vy>=0){const feet=a.y+16,oldFeet=previous+16;let best=Infinity;
   for(let row=Math.max(3,Math.floor(oldFeet/8));row<=Math.min(27,Math.floor(feet/8));row++)for(let col=Math.max(0,Math.floor((a.x+3)/8));col<=Math.min(31,Math.floor((a.x+12)/8));col++)if(this.level.solid[row*32+col]&&oldFeet<=row*8+.01&&feet>=row*8)best=Math.min(best,row*8);
   if(best<Infinity){a.y=best-16;a.vy=0;a.ground=true;}
  }
  if(a.y>224){a.y=24;a.ground=false;}if(a.y<24){a.y=24;a.vy=0;}
 }
 shoot(){const p=this.player;if(p.cooldown||this.bubbles.length>=12)return;p.cooldown=18;this.bubbles.push({x:p.x+p.dir*10,y:p.y-1,vx:this.config.bubbleSpeed*p.dir,age:0,enemy:null});}
 pop(b){if(b.enemy){const e=b.enemy;this.score+=1000;e.mode='dead';this.fruit.push({x:b.x,y:b.y,vy:-1,age:0});this.effects.push({x:b.x,y:b.y,life:30,text:'+1000'});}this.bubbles=this.bubbles.filter(v=>v!==b);}
 hit(){if(this.player.invulnerable)return;this.lives--;if(this.lives<=0){this.state='gameover';return;}this.spawn();}
 step(input={}){
  if(this.state!=='playing')return;this.tick++;this.timer--;
  const p=this.player;p.invulnerable=Math.max(0,p.invulnerable-1);p.cooldown=Math.max(0,p.cooldown-1);p.vx=((input.right?1:0)-(input.left?1:0))*this.config.playerSpeed;if(p.vx)p.dir=Math.sign(p.vx);
  if(input.jump&&!this.jumpHeld&&p.ground){p.vy=-this.config.jumpSpeed;p.ground=false;}this.jumpHeld=!!input.jump;
  if(input.fire)this.shoot();this.move(p);
  for(const b of [...this.bubbles]){b.age++;if(b.age<38&&!b.enemy)b.x+=b.vx;else{b.y-=this.config.bubbleRise;b.x+=Math.sin((this.tick+b.age)*.04)*.12;}
   b.x=Math.max(16,Math.min(224,b.x));if(b.enemy){b.enemy.x=b.x;b.enemy.y=b.y;}
   if(b.age>14&&overlap(p,b,3)){this.pop(b);continue;}
   if(b.age>this.config.trapFrames||b.y<26){if(b.enemy){b.enemy.mode='free';b.enemy.vy=0;b.enemy.vx=this.config.enemySpeed*(p.x<b.x?-1:1)*1.5;}this.bubbles=this.bubbles.filter(v=>v!==b);}
  }
  for(const e of this.enemies){if(e.mode!=='free')continue;e.age++;if(e.x<=16)e.vx=Math.abs(e.vx);if(e.x>=224)e.vx=-Math.abs(e.vx);if(e.ground&&e.age%180===60)e.vy=-this.config.jumpSpeed*.9;this.move(e);
   const b=this.bubbles.find(b=>!b.enemy&&b.age<120&&overlap(e,b,2));if(b){e.mode='trapped';b.enemy=e;b.age=38;continue;}
   if(overlap(e,p,3))this.hit();
  }
  for(const f of [...this.fruit]){f.age++;f.vx=0;this.move(f);if(overlap(p,f,2)){this.score+=500;this.effects.push({x:f.x,y:f.y,life:30,text:'+500'});this.fruit=this.fruit.filter(v=>v!==f);}else if(f.age>600)this.fruit=this.fruit.filter(v=>v!==f);}
  for(const e of this.effects){e.life--;e.y-=.3;}this.effects=this.effects.filter(e=>e.life>0);
  if(this.timer<=0){this.hit();this.timer=this.config.roundFrames;}
  if(this.enemies.every(e=>e.mode==='dead')&&!this.fruit.length)this.state='complete';
 }
}
const api={World,validateLevel,overlap};if(typeof module!=='undefined')module.exports=api;root.BubbleEngine=api;
})(typeof window!=='undefined'?window:globalThis);
