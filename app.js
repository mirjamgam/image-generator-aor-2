// Art of Research 2026 · LinkedIn image generator
(function(){
  const C = {bg:"#480D43", blue:"#6B8CFF", light:"#C9D4FF", white:"#FFFFFF", deep:"#2F0A2D"};
  const DATE = "25–27 November 2026", PLACE = "Aalto University, Espoo";
  const LABEL = {attending:"I'M ATTENDING", presenting:"I'M PRESENTING", volunteering:"I'M VOLUNTEERING"};
  const POST = {
    attending:"I'm attending Art of Research 2026: Voices at Aalto University, 25–27 November 2026. Looking forward to three days of keynotes, sessions and the exhibition in Espoo. See you there?",
    presenting:"I'm presenting at Art of Research 2026: Voices at Aalto University, 25–27 November 2026. Come and say hello at my session!",
    volunteering:"I'm volunteering at Art of Research 2026: Voices at Aalto University, 25–27 November 2026. Find us at the info desk, in the session rooms and at the cloakrooms!"
  };
  const $ = id => document.getElementById(id);
  const cv = $("cv"), ctx = cv.getContext("2d");
  const state = {photo:null, zoom:1, ox:0, oy:0, mode:"attending", name:"", org:"", msg:"", fmt:"square", postEdited:false};

  function load(src){ return new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; }); }
  let AOR, HERO, AALTO;

  function geo(){
    // sets: [centre x, centre y, first radius, step, count] for the two families of circles
    if (state.fmt === "square") return {W:1200,H:1200,cx:820,cy:470,r:262,
      logo:[64,64,400],tx:64,label:372,nameLines:3,aalto:[1200-64-120,64,120],
      voices:[52,1200-64-154,560], dateY:930,
      sets:[[920,-220,140,102,6],[1300,560,110,110,7]]};
    return {W:1200,H:627,cx:930,cy:300,r:200,logo:[52,48,270],tx:52,label:262,nameLines:2,aalto:null,
      voices:[1200-52-240,627-28-66,240], dateY:579,
      sets:[[930,-170,120,95,6],[1250,200,90,95,6]]};
  }
  function wrap(text, maxW, maxLines){
    const words = text.split(/\s+/).filter(Boolean), lines = [];
    let cur = "";
    for (const w of words){
      const t = cur ? cur + " " + w : w;
      if (ctx.measureText(t).width <= maxW || !cur) cur = t; else { lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    if (lines.length > maxLines){ const keep = lines.slice(0, maxLines); keep[maxLines-1] = keep[maxLines-1].replace(/\s*\S*$/, "") + "…"; return keep; }
    return lines;
  }
  function spaced(text, x, y, px){
    if ("letterSpacing" in ctx){ ctx.letterSpacing = px + "px"; ctx.fillText(text, x, y); ctx.letterSpacing = "0px"; return; }
    ctx.fillText(text, x, y);
  }

  function draw(){
    const g = geo();
    if (cv.width !== g.W || cv.height !== g.H){ cv.width = g.W; cv.height = g.H; }
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = C.bg; ctx.fillRect(0,0,g.W,g.H);
    // resonance arcs around the photo
    ctx.save();
    ctx.strokeStyle = C.blue; ctx.lineWidth = 2.5;
    for (const [x, y, r0, step, n] of g.sets){
      for (let i = 0; i < n; i++){ ctx.beginPath(); ctx.arc(x, y, r0 + i*step, 0, Math.PI*2); ctx.stroke(); }
    }
    ctx.restore(); ctx.globalAlpha = 1;
    // VOICES wordmark, cut from the conference banner
    if (HERO){ const [x,y,w] = g.voices; ctx.drawImage(HERO, 60, 112, 870, 240, x, y, w, w*240/870); }
    const textRight = g.cx - g.r - 48;
    // logos
    if (AOR){ const [x,y,w] = g.logo; ctx.drawImage(AOR, x, y, w, w*292/600); }
    if (g.aalto && AALTO){ const [x,y,w] = g.aalto; ctx.drawImage(AALTO, x, y, w, w*357/440); }
    // photo
    ctx.beginPath(); ctx.arc(g.cx, g.cy, g.r + 12, 0, Math.PI*2); ctx.fillStyle = C.blue; ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(g.cx, g.cy, g.r, 0, Math.PI*2); ctx.clip();
    if (state.photo){
      const p = state.photo, s = Math.max(2*g.r/p.width, 2*g.r/p.height) * state.zoom;
      const k = g.r / 262; // offsets are stored for the square size
      ctx.drawImage(p, g.cx - p.width*s/2 + state.ox*k, g.cy - p.height*s/2 + state.oy*k, p.width*s, p.height*s);
    } else {
      ctx.fillStyle = C.deep; ctx.fillRect(g.cx-g.r, g.cy-g.r, 2*g.r, 2*g.r);
      ctx.fillStyle = "rgba(107,140,255,.55)";
      ctx.beginPath(); ctx.arc(g.cx, g.cy - g.r*0.22, g.r*0.32, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(g.cx, g.cy + g.r*0.75, g.r*0.62, g.r*0.5, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = C.light; ctx.font = `600 ${Math.round(g.r*0.12)}px Inter, Arial, sans-serif`; ctx.textAlign = "center";
      ctx.fillText("Your photo", g.cx, g.cy + g.r*0.28); ctx.textAlign = "left";
    }
    ctx.restore();
    // text
    const maxW = textRight - g.tx, sq = state.fmt === "square";
    let y = g.label;
    ctx.fillStyle = C.light; ctx.font = `700 ${sq?30:24}px Inter, Arial, sans-serif`;
    spaced(LABEL[state.mode], g.tx, y, 4);
    y += sq ? 26 : 20;
    const name = state.name.trim() || "Your Name";
    ctx.font = `800 ${sq?62:50}px Inter, Arial, sans-serif`; ctx.fillStyle = state.name.trim() ? C.white : "rgba(255,255,255,.45)";
    for (const l of wrap(name, maxW, g.nameLines)){ y += sq ? 68 : 56; ctx.fillText(l, g.tx, y); }
    if (state.org.trim()){
      ctx.font = `500 ${sq?30:24}px Inter, Arial, sans-serif`; ctx.fillStyle = C.light; y += sq ? 14 : 10;
      for (const l of wrap(state.org.trim(), maxW, 2)){ y += sq ? 40 : 32; ctx.fillText(l, g.tx, y); }
    }
    if (state.msg.trim()){
      ctx.font = `700 ${sq?32:26}px Inter, Arial, sans-serif`; ctx.fillStyle = C.white; y += sq ? 26 : 18;
      for (const l of wrap(state.msg.trim(), maxW, 1)){ y += sq ? 40 : 32; ctx.fillText(l, g.tx, y); }
    }
    const dy = g.dateY;
    ctx.fillStyle = C.white; ctx.font = `700 ${sq?30:24}px Inter, Arial, sans-serif`; ctx.fillText(DATE, g.tx, dy - (sq?40:32));
    ctx.fillStyle = C.light; ctx.font = `500 ${sq?26:21}px Inter, Arial, sans-serif`; ctx.fillText(PLACE, g.tx, dy);
  }

  // inputs
  function setPost(){ if (!state.postEdited) $("post").value = POST[state.mode]; }
  $("mode").addEventListener("change", e => { state.mode = e.target.value; setPost(); draw(); });
  $("name").addEventListener("input", e => { state.name = e.target.value; draw(); });
  $("org").addEventListener("input", e => { state.org = e.target.value; draw(); });
  $("msg").addEventListener("input", e => { state.msg = e.target.value; draw(); });
  $("post").addEventListener("input", () => { state.postEdited = true; });
  $("zoom").addEventListener("input", e => { state.zoom = parseFloat(e.target.value); draw(); });
  function fmt(f){ state.fmt = f; $("sq").setAttribute("aria-pressed", f === "square"); $("ls").setAttribute("aria-pressed", f !== "square"); $("fallback").hidden = true; draw(); }
  $("sq").addEventListener("click", () => fmt("square"));
  $("ls").addEventListener("click", () => fmt("landscape"));

  function readFile(f){
    if (!f || !/^image\//.test(f.type)){ $("status").textContent = "Please choose an image file (JPG or PNG)."; return; }
    const rd = new FileReader();
    rd.onload = async () => {
      const img = await load(rd.result);
      if (!img){ $("status").textContent = "This image couldn't be opened. Try a JPG or PNG."; return; }
      state.photo = img; state.zoom = 1; state.ox = 0; state.oy = 0; $("zoom").value = 1; $("status").textContent = ""; $("fallback").hidden = true; draw();
    };
    rd.readAsDataURL(f);
  }
  const drop = $("drop");
  drop.addEventListener("click", () => $("file").click());
  drop.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); $("file").click(); } });
  $("file").addEventListener("change", e => readFile(e.target.files[0]));
  ["dragenter","dragover"].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave","drop"].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", e => readFile(e.dataTransfer.files[0]));

  // drag to position
  let drag = null;
  cv.addEventListener("pointerdown", e => { if (!state.photo) return; drag = {x:e.clientX, y:e.clientY, ox:state.ox, oy:state.oy}; cv.setPointerCapture(e.pointerId); cv.classList.add("dragging"); });
  cv.addEventListener("pointermove", e => {
    if (!drag) return;
    const g = geo(), scale = cv.width / cv.clientWidth, k = 262 / g.r;
    state.ox = drag.ox + (e.clientX - drag.x) * scale * k; state.oy = drag.oy + (e.clientY - drag.y) * scale * k; draw();
  });
  const end = () => { drag = null; cv.classList.remove("dragging"); };
  cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);

  // copy
  $("copy").addEventListener("click", () => {
    const t = $("post").value;
    try {
      navigator.clipboard.writeText(t).then(() => { $("copy").textContent = "Copied"; setTimeout(() => $("copy").textContent = "Copy text", 1800); },
        () => { $("post").select(); $("copy").textContent = "Press Ctrl+C to copy"; });
    } catch (_) { $("post").select(); $("copy").textContent = "Press Ctrl+C to copy"; }
  });

  // download
  function showFallback(){ $("fallbackImg").src = cv.toDataURL("image/png"); $("fallback").hidden = false; }
  $("save").addEventListener("click", () => {
    const filename = `art-of-research-2026-${state.mode}${state.fmt === "square" ? "" : "-landscape"}.png`;
    try {
      cv.toBlob(blob => {
        if (!blob){ showFallback(); return; }
        const url = URL.createObjectURL(blob), a = document.createElement("a");
        a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        $("status").textContent = "Image saved. Upload it to your LinkedIn post.";
      }, "image/png");
    } catch (e) { showFallback(); }
  });

  setPost();
  Promise.all([load("assets/aor-logo.png"), load("assets/voices-banner.jpg"), load("assets/aalto-logo.png")]).then(([a,h,al]) => {
    AOR = a; HERO = h; AALTO = al; draw();
    if (document.fonts && document.fonts.load){
      Promise.all(["800 62px Inter","700 30px Inter","500 30px Inter"].map(f => document.fonts.load(f))).then(draw, draw);
    }
  });
  draw();
})();
