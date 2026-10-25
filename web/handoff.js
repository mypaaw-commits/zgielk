/* Reconstruction evidence is a separate workflow from the room's game player. */
(()=>{
 let file=null,observations=[],pending=false;
 const modal=$('handoff-dialog');
 function selected(next){if(file!==next){file=next;observations=[];$('handoff-notes').value='';}render();}
 function render(){
  $('handoff-filename').textContent=file?file.name:'Nie wybrano pliku.';
  $('capture-observation').disabled=pending||file!==cartridge||!emulator?.nes||emulator.frameCount<1||observations.length>=12;
  $('export-handoff').disabled=pending||!file;$('handoff-rom').disabled=pending;
  $('observation-list').replaceChildren();
  observations.forEach((item,index)=>{const li=document.createElement('li');li.textContent=`${item.label} — klatka ${item.frame} `;const remove=document.createElement('button');remove.textContent='Usuń';remove.className='quiet';remove.disabled=pending;remove.onclick=()=>{observations.splice(index,1);render();};li.append(remove);$('observation-list').append(li);});
 }
 $('open-handoff').onclick=()=>{if(emulator)emulator.pause();if(cartridge&&file!==cartridge)selected(cartridge);else render();modal.showModal();};
 $('close-handoff').onclick=()=>modal.close();
 $('handoff-rom').onchange=event=>{const next=event.target.files[0];if(next){selected(next);$('handoff-status').textContent='Plik wybrany. Możesz eksportować surowe materiały lub wczytać tę grę w emulatorze, aby zebrać obserwacje.';}event.target.value='';};
 $('capture-observation').onclick=()=>{
  try{
   if(pending||file!==cartridge||!emulator?.nes||observations.length>=12)return;
   emulator.pause();const s=emulator.snapshot();
   observations.push({label:$('observation-name').value.trim()||`Obserwacja ${observations.length+1}`,rom_sha256:s.rom_sha256,frame:s.frame,
    screenshot_png:s.screenshot_png,chr_base64:s.patterns.chr_base64,ram:s.ram,oam:s.oam,ppu_vram:s.ppu_vram.slice(0,16384),inputs:s.inputs,input_log_may_be_truncated:s.input_log_may_be_truncated});
   $('observation-name').value='';$('handoff-status').textContent='Zachowano dowody dla tej klatki. Zbierz inne zachowania, a potem pobierz pakiet. Obserwacje pozostają w tej karcie do jej zamknięcia.';render();
  }catch(error){$('handoff-status').textContent=error.message;}
 };
 function asBase64(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=()=>reject(new Error('Nie można odczytać pliku.'));reader.readAsDataURL(blob);});}
 $('export-handoff').onclick=async()=>{
  if(pending||!file)return;pending=true;render();$('handoff-status').textContent='Budowanie pakietu dowodów…';
  try{
   if(file.size>32*1024*1024)throw new Error('Limit pliku: 32 MiB.');
   const payload={rom_base64:await asBase64(file),observations,notes:$('handoff-notes').value};
   const response=await fetch('/api/handoff',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(60000)});
   if(!response.ok){const error=await response.json();throw new Error(error.error||'Nie udało się przygotować pakietu.');}
   const url=URL.createObjectURL(await response.blob());const a=document.createElement('a');a.href=url;a.download='reconstruction-pack.zip';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
   $('handoff-status').textContent='Pakiet gotowy. Przekaż cały ZIP do pracy nad nowym silnikiem. HANDOFF.md opisuje materiały, a reconstruction-spec.json wskazuje nierozpoznane elementy.';
  }catch(error){$('handoff-status').textContent=error.message;}finally{pending=false;render();}
 };
})();
