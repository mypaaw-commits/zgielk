const assert=require('node:assert/strict');global.window={};require('./game-data.js');const {World,validateLevel}=require('./engine.js');
const d=window.BUBBLE_DATA;const w=new World(d.level,d.settings);
w.step();assert.equal(w.player.ground,true);const x=w.player.x;for(let i=0;i<10;i++)w.step({right:true});assert.equal(w.player.x,x+10);const y=w.player.y;w.step({jump:true});assert.ok(w.player.y<y);
w.reset();const enemy=w.enemies[0];w.player.x=80;w.player.y=80;enemy.x=100;enemy.y=80;enemy.vx=0;w.step({fire:true});assert.equal(enemy.mode,'trapped');assert.ok(w.bubbles.some(b=>b.enemy===enemy));w.pop(w.bubbles.find(b=>b.enemy));assert.equal(enemy.mode,'dead');assert.equal(w.score,1000);assert.equal(w.fruit.length,1);
w.player.x=w.fruit[0].x;w.player.y=w.fruit[0].y;w.step();assert.equal(w.score,1500);
w.reset();assert.equal(w.score,0);assert.equal(w.tick,0);assert.equal(w.enemies.length,4);assert.equal(w.bubbles.length,0);
assert.throws(()=>validateLevel({...d.level,solid:[0]}));assert.throws(()=>validateLevel({...d.level,player:{x:NaN,y:20}}));
const a=new World(d.level,d.settings),b=new World(d.level,d.settings);for(let i=0;i<600;i++){const input={right:i<100,fire:i%40<4,jump:i%120<2};a.step(input);b.step(input);}assert.deepEqual(a.player,b.player);assert.deepEqual(a.enemies,b.enemies);
console.log('Native simulation: movement, jumping, trapping, popping, fruit, restart, validation and deterministic replay passed.');
