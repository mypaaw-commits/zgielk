/* Research workspace: curated profiles and observations remain distinct. */
let researchReport=null;
let references=[];
let lastPatterns=null;
let lastPatternPng=null;
function researchKey(){return 'neslab-research-v1:'+researchReport.sha256;}
function downloadJSON(value,name){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
function saveResearch(){
  try{localStorage.setItem(researchKey(),JSON.stringify({notes:$('research-notes').value,references}));$('notes-status').textContent='Zapisano w tej przeglądarce.';}
  catch(error){$('notes-status').textContent='Nie można zapisać lokalnie. Pobierz dokumentację JSON, aby zachować obserwacje.';}
}
function renderReferences(){
  $('level-captures').replaceChildren();
  if(!references.length){$('level-captures').append(element('p','Brak ujęć. Wygeneruj dostępny przykład lub zachowaj klatkę z podglądu gry.'));return;}
  references.forEach((reference,index)=>{
    const card=element('article','');const img=document.createElement('img');img.src=reference.screenshot_png;img.alt=reference.label;img.loading='lazy';
    card.append(img,element('h3',reference.label),element('p',`Klatka ${reference.frame} · ${reference.source}`));
    const remove=element('button','Usuń referencję');remove.className='secondary';remove.onclick=()=>{references.splice(index,1);renderReferences();saveResearch();};card.append(remove);$('level-captures').append(card);
  });
}
window.addEventListener('neslab-analysis',event=>{
  researchReport=event.detail;const game=researchReport.game;
  $('game-title').textContent=game.title;
  $('game-description').textContent=game.description;
  $('game-source').textContent=game.identification+' '+game.source;
  $('verification').textContent=researchReport.runtime.verification;
  $('mechanics').replaceChildren();
  for(const mechanic of game.mechanics){const card=element('div','');card.className='mechanic-card';card.append(element('h3',mechanic.name),element('p',mechanic.description),element('small',mechanic.evidence));$('mechanics').append(card);}
  if(!game.mechanics.length)$('mechanics').append(element('p','Mechaniki nie zostały rozpoznane. Opisz je na podstawie rozgrywki w notatkach poniżej.'));
  $('port-checklist').replaceChildren();
  for(const area of game.port_plan){const row=element('div','');row.className='check-row';row.append(element('strong',area.area),element('span',area.status));$('port-checklist').append(row);}
  $('example-level').disabled=!game.level_example.available||!researchReport.runtime.available;
  $('level-status').textContent=game.level_example.available?'Dostępny rzeczywisty przykład pierwszego etapu dla tego ROM-u.':'Automatyczny przykład nie jest dostępny. Użyj podglądu gry i zachowaj własną klatkę.';
  $('chr-bank').replaceChildren();
  const banks=Math.ceil(researchReport.chr_bytes/8192);
  for(let i=0;i<banks;i++){const option=element('option',`Bank ${i+1} / ${banks}`);option.value=i;$('chr-bank').append(option);}
  $('chr-bank').disabled=!banks;$('bank-status').textContent=banks?`${banks} banków CHR-ROM. Umowna paleta; to surowe kafelki, nie gotowe obiekty.`:'Brak CHR-ROM. Grafika powstaje w CHR-RAM podczas działania gry.';
  lastPatterns=null;lastPatternPng=null;
  $('chr-source').querySelector('[value="rom"]').disabled=!banks;
  $('chr-source').value=banks?'rom':'ppu';
  $('capture-patterns').disabled=!researchReport.runtime.available;
  $('download-patterns').disabled=true;$('download-pattern-png').disabled=true;
  if(!banks)$('bank-status').textContent=researchReport.runtime.available?'Grafika ładowana do CHR-RAM. Kliknij „Odczytaj grafikę z gry”; uruchomię podgląd i wykonam pierwsze 180 klatek.':'Grafika wymaga CHR-RAM, ale ten ROM nie jest obsługiwany przez obecny emulator. '+researchReport.runtime.reasons.join(' ');
  references=[];$('research-notes').value='';$('notes-status').textContent='Notatki są przypisane do SHA-256 tego ROM-u.';
  try{const saved=JSON.parse(localStorage.getItem(researchKey())||'{}');$('research-notes').value=typeof saved.notes==='string'?saved.notes:'';references=validReferences(saved.references||[]);}catch(error){$('notes-status').textContent='Nie odczytano poprzednich notatek. Możesz wczytać kopię JSON.';}
  renderReferences();
});
$('chr-zoom').onchange=()=>{$('tiles').style.width=$('chr-zoom').value+'px';};
$('chr-bank').onchange=async()=>{
  if(busy||!currentFile)return;
  busy=true;$('chr-bank').disabled=true;
  try{const data=await(await send('/api/chr',currentFile,{'X-CHR-Bank':$('chr-bank').value})).json();drawTiles(data.preview_chr_base64);$('bank-status').textContent=`Bank ${data.bank+1} załadowany. Umowna paleta; oryginalne kolory zależą od PPU.`;}
  catch(error){$('bank-status').textContent=error.message;}finally{busy=false;$('chr-bank').disabled=false;}
};
$('chr-source').onchange=()=>{
  if(busy)return;
  const fromPPU=$('chr-source').value==='ppu';
  $('chr-bank').disabled=fromPPU;
  if(fromPPU){
    drawTiles(lastPatterns?.chr_base64||'');
    $('bank-status').textContent=lastPatterns?`Wzorce PPU z klatki ${lastPatterns.frame}. ${lastPatterns.notice}`:'Kliknij „Odczytaj grafikę z gry”. Zrzut obejmie aktualnie załadowane kafelki.';
  }else{$('chr-bank').onchange();}
};
$('capture-patterns').onclick=async()=>{
  if(busy||!currentFile)return;
  busy=true;$('capture-patterns').disabled=true;$('chr-source').disabled=true;
  try{
    const instance=await ensurePlayer();
    instance.pause();
    if(instance.frameCount===0){
      for(let i=0;i<180;i++){
        instance.advance();
        if(instance.nes.crashed)throw new Error('Emulator zatrzymał się podczas ładowania grafiki.');
        if(i%30===0){$('bank-status').textContent=`Ładowanie CHR-RAM: ${i}/180 klatek…`;await new Promise(resolve=>setTimeout(resolve,0));}
      }
    }
    lastPatterns=instance.patternSnapshot();
    $('chr-source').value='ppu';$('chr-bank').disabled=true;
    drawTiles(lastPatterns.chr_base64);lastPatternPng=$('tiles').toDataURL('image/png');
    $('download-patterns').disabled=false;$('download-pattern-png').disabled=false;
    const empty=!Uint8Array.from(atob(lastPatterns.chr_base64),c=>c.charCodeAt(0)).some(value=>value!==0);
    $('bank-status').textContent=`Odczytano 512 kafelków (8 KiB) z klatki ${lastPatterns.frame}. `+(empty?'PPU jest jeszcze puste. Uruchom grę, przejdź dalej i ponów odczyt. ':'' )+'To bieżący stan, nie cała grafika gry. Paleta podglądu jest umowna.';
  }catch(error){$('bank-status').textContent=error.message;}
  finally{busy=false;$('capture-patterns').disabled=false;$('chr-source').disabled=false;}
};
function downloadBlob(blob,name){const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
$('download-patterns').onclick=()=>{if(lastPatterns)downloadBlob(new Blob([Uint8Array.from(atob(lastPatterns.chr_base64),c=>c.charCodeAt(0))],{type:'application/octet-stream'}),`ppu-chr-frame-${lastPatterns.frame}.bin`);};
$('download-pattern-png').onclick=()=>{if(lastPatternPng){const link=document.createElement('a');link.href=lastPatternPng;link.download=`ppu-atlas-frame-${lastPatterns.frame}.png`;link.click();}};
function captureReference(instance,label,source){
  if(references.length>=8)throw new Error('Limit 8 ujęć na ROM. Wyeksportuj dokumentację i usuń starsze referencje.');
  if(!instance?.nes||instance.frameCount<1)throw new Error('Najpierw uruchom podgląd gry i przejdź do wybranego miejsca.');
  const ppu=instance.nes.ppu;
  const tables=[];
  for(let table=0;table<4;table++){
    const bytes=[];
    for(let i=0;i<1024;i++){const address=0x2000+table*1024+i;const mapped=ppu.vramMirrorTable?.[address]??address;bytes.push(ppu.vramMem[mapped]||0);}
    tables.push({address:0x2000+table*1024,width:32,height:30,tile_ids:bytes.slice(0,960),attributes:bytes.slice(960)});
  }
  references.push({label,source,frame:instance.frameCount,screenshot_png:instance.canvas.toDataURL('image/png'),frame_hash:instance.frameHash,ppu_nametables:tables,oam:Array.from(ppu.spriteMem),inputs:instance.inputs.slice(),notice:'Obserwacja obrazu i PPU, nie wyodrębniony format poziomu ani mapa kolizji.'});
  renderReferences();saveResearch();
}
$('capture-level').onclick=()=>{
  if(busy)return;
  try{if(player)player.pause();captureReference(player,`Obserwacja ${references.length+1}`,'Ujęcie zachowane przez użytkownika.');$('level-status').textContent='Zachowano klatkę i tablice PPU. Zapisz kontekst w notatkach.';}
  catch(error){$('level-status').textContent=error.message;}
};
$('example-level').onclick=async()=>{
  if(busy||!currentFile||!researchReport.game.level_example.available)return;
  busy=true;$('example-level').disabled=true;let example=null;
  try{
    if(references.length>=8)throw new Error('Limit 8 ujęć. Usuń wcześniejszą referencję.');
    const recipe=researchReport.game.level_example;
    const config=await(await send('/api/runtime',currentFile)).json();
    example=new NESLabPlayer($('example-player'));example.load(config);
    if(!example.nes)throw new Error('Nie można uruchomić przykładu.');
    for(let frame=0;frame<recipe.capture_frame;frame++){
      for(const input of recipe.recipe)if(input.frame===frame)example.button(input.button,input.down);
      example.advance();
      if(frame%60===0){$('level-status').textContent=`Odtwarzanie przykładu: ${Math.round(frame/recipe.capture_frame*100)}%`;await new Promise(resolve=>setTimeout(resolve,0));}
      if(example.nes.crashed)throw new Error('Emulator zatrzymał się podczas odtwarzania przykładu.');
    }
    captureReference(example,recipe.label,recipe.source);$('level-status').textContent='Zachowano rzeczywisty obraz etapu i tablice PPU. Brak dekodera mapy kolizji.';
  }catch(error){$('level-status').textContent=error.message;}
  finally{if(example)example.destroy();busy=false;$('example-level').disabled=false;}
};
$('research-notes').addEventListener('input',saveResearch);
$('export-design').onclick=()=>{if(researchReport)downloadJSON({format:'neslab-research-v1',rom_sha256:researchReport.sha256,game:researchReport.game,compatibility:researchReport.runtime,notes:$('research-notes').value,references},'neslab-research.json');};
function validReferences(value){
  if(!Array.isArray(value)||value.length>8)throw new Error('Nieprawidłowa liczba referencji.');
  for(const item of value)if(!item||typeof item.label!=='string'||item.label.length>200||typeof item.source!=='string'||item.source.length>2000||!Number.isSafeInteger(item.frame)||item.frame<0||typeof item.screenshot_png!=='string'||item.screenshot_png.length>500000||!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(item.screenshot_png))throw new Error('Nieprawidłowa referencja obrazu.');
  return value;
}
$('import-design').onchange=async event=>{
  const file=event.target.files[0];if(!file)return;
  try{
    if(file.size>5*1024*1024)throw new Error('Limit dokumentacji to 5 MiB.');
    const data=JSON.parse(await file.text());
    if(data.format!=='neslab-research-v1'||data.rom_sha256!==researchReport.sha256)throw new Error('Dokumentacja dotyczy innego ROM-u lub ma nieprawidłowy format.');
    const imported=validReferences(data.references);
    if(typeof data.notes!=='string'||data.notes.length>100000)throw new Error('Nieprawidłowe notatki.');
    references=imported;$('research-notes').value=data.notes;renderReferences();saveResearch();$('notes-status').textContent='Wczytano notatki i referencje dla tego ROM-u.';
  }catch(error){$('notes-status').textContent=error.message;}
  finally{event.target.value='';}
};
