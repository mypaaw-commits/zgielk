const $ = id => document.getElementById(id);
let currentFile = null;
let busy = false;
let ready = false;
let player = null;
const hex = n => '0x' + n.toString(16).toUpperCase().padStart(6, '0');
function element(tag, text) { const node = document.createElement(tag); node.textContent = text; return node; }
async function send(path, file, extraHeaders = {}) {
  let response;
  try {
    response = await fetch(path, {method:'POST', headers:{'Content-Type':'application/octet-stream',...extraHeaders}, body:file, signal:AbortSignal.timeout(30000)});
  } catch(error) {
    throw new Error(error.name === 'TimeoutError' ? 'Serwer nie odpowiedział w ciągu 30 sekund. Spróbuj ponownie lub uruchom ponownie serwer NES LAB.' : 'Nie można połączyć się z analizatorem. Sprawdź, czy serwer NES LAB nadal działa, i odśwież stronę.');
  }
  const contentType = response.headers.get('Content-Type') || '';
  if (!response.ok) {
    const error = contentType.includes('application/json') ? await response.json() : null;
    throw new Error(error?.error || `Serwer zwrócił błąd HTTP ${response.status}. Uruchom serwer NES LAB zamiast zwykłego serwera plików.`);
  }
  if (!contentType.includes(['/api/export','/api/project'].includes(path) ? 'application/zip' : 'application/json')) {
    throw new Error('Ten adres wyświetla stronę, ale nie udostępnia analizatora NES LAB. Uruchom serwer Pythona zgodnie z instrukcją poniżej.');
  }
  return response;
}
async function analyze(file) {
  if (!file || busy) return;
  if (!ready) { $('startup').open=true; $('message').scrollIntoView({block:'center'}); return; }
  busy = true;
  currentFile = null;
  if(player){player.destroy();player=null;}
  $('runtime-panel').hidden=true;
  $('results').hidden = true;
  $('rom').disabled = true;
  $('message').textContent = `Analizuję ${file.name} (${file.size.toLocaleString('pl')} bajtów)…`;
  $('message').scrollIntoView({block:'center'});
  try {
    if (file.size > 32 * 1024 * 1024) throw new Error('Limit pliku to 32 MiB.');
    const report = await (await send('/api/analyze', file)).json();
    currentFile = file;
    window.dispatchEvent(new CustomEvent("neslab-analysis",{detail:report}));
    const support=report.runtime;
    $('preview').disabled=!support.available;
    $('generate').disabled=!support.available;
    $('compatibility').textContent=support.available?'Projekt offline: play.html + runtime JavaScript + ROM + surowe dane + analiza 6502. To emulacja, nie natywny port.':support.reasons.join(' ');
    const code=report.code_analysis;
    $('code-summary').textContent=`${code.instruction_count.toLocaleString('pl')} kandydatów na instrukcje; ${code.coverage_bytes.toLocaleString('pl')} bajtów osiągalnych statycznie. ${code.warnings.join(' ')}`;
    $('filename').textContent = file.name;
    $('stats').replaceChildren();
    for (const [label, value] of [['FORMAT',report.format],['MAPPER',report.mapper],['PRG-ROM',report.prg_bytes.toLocaleString('pl')+' B'],['KAFELKI CHR',report.tiles.toLocaleString('pl')]]) {
      const node = element('div',''); node.className='stat'; node.append(element('strong',value),element('span',label)); $('stats').append(node);
    }
    $('regions').replaceChildren();
    for (const region of report.regions) { const row = element('tr',''); for (const value of [region.name,hex(region.offset),region.size.toLocaleString('pl')]) row.append(element('td',value)); $('regions').append(row); }
    $('details').replaceChildren();
    for (const [label,value] of [['Mirroring (nagłówek)',report.mirroring],['Bateria',report.battery?'Tak':'Nie'],['Submapper',report.submapper ?? '—'],['Wektory CPU (NROM)',report.vectors ? Object.entries(report.vectors).map(([k,v])=>`${k}: ${v}`).join(' · '):'Nieustalone']]) $('details').append(element('dt',label),element('dd',value));
    $('hash').textContent=report.sha256;
    for (const key of ['warnings','limitations']) $(key).replaceChildren(...report[key].map(text=>element('li',text)));
    $('strings').replaceChildren();
    for (const item of report.strings) { const row=element('div',''); row.className='string'; row.append(element('span',hex(item.prg_offset)),element('span',item.text)); $('strings').append(row); }
    if (!report.strings.length) $('strings').append(element('p','Brak kandydatów. To nie wyklucza tekstu we własnym kodowaniu gry.'));
    drawTiles(report.preview_chr_base64);
    $('results').hidden=false;
    $('message').textContent='Analiza gotowa. Zajrzyj do opisu gry, grafiki i referencji poziomów.';
    $('results').scrollIntoView({block:'start'});
  } catch(error) { $('message').textContent=error.message; }
  finally { busy=false; $('rom').disabled=false; $('rom').value=''; }
}
function drawTiles(base64) {
    const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
    $('tiles').hidden=!bytes.length; $('chr-empty').hidden=!!bytes.length;
    const context=$('tiles').getContext('2d');
    const image=context.createImageData(128,256); const palette=[18,83,158,241];
    for(let tile=0;tile<Math.floor(bytes.length/16);tile++) for(let y=0;y<8;y++) for(let x=0;x<8;x++) {
      const color=palette[((bytes[tile*16+y]>>(7-x))&1)|(((bytes[tile*16+y+8]>>(7-x))&1)<<1)];
      const offset=(((Math.floor(tile/16)*8+y)*128)+(tile%16)*8+x)*4;
      image.data.set([color,color,color,255],offset);
    }
    context.putImageData(image,0,0);
}
$('rom').addEventListener('change',event=>analyze(event.target.files[0]));
for (const name of ['dragenter','dragover']) $('upload').addEventListener(name,event=>{event.preventDefault();$('upload').classList.add('drag');});
for (const name of ['dragleave','drop']) $('upload').addEventListener(name,event=>{event.preventDefault();$('upload').classList.remove('drag');});
$('upload').addEventListener('drop',event=>analyze(event.dataTransfer.files[0]));
$('export').addEventListener('click',async()=>{
  if (!currentFile || busy) return;
  busy=true; $('export').disabled=true; $('rom').disabled=true;
  try { const blob=await (await send('/api/export',currentFile)).blob(); const url=URL.createObjectURL(blob); const link=document.createElement('a'); link.href=url;link.download='neslab-export.zip';link.click();setTimeout(()=>URL.revokeObjectURL(url),10000); }
  catch(error) {$('message').textContent=error.message;}
  finally {busy=false;$('export').disabled=false;$('rom').disabled=false;}
});

$('preview').addEventListener('click',async()=>{
  if(!currentFile||busy)return;
  busy=true;$('preview').disabled=true;
  $('message').textContent='Przygotowywanie podglądu gry…';
  try{
    const config=await(await send('/api/runtime',currentFile)).json();
    if(player)player.destroy();
    player=new NESLabPlayer($('player'));player.load(config);
    window.neslabPlayer=player;
    $('runtime-panel').hidden=false;$('runtime-panel').scrollIntoView({block:'start'});
    $('message').textContent='Podgląd gotowy. Kliknij Uruchom w panelu gry.';
  }catch(error){$('message').textContent=error.message;}
  finally{busy=false;$('preview').disabled=false;}
});
$('generate').addEventListener('click',async()=>{
  if(!currentFile||busy)return;
  busy=true;$('generate').disabled=true;
  $('message').textContent='Generowanie projektu JavaScript…';
  try{
    const blob=await(await send('/api/project',currentFile)).blob();
    const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='neslab-project.zip';link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
    $('message').textContent='Projekt wygenerowany. Rozpakuj ZIP i otwórz play.html. Nie wymaga Pythona ani internetu.';
  }catch(error){$('message').textContent=error.message;}
  finally{busy=false;$('generate').disabled=false;}
});

async function initialize() {
  try {
    if (location.protocol === 'file:') throw new Error('Otwarty jest sam plik HTML. Analizator wymaga uruchomienia serwera Pythona — instrukcja poniżej.');
    const response = await fetch('/api/health', {signal:AbortSignal.timeout(5000)});
    if (!response.ok || !(response.headers.get('Content-Type') || '').includes('application/json') || (await response.json()).app !== 'neslab') {
      throw new Error('Analizator NES LAB nie jest dostępny pod tym adresem. Uruchom serwer Pythona zgodnie z instrukcją poniżej.');
    }
    ready=true; $('rom').disabled=false;
    $('message').textContent='Analizator jest gotowy. Wybierz ROM, aby wyświetlić raport i grafikę.';
  } catch(error) {
    $('message').textContent=error.message.startsWith('Otwarty') || error.message.startsWith('Analizator') ? error.message : 'Brak połączenia z serwerem NES LAB. Uruchom go zgodnie z instrukcją poniżej i odśwież stronę.';
    $('startup').open=true;
  }
}
initialize();
