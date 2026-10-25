/* NES LAB runtime adapter. JSNES remains responsible for CPU, PPU, APU and mappers. */
class NESLabPlayer {
  constructor(container) {
    this.container=container;
    this.container.tabIndex=0;
    this.container.classList.add('nes-player');
    this.container.innerHTML=`<canvas width="256" height="240" tabindex="0" aria-label="Ekran gry NES"></canvas>
      <div class="player-toolbar"><button data-action="run">Uruchom</button><button data-action="step">1 klatka</button><button data-action="reset">Restart</button><button data-action="sound">Dźwięk: wł.</button><button data-action="snapshot">Pobierz stan JSON</button></div>
      <p class="player-status" role="status" aria-live="polite">Wczytaj ROM.</p>
      <p class="player-help">Strzałki: ruch · X: A · Z: B · Enter: Start · Shift: Select. Kliknij ekran przed użyciem klawiatury.</p>
      <div class="player-pad"><button data-key="ArrowLeft" aria-label="Lewo">←</button><button data-key="ArrowUp" aria-label="Góra">↑</button><button data-key="ArrowDown" aria-label="Dół">↓</button><button data-key="ArrowRight" aria-label="Prawo">→</button><button data-key="ShiftLeft">Select</button><button data-key="Enter">Start</button><button data-key="KeyZ">B</button><button data-key="KeyX">A</button></div>`;
    this.canvas=container.querySelector('canvas');
    this.context=this.canvas.getContext('2d');
    this.image=this.context.createImageData(256,240);
    this.status=container.querySelector('.player-status');
    this.runButton=container.querySelector('[data-action="run"]');
    this.soundButton=container.querySelector('[data-action="sound"]');
    this.running=false;this.runToken=0;this.frameCount=0;this.animation=null;this.muted=false;
    this.inputs=[];this.held=new Set();this.audio=null;this.audioTime=0;this.audioSources=new Set();
    this.sampleL=[];this.sampleR=[];
    this.keyMap={KeyX:0,KeyZ:1,ShiftLeft:2,ShiftRight:2,Enter:3,ArrowUp:4,ArrowDown:5,ArrowLeft:6,ArrowRight:7};
    this.keydown=event=>{if(event.code in this.keyMap){event.preventDefault();if(!event.repeat)this.button(event.code,true);}};
    this.keyup=event=>{if(event.code in this.keyMap){event.preventDefault();this.button(event.code,false);}};
    container.addEventListener('keydown',this.keydown);
    container.addEventListener('keyup',this.keyup);
    this.blur=()=>this.releaseAll();
    window.addEventListener('blur',this.blur);
    container.addEventListener('focusout',event=>{if(!container.contains(event.relatedTarget))this.releaseAll();});
    this.visibility=()=>{if(document.hidden)this.pause();};
    document.addEventListener('visibilitychange',this.visibility);
    container.querySelector('[data-action="run"]').onclick=()=>this.running?this.pause():this.start();
    container.querySelector('[data-action="step"]').onclick=()=>{this.pause();this.advance();};
    container.querySelector('[data-action="reset"]').onclick=()=>{if(this.config)this.load(this.config);};
    this.soundButton.onclick=()=>{this.muted=!this.muted;this.soundButton.textContent='Dźwięk: '+(this.muted?'wył.':'wł.');if(this.muted)this.clearAudio();};
    container.querySelector('[data-action="snapshot"]').onclick=()=>this.downloadState();
    for(const button of container.querySelectorAll('[data-key]')) {
      button.style.touchAction='none';
      button.onpointerdown=event=>{event.preventDefault();button.setPointerCapture(event.pointerId);this.button(button.dataset.key,true);};
      for(const event of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(event,()=>this.button(button.dataset.key,false));
    }
  }
  load(config) {
    this.pause();this.config=config;this.frameCount=0;this.inputs=[];this.held.clear();this.frameHash=null;
    try {
      this.nes=new jsnes.NES({sampleRate:48000,emulateSound:true,
        onFrame:buffer=>{
          let hash=2166136261;
          for(let i=0;i<buffer.length;i++) {
            const pixel=buffer[i],j=i*4;
            this.image.data[j]=pixel&255;this.image.data[j+1]=(pixel>>>8)&255;this.image.data[j+2]=(pixel>>>16)&255;this.image.data[j+3]=255;
            hash=Math.imul(hash^pixel,16777619)>>>0;
          }
          this.frameHash=hash.toString(16).padStart(8,'0');this.context.putImageData(this.image,0,0);
        },
        onAudioSample:(left,right)=>{if(this.audio&&this.running&&!this.muted){this.sampleL.push(left);this.sampleR.push(right);}}
      });
      const bytes=Uint8Array.from(atob(config.romBase64),c=>c.charCodeAt(0));
      this.nes.loadROM(bytes);
      // Preserve all 256×240 pixels. A real TV's overscan is decorative, not a crop.
      this.nes.ppu.clipToTvSize=false;
      this.context.fillStyle='#000';this.context.fillRect(0,0,256,240);
      this.setEnabled(true);
      this.updateStatus('ROM gotowy. Kliknij Uruchom albo 1 klatka.');
    } catch(error) {this.nes=null;this.setEnabled(false);this.status.textContent='Nie udało się uruchomić ROM-u: '+error.message;}
  }
  setEnabled(enabled) {for(const button of this.container.querySelectorAll('button'))button.disabled=!enabled;}
  updateStatus(text='Pauza.') {this.status.textContent=`${text} Klatka: ${this.frameCount}. Mapper: ${this.config?.mapper??'—'}.`;}
  async start() {
    if(!this.nes||this.running)return;
    const token=++this.runToken;
    this.running=true;this.runButton.textContent='Pauza';this.canvas.focus();
    try {
      if(!this.audio&&window.AudioContext)this.audio=new AudioContext({sampleRate:48000});
      if(this.audio)this.audio.resume().catch(()=>{this.muted=true;this.soundButton.textContent='Dźwięk: niedostępny';});
    } catch(error) {this.muted=true;this.soundButton.textContent='Dźwięk: niedostępny';}
    if(!this.running||this.runToken!==token)return;
    this.lastTime=null;this.accumulator=0;
    const loop=time=>{
      if(!this.running||this.runToken!==token)return;
      if(this.lastTime===null)this.lastTime=time-1000/60;
      this.accumulator+=Math.min(time-this.lastTime,100);this.lastTime=time;
      let count=0;
      while(this.accumulator>=1000/60&&count++<3&&this.running){this.accumulator-=1000/60;this.advance();}
      if(count>=3)this.accumulator=0;
      if(this.running)this.animation=requestAnimationFrame(loop);
    };
    this.animation=requestAnimationFrame(loop);
  }
  advance() {
    if(!this.nes)return;
    this.sampleL.length=0;this.sampleR.length=0;
    try {this.nes.frame();this.frameCount++;this.flushAudio();this.updateStatus(this.running?'Działa.':'Pauza.');}
    catch(error){this.pause();this.status.textContent=`Błąd emulacji w klatce ${this.frameCount}: ${error.message}`;}
  }
  flushAudio() {
    if(!this.audio||this.audio.state!=='running'||this.muted||!this.sampleL.length)return;
    const buffer=this.audio.createBuffer(2,this.sampleL.length,48000);
    buffer.getChannelData(0).set(this.sampleL);buffer.getChannelData(1).set(this.sampleR);
    if(this.audioTime<this.audio.currentTime||this.audioTime>this.audio.currentTime+.2){this.clearAudio();this.audioTime=this.audio.currentTime+.025;}
    const source=this.audio.createBufferSource();source.buffer=buffer;source.connect(this.audio.destination);
    source.onended=()=>{source.disconnect();this.audioSources.delete(source);};
    this.audioSources.add(source);source.start(this.audioTime);this.audioTime+=buffer.duration;
  }
  clearAudio() {for(const source of this.audioSources){try{source.stop();}catch(error){/* Already stopped. */}source.disconnect();}this.audioSources.clear();this.audioTime=0;}
  pause() {this.running=false;this.runToken++;cancelAnimationFrame(this.animation);this.clearAudio();this.releaseAll();this.runButton.textContent='Uruchom';if(this.nes)this.updateStatus();}
  button(code,down) {
    if(!this.nes||!(code in this.keyMap))return;
    const key=this.keyMap[code];
    if(down===this.held.has(key))return;
    if(down){this.held.add(key);this.nes.buttonDown(1,key);}else{this.held.delete(key);this.nes.buttonUp(1,key);}
    if(this.inputs.length<20000)this.inputs.push({frame:this.frameCount,button:key,down});
  }
  releaseAll(){if(!this.held)return;for(const [code,key] of Object.entries(this.keyMap))if(this.held.has(key))this.button(code,false);}
  patternSnapshot() {
    if(!this.nes||this.frameCount<1)throw new Error('Najpierw uruchom grę, aby załadowała grafikę do PPU.');
    // Read the currently decoded pattern tiles, not PRG bytes or stale unmapped VRAM.
    const bytes=new Uint8Array(8192);
    for(let tile=0;tile<512;tile++)for(let y=0;y<8;y++)for(let x=0;x<8;x++){
      const pixel=this.nes.ppu.ptTile[tile].pix[y*8+x];
      bytes[tile*16+y]|=(pixel&1)<<(7-x);
      bytes[tile*16+y+8]|=((pixel>>1)&1)<<(7-x);
    }
    return {format:'neslab-pattern-snapshot-v1',rom_sha256:this.config.sha256,frame:this.frameCount,
      source:'PPU decoded pattern tables $0000-$1FFF',chr_base64:btoa(String.fromCharCode(...bytes)),
      notice:'Bieżące 8 KiB wzorców PPU. Nie obejmuje wszystkich banków ani grafiki z nieodwiedzonych ekranów; paleta atlasu jest umowna.'};
  }
  snapshot() {
    if(!this.nes)throw new Error('Brak wczytanego ROM-u.');
    return {format:'neslab-runtime-state-v1',engine:'JSNES 2.1.0 + NES LAB PPU fixes 1-2',rom_sha256:this.config.sha256,
      frame:this.frameCount,frame_hash:this.frameHash,frame_hash_algorithm:'fnv1a-u32-bgr',screenshot_png:this.canvas.toDataURL('image/png'),
      inputs:this.inputs.slice(),input_log_limit:20000,input_log_may_be_truncated:this.inputs.length>=20000,
      ram:Array.from(this.nes.cpu.mem.slice(0,2048)),ppu_vram:Array.from(this.nes.ppu.vramMem),oam:Array.from(this.nes.ppu.spriteMem),
      patterns:this.frameCount?this.patternSnapshot():null,state:this.nes.toJSON(),notice:'Zaobserwowany stan emulatora, nie rozpoznane struktury poziomów, fizyki lub animacji.'};
  }
  downloadState() {
    if(!this.nes)return;
    this.pause();
    const json=JSON.stringify(this.snapshot(),(key,value)=>ArrayBuffer.isView(value)?Array.from(value):value);
    const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download=`neslab-state-${this.frameCount}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
  }
  destroy(){this.pause();this.container.removeEventListener('keydown',this.keydown);this.container.removeEventListener('keyup',this.keyup);window.removeEventListener('blur',this.blur);document.removeEventListener('visibilitychange',this.visibility);if(this.audio)this.audio.close().catch(()=>{});this.container.replaceChildren();this.nes=null;}
}
window.NESLabPlayer=NESLabPlayer;
