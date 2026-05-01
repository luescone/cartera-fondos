import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#6366f1","#22d3ee","#f59e0b","#10b981","#f43f5e","#a78bfa","#34d399","#fb923c","#38bdf8","#e879f9"];
const CATS = ["Renta Variable","Renta Fija","Monetario","ETC","Crypto","Mixto","Otro"];

const ISIN_TICKER = {
  "IE00B03HD191": "IE00B03HD191.IR",
  "IE00B18GC888": "IE00B18GC888.IR",
  "IE00BFZMJT78": "IE00BFZMJT78.IR",
  "IE000QAZP7L2": "IE000QAZP7L2.IR",
  "ES0141116030": "ES0141116030.MC",
  "FR0000447823": "FR0000447823.PA",
};

const FACTSHEETS = {
  "IE00B03HD191": { nombre:"Vanguard Global Stock", sectores:{"Tecnología":24.98,"Serv. Financieros":16.82,"Salud":11.15,"Industria":10.28,"Consumo Cíclico":9.98,"Consumo Defensivo":6.44,"Comunicaciones":8.09,"Energía":4.15,"Inmobiliario":2.21,"Materiales":3.17}, paises:{"EE.UU.":71.87,"Japón":5.42,"Reino Unido":3.68,"Zona Euro":8.44,"Canadá":3.16,"Australia":1.67}, holdings:[{n:"Apple",p:4.91},{n:"NVIDIA",p:3.90},{n:"Microsoft",p:3.90},{n:"Amazon",p:2.64},{n:"Meta",p:1.85},{n:"Alphabet A",p:1.33},{n:"Tesla",p:1.10},{n:"Broadcom",p:1.10}], rent:{2020:6.25,2021:30.98,2022:-12.85,2023:19.54,2024:26.50} },
  "IE00B18GC888": { nombre:"Vanguard Global Bond", sectores:{"Gubernamental":63.45,"Corporativo":23.68,"Titulizaciones":12.60,"Municipal":0.25}, paises:{"EE.UU.":20,"Alemania":12,"Francia":10,"Reino Unido":8,"Italia":6,"Japón":7}, holdings:[{n:"France Republic",p:0.38},{n:"Germany Rep.",p:0.37},{n:"US Treasury",p:0.30},{n:"UK Gilt",p:0.26},{n:"Italy 3.35%",p:0.23}], rent:{2020:4.80,2021:-2.83,2022:-15.06,2023:4.69,2024:0.83} },
  "IE00BFZMJT78": { nombre:"Neuberger Berman Short Dur.", sectores:{"Inv. Grade Credit":49.63,"Securitized":14.45,"Sovereign":11.80,"High Yield":11.49,"Covered Bonds":7.78}, paises:{"EE.UU.":12.76,"Alemania":11.10,"Italia":10.13,"Reino Unido":9.99,"Francia":7.73,"España":4.62}, holdings:[{n:"IG Credit",p:49.63},{n:"Securitized",p:14.45},{n:"Sovereign",p:11.80},{n:"High Yield",p:11.49}], rent:{2020:2.50,2021:1.04,2022:-5.59,2023:6.72,2024:7.37} },
  "IE000QAZP7L2": { nombre:"iShares Emerging Markets", sectores:{"Tecnología":26.77,"Serv. Financieros":22.28,"Consumo Cíclico":12.30,"Comunicaciones":9.72,"Materiales":6.82,"Industria":7.10,"Energía":4.12}, paises:{"Asia Emergente":47.65,"Asia Desarrollada":32.44,"Iberoamérica":7.45,"Oriente Medio":5.72,"África":3.55}, holdings:[{n:"Taiwan Semi.",p:11.20},{n:"Tencent",p:4.99},{n:"Alibaba",p:3.31},{n:"Samsung",p:3.21},{n:"SK Hynix",p:1.95}], rent:{2024:4.47} },
  "ES0141116030": { nombre:"Hamco Global Value", sectores:{"Consumo Cíclico":39.09,"Industria":14.40,"Consumo Defensivo":13.48,"Energía":7.03,"Materiales":8.50,"Comunicaciones":5.41,"Serv. Financieros":4.38}, paises:{"Asia Emergente":27.89,"Asia Desarrollada":25.88,"Canadá":10.70,"Zona Euro":9.70,"EE.UU.":7.27,"Japón":6.82}, holdings:[{n:"Sasol Ltd",p:3.21},{n:"Brilliance China",p:2.57},{n:"Linamar",p:2.39},{n:"Youngone",p:1.97},{n:"Siam Cement",p:1.92}], rent:{2020:9.99,2021:40.10,2022:29.14,2023:10.94,2024:10.64} },
  "FR0000447823": { nombre:"AXA Trésor Court Terme", sectores:{"Banca":54.04,"Cash":30.70,"Serv. Financieros":5.07,"Agencia":3.75,"Retail":3.66}, paises:{"Francia":45.48,"España":13.39,"Países Bajos":6.63,"Bélgica":4.77,"Finlandia":4.60,"Alemania":4.54,"Gran Bretaña":3.72}, holdings:[{n:"Depósitos Banca FR",p:17.62},{n:"CP&MTN Banca",p:12.00}], rent:{2020:-0.47,2021:-0.60,2022:-0.04,2023:3.39,2024:3.90} }
};

const defaultFunds = [
  {id:1,nombre:"Vanguard Global Stock Index",isin:"IE00B03HD191",entidad:"MyInvestor",cat:"Renta Variable",partic:0,precio:0,coste:0},
  {id:2,nombre:"Vanguard Global Bond EUR Hdg",isin:"IE00B18GC888",entidad:"MyInvestor",cat:"Renta Fija",partic:0,precio:0,coste:0},
  {id:3,nombre:"Neuberger Berman Short Dur.",isin:"IE00BFZMJT78",entidad:"MyInvestor",cat:"Renta Fija",partic:0,precio:0,coste:0},
  {id:4,nombre:"iShares Emerging Markets S",isin:"IE000QAZP7L2",entidad:"MyInvestor",cat:"Renta Variable",partic:0,precio:0,coste:0},
  {id:5,nombre:"Hamco Global Value Fund",isin:"ES0141116030",entidad:"MyInvestor",cat:"Renta Variable",partic:0,precio:0,coste:0},
  {id:6,nombre:"AXA Trésor Court Terme",isin:"FR0000447823",entidad:"MyInvestor",cat:"Monetario",partic:0,precio:0,coste:0},
];

function useLS(key, def) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; }
    catch { return def; }
  });
  const set = useCallback(v => {
    setVal(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key]);
  return [val, set];
}

const fe = n => (isNaN(n)||n==null) ? "-" : n.toFixed(2).replace(".",",").replace(/\B(?=(\d{3})+(?!\d))/g,".") + " €";
const fp = n => (n>=0?"+":"") + n.toFixed(2).replace(".",",") + "%";
const fn = (n,d=4) => (isNaN(n)||n==null) ? "-" : n.toFixed(d).replace(".",",");
const cc = n => n >= 0 ? "#34d399" : "#f87171";

function Toast({ msg }) {
  return msg ? <div style={{position:"fixed",bottom:20,right:20,background:"#065f46",color:"#6ee7b7",padding:"8px 16px",borderRadius:8,fontSize:12,fontWeight:600,zIndex:999}}>{msg}</div> : null;
}

function EditCell({ value, onSave, fmt = v => v, step = "0.01" }) {
  const [editing, setEditing] = useState(false);
  const [tmp, setTmp] = useState(value);
  const ref = useRef();
  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);
  if (editing) return (
    <input ref={ref} type="number" step={step} value={tmp}
      style={{width:90,background:"#0f172a",border:"1px solid #6366f1",color:"white",borderRadius:4,padding:"2px 6px",fontSize:12}}
      onChange={e => setTmp(e.target.value)}
      onBlur={() => { onSave(parseFloat(tmp)||0); setEditing(false); }}
      onKeyDown={e => { if(e.key==="Enter") ref.current.blur(); if(e.key==="Escape") setEditing(false); }}
    />
  );
  return <span onClick={() => { setTmp(value); setEditing(true); }} style={{cursor:"pointer",color:"#38bdf8",textDecoration:"underline dotted"}}>{fmt(value)}</span>;
}

export default function App() {
  const [funds, setFunds] = useLS("funds_v2", defaultFunds);
  const [aport, setAport] = useLS("aport_v2", []);
  const [pctDes, setPctDes] = useLS("pct_v2", {});
  const [tab, setTab] = useState("resumen");
  const [toast, setToast] = useState("");
  const [newFund, setNewFund] = useState({nombre:"",isin:"",entidad:"",cat:"Renta Variable",partic:0,precio:0,coste:0});
  const [newAp, setNewAp] = useState({fondoId:"",fecha:"",importe:"",liq:"",partic:"",periodo:"Puntual"});
  const [modal, setModal] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState({});

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 2000); };

  const saveFunds = f => { setFunds(f); showToast("✓ Guardado"); };
  const saveAport = a => { setAport(a); showToast("✓ Guardado"); };

  const enr = useMemo(() => funds.map(f => {
    const val = f.partic * f.precio;
    const ben = val - f.coste;
    const pct = f.coste ? (ben/f.coste)*100 : 0;
    return {...f, val, ben, pct};
  }), [funds]);

  const totalInv = enr.reduce((s,f) => s+f.coste, 0);
  const totalVal = enr.reduce((s,f) => s+f.val, 0);
  const totalBen = totalVal - totalInv;
  const totalPct = totalInv ? (totalBen/totalInv)*100 : 0;

  // Calcular coste desde aportaciones automáticamente
  const recalcularCostes = () => {
    const updated = funds.map(f => {
      const totalAport = aport.filter(a => a.fondoId === f.id).reduce((s,a) => s+a.importe, 0);
      return totalAport > 0 ? {...f, coste: totalAport} : f;
    });
    saveFunds(updated);
    showToast("✓ Costes recalculados desde aportaciones");
  };

  const updateFund = (id, campo, valor) => {
    saveFunds(funds.map(f => f.id===id ? {...f,[campo]:valor} : f));
  };

  const delFund = id => {
    if(!confirm("¿Eliminar fondo?")) return;
    saveFunds(funds.filter(f=>f.id!==id));
    saveAport(aport.filter(a=>a.fondoId!==id));
  };

  const addFund = () => {
    if(!newFund.nombre||!newFund.isin) return alert("Nombre e ISIN obligatorios.");
    saveFunds([...funds,{...newFund,id:Date.now(),partic:+newFund.partic,precio:+newFund.precio,coste:+newFund.coste}]);
    setNewFund({nombre:"",isin:"",entidad:"",cat:"Renta Variable",partic:0,precio:0,coste:0});
  };

  const addAport = () => {
    if(!newAp.fondoId||!newAp.fecha||!newAp.importe) return alert("Fondo, fecha e importe son obligatorios.");
    saveAport([...aport,{id:Date.now(),fondoId:+newAp.fondoId,fecha:newAp.fecha,importe:+newAp.importe,liq:+newAp.liq,partic:+newAp.partic,periodo:newAp.periodo}]);
    setNewAp({fondoId:"",fecha:"",importe:"",liq:"",partic:"",periodo:"Puntual"});
  };

  const delAport = id => saveAport(aport.filter(a=>a.id!==id));

  // ─── ACTUALIZAR PRECIOS VIA YAHOO FINANCE ─────────────────
  const actualizarPrecios = async () => {
    setRefreshing(true);
    setRefreshStatus({});
    const updated = [...funds];
    const status = {};
    for (let i = 0; i < updated.length; i++) {
      const f = updated[i];
      const ticker = ISIN_TICKER[f.isin.toUpperCase()] || (f.isin + ".IR");
      status[f.id] = "loading";
      setRefreshStatus({...status});
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=5d`;
        const r = await fetch(url);
        if (!r.ok) throw new Error("HTTP " + r.status);
        const data = await r.json();
        const closes = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close;
        if (!closes?.length) throw new Error("sin datos");
        let precio = null;
        for (let j = closes.length-1; j >= 0; j--) { if (closes[j] != null) { precio = closes[j]; break; } }
        if (!precio) throw new Error("precio nulo");
        updated[i] = {...f, precio: parseFloat(precio.toFixed(4))};
        status[f.id] = "ok";
      } catch {
        status[f.id] = "error";
      }
      setRefreshStatus({...status});
    }
    saveFunds(updated);
    setRefreshing(false);
    const errores = updated.filter((_,i) => status[funds[i].id] === "error");
    if (errores.length) showToast(`⚠️ ${errores.length} fondos sin actualizar — edítalos manualmente`);
    else showToast("✓ Precios actualizados");
  };

  // ─── PARSEO CSV ───────────────────────────────────────────
  const parsearNumES = raw => {
    let s = (raw||"").toString().replace(/[^0-9,.-]/g,"");
    if (s.includes(",") && s.includes(".")) s = s.replace(/\./g,"").replace(",",".");
    else s = s.replace(",",".");
    return parseFloat(s) || 0;
  };

  const parsearFechaES = raw => {
    const s = (raw||"").trim();
    const p = s.split(/[\/\-\.]/);
    if (p.length === 3) {
      // Si el primer segmento tiene 4 dígitos es yyyy-mm-dd
      if (p[0].length === 4) return `${p[0]}-${p[1].padStart(2,"0")}-${p[2].padStart(2,"0")}`;
      // Si no, es dd/mm/yyyy
      return `${p[2].length===2?"20"+p[2]:p[2]}-${p[1].padStart(2,"0")}-${p[0].padStart(2,"0")}`;
    }
    const dt = new Date(s);
    return !isNaN(dt) ? dt.toISOString().slice(0,10) : "";
  };

  const leerCSV = text => {
    const lines = text.trim().split("\n");
    const sep = text.includes("\t") ? "\t" : text.includes(";") ? ";" : ",";
    const headers = lines[0].split(sep).map(h => h.trim().replace(/^["']|["']$/g,"").toLowerCase());
    return lines.slice(1).filter(l => l.trim()).map(l => {
      const vals = l.split(sep).map(v => v.trim().replace(/^["']|["']$/g,""));
      const obj = {};
      headers.forEach((h,i) => obj[h] = vals[i] || "");
      return obj;
    });
  };

  const importarArchivo = (e, broker) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const filas = leerCSV(ev.target.result);
      const pending = [];
      const omitidos = [];

      filas.forEach(row => {
        let isin, fecha, importe, partic, liq, nombre;

        if (broker === "myinvestor") {
          const estado = (row["estado"] || "").toLowerCase();
          if (!estado.includes("finaliz")) return;
          isin = (row["isin"] || "").trim().toUpperCase();
          fecha = parsearFechaES(row["fecha de la orden"] || row["fecha"] || "");
          importe = parsearNumES(row["importe estimado"] || row["importe"] || "");
          partic = parsearNumES(row["nº de participaciones"] || row["num. participaciones"] || row["participaciones"] || "");
          liq = partic > 0 ? parseFloat((importe/partic).toFixed(4)) : 0;
          nombre = "";
        } else {
          // Trade Republic
          const tipo = (row["type"] || "").toUpperCase();
          if (tipo !== "BUY") return;
          const cls = (row["asset_class"] || "").toUpperCase();
          // Aceptar FUND y CRYPTO
          if (cls !== "FUND" && cls !== "CRYPTO") return;
          isin = (row["symbol"] || "").trim().toUpperCase();
          // Trade Republic da fecha en formato yyyy-mm-dd en columna "date"
          fecha = (row["date"] || "").slice(0,10);
          if (!fecha) fecha = parsearFechaES(row["datetime"] || "");
          partic = Math.abs(parsearNumES(row["shares"] || "0"));
          liq = Math.abs(parsearNumES(row["price"] || "0"));
          importe = Math.abs(parsearNumES(row["amount"] || "0"));
          if (importe <= 0 && partic > 0 && liq > 0) importe = parseFloat((partic * liq).toFixed(2));
          nombre = row["name"] || "";
        }

        if (!isin || !fecha || importe <= 0) return;

        const fondo = funds.find(f => f.isin.toUpperCase() === isin);
        if (!fondo) { omitidos.push(isin); return; }

        const existe = aport.some(a => a.fondoId===fondo.id && a.fecha===fecha && Math.abs(a.importe-importe)<0.01);
        if (existe) return;

        pending.push({fondoId:fondo.id, fondoNombre:fondo.nombre, fecha, importe, partic, liq, periodo:"Puntual"});
      });

      if (!pending.length) {
        let msg = "No se encontraron operaciones nuevas.";
        if (omitidos.length) msg += `\n\n⚠️ ISINs no reconocidos: ${[...new Set(omitidos)].join(", ")}\n\nAñade estos fondos en la pestaña Fondos con el ISIN correcto.`;
        return alert(msg);
      }
      setImportPreview(pending);
      setModal("import");
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  const confirmarImport = () => {
    saveAport([...aport, ...importPreview.map(a => ({...a, id:Date.now()+Math.random()}))]);
    setModal(null); setImportPreview([]);
  };

  const anos = [...new Set(aport.map(a => a.fecha?.slice(0,4)).filter(Boolean))].sort();

  const corrData = useMemo(() => {
    const fondosFS = Object.entries(FACTSHEETS).map(([isin,fd]) => ({isin,...fd}));
    const tv = enr.reduce((s,f) => s+f.val, 0);
    const secAgr={}, paisAgr={}, holdAgr={};
    fondosFS.forEach(fd => {
      const f = enr.find(x => x.isin.toUpperCase()===fd.isin);
      const w = f && tv > 0 ? f.val/tv : 1/fondosFS.length;
      Object.entries(fd.sectores||{}).forEach(([k,v]) => secAgr[k]=(secAgr[k]||0)+v*w);
      Object.entries(fd.paises||{}).forEach(([k,v]) => paisAgr[k]=(paisAgr[k]||0)+v*w);
      (fd.holdings||[]).forEach(h => holdAgr[h.n]=(holdAgr[h.n]||0)+h.p*w);
    });
    return {fondosFS, secAgr, paisAgr, holdAgr};
  }, [enr]);

  const s = {
    bg:"#0f172a", card:"#1e293b", border:"#334155", text:"#e2e8f0", muted:"#94a3b8",
    btn:{background:"#4f46e5",color:"white",border:"none",borderRadius:6,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:600},
    btnSm:{background:"#4f46e5",color:"white",border:"none",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:11,fontWeight:600},
    btnDel:{background:"#7f1d1d",color:"#fca5a5",border:"none",borderRadius:4,padding:"3px 8px",cursor:"pointer",fontSize:11},
    inp:{background:"#0f172a",border:"1px solid #334155",color:"white",borderRadius:6,padding:"6px 10px",fontSize:12,outline:"none"},
    th:{background:"#1e293b",color:"#94a3b8",padding:"8px 10px",textAlign:"left",borderBottom:"1px solid #334155",whiteSpace:"nowrap",fontSize:13},
    td:{padding:"8px 10px",borderBottom:"1px solid #1e293b",fontSize:13},
    totalRow:{background:"#1e3a5f"},
    h3:{color:"#c7d2fe",marginTop:0,marginBottom:14},
    h4:{color:"#94a3b8",marginBottom:10,fontSize:13},
  };

  const TABS = [
    {id:"resumen",label:"📊 Resumen"},{id:"fondos",label:"📋 Fondos"},
    {id:"aportaciones",label:"💶 Aportaciones"},{id:"anios",label:"📅 Por Años"},
    {id:"rebalanceo",label:"⚖️ Rebalanceo"},{id:"correlacion",label:"🔗 Correlación"},
    {id:"graficas",label:"📈 Gráficas"}
  ];

  return (
    <div style={{background:s.bg,minHeight:"100vh",color:s.text,fontFamily:"system-ui,sans-serif",fontSize:14}}>
      <Toast msg={toast}/>

      {/* Modal importación */}
      {modal==="import" && (
        <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.75)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:12,padding:24,maxWidth:640,width:"92%",maxHeight:"80vh",overflowY:"auto"}}>
            <h3 style={s.h3}>Previsualizar importación</h3>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr>{["Fecha","Fondo","Importe","Participaciones","V.Liq"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>{importPreview.map((a,i)=>(
                  <tr key={i} style={{background:i%2===0?s.card:s.bg}}>
                    <td style={s.td}>{a.fecha}</td>
                    <td style={s.td}>{a.fondoNombre?.split(" ").slice(0,3).join(" ")}</td>
                    <td style={{...s.td,color:"#34d399",fontWeight:600}}>{fe(a.importe)}</td>
                    <td style={s.td}>{fn(a.partic)}</td>
                    <td style={s.td}>{fe(a.liq)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <p style={{color:s.muted,fontSize:12,marginTop:8}}>{importPreview.length} operaciones nuevas detectadas.</p>
            <div style={{display:"flex",gap:8,marginTop:16,justifyContent:"flex-end"}}>
              <button style={s.btnDel} onClick={()=>{setModal(null);setImportPreview([]);}}>Cancelar</button>
              <button style={s.btn} onClick={confirmarImport}>✓ Importar todo</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{background:s.card,padding:"14px 24px",borderBottom:`1px solid ${s.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div>
          <h1 style={{margin:0,fontSize:20,fontWeight:700,color:"#818cf8"}}>📈 Cartera de Fondos</h1>
          <p style={{margin:"2px 0 0",fontSize:11,color:s.muted}}>Seguimiento privado · Guardado en tu navegador</p>
        </div>
        <button style={{...s.btnDel,fontSize:11}} onClick={()=>{if(!confirm("¿Borrar todos los datos?"))return;setFunds([]);setAport([]);setPctDes({});showToast("✓ Datos borrados");}}>🗑️ Borrar todo</button>
      </div>

      {/* KPIs */}
      <div style={{display:"flex",flexWrap:"wrap",gap:10,padding:"14px 24px"}}>
        {[["Valor Total",fe(totalVal),"#818cf8"],["Invertido",fe(totalInv),"#38bdf8"],["Beneficio",fe(totalBen),cc(totalBen)],["Rentabilidad",fp(totalPct),cc(totalPct)],["Fondos",funds.length,"#fb923c"]].map(([l,v,c])=>(
          <div key={l} style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:10,padding:"10px 18px",minWidth:120}}>
            <div style={{fontSize:11,color:s.muted}}>{l}</div>
            <div style={{fontSize:18,fontWeight:700,color:c,marginTop:2}}>{v}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",flexWrap:"wrap",gap:4,padding:"0 24px",borderBottom:`1px solid ${s.border}`}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{background:tab===t.id?"#6366f1":"transparent",color:tab===t.id?"white":s.muted,border:"none",padding:"8px 14px",cursor:"pointer",borderRadius:"8px 8px 0 0",fontSize:13,fontWeight:tab===t.id?600:400}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{padding:"20px 24px"}}>

        {/* ── RESUMEN ── */}
        {tab==="resumen" && (
          <div>
            <h3 style={s.h3}>Resumen de la cartera</h3>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{["Fondo","ISIN","Valor (€)","Coste (€)","Benef. (€)","Rent. %","Entidad"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {enr.map((f,i)=>(
                    <tr key={f.id} style={{background:i%2===0?s.card:s.bg}}>
                      <td style={{...s.td,fontWeight:600}}>{f.nombre}</td>
                      <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:s.muted}}>{f.isin}</td>
                      <td style={s.td}>{fe(f.val)}</td>
                      <td style={{...s.td,color:s.muted}}>{fe(f.coste)}</td>
                      <td style={{...s.td,color:cc(f.ben),fontWeight:600}}>{fe(f.ben)}</td>
                      <td style={{...s.td,color:cc(f.pct),fontWeight:700}}>{fp(f.pct)}</td>
                      <td style={{...s.td,color:s.muted}}>{f.entidad}</td>
                    </tr>
                  ))}
                  <tr style={s.totalRow}>
                    <td style={{...s.td,fontWeight:700,color:"#93c5fd"}} colSpan={2}>TOTAL</td>
                    <td style={{...s.td,fontWeight:700}}>{fe(totalVal)}</td>
                    <td style={{...s.td,fontWeight:700}}>{fe(totalInv)}</td>
                    <td style={{...s.td,fontWeight:700,color:cc(totalBen)}}>{fe(totalBen)}</td>
                    <td style={{...s.td,fontWeight:700,color:cc(totalPct)}}>{fp(totalPct)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── FONDOS ── */}
        {tab==="fondos" && (
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,flexWrap:"wrap"}}>
              <h3 style={{...s.h3,margin:0}}>Mis Fondos</h3>
              <button
                style={{...s.btn,background:refreshing?"#334155":"#0e7490",opacity:refreshing?0.7:1}}
                disabled={refreshing}
                onClick={actualizarPrecios}
              >
                {refreshing?"⏳ Actualizando...":"🔄 Actualizar precios"}
              </button>
              <button style={{...s.btn,background:"#065f46"}} onClick={recalcularCostes}>
                🧮 Calcular costes desde aportaciones
              </button>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{["Nombre","ISIN","Entidad","Cat.","Participaciones","Precio (€)","Valor (€)","Coste (€)","Benef.","Rent.%",""].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {enr.map((f,i)=>(
                    <tr key={f.id} style={{background:i%2===0?s.card:s.bg}}>
                      <td style={{...s.td,fontWeight:600}}>{f.nombre}</td>
                      <td style={{...s.td,fontFamily:"monospace",fontSize:11,color:s.muted}}>{f.isin}</td>
                      <td style={{...s.td,color:s.muted}}>{f.entidad}</td>
                      <td style={{...s.td,fontSize:11,color:s.muted}}>{f.cat}</td>
                      <td style={s.td}><EditCell value={f.partic} onSave={v=>updateFund(f.id,"partic",v)} fmt={v=>fn(v,4)} step="0.0001"/></td>
                      <td style={s.td}>
                        <span style={{display:"flex",alignItems:"center",gap:6}}>
                          <EditCell value={f.precio} onSave={v=>updateFund(f.id,"precio",v)} fmt={v=>fe(v)} step="0.0001"/>
                          {refreshStatus[f.id]==="loading" && <span style={{color:"#f59e0b",fontSize:10}}>⏳</span>}
                          {refreshStatus[f.id]==="ok" && <span style={{color:"#34d399",fontSize:10}}>✓</span>}
                          {refreshStatus[f.id]==="error" && <span style={{color:"#f87171",fontSize:10}}>✗</span>}
                        </span>
                      </td>
                      <td style={{...s.td,fontWeight:600}}>{fe(f.val)}</td>
                      <td style={s.td}><EditCell value={f.coste} onSave={v=>updateFund(f.id,"coste",v)} fmt={v=>fe(v)}/></td>
                      <td style={{...s.td,color:cc(f.ben),fontWeight:600}}>{fe(f.ben)}</td>
                      <td style={{...s.td,color:cc(f.pct),fontWeight:700}}>{fp(f.pct)}</td>
                      <td style={s.td}><button style={s.btnDel} onClick={()=>delFund(f.id)}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:10,padding:16,marginTop:16}}>
              <h4 style={s.h4}>➕ Añadir fondo</h4>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"flex-end"}}>
                {[["nombre","Nombre",180],["isin","ISIN",130],["entidad","Entidad",110]].map(([k,ph,w])=>(
                  <input key={k} placeholder={ph} value={newFund[k]||""} onChange={e=>setNewFund(f=>({...f,[k]:e.target.value}))} style={{...s.inp,width:w}}/>
                ))}
                <select value={newFund.cat} onChange={e=>setNewFund(f=>({...f,cat:e.target.value}))} style={s.inp}>
                  {CATS.map(c=><option key={c}>{c}</option>)}
                </select>
                {[["partic","Participaciones",120],["precio","Precio",90],["coste","Coste total",110]].map(([k,ph,w])=>(
                  <input key={k} type="number" placeholder={ph} value={newFund[k]||""} onChange={e=>setNewFund(f=>({...f,[k]:e.target.value}))} style={{...s.inp,width:w}}/>
                ))}
                <button style={s.btn} onClick={addFund}>Añadir</button>
              </div>
            </div>
            <p style={{color:"#475569",fontSize:11,marginTop:8}}>Haz clic en participaciones, precio o coste para editarlos. ✓/✗ indica estado de la última actualización automática.</p>
          </div>
        )}

        {/* ── APORTACIONES ── */}
        {tab==="aportaciones" && (
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,flexWrap:"wrap"}}>
              <h3 style={{...s.h3,margin:0}}>Aportaciones</h3>
              <label style={{...s.btn,background:"#065f46",color:"#6ee7b7",cursor:"pointer",display:"inline-flex",alignItems:"center"}}>
                📂 MyInvestor CSV
                <input type="file" accept=".csv,.xlsx" style={{display:"none"}} onChange={e=>importarArchivo(e,"myinvestor")}/>
              </label>
              <label style={{...s.btn,background:"#0f4c75",color:"#7dd3fc",cursor:"pointer",display:"inline-flex",alignItems:"center"}}>
                📂 Trade Republic CSV
                <input type="file" accept=".csv" style={{display:"none"}} onChange={e=>importarArchivo(e,"traderepublic")}/>
              </label>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{["Fecha","Fondo","Importe","Periodo","V. Liq.","Participaciones",""].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {[...aport].sort((a,b)=>(b.fecha||"").localeCompare(a.fecha||"")).map((a,i)=>{
                    const f = funds.find(x=>x.id===a.fondoId);
                    return (
                      <tr key={a.id} style={{background:i%2===0?s.card:s.bg}}>
                        <td style={{...s.td,color:s.muted}}>{a.fecha}</td>
                        <td style={s.td}>{f?.nombre||"—"}</td>
                        <td style={{...s.td,color:"#34d399",fontWeight:600}}>{fe(a.importe)}</td>
                        <td style={s.td}><span style={{background:"#1e3a5f",color:"#38bdf8",borderRadius:4,padding:"2px 8px",fontSize:11}}>{a.periodo}</span></td>
                        <td style={{...s.td,color:s.muted}}>{fe(a.liq)}</td>
                        <td style={{...s.td,color:s.muted}}>{fn(a.partic)}</td>
                        <td style={s.td}><button style={s.btnDel} onClick={()=>delAport(a.id)}>✕</button></td>
                      </tr>
                    );
                  })}
                  <tr style={s.totalRow}>
                    <td style={{...s.td,fontWeight:700,color:"#93c5fd"}} colSpan={2}>TOTAL APORTADO</td>
                    <td style={{...s.td,fontWeight:700}}>{fe(aport.reduce((s,a)=>s+a.importe,0))}</td>
                    <td colSpan={4}></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:10,padding:16,marginTop:16}}>
              <h4 style={s.h4}>➕ Añadir aportación manual</h4>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"flex-end"}}>
                <select value={newAp.fondoId} onChange={e=>setNewAp(a=>({...a,fondoId:e.target.value}))} style={{...s.inp,width:180}}>
                  <option value="">Seleccionar fondo</option>
                  {funds.map(f=><option key={f.id} value={f.id}>{f.nombre}</option>)}
                </select>
                <input type="date" value={newAp.fecha} onChange={e=>setNewAp(a=>({...a,fecha:e.target.value}))} style={s.inp}/>
                {[["importe","Importe (€)",100],["liq","V. Liquidativo",110],["partic","Participaciones",120]].map(([k,ph,w])=>(
                  <input key={k} type="number" placeholder={ph} value={newAp[k]} onChange={e=>setNewAp(a=>({...a,[k]:e.target.value}))} style={{...s.inp,width:w}}/>
                ))}
                <select value={newAp.periodo} onChange={e=>setNewAp(a=>({...a,periodo:e.target.value}))} style={s.inp}>
                  {["Mensual","Trimestral","Semestral","Anual","Puntual"].map(p=><option key={p}>{p}</option>)}
                </select>
                <button style={s.btn} onClick={addAport}>Añadir</button>
              </div>
            </div>
            <div style={{background:"#1e3a5f",border:"1px solid #1d4ed8",borderRadius:8,padding:12,marginTop:12,fontSize:12,color:"#93c5fd",lineHeight:1.8}}>
              <b>MyInvestor:</b> Fecha de la orden · ISIN · Importe estimado · Nº participaciones · Estado (solo Finalizadas)<br/>
              <b>Trade Republic:</b> datetime · date · type (BUY) · asset_class (FUND/CRYPTO) · symbol (ISIN) · shares · price · amount
            </div>
          </div>
        )}

        {/* ── POR AÑOS ── */}
        {tab==="anios" && (
          <div>
            <h3 style={s.h3}>Por Años</h3>
            {!anos.length ? (
              <p style={{color:s.muted}}>No hay aportaciones aún. Importa tu CSV o añade manualmente.</p>
            ) : (
              <>
                <div style={{overflowX:"auto",marginBottom:20}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr>
                        <th style={s.th}>Año</th>
                        {enr.map(f=><th key={f.id} style={s.th}>{f.nombre.split(" ").slice(0,2).join(" ")}</th>)}
                        <th style={s.th}>Total (€)</th>
                        <th style={s.th}>Acumulado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        let acum = 0;
                        return anos.map((y,i) => {
                          const celdas = enr.map(f =>
                            aport.filter(a => a.fondoId===f.id && a.fecha && a.fecha.slice(0,4)===y).reduce((s,a)=>s+a.importe,0)
                          );
                          const tot = celdas.reduce((s,v)=>s+v,0);
                          acum += tot;
                          return (
                            <tr key={y} style={{background:i%2===0?s.card:s.bg}}>
                              <td style={{...s.td,color:"#818cf8",fontWeight:700}}>{y}</td>
                              {celdas.map((v,j)=>(
                                <td key={j} style={s.td}>
                                  {v>0 ? <span style={{color:"#34d399",fontWeight:600}}>{fe(v)}</span> : <span style={{color:"#475569"}}>—</span>}
                                </td>
                              ))}
                              <td style={{...s.td,fontWeight:700}}>{fe(tot)}</td>
                              <td style={{...s.td,color:"#38bdf8",fontWeight:700}}>{fe(acum)}</td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
                <div style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:10,padding:16}}>
                  <h4 style={s.h4}>Aportaciones anuales por fondo</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={anos.map(y=>({y,...Object.fromEntries(enr.map(f=>[f.nombre.split(" ").slice(0,2).join(" "), aport.filter(a=>a.fondoId===f.id&&a.fecha?.slice(0,4)===y).reduce((s,a)=>s+a.importe,0)||null]))}))} >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                      <XAxis dataKey="y" tick={{fill:s.muted,fontSize:11}}/>
                      <YAxis tick={{fill:s.muted,fontSize:11}}/>
                      <Tooltip formatter={v=>fe(v)}/>
                      <Legend wrapperStyle={{fontSize:11}}/>
                      {enr.map((f,i)=><Bar key={f.id} dataKey={f.nombre.split(" ").slice(0,2).join(" ")} stackId="a" fill={COLORS[i%COLORS.length]}/>)}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── REBALANCEO ── */}
        {tab==="rebalanceo" && (
          <div>
            <h3 style={s.h3}>⚖️ Calculadora de Rebalanceo</h3>
            <p style={{color:s.muted,fontSize:12,marginBottom:14}}>Introduce el % deseado. Verde = comprar · Rojo = vender.</p>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{["Activo","Cat.","Valor Actual","% Actual","% Deseado","Valor Deseado","Rebalanceo"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {enr.map((f,i)=>{
                    const pA = totalVal>0?(f.val/totalVal)*100:0;
                    const pD = parseFloat(pctDes[f.id])||0;
                    const vD = (pD/100)*totalVal;
                    const reb = vD-f.val;
                    return (
                      <tr key={f.id} style={{background:i%2===0?s.card:s.bg}}>
                        <td style={{...s.td,fontWeight:600}}>{f.nombre}</td>
                        <td style={{...s.td,fontSize:11,color:s.muted}}>{f.cat}</td>
                        <td style={s.td}>{fe(f.val)}</td>
                        <td style={s.td}>{fn(pA,2)}%</td>
                        <td style={s.td}>
                          <input type="number" min={0} max={100} step={0.5} value={pD}
                            style={{...s.inp,width:70,textAlign:"center"}}
                            onChange={e=>{const v=parseFloat(e.target.value)||0; setPctDes(p=>({...p,[f.id]:v})); showToast("✓ Guardado");}}
                          />
                        </td>
                        <td style={s.td}>{fe(vD)}</td>
                        <td style={s.td}>
                          {Math.abs(reb)<0.5 ? <span style={{color:"#475569"}}>—</span> :
                            <span style={{background:reb>0?"#064e3b":"#7f1d1d",color:reb>0?"#6ee7b7":"#fca5a5",borderRadius:4,padding:"2px 8px",fontWeight:700}}>
                              {reb>0?"+":""}{fe(reb)}
                            </span>
                          }
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={s.totalRow}>
                    <td style={{...s.td,fontWeight:700,color:"#93c5fd"}} colSpan={2}>TOTAL</td>
                    <td style={{...s.td,fontWeight:700}}>{fe(totalVal)}</td>
                    <td style={{...s.td,fontWeight:700}}>100%</td>
                    <td style={{...s.td,fontWeight:700,color:Math.abs(Object.values(pctDes).reduce((s,v)=>s+(v||0),0)-100)<0.1?"#6ee7b7":"#f59e0b"}}>
                      {fn(Object.values(pctDes).reduce((s,v)=>s+(v||0),0),2)}%
                    </td>
                    <td style={{...s.td,fontWeight:700}}>{fe(totalVal)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CORRELACIÓN ── */}
        {tab==="correlacion" && (
          <div>
            <h3 style={s.h3}>🔗 Análisis de Correlación</h3>
            <p style={{color:s.muted,fontSize:12,marginBottom:14}}>Datos reales de factsheets (2026). Ponderado por valor actual de tu cartera.</p>

            <div style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:10,padding:16,marginBottom:16}}>
              <h4 style={s.h4}>Solapamiento sectorial entre fondos</h4>
              <div style={{overflowX:"auto"}}>
                <table style={{borderCollapse:"collapse",fontSize:11}}>
                  <thead><tr>
                    <th style={{...s.th,minWidth:110}}></th>
                    {corrData.fondosFS.map(f=><th key={f.isin} style={{...s.th,fontSize:10}}>{f.nombre.split(" ").slice(0,2).join(" ")}</th>)}
                  </tr></thead>
                  <tbody>{corrData.fondosFS.map(fi=>(
                    <tr key={fi.isin}>
                      <td style={{...s.td,color:s.muted,fontSize:10}}>{fi.nombre.split(" ").slice(0,2).join(" ")}</td>
                      {corrData.fondosFS.map(fj=>{
                        if(fi.isin===fj.isin) return <td key={fj.isin} style={s.td}><span style={{color:"#818cf8"}}>—</span></td>;
                        const si=Object.keys(fi.sectores||{}),sj=Object.keys(fj.sectores||{});
                        const comun=si.filter(x=>sj.includes(x));
                        const union=[...new Set([...si,...sj])];
                        const pct=union.length?Math.round((comun.length/union.length)*100):0;
                        const bg=pct>60?"#064e3b":pct>30?"#1e3a5f":"#1e293b";
                        const col=pct>60?"#6ee7b7":pct>30?"#93c5fd":"#64748b";
                        return <td key={fj.isin} style={s.td}><span style={{background:bg,color:col,borderRadius:4,padding:"2px 6px",fontWeight:600}}>{pct}%</span></td>;
                      })}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginBottom:16}}>
              {[
                ["Exposición sectorial consolidada", corrData.secAgr, 2],
                ["Exposición geográfica consolidada", corrData.paisAgr, 1.2],
              ].map(([titulo, datos, mult])=>(
                <div key={titulo} style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:10,padding:16}}>
                  <h4 style={s.h4}>{titulo}</h4>
                  {Object.entries(datos).sort((a,b)=>b[1]-a[1]).slice(0,9).map(([k,v],i)=>(
                    <div key={k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7,fontSize:12}}>
                      <div style={{minWidth:110,color:s.muted,textAlign:"right",fontSize:11}}>{k.slice(0,16)}</div>
                      <div style={{flex:1,background:"#0f172a",borderRadius:4,height:14,overflow:"hidden"}}>
                        <div style={{width:`${Math.min(v*mult,100)}%`,height:"100%",background:COLORS[i%COLORS.length],borderRadius:4}}/>
                      </div>
                      <div style={{minWidth:40,fontWeight:600}}>{v.toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              ))}

              <div style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:10,padding:16}}>
                <h4 style={s.h4}>Top holdings consolidados</h4>
                {Object.entries(corrData.holdAgr).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,v],i)=>(
                  <div key={k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7,fontSize:12}}>
                    <div style={{minWidth:110,color:s.muted,textAlign:"right",fontSize:11}}>{k.slice(0,16)}</div>
                    <div style={{flex:1,background:"#0f172a",borderRadius:4,height:14,overflow:"hidden"}}>
                      <div style={{width:`${Math.min(v*6,100)}%`,height:"100%",background:COLORS[i%COLORS.length],borderRadius:4}}/>
                    </div>
                    <div style={{minWidth:40,fontWeight:600}}>{v.toFixed(2)}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:10,padding:16}}>
              <h4 style={s.h4}>Rentabilidad anual comparada 2020-2024 (datos reales de factsheets)</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={[2020,2021,2022,2023,2024].map(y=>({y,...Object.fromEntries(corrData.fondosFS.map(f=>[f.nombre.split(" ").slice(0,2).join(" "),f.rent?.[y]??null]))}))} >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="y" tick={{fill:s.muted,fontSize:11}}/>
                  <YAxis tick={{fill:s.muted,fontSize:11}} unit="%"/>
                  <Tooltip formatter={v=>v!=null?v.toFixed(2)+"%":"N/A"}/>
                  <Legend wrapperStyle={{fontSize:11}}/>
                  {corrData.fondosFS.map((f,i)=>(
                    <Line key={f.isin} type="monotone" dataKey={f.nombre.split(" ").slice(0,2).join(" ")} stroke={COLORS[i%COLORS.length]} strokeWidth={2} dot={{fill:COLORS[i%COLORS.length]}} connectNulls={false}/>
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── GRÁFICAS ── */}
        {tab==="graficas" && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
            <div style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:10,padding:16}}>
              <h4 style={s.h4}>Distribución del valor actual</h4>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={enr.map(f=>({name:f.nombre.split(" ").slice(0,2).join(" "),value:+f.val.toFixed(2)}))} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({percent})=>`${(percent*100).toFixed(0)}%`}>
                    {enr.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip formatter={v=>fe(v)}/><Legend wrapperStyle={{fontSize:11}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:10,padding:16}}>
              <h4 style={s.h4}>Coste vs Valor actual</h4>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={enr.map(f=>({name:f.nombre.split(" ").slice(0,2).join(" "),Coste:f.coste,Valor:+f.val.toFixed(2)}))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="name" tick={{fill:s.muted,fontSize:10}}/><YAxis tick={{fill:s.muted,fontSize:11}}/>
                  <Tooltip formatter={v=>fe(v)}/><Legend wrapperStyle={{fontSize:11}}/>
                  <Bar dataKey="Coste" fill="#6366f1"/><Bar dataKey="Valor" fill="#22d3ee"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:10,padding:16}}>
              <h4 style={s.h4}>Rentabilidad por fondo (%)</h4>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={enr.map(f=>({name:f.nombre.split(" ").slice(0,2).join(" "),rent:+f.pct.toFixed(2)}))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="name" tick={{fill:s.muted,fontSize:10}}/><YAxis tick={{fill:s.muted,fontSize:11}} unit="%"/>
                  <Tooltip formatter={v=>v.toFixed(2)+"%"}/>
                  <Bar dataKey="rent" name="Rentabilidad">{enr.map((f,i)=><Cell key={i} fill={f.pct>=0?"#34d399":"#f87171"}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:10,padding:16}}>
              <h4 style={s.h4}>Capital acumulado invertido</h4>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={anos.map(y=>({y,inv:aport.filter(a=>a.fecha?.slice(0,4)<=y).reduce((s,a)=>s+a.importe,0)}))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="y" tick={{fill:s.muted,fontSize:11}}/><YAxis tick={{fill:s.muted,fontSize:11}}/>
                  <Tooltip formatter={v=>fe(v)}/>
                  <Line type="monotone" dataKey="inv" stroke="#818cf8" strokeWidth={2} dot={{fill:"#818cf8"}} name="Invertido"/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
