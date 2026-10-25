/* Independent 8x16 NES OAM pixel oracle, including both banks and H/V flips. */
const assert = require('node:assert/strict');
const path = require('node:path');
const engine = require(process.argv[2] ? path.resolve(process.argv[2]) : '../web/vendor/jsnes-patched.min.js');
const nes = new engine.NES({emulateSound:false});
const ppu = nes.ppu;
nes.mmap = {latchAccess(){}};
ppu.f_spVisibility=1;
ppu.f_spriteSize=1;
for(let index=0;index<512;index++) {
  for(let row=0;row<8;row++)for(let col=0;col<8;col++)ppu.ptTile[index].pix[row*8+col]=(index+col+row*2)%4;
}
for(let index=0;index<16;index++)ppu.sprPalette[index]=100+index;
const x=24,y=30;
let checked=0,cases=0,failures=0,firstFailure=null;
for(let tile=0;tile<256;tile++)for(const flips of [0,64,128,192])for(let palette=0;palette<4;palette++) {
  ppu.buffer.fill(0);
  ppu.pixrendered.fill(255);
  for(let row=0;row<16;row++) {
    const scan=y+row;
    ppu.scanlineSpriteCount[scan]=1;
    ppu.scanlineSecondaryOAM.set([y-1,tile,flips|palette,x],scan*32);
  }
  ppu.renderSpritesPartially(y,16,0);
  for(let row=0;row<16;row++)for(let col=0;col<8;col++) {
    const sourceY=flips&128?15-row:row;
    const sourceX=flips&64?7-col:col;
    const patternAddress=((tile&1)<<12)+((tile&254)<<4)+(sourceY>=8?16:0);
    const tileIndex=patternAddress>>>4;
    const color=(tileIndex+sourceX+(sourceY%8)*2)%4;
    const expected=color?100+palette*4+color:0;
    const actual=ppu.buffer[(y+row)*256+x+col];
    checked++;
    if(actual!==expected){failures++;if(!firstFailure)firstFailure={tile,flips,palette,row,col,expected,actual};}
  }
  cases++;
}
assert.equal(failures,0,`${failures}/${checked} sprite pixels differ; first: ${JSON.stringify(firstFailure)}`);
console.log(`PPU regression passed: ${cases} cases, ${checked} pixels, all tiles/banks/flips/palettes.`);
