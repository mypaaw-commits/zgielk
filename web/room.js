const $=id=>document.getElementById(id);
let emulator=null,cartridge=null,loading=false;
window.nesRoom={get player(){return emulator;}};
function message(text,error=false){$('message').textContent=text;$('message').classList.toggle('error',error);}
function sync(){
  const loaded=!!emulator?.nes;
  $('pause').disabled=!loaded;$('restart').disabled=!loaded;$('sound').disabled=!loaded;
  $('pause-text').textContent=emulator?.running?'Pauza':'Graj';
  $('sound').setAttribute('aria-pressed',String(!!emulator?.muted));
  $('sound').setAttribute('aria-label',emulator?.muted?'Włącz dźwięk':'Wyłącz dźwięk');
  $('touch-controls').hidden=!loaded;
}
async function loadFile(file){
  if(!file||loading)return;
  loading=true;$('loading').hidden=false;$('rom').disabled=true;
  if(emulator)emulator.pause();
  message('Wkładam kartridż…');
  try{
    if(file.size>32*1024*1024)throw new Error('Ten plik jest za duży. Limit wynosi 32 MiB.');
    if(location.protocol==='file:')throw new Error('Uruchom START-WINDOWS.bat lub START-MAC-LINUX.command. Sam plik HTML nie uruchamia emulatora.');
    const response=await fetch('/api/runtime',{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:file,signal:AbortSignal.timeout(20000)});
    if(!(response.headers.get('Content-Type')||'').includes('application/json'))throw new Error('Serwer emulatora nie jest dostępny. Uruchom aplikację z pliku START.');
    const config=await response.json();
    if(!response.ok)throw new Error(config.error||'Nie udało się wczytać gry.');
    if(emulator)emulator.destroy();
    emulator=new NESLabPlayer($('player'));
    const pause=emulator.pause.bind(emulator);
    emulator.pause=()=>{pause();sync();};
    const advance=emulator.advance.bind(emulator);
    emulator.advance=()=>{advance();if(emulator?.nes?.crashed)message('Gra zatrzymała się z powodu błędu emulacji. Możesz spróbować restartu.',true);};
    emulator.load(config);
    if(!emulator.nes)throw new Error('Ten ROM nie uruchomił się w obecnym emulatorze. Spróbuj innego pliku.');
    cartridge=file;$('game-name').textContent=file.name;
    $('welcome').hidden=true;$('player').hidden=false;
    $('television').classList.add('playing');
    await emulator.start();sync();
    message('Kartridż gotowy. Enter to Start. Miłej gry.');
  }catch(error){
    const connection=['TypeError','TimeoutError'].includes(error.name);
    message(connection?'Brak odpowiedzi serwera. Sprawdź, czy okno aplikacji nadal jest otwarte, i spróbuj ponownie.':error.message,true);
    if(!emulator?.nes){if(emulator)emulator.destroy();emulator=null;cartridge=null;$('game-name').textContent='Jeszcze żadna gra';$('welcome').hidden=false;$('player').hidden=true;$('television').classList.remove('playing');}
    sync();
  }finally{loading=false;$('loading').hidden=true;$('rom').disabled=false;$('rom').value='';}
}
$('rom').onchange=event=>loadFile(event.target.files[0]);
for(const name of ['dragenter','dragover'])$('screen').addEventListener(name,event=>{event.preventDefault();$('screen').classList.add('drag');});
for(const name of ['dragleave','drop'])$('screen').addEventListener(name,event=>{event.preventDefault();$('screen').classList.remove('drag');});
$('screen').addEventListener('drop',event=>loadFile(event.dataTransfer.files[0]));
// Prevent dropping a ROM outside the television from navigating away.
document.addEventListener('dragover',event=>event.preventDefault());
document.addEventListener('drop',event=>event.preventDefault());
$('pause').onclick=async()=>{if(!emulator||loading)return;if(emulator.running)emulator.pause();else await emulator.start();sync();};
$('restart').onclick=async()=>{if(emulator?.config&&!loading){emulator.load(emulator.config);await emulator.start();sync();message('Jeszcze raz. Gra uruchomiona od początku.');}};
$('sound').onclick=()=>{if(!emulator)return;emulator.muted=!emulator.muted;if(emulator.muted)emulator.clearAudio();else if(emulator.audio)emulator.audio.resume().catch(()=>message('Przeglądarka nie pozwoliła włączyć dźwięku.',true));sync();};
$('crt').onclick=()=>{const enabled=$('crt').getAttribute('aria-pressed')!=='true';$('crt').setAttribute('aria-pressed',String(enabled));$('television').classList.toggle('no-crt',!enabled);};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if($('television').requestFullscreen)await $('television').requestFullscreen();else throw new Error();if(emulator)emulator.canvas.focus();}catch(error){message('Ta przeglądarka nie udostępnia pełnego ekranu.',true);}};
$('help').onclick=()=>{if(emulator)emulator.pause();$('help-dialog').showModal();};
$('close-help').onclick=()=>$('help-dialog').close();
$('help-dialog').addEventListener('click',event=>{if(event.target===$('help-dialog')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.target.close();}});
for(const button of $('touch-controls').querySelectorAll('[data-key]')){
  button.onpointerdown=event=>{event.preventDefault();if(!emulator||loading)return;button.setPointerCapture(event.pointerId);emulator.button(button.dataset.key,true);};
  for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>emulator?.button(button.dataset.key,false));
}
document.addEventListener('visibilitychange',sync);
if(location.protocol==='file:')message('Uruchom START-WINDOWS.bat lub START-MAC-LINUX.command, aby otworzyć emulator.',true);
