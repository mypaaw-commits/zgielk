const assert=require('node:assert/strict');
global.window={};global.jsnes=require('../web/vendor/jsnes-patched.min.js');
require('../web/player.js');
const rom=new Uint8Array(16+16384);rom.set([78,69,83,26,1,0]);rom.fill(0xea,16);rom.set([0,128,0,128,0,128],rom.length-6);
const player=Object.create(window.NESLabPlayer.prototype);
player.pause=()=>{};player.held=new Set();player.image={data:new Uint8ClampedArray(256*240*4)};
player.context={fillRect(){},putImageData(){}};player.setEnabled=()=>{};player.updateStatus=()=>{};
player.load({romBase64:Buffer.from(rom).toString('base64'),mapper:0});
assert.ok(player.nes);assert.equal(player.nes.ppu.clipToTvSize,false);
const ppu=player.nes.ppu;ppu.f_bgClipping=1;ppu.f_spClipping=1;ppu.buffer.fill(0x443322);
ppu.buffer[0]=255;ppu.buffer[255]=65280;ppu.buffer[239*256]=16711680;ppu.buffer[240*256-1]=16777215;
ppu.endFrame();
for(const [index,rgb] of [[0,[255,0,0]],[255,[0,255,0]],[239*256,[0,0,255]],[240*256-1,[255,255,255]]]){
 assert.deepEqual(Array.from(player.image.data.slice(index*4,index*4+3)),rgb);
}
console.log('Full 256x240 frame preserved: overscan off; all four corner markers reach canvas unchanged.');
