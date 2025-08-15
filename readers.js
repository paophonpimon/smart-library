// === CONFIG ===
const SHEET_ID  = "1agyu31GI2YGD-42in3P7hZytsKNO-kg-JDdfvlJL7q0"; // อันเดียวกับหน้าอื่น
const SHEET_TAB = "readers";                                      // << ใช้แท็บนี้

// คีย์ที่คาดหวังในชีต:
// ลำดับ | ชื่อ | ห้อง | รูป | เล่ม | เวลาฟังนาที | เหรียญ | อัปเดต
const WANT = {
  "ลำดับ":"ลำดับ","ชื่อ":"ชื่อ","ห้อง":"ห้อง","รูป":"รูป",
  "เล่ม":"เล่ม","เวลาฟังนาที":"เวลาฟังนาที","เหรียญ":"เหรียญ","อัปเดต":"อัปเดต"
};

// ===== Helpers =====
const $ = id => document.getElementById(id);
const els = { grid: $("grid"), tbody: $("tbody"), tableWrap: $("tableWrap"), err: $("error") };

function normKey(s){ return String(s||"").replace(/[\u200B-\u200D\uFEFF]/g,"").replace(/\s+/g,"").trim(); }
function remapRowKeys(row){
  const out = {}, wantNorm = {}; Object.keys(WANT).forEach(k => wantNorm[normKey(k)] = WANT[k]);
  for(const k in row){ const kn = normKey(k); const t = wantNorm[kn]; if(t) out[t] = (row[k] ?? "").toString().trim(); }
  return out;
}
function csvUrl(tab){
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}&cachebust=${Date.now()}`;
}
function loadTab(tab){
  return new Promise((resolve, reject) => {
    Papa.parse(csvUrl(tab), {
      download:true, header:true, skipEmptyLines:true,
      complete: res => resolve((res.data||[]).map(remapRowKeys)),
      error: err => reject(err)
    });
  });
}

// ข้อมูลตัวอย่าง เผื่อโหลดชีตไม่สำเร็จ
function sample(){
  return [
    {ลำดับ:"1",ชื่อ:"กานต์ ชาญฉลาด",ห้อง:"ม.3/1",รูป:"",เล่ม:"42",เวลาฟังนาที:"1280",เหรียญ:"ทอง",อัปเดต:"2025-08-01"},
    {ลำดับ:"2",ชื่อ:"พลอย พิชิตปัญญา",ห้อง:"ม.2/3",รูป:"",เล่ม:"37",เวลาฟังนาที:"1105",เหรียญ:"เงิน",อัปเดต:"2025-08-01"},
    {ลำดับ:"3",ชื่อ:"ภาคิน รักอ่าน",ห้อง:"ม.5/2",รูป:"",เล่ม:"33",เวลาฟังนาที:"980",เหรียญ:"ทองแดง",อัปเดต:"2025-08-01"},
    {ลำดับ:"4",ชื่อ:"มิว นิษฐา",ห้อง:"ม.1/1",รูป:"",เล่ม:"28",เวลาฟังนาที:"840",เหรียญ:"",อัปเดต:"2025-08-01"},
    {ลำดับ:"5",ชื่อ:"เจ เจตริน",ห้อง:"ม.6/1",รูป:"",เล่ม:"25",เวลาฟังนาที:"790",เหรียญ:"",อัปเดต:"2025-08-01"},
  ];
}

function makeInitial(name){
  const parts = (name||"").split(/\s+/); const a = parts[0]?.[0]||"?"; const b = parts[1]?.[0]||"";
  return (a+b).toUpperCase();
}

function renderGrid(rows){
  els.grid.innerHTML = "";
  const maxBooks = Math.max(...rows.map(r=>Number(r.เล่ม||0)), 1);
  rows.forEach((r,i)=>{
    const rank = i+1;
    const medal = rank===1?'rank-1':rank===2?'rank-2':rank===3?'rank-3':'';
    const cover = r.รูป
      ? `<img class="avatar" src="${r.รูป}" alt="${r.ชื่อ}">`
      : `<div class="avatar" style="display:flex;align-items:center;justify-content:center;font-weight:900">${makeInitial(r.ชื่อ)}</div>`;
    const p = Math.round((Number(r.เล่ม||0)/maxBooks)*100);
    const badge = r.เหรียญ ? `<span class="badge gold">${r.เหรียญ}</span>` : "";
    const card = document.createElement("article");
    card.className = "lb-card";
    card.innerHTML = `
      <span class="rank-badge ${medal}">#${rank}</span>
      <div class="row">
        ${cover}
        <div class="info">
          <h3 class="name">${r.ชื่อ||"-"}</h3>
          <div class="meta">${r.ห้อง||""}</div>
          <div class="badges">
            <span class="pill-small">เล่ม: <strong>${Number(r.เล่ม||0)}</strong></span>
            <span class="pill-small">เวลาฟัง: <strong>${Number(r.เวลาฟังนาที||0)}</strong> นาที</span>
            ${badge}
          </div>
        </div>
      </div>
      <div class="bar" title="${p}% ของผู้ที่มากที่สุด"><span style="width:${p}%"></span></div>
    `;
    els.grid.appendChild(card);
  });
}

function renderTable(rows){
  els.tbody.innerHTML = rows.map((r,i)=>`
    <tr>
      <td>${i+1}</td>
      <td>${r.ชื่อ||"-"}</td>
      <td>${r.ห้อง||""}</td>
      <td style="font-weight:800">${Number(r.เล่ม||0)}</td>
      <td>${Number(r.เวลาฟังนาที||0)}</td>
      <td>${r.เหรียญ||""}</td>
    </tr>`).join("");
}

function updateStats(rows){
  const totalBooks = rows.reduce((s,r)=>s+Number(r.เล่ม||0),0);
  const totalMin   = rows.reduce((s,r)=>s+Number(r.เวลาฟังนาที||0),0);
  const lastUpdate = rows[0]?.อัปเดต || "-";
  $("stat-people").textContent = rows.length.toLocaleString("th-TH");
  $("stat-books").textContent  = totalBooks.toLocaleString("th-TH");
  $("stat-min").textContent    = totalMin.toLocaleString("th-TH");
  $("stat-update").textContent = lastUpdate;
}

function applyFilters(rows){
  const g = $("grade").value;
  const q = $("q").value.trim().toLowerCase();
  let out = rows.slice();
  if(g !== "all") out = out.filter(r => (r.ห้อง||"").startsWith(g));
  if(q) out = out.filter(r => (`${r.ชื่อ||""} ${r.ห้อง||""}`).toLowerCase().includes(q));
  // จัดอันดับ: เล่ม (desc) > เวลาฟัง (desc)
  out.sort((a,b)=> Number(b.เล่ม||0) - Number(a.เล่ม||0) || Number(b.เวลาฟังนาที||0) - Number(a.เวลาฟังนาที||0));
  return out;
}

async function refresh(){
  try{
    let rows = await loadTab(SHEET_TAB);
    if(!rows.length) rows = sample();
    const view = applyFilters(rows);
    renderGrid(view);
    renderTable(view);
    updateStats(view);
    els.err.hidden = true;
  }catch(e){
    const view = applyFilters(sample());
    renderGrid(view); renderTable(view); updateStats(view);
    els.err.hidden = false; els.err.textContent = "โหลดข้อมูลจากชีตไม่สำเร็จ แสดงข้อมูลตัวอย่างแทน";
  }
}

// === Events ===
window.addEventListener("DOMContentLoaded", ()=>{
  $("grade").addEventListener("change", refresh);
  $("q").addEventListener("input", refresh);
  $("viewCard").addEventListener("click", ()=>{
    els.tableWrap.hidden = true; $("grid").style.display = ""; refresh();
    $("viewCard").classList.remove("btn-ghost");
    $("viewTable").classList.add("btn-ghost");
  });
  $("viewTable").addEventListener("click", ()=>{
    els.tableWrap.hidden = false; $("grid").style.display = "none"; refresh();
    $("viewTable").classList.remove("btn-ghost");
    $("viewCard").classList.add("btn-ghost");
  });
  $("btnPrint").addEventListener("click", e=>{ e.preventDefault(); window.print(); });

  refresh();
});
