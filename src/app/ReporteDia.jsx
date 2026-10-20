"use client";
import { useState, useEffect } from "react";

// Pestaña "Reporte del día": muestra el reporte que deja el agente diario en /api/reporte.
const REC = {
  SI:           { label:"SÍ participar", bg:"#EAF3DE", color:"#3B6D11", dot:"#639922" },
  CONDICIONADO: { label:"Condicionado",  bg:"#FAEEDA", color:"#854F0B", dot:"#EF9F27" },
  NO:           { label:"No participar", bg:"#FCEBEB", color:"#A32D2D", dot:"#E24B4A" },
};
const fmt  = n => n ? "$ " + Number(n).toLocaleString("es-CL") : "Ver bases";
const fmtD = s => s ? (s.split("T")[0] || "").split("-").reverse().join("/") : "—";
const diasA = f => { if (!f) return null; const c = new Date(f); const h = new Date();
  return Math.round((new Date(c.getFullYear(),c.getMonth(),c.getDate()) - new Date(h.getFullYear(),h.getMonth(),h.getDate())) / 86400000); };
const fmtFH = s => { if (!s) return "No informada"; const h = String(s).slice(11,16); return fmtD(s) + (h && h !== "00:00" ? " " + h : ""); };
const ventanaTxt = v => !v ? "" : v.desde === v.hasta ? `Publicadas el ${fmtD(v.desde)}` : `Publicadas entre ${fmtD(v.desde)} y ${fmtD(v.hasta)}`;
const ficha = c => `https://www.mercadopublico.cl/Procurement/Modules/RFB/DetailsAcquisition.aspx?idlicitacion=${c}`;

export default function ReporteDia() {
  const [fechas, setFechas] = useState([]);
  const [fecha, setFecha]   = useState("");
  const [rep, setRep]       = useState(null);
  const [cargando, setCarg] = useState(true);
  const [verDesc, setVerDesc] = useState(false);
  const [filtroRec, setFiltroRec] = useState("todas");

  useEffect(() => { fetch("/api/reporte?lista=1").then(r=>r.json()).then(d=>setFechas(d.fechas||[])).catch(()=>{}); }, []);
  useEffect(() => {
    setCarg(true);
    fetch(fecha ? `/api/reporte?fecha=${fecha}` : "/api/reporte").then(r=>r.json())
      .then(d=>setRep(d.reporte)).catch(()=>setRep(null)).finally(()=>setCarg(false));
  }, [fecha]);

  if (cargando) return <div style={{padding:"2rem",textAlign:"center",color:"var(--color-text-tertiary)",fontSize:13}}>Cargando reporte…</div>;
  if (!rep) return <div style={{padding:"3rem 0",textAlign:"center",color:"var(--color-text-tertiary)",fontSize:13}}><div style={{fontSize:32,marginBottom:12}}>📰</div>Aún no hay reportes. El agente publica uno de lunes a viernes en la mañana.</div>;

  const lics = (rep.licitaciones||[]).filter(l => filtroRec==="todas" || l.recomendacion===filtroRec)
    .sort((a,b) => ({SI:0,CONDICIONADO:1,NO:2}[a.recomendacion]-({SI:0,CONDICIONADO:1,NO:2}[b.recomendacion])) || new Date(a.cierre)-new Date(b.cierre));
  const r = rep.resumen || {};
  const card = (l, v, c) => <div key={l} style={{background:"var(--color-background-secondary)",borderRadius:10,padding:"10px 13px"}}><div style={{fontSize:11,color:"var(--color-text-tertiary)",marginBottom:4}}>{l}</div><div style={{fontSize:22,fontWeight:600,color:c,lineHeight:1}}>{v??"—"}</div></div>;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:12}}>
        <div>
          <div style={{fontSize:14,fontWeight:600}}>Reporte del {fmtD(rep.fecha)} · Centro Médico Pedro de Valdivia</div>
          <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginTop:2}}>{ventanaTxt(rep.ventana)} · generado {rep.generado ? new Date(rep.generado).toLocaleString("es-CL") : "—"}</div>
        </div>
        <select value={fecha} onChange={e=>setFecha(e.target.value)} style={{fontSize:12,padding:"5px 8px",borderRadius:8,border:"0.5px solid var(--color-border-secondary)"}}>
          <option value="">Último reporte</option>
          {fechas.map(f=><option key={f} value={f}>{fmtD(f)}</option>)}
        </select>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:9,marginBottom:14}}>
        {card("Revisadas", r.revisadas, "var(--color-text-primary)")}
        {card("Relevantes", (rep.licitaciones||[]).length, "#185FA5")}
        {card("SÍ", r.si, "#3B6D11")}
        {card("Condicionado", r.condicionado, "#854F0B")}
        {card("Descartadas", (rep.descartadas||[]).length, "#5F5E5A")}
      </div>

      {rep.nota && <div style={{background:"#E6F1FB",borderRadius:8,padding:"9px 14px",fontSize:12,color:"#185FA5",marginBottom:12}}>{rep.nota}</div>}

      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
        {[["todas","Todas"],["SI","SÍ"],["CONDICIONADO","Condicionado"],["NO","No"]].map(([k,l])=>
          <button key={k} onClick={()=>setFiltroRec(k)} style={{padding:"4px 12px",borderRadius:20,border:"none",background:filtroRec===k?"var(--color-background-secondary)":"none",fontWeight:filtroRec===k?600:400,fontSize:12,cursor:"pointer",color:"var(--color-text-primary)"}}>{l}</button>)}
      </div>

      {lics.length===0 && <div style={{textAlign:"center",padding:"1.5rem",color:"var(--color-text-tertiary)",fontSize:13}}>Sin licitaciones relevantes en esta ventana.</div>}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {lics.map(l => { const e = REC[l.recomendacion]||REC.CONDICIONADO; const d = diasA(l.cierre);
          return <div key={l.codigo} style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderLeft:`3px solid ${e.dot}`,borderRadius:10,padding:"12px 15px"}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:240}}>
                <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:3}}>
                  <span style={{background:e.bg,color:e.color,borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:600}}>{e.label}</span>
                  <span style={{fontSize:13,fontWeight:600}}>{l.nombre}</span>
                </div>
                <div style={{fontSize:12,color:"var(--color-text-secondary)"}}>{l.organismo}{l.comuna?` · ${l.comuna}`:""}</div>
                <div style={{fontSize:12,marginTop:4}}>{l.justificacion}</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>{(l.especialidades||[]).map(s=><span key={s} style={{fontSize:10,background:"var(--color-background-secondary)",borderRadius:20,padding:"1px 7px",color:"var(--color-text-secondary)"}}>{s}</span>)}</div>
              </div>
              <div style={{textAlign:"right",minWidth:120}}>
                <div style={{fontSize:14,fontWeight:700,color:"#185FA5"}}>{fmt(l.monto)}</div>
                <div style={{fontSize:11,color:"var(--color-text-secondary)",lineHeight:1.6,marginTop:2}}>
                  <div>Publicada: {fmtD(l.publicacion)}</div>
                  <div>Preguntas hasta: {fmtFH(l.preguntas_hasta)}</div>
                  <div style={{fontWeight:d!==null&&d<=5?600:400,color:d!==null&&d<=5?"#A32D2D":"inherit"}}>Cierre: {fmtFH(l.cierre)}{d===null?"":d<0?" (cerrada)":d===0?" (hoy)":` (${d}d)`}</div>
                </div>
                <a href={ficha(l.codigo)} target="_blank" rel="noreferrer" style={{fontSize:11,color:"#185FA5"}}>{l.codigo} ↗</a>
              </div>
            </div>
            {(l.puntos_criticos?.length>0 || l.proximos_pasos?.length>0) && <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:10,marginTop:10,fontSize:12}}>
              {l.puntos_criticos?.length>0 && <div style={{background:"#FEFCE8",borderRadius:7,padding:"7px 11px"}}><b>Puntos críticos</b><ul style={{margin:"4px 0 0",paddingLeft:16}}>{l.puntos_criticos.map((p,i)=><li key={i}>{p}</li>)}</ul></div>}
              {l.proximos_pasos?.length>0 && <div style={{background:"#F8F8F5",borderRadius:7,padding:"7px 11px"}}><b>Próximos pasos</b><ol style={{margin:"4px 0 0",paddingLeft:16}}>{l.proximos_pasos.map((p,i)=><li key={i}>{p}</li>)}</ol></div>}
            </div>}
          </div>; })}
      </div>

      {(rep.descartadas||[]).length>0 && <div style={{marginTop:14}}>
        <button onClick={()=>setVerDesc(!verDesc)} style={{background:"none",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,padding:"5px 12px",fontSize:12,cursor:"pointer",color:"var(--color-text-secondary)"}}>{verDesc?"▾":"▸"} Descartadas ({rep.descartadas.length}) — auditar filtro</button>
        {verDesc && <div style={{marginTop:8,fontSize:12}}>{rep.descartadas.map(x=><div key={x.codigo} style={{display:"grid",gridTemplateColumns:"150px 1fr 1fr",gap:10,padding:"5px 0",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
          <a href={ficha(x.codigo)} target="_blank" rel="noreferrer" style={{fontFamily:"monospace",fontSize:11,color:"#185FA5"}}>{x.codigo}</a><span>{x.nombre}</span><span style={{color:"var(--color-text-tertiary)"}}>{x.motivo}</span></div>)}</div>}
      </div>}
    </div>
  );
}
