const assert=require('node:assert/strict'),path=require('node:path');
const engine=require(process.argv[2]?path.resolve(process.argv[2]):'../web/vendor/jsnes-patched.min.js');
const ppu=new engine.NES({emulateSound:false}).ppu;
ppu.ntable1=[0,1,2,3];
ppu.f_spriteSize=1;ppu.f_spClipping=1;ppu.f_bgClipping=1;
ppu.cntFV=0;ppu.cntVT=0;ppu.cntV=0;ppu.regS=0;ppu.regFH=0;ppu.regHT=0;ppu.regH=0;
ppu.ptTile[0].pix.fill(1); // Fully opaque background tile.
let cases=0;
for(const bank of [0,1])for(let sourceY=0;sourceY<16;sourceY++)for(const sourceX of [0,7])for(const flags of [0,64,128,192]) {
 const base=4+bank*256;ppu.ptTile[base].pix.fill(0);ppu.ptTile[base+1].pix.fill(0);
 ppu.ptTile[base+(sourceY>>3)].pix[(sourceY%8)*8+sourceX]=1;
 for(let row=0;row<16;row++){
  const scan=30+row;ppu.scanlineSprite0[scan]=1;ppu.scanlineSpriteCount[scan]=1;
  ppu.scanlineSecondaryOAM.set([29,4+bank,flags,24],scan*32);
  const expectedY=flags&128?15-sourceY:sourceY;
  assert.equal(ppu._precomputeSprite0Hit(scan),row===expectedY,`bank ${bank}, sourceY ${sourceY}, flips ${flags}, row ${row}`);
  if(row===expectedY)assert.equal(ppu.spr0HitX,24+(flags&64?7-sourceX:sourceX));
  cases++;
 }
}
console.log(`Sprite-zero hit regression passed: ${cases} scanline cases.`);
