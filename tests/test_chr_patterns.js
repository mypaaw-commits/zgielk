/* Execute a synthetic CHR-RAM cartridge; verify exact reconstructed bitplanes. */
const assert=require('node:assert/strict');
global.window={};
require('../web/player.js');
const {NES}=require('../web/vendor/jsnes-patched.min.js');
const rom=new Uint8Array(16+16384);rom.set([78,69,83,26,1,0]);
const code=[];
const lda=n=>code.push(0xa9,n),sta=n=>code.push(0x8d,n&255,n>>>8);
code.push(0x78);lda(0);sta(0x2000);sta(0x2001);
for(const [address,value] of [[0,128],[8,64],[4096,255]]){lda(address>>>8);sta(0x2006);lda(address&255);sta(0x2006);lda(value);sta(0x2007);}
const loop=0x8000+code.length;code.push(0x4c,loop&255,loop>>>8);rom.set(code,16);
for(let i=0;i<3;i++)rom.set([0,128],16+16384-6+i*2);
const player=Object.create(window.NESLabPlayer.prototype);
player.nes=new NES({emulateSound:false});player.nes.loadROM(rom);player.config={sha256:'synthetic'};player.frameCount=0;
assert.throws(()=>player.patternSnapshot(),/uruchom/);
player.nes.frame();player.nes.frame();player.frameCount=2;
const captured=player.patternSnapshot();const bytes=Buffer.from(captured.chr_base64,'base64');
assert.equal(bytes.length,8192);assert.equal(captured.frame,2);assert.equal(captured.rom_sha256,'synthetic');
const expected=Buffer.alloc(8192);expected[0]=128;expected[8]=64;expected[4096]=255;
assert.deepEqual(bytes,expected);
// Later graphics uploads replace the capture; no cached first-screen atlas.
player.nes.ppu.writeMem(0,0x55);
assert.equal(Buffer.from(player.patternSnapshot().chr_base64,'base64')[0],0x55);
console.log('CHR-RAM CPU upload, both pattern tables, exact bitplanes and refreshed snapshot: passed.');
