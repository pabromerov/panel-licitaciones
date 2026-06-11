"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const SUCURSALES = [
  { empresa:"SANASALUD CENTROS MÉDICOS S.A.", rut:"76.686.235-7", nombre:"Centro Médico Pedro de Valdivia", direccion:"Av. Pedro de Valdivia 195, Providencia", ciudad:"Santiago", tipo:"Centro médico", region:"RM", espsFilter:null },
  { empresa:"CLÍNICA SAN ANTONIO S.A.", rut:"78.035.390-2", nombre:"Clínica San Antonio", direccion:"Antonio Palmieri 250", ciudad:"San Antonio", tipo:"Clínica", region:"Valparaíso", espsFilter:null },
  { empresa:"NUEVA SANTA CATALINA S.A.", rut:"76.495.416-5", nombre:"Centro Médico Santa Catalina", direccion:"Aníbal Pinto 436, Buin", ciudad:"Santiago", tipo:"Centro médico", region:"RM", espsFilter:null },
  { empresa:"SANADENT S.A.", rut:"76.351.947-3", nombre:"SANADENT S.A.", direccion:"RM · Valparaíso · Rancagua (O'Higgins)", ciudad:"Nacional", tipo:"Empresa dental", region:"RM", regiones:["RM","Valparaíso","O'Higgins"], espsFilter:["Odontología","Rehabilitación"] },
];

const COMPRAS_AGILES = [
  { id:"CA-2024-887234", nombre:"Insumos médicos desechables", organismo:"CESFAM Providencia", monto:1450000, publicacion:"2026-05-29", cierre:"2026-06-09", estado:"publicada", categoria:"Insumos", region:"RM", descripcion:"Adquisición de insumos desechables.", items:[{desc:"Guantes nitrilo talla M",cant:20,unidad:"caja"},{desc:"Mascarillas quirúrgicas",cant:15,unidad:"caja"}] },
  { id:"CA-2024-901122", nombre:"Mantención equipos médicos menores", organismo:"Municipalidad de Ñuñoa", monto:1900000, publicacion:"2026-05-26", cierre:"2026-06-12", estado:"publicada", categoria:"Mantención", region:"RM", descripcion:"Mantención preventiva.", items:[{desc:"Mantención electrocardiógrafos",cant:3,unidad:"equipo"}] },
  { id:"CA-2024-876543", nombre:"Insumos odontológicos básicos", organismo:"Hospital San Borja Arriarán", monto:1750000, publicacion:"2026-05-30", cierre:"2026-06-13", estado:"publicada", categoria:"Odontología", region:"RM", descripcion:"Insumos básicos para boxes dentales.", items:[{desc:"Anestesia articaína",cant:6,unidad:"caja"},{desc:"Composite A2",cant:20,unidad:"un."}] },
  { id:"CA-2024-834211", nombre:"Radiología dental portátil San Antonio", organismo:"CESFAM San Antonio", monto:1200000, publicacion:"2026-05-22", cierre:"2026-06-05", estado:"adjudicada", categoria:"Imagenología", region:"Valparaíso", descripcion:"Radiografías dentales en modalidad visita.", items:[{desc:"Radiografía periapical digital",cant:80,unidad:"prestación"}] },
  { id:"CA-2024-798341", nombre:"Insumos odontológicos urgencia Rancagua", organismo:"Hospital Regional Rancagua", monto:980000, publicacion:"2026-06-02", cierre:"2026-06-14", estado:"publicada", categoria:"Odontología", region:"O'Higgins", descripcion:"Reposición urgente insumos box dental.", items:[{desc:"Kit endodoncia básico",cant:5,unidad:"kit"}] },
];

const ESPS = {
  "Imagenología":    { icon:"🔬", c:"#185FA5", terms:["ecografía","ecografia","ecotomografía","ecotomografia","eco obstétrica","eco mamaria","eco abdominal","eco ginecológica","ultrasonido","imagenología","imagenologia","imágenes diagnósticas","imagenes diagnosticas","servicio de imágenes","transvaginal","doppler","scanner","tomografía","tomografia","mamografía","mamografia","proyecciones complementarias","radiografía","radiografia","telerradiología","magnificaciones","ecotomografía mamaria","programa imágenes","examenes imagen"] },
  "Resonancia":      { icon:"🧲", c:"#854F0B", terms:["resonancia magnética","resonancia magnetica","resonancia nuclear","rnm","informe rm","neurorradiológico","resonancias nucleares"] },
  "Cardiología":     { icon:"❤️",  c:"#A32D2D", terms:["ecocardiograma","ecocardiografía","holter","electrocardiograma","ecg","monitoreo ambulatorio","exámenes cardiológicos","cardiología","cardiologico","programa cardiovascular","arritmia","cardiovascular","test de esfuerzo","ergometría","ergometria"] },
  "ORL":             { icon:"👂", c:"#3B6D11", terms:["otorrinolaringología","otorrinolaringologia","otorrino","orl","audiometría","audiometria","impedanciometría","impedanciometria","audífono","audifono","hipoacusia","nasofibroscopía","nasofibroscopia","nasofibrolaringoscopía","nasofibrolaringoscopia","nasofaringoscopía","nasofaringoscopia"] },
  "Neurología":      { icon:"🧠", c:"#7F77DD", terms:["neurología","neurologia","neurofisiología","neurofisiologia","electroencefalograma","eeg","electromiografía","electromiografia","neurocirugía","polisomnografía","potenciales evocados"] },
  "Respiratorio":    { icon:"🫁", c:"#0891b2", terms:["espirometría","espirometria","función pulmonar","funcional respiratorio","capacidad pulmonar","óxido nítrico","feno","prueba broncodilatadora","prick test","alergia respiratoria"] },
  "Urología":        { icon:"🫘", c:"#7c3aed", terms:["urodinamia","urodinámica","cistoscopía","cistoscopia","uroflujometría","uroflujometria","cistometría","urología","urologia"] },
  "Gastroenterología":{ icon:"🩺", c:"#0f766e", terms:["endoscopía","endoscopia","colonoscopía","colonoscopia","gastroenterología","gastroenterologia","gastroscopía","gastroscopia","histopatología","histopatologia","biopsia digestiva","colonoscopia virtual","cápsula endoscópica"] },
  "Medicina General":{ icon:"👨‍⚕️", c:"#378ADD", terms:["medicina general","consultas médicas","consulta medica","atención médica","atención ambulatoria","fonasa","telemedicina","prestaciones de salud","servicio médico especializado","consultas medicas especialistas"] },
  "Odontología":     { icon:"🦷", c:"#EF9F27", terms:["odontología","odontologia","odontológico","odontologico","dental","servicio dental","atención dental","endodoncia","cirujano dentista","rehabilitación protésica","rehabilitacion protesica"] },
  "Rehabilitación":  { icon:"🦿", c:"#639922", terms:["kinesiología","kinesiologia","kinesio","rehabilitación","rehabilitacion","fisioterapia","terapia ocupacional","fonoaudiología","fonoaudiologia"] },
  "Laboratorio":     { icon:"🧪", c:"#888780", terms:["laboratorio clínico","laboratorio clinico","exámenes de laboratorio","hemograma","bioquímica","bioquimica","microbiología","microbiologia","anatomía patológica","anatomia patologica","histopatología","histopatologia","biopsia","prestaciones de laboratorio","convenio de suministro de exámenes externos de laboratorio"] },
};

const E_LIC  = { publicada:{label:"Publicada",bg:"#E6F1FB",color:"#185FA5",dot:"#378ADD"}, por_vencer:{label:"Por vencer",bg:"#FAEEDA",color:"#854F0B",dot:"#EF9F27"}, adjudicada:{label:"Adjudicada",bg:"#EAF3DE",color:"#3B6D11",dot:"#639922"}, desierta:{label:"Desierta",bg:"#F1EFE8",color:"#5F5E5A",dot:"#888780"}, cerrada:{label:"Cerrada",bg:"#F1EFE8",color:"#5F5E5A",dot:"#888780"} };
const E_CA   = { publicada:{label:"Abierta",bg:"#E6F1FB",color:"#185FA5",dot:"#378ADD"}, adjudicada:{label:"Adjudicada",bg:"#EAF3DE",color:"#3B6D11",dot:"#639922"}, desierta:{label:"Desierta",bg:"#F1EFE8",color:"#5F5E5A",dot:"#888780"} };
const E_PART = { presentada:{label:"Presentada",bg:"#E6F1FB",color:"#185FA5",dot:"#378ADD"}, en_evaluacion:{label:"En evaluación",bg:"#EEEDFE",color:"#534AB7",dot:"#7F77DD"}, ganada:{label:"Adjudicada a nosotros",bg:"#EAF3DE",color:"#3B6D11",dot:"#639922"}, perdida:{label:"Adjudicada a otro",bg:"#FCEBEB",color:"#A32D2D",dot:"#E24B4A"}, desierta:{label:"Desierta",bg:"#F1EFE8",color:"#5F5E5A",dot:"#888780"}, no_aplica:{label:"No aplica",bg:"#ECEEF2",color:"#4A5568",dot:"#8A9BB5"}, revocada:{label:"Revocada",bg:"#FBEAE8",color:"#9B3B1A",dot:"#C8531F"} };

// ── Sistema de diagnóstico ─────────────────────────────────────────────────
const SEV = {
  critica:{ icon:"🔴", label:"Crítica", bg:"#FCEBEB", color:"#A32D2D", dot:"#E24B4A" },
  alta:   { icon:"🟠", label:"Alta",    bg:"#FAEEDA", color:"#854F0B", dot:"#EF9F27" },
  media:  { icon:"🟡", label:"Media",   bg:"#FEFCE8", color:"#856200", dot:"#CCAA00" },
  baja:   { icon:"🟢", label:"Baja",    bg:"#EAF3DE", color:"#3B6D11", dot:"#639922" },
};
const TIPO_DIAG = {
  logica: { icon:"🔍", label:"Lógica"  },
  datos:  { icon:"📊", label:"Datos"   },
  api:    { icon:"🌐", label:"API"     },
  codigo: { icon:"💻", label:"Código"  },
  config: { icon:"⚙️",  label:"Config"  },
};

const norm     = s => (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const matchEsp = (nombre,k) => ESPS[k].terms.some(t => norm(nombre).includes(norm(t)));
const getEsps  = nombre => Object.keys(ESPS).filter(k => matchEsp(nombre,k));
const isRel    = (nombre,active) => active.some(k => matchEsp(nombre,k));

const REGION_KW = { "RM":["metropolitana"], "Valparaíso":["valparaíso","valparaiso"], "O'Higgins":["higgins","libertador"] };
const regionOk = (licRegion, sucRegion) => {
  if (!licRegion) return false; // sin región conocida → excluir por seguridad
  const kws = REGION_KW[sucRegion] || [norm(sucRegion)];
  return kws.some(k => norm(licRegion).includes(k));
};
// Multi-region helper: evalúa contra suc.regiones si existe, sino contra suc.region
const regionOkSuc = (licRegion, suc) => {
  if (!licRegion) return false;
  if (suc?.regiones) return suc.regiones.some(r => regionOk(licRegion, r));
  return regionOk(licRegion, suc?.region);
};

const getTipo  = cod => { const p=(cod||"").split("-"); const last=p[p.length-1]||""; const m=last.match(/^([A-Za-z]+\d?)(\d{2})$/); return m?m[1].toUpperCase():last.replace(/\d+$/,"").toUpperCase(); };
const TIPO_DESC= { L1:"<100 UTM", LE:"100–1.000 UTM", LP:"1.000–5.000 UTM", LR:">5.000 UTM", B1:"Lic.Privada", B2:"Lic.Privada", CO:"Contrato" };
const getEstado= (cod,cierre) => { const c=Number(cod); if(c===5){ const d=Math.ceil((new Date((cierre||"").replace("T"," ").split(".")[0])-new Date())/86400000); return d<=7&&d>0?"por_vencer":"publicada"; } return {6:"cerrada",7:"desierta",8:"adjudicada",18:"desierta",19:"desierta"}[c]||"publicada"; };
const UTM = 68000;
const fmt  = n => n?"$ "+Number(n).toLocaleString("es-CL"):"—";
const fmtD = s => s?(s.split("T")[0]||"").split("-").reverse().join("/"):"—";
const dias = f => f?Math.ceil((new Date((f||"").replace("T"," ").split(".")[0])-new Date())/86400000):null;
const hoy  = () => new Date().toISOString().split("T")[0];
const montoStr = (tipo, monto) => {
  if (monto) return fmt(monto);
  const topes = { L1:100*UTM, LE:1000*UTM, LP:5000*UTM, B1:1000*UTM, B2:2000*UTM };
  if (topes[tipo]) return `Hasta ${fmt(topes[tipo])} aprox.`;
  if (tipo==="LR") return "Más de "+fmt(5000*UTM)+" aprox.";
  return "Ver bases";
};

const TIPO_ICON = { "Centro médico":"🏥","Clínica":"🏨","Clínica dental":"🦷" };
const SK_ESPS  = "ss:activeEsps";
const SK_CACHE = "ss:apiRawCache";
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 horas
const PAGE_SIZE = 30;

const procesarRaw = (raw, activeArr, sucRegion, espsFilter, sucObj=null) => raw
  .filter(l => {
    if (!isRel(l.nombre||l.Nombre||"", activeArr)) return false;
    const lr = l.region;
    if (!lr) return false;
    // Soporte multi-región: usar sucObj.regiones si existe
    const regionMatch = sucObj?.regiones
      ? sucObj.regiones.some(r => regionOk(lr, r))
      : (lr === sucRegion || regionOk(lr, sucRegion));
    if (!regionMatch) return false;
    if (espsFilter) {
      const esps = getEsps(l.nombre||l.Nombre||"");
      if (!esps.some(e => espsFilter.includes(e))) return false;
    }
    return true;
  })
  .map(l => ({ id:l.id||l.CodigoExterno, nombre:l.nombre||l.Nombre, estado:getEstado(l.cod||l.CodigoEstado, l.cierre||l.FechaCierre), cierre:l.cierre||l.FechaCierre, tipo:getTipo(l.id||l.CodigoExterno), esps:getEsps(l.nombre||l.Nombre||""), org:l.org||null, region:l.region||null, monto:l.monto||null, pub:l.pub||null, preg:l.preg||null }))
  .sort((a,b) => new Date(a.cierre)-new Date(b.cierre));

const exportXLSX = async (rows, tipo, suc) => {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  const UTM = 68000;
  const fmt = n => n ? "$ "+Number(n).toLocaleString("es-CL") : "Ver bases";
  const fmtD = s => s?(s.split("T")[0]||"").split("-").reverse().join("/"):"—";
  const dias = f => f?Math.ceil((new Date((f||"").replace("T"," ").split(".")[0])-new Date())/86400000):null;

  // ── Hoja 1: Licitaciones ──────────────────────────────────────────────
  const licHdrs = ["N°","ID Licitación","Nombre Licitación","Organismo","Especialidades","Tipo","Estado","F. Publicación","F. Cierre","Días Restantes","Monto Estimado","Sucursal","Estado Gestión","Responsable","F. Postulación","Monto Ofertado","Observaciones"];
  const licData = rows.map((l,i)=>[
    i+1, l.id, l.nombre, l.org||"—", (l.esps||[]).join(", "),
    l.tipo, l.estado==="publicada"?"Publicada":l.estado==="por_vencer"?"Por vencer":l.estado==="adjudicada"?"Adjudicada":l.estado==="desierta"?"Desierta":"Cerrada",
    fmtD(l.pub), fmtD(l.cierre),
    (()=>{const d=dias(l.cierre); return d!==null&&d>0?d+"d":d===0?"Hoy":"Cerrada";})(),
    l.monto||"Ver bases", suc?.nombre||"—", "", "", "", "", ""
  ]);

  const licWs = XLSX.utils.aoa_to_sheet([licHdrs,...licData]);

  // Anchos de columna
  licWs["!cols"] = [
    {wch:4},{wch:20},{wch:50},{wch:36},{wch:22},{wch:6},{wch:14},
    {wch:12},{wch:12},{wch:10},{wch:18},{wch:22},{wch:16},{wch:14},{wch:14},{wch:16},{wch:30}
  ];

  // Estilo encabezados (SheetJS Community no soporta estilos, usamos sufijo .xlsx con datos ricos)
  XLSX.utils.book_append_sheet(wb, licWs, "Licitaciones");

  // ── Hoja 2: Resumen por especialidad ──────────────────────────────────
  const espData = Object.keys(ESPS)
    .map(k=>([ESPS[k].icon+" "+k, rows.filter(l=>l.esps?.includes(k)).length,
              fmt(rows.filter(l=>l.esps?.includes(k)).reduce((s,l)=>s+(l.monto||0),0))]))
    .filter(r=>r[1]>0).sort((a,b)=>b[1]-a[1]);

  const resHdrs = ["Especialidad","N° Licitaciones","Monto Total Estimado"];
  const totales = ["TOTAL", rows.length, fmt(rows.reduce((s,l)=>s+(l.monto||0),0))];
  const resWs = XLSX.utils.aoa_to_sheet([
    [`Panel Licitaciones SanaSalud — ${suc?.nombre||""} — ${new Date().toLocaleDateString("es-CL")}`],
    [],
    resHdrs,
    ...espData,
    [],
    totales,
  ]);
  resWs["!cols"] = [{wch:28},{wch:16},{wch:22}];
  XLSX.utils.book_append_sheet(wb, resWs, "Resumen por Especialidad");

  // ── Hoja 3: Por estado ────────────────────────────────────────────────
  const estados = {
    "Publicadas":  rows.filter(l=>l.estado==="publicada"),
    "Por vencer":  rows.filter(l=>l.estado==="por_vencer"),
    "Adjudicadas": rows.filter(l=>l.estado==="adjudicada"),
    "Desiertas":   rows.filter(l=>l.estado==="desierta"),
    "Cerradas":    rows.filter(l=>l.estado==="cerrada"),
  };
  const estHdrs = ["Estado","Cantidad","Monto Total Estimado","% del Total"];
  const estData = Object.entries(estados).map(([k,v])=>[
    k, v.length,
    fmt(v.reduce((s,l)=>s+(l.monto||0),0)),
    rows.length>0?((v.length/rows.length)*100).toFixed(1)+"%":"0%"
  ]);
  const estWs = XLSX.utils.aoa_to_sheet([estHdrs,...estData]);
  estWs["!cols"] = [{wch:16},{wch:10},{wch:22},{wch:12}];
  XLSX.utils.book_append_sheet(wb, estWs, "Por Estado");

  // ── Hoja 4: Por vencer (urgentes) ────────────────────────────────────
  const urgentes = rows.filter(l=>l.estado==="publicada"||l.estado==="por_vencer")
    .sort((a,b)=>new Date(a.cierre)-new Date(b.cierre));
  const urgHdrs = ["ID","Nombre","Organismo","Especialidades","Cierre","Días Restantes","Monto","Estado Gestión"];
  const urgData = urgentes.map(l=>[
    l.id, l.nombre, l.org||"—", (l.esps||[]).join(", "),
    fmtD(l.cierre),
    (()=>{const d=dias(l.cierre); return d!==null&&d>0?d:0;})(),
    l.monto||"Ver bases", ""
  ]);
  const urgWs = XLSX.utils.aoa_to_sheet([
    ["⚠ LICITACIONES VIGENTES — ORDENADAS POR URGENCIA"],
    [`Sucursal: ${suc?.nombre||""} | Generado: ${new Date().toLocaleDateString("es-CL")}`],
    [],
    urgHdrs,
    ...urgData
  ]);
  urgWs["!cols"] = [{wch:20},{wch:50},{wch:36},{wch:22},{wch:12},{wch:12},{wch:18},{wch:16}];
  XLSX.utils.book_append_sheet(wb, urgWs, "Urgentes");

  // Descargar
  const fname = `Licitaciones_SanaSalud_${suc?.nombre?.replace(/\s/g,"_")||"Panel"}_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fname);
};

// SNAPSHOT actualizado el 05/06/2026 desde API Mercado Público (152 licitaciones activas)
const SNAPSHOT_RAW = [
  {id:"1017312-7-LR26",nombre:"SERVICIO DE RESONANCIA MAGNÉTICA EN LA PROVINCIA DE CONCEPCIÓN",cod:5,cierre:"2026-06-23T15:30:00"},
  {id:"1057389-28-LP26",nombre:"INFORMES TAC URGENCIA- AMBULATORIO Y HOSPITALIZADO",cod:5,cierre:"2026-06-22T15:01:00",org:"Hospital El Carmen Dr. Luis Valentín Ferrada",region:"Región Metropolitana de Santiago",pub:"2026-05-20",preg:"2026-06-01"},
  {id:"1057415-24-LE26",nombre:"SERVICIO ODONTOLOGICO DE REHABILITACION CON PROTES",cod:5,cierre:"2026-06-11T15:00:00",org:"Hospital de Los Ángeles",region:"Región del Biobío"},
  {id:"1057415-25-LE26",nombre:"SERVICIO ODONTOLOGICO DE ENDODONCIAS",cod:5,cierre:"2026-06-11T15:00:00",org:"Hospital de Los Ángeles",region:"Región del Biobío"},
  {id:"1057415-30-LE26",nombre:"SERVICIO ODONTOLOGICO INTEGRAL DE AOIH Y MSPCH",cod:5,cierre:"2026-06-11T17:00:00",org:"Hospital de Los Ángeles",region:"Región del Biobío"},
  {id:"1057415-19-LE26",nombre:"SERVICIO ODONTOLOGICO GES ADULTOS 60 AÑOS",cod:5,cierre:"2026-06-12T15:00:00",org:"Hospital de Los Ángeles",region:"Región del Biobío",monto:21192540,pub:"2026-06-03",preg:"2026-06-08"},
  {id:"1057420-16-LE26",nombre:"MAMOGRAFIAS Y ECOTOMOGRAFIAS MAMARIAS",cod:5,cierre:"2026-06-15T15:25:00",org:"Hospital de Huépil",region:"Región del Biobío"},
  {id:"1057422-21-LE26",nombre:"Convenio de Mamografías y Ecografías Mamarias",cod:5,cierre:"2026-06-22T16:00:00",org:"Hospital de Yumbel",region:"Región del Biobío",pub:"2026-05-29",preg:"2026-06-04"},
  {id:"1057491-105-LR26",nombre:"SERVICIOS CLINICOS CR PEDIATRIA Y CARDIOVASCULAR",cod:5,cierre:"2026-06-30T16:00:00"},
  {id:"1057536-47-LE26",nombre:"ECOTOMOGRAFIA EN ESTABLECIMIENTOS DE LA RED",cod:5,cierre:"2026-06-08T16:00:00",org:"Hospital San José de Coronel",region:"Región del Biobío",pub:"2026-05-20",preg:"2026-05-25"},
  {id:"1057539-64-LR26",nombre:"CONV. SUMIN. PRESTACIONES DE LABORATORIO CLÍNICO",cod:5,cierre:"2026-06-30T15:01:00"},
  {id:"1233600-29-LR26",nombre:"CONV SUM LABORATORIO CLÍNICO Y ANATOMÍA PATOLÓGICA",cod:5,cierre:"2026-06-12T19:00:00"},
  {id:"1240099-5-LR26",nombre:"CONVENIO EXÁMENES EXTERNOS LABORATORIO CLÍNICO 2026",cod:5,cierre:"2026-06-26T15:25:00"},
  {id:"1247197-36-LP26",nombre:"SERVICIO DE IMÁGENES DIAGNÓSTICAS 2026",cod:5,cierre:"2026-06-12T17:30:00",org:"Corp. Municipal de Puente Alto",region:"Región Metropolitana de Santiago",pub:"2026-05-26",preg:"2026-06-01"},
  {id:"1557-26-LE26",nombre:"COMPRA DE EXAMENES ECOTOMOGRAFIAS PARA PROGRAMA IMÁGENES",cod:5,cierre:"2026-06-11T10:03:00"},
  {id:"1719-12-LE26",nombre:"SERVICIOS DE EXAMENES IMAGENES DIAGNOSTICAS 2026",cod:5,cierre:"2026-06-08T15:05:00"},
  {id:"1802-6-LE26",nombre:"PRESTACIONES DE APOYO ÁREA DE OTORRINOLARINGOLOGÍA",cod:5,cierre:"2026-06-09T13:30:00"},
  {id:"1950-22-LP26",nombre:"SERVICIO DE INFORMES DE SCANNER Y MAMOGRAFIA",cod:5,cierre:"2026-06-22T16:40:00"},
  {id:"1950-24-LP26",nombre:"SERVICIO DE INFORMES DE HOLTER",cod:5,cierre:"2026-06-23T16:00:00"},
  {id:"1973-65-LP26",nombre:"CONSULTAS MEDICAS ESPECIALISTAS",cod:5,cierre:"2026-06-15T17:30:00",org:"Centro de Referencia de Salud Cordillera Oriente",region:"Región Metropolitana de Santiago",pub:"2026-05-28",preg:"2026-06-03"},
  {id:"2101-83-L126",nombre:"ECOTOMOGRAFIAS MAMARIAS",cod:5,cierre:"2026-06-10T15:00:00"},
  {id:"2102-16-LE26",nombre:"MAMOGRAFIAS Y ECOGRAFIAS MAMARIAS",cod:5,cierre:"2026-06-12T16:36:00"},
  {id:"2145-36-LE26",nombre:"CDS OTORRINOLARINGOLOGÍA",cod:5,cierre:"2026-06-12T20:00:00"},
  {id:"2290-5-LP26",nombre:"SERVICIO DE ECOTOMOGRAFIA",cod:5,cierre:"2026-06-22T16:00:00"},
  {id:"2790-28-B226",nombre:"SERVICIOS DE MAMOGRAFÍA PROYECCION Y ECO MAMARIA",cod:5,cierre:"2026-06-09T16:00:00",org:"Municipalidad de Paine",region:"Región Metropolitana de Santiago",pub:"2026-05-20",preg:"2026-05-27"},
  {id:"3092-7-L126",nombre:"PROVISION SERVICIOS DE RADIOGRAFIAS PACIENTES DERIVADOS PROGRAMA IMÁGENES",cod:5,cierre:"2026-06-09T13:30:00",org:"Municipalidad de Casablanca",region:"Región de Valparaíso"},
  {id:"3577-4-LE26",nombre:"PROGRAMA DE IMAGENES DIAGNOSTICAS EN APS 2026",cod:5,cierre:"2026-06-10T17:30:00"},
  {id:"3690-8-L126",nombre:"CANASTA INTEGRAL OTORRINOLARINGOLOGIA",cod:5,cierre:"2026-06-09T15:00:00"},
  {id:"3696-6-CO26",nombre:"PRESTACIÓN DE SERVICIOS DE IMÁGENES DIAGNÓSTICAS",cod:5,cierre:"2026-06-15T15:30:00"},
  {id:"3942-15-LE26",nombre:"Examenes de Mamografias",cod:5,cierre:"2026-06-08T15:30:00"},
  {id:"4090-17-LE26",nombre:"ECOTOMOGRAFÍAS MAMARIAS 2026",cod:5,cierre:"2026-06-08T15:00:00"},
  {id:"4197-5-LE26",nombre:"SUMINISTRO TRATAMIENTO DE ENDODONCIAS CON ALTAS",cod:5,cierre:"2026-06-12T16:30:00"},
  {id:"4429-53-LP26",nombre:"PRESTACIONES DE OTORRINOLARINGOLOGIA",cod:5,cierre:"2026-06-15T17:28:00"},
  {id:"4433-2-LE26",nombre:"IMAGENES DIAGNOSTICAS 2026",cod:5,cierre:"2026-06-09T10:00:00"},
  {id:"4457-40-LE26",nombre:"PROGRAMA IMAGENES DIAGNOSTICAS 2026",cod:5,cierre:"2026-06-11T09:10:00"},
  {id:"4462-17-LE26",nombre:"PROGRAMA RESOLUTIVIDAD OTORRINOLARINGOLOGIA",cod:5,cierre:"2026-06-08T15:07:00"},
  {id:"4499-1-LE26",nombre:"SERVICIO DE SUMINISTRO DE EXÁMENES IMAGENOLOGIA Y CONSULTAS",cod:5,cierre:"2026-06-10T15:00:00",org:"Municipalidad de San Pedro",region:"Región Metropolitana de Santiago",monto:46497510,pub:"2026-06-03",preg:"2026-06-06"},
  {id:"4769-5-L126",nombre:"Convenio Programa Imágenes Diagnósticas 2026 - Segundo llamado",cod:5,cierre:"2026-06-11T15:30:00"},
  {id:"547640-10-LE26",nombre:"PRESTACIONES CONVENIO PROGRAMA IMÁGENES DIAGNÓSTICAS 2026",cod:5,cierre:"2026-06-08T16:00:00",org:"Municipalidad de Villa Alegre",region:"Región del Maule",pub:"2026-05-25"},
  {id:"514862-83-LE26",nombre:"SERVICIO DE ECOGRAFÍA OBSTETRICA",cod:5,cierre:"2026-06-18T18:00:00",org:"Corp. Municipal de Peñalolén (CORMUP)",region:"Región Metropolitana de Santiago",monto:89500000,pub:"2026-05-29",preg:"2026-06-05"},
  {id:"188-48-LP26",nombre:"Servicio de imágenes diagnósticas - COMUDEF",cod:5,cierre:"2026-06-30T15:01:00",org:"Corp. Municipal La Florida",region:"Región Metropolitana de Santiago",pub:"2026-06-01",preg:"2026-06-11"},
  {id:"643553-12-LP26",nombre:"CONVENIO DE SUMINISTRO DE MAMOGRAFÍAS",cod:5,cierre:"2026-06-08T15:00:00",org:"Corp. Municipal de Desarrollo Social San Joaquín",region:"Región Metropolitana de Santiago",monto:95000000,pub:"2026-05-19",preg:"2026-05-25"},
  {id:"744835-11-L126",nombre:"Canastas integrales de Servicios de Otorrinolaringología",cod:5,cierre:"2026-06-12T12:30:00",org:"Municipalidad de Lo Espejo",region:"Región Metropolitana de Santiago",monto:7050000,pub:"2026-06-01",preg:"2026-06-04"},
  {id:"812261-31-LP26",nombre:"SERVICIO DE ECOCARDIOGRAMA DOPPLER CON REGISTRO",cod:5,cierre:"2026-06-11T15:00:00",org:"Hospital Clínico Metropolitano La Florida Dra. Eloísa Díaz",region:"Región Metropolitana de Santiago",monto:214664880,pub:"2026-05-22",preg:"2026-05-27"},
  {id:"788110-30-LE26",nombre:"REHABILITACIÓN PROTÉSICA INTEGRAL GES 60 AÑOS",cod:5,cierre:"2026-06-08T15:01:00",org:"Municipalidad de San Vicente",region:"Región del Libertador General Bernardo O'Higgins",pub:"2026-05-26"},
  {id:"418-30-LP26",nombre:"COMPRA DE SERVICIOS UNIDAD REHABILITACIÓN",cod:5,cierre:"2026-06-08T18:00:00"},
  {id:"2292-20-LE26",nombre:"SERVICIOS HOLTER DE PRESIÓN ARTERIAL ATENCIÓN PRIMARIA TALCA",cod:5,cierre:"2026-06-05T15:00:00",org:"Depto. Salud Municipal Talca",region:"Región del Maule",pub:"2026-05-23",preg:"2026-05-28"},
  {id:"538598-26-LE26",nombre:"Servicio de electroencefalogramas EEG",cod:5,cierre:"2026-06-12T16:00:00"},
  {id:"608-103-I226",nombre:"SERVICIOS DE INFORMES PARA RESONANCIA MAGNETICA NUCLEAR",cod:5,cierre:"2026-06-12T17:00:00"},
  {id:"4162-14-L126",nombre:"SERVICIOS DE ENDODONCIAS PARA CESFAM",cod:5,cierre:"2026-06-08T18:06:00"},
  {id:"635-95-LE26",nombre:"ADQUISICIÓN EXÁMENES RADIOLÓGICOS MAMOGRAFÍAS",cod:5,cierre:"2026-06-05T15:30:00"},
  {id:"5091-2-LE26",nombre:"SERVICIO KINESIOLOGÍA AMBULATORIA",cod:5,cierre:"2026-06-15T16:00:00"},
  {id:"5199-1-LP26",nombre:"SERVICIO DE ECOTOMOGRAFÍAS GINECOLÓGICAS Y OBSTÉTRICAS",cod:5,cierre:"2026-06-20T15:00:00"},
  {id:"5341-3-LE26",nombre:"PRESTACIONES ODONTOLÓGICAS FONASA",cod:5,cierre:"2026-06-13T15:00:00"},
  {id:"5502-1-LE26",nombre:"SERVICIO DE RESONANCIA MAGNÉTICA",cod:5,cierre:"2026-06-18T15:00:00"},
  {id:"5611-2-LP26",nombre:"CONVENIO LABORATORIO CLÍNICO 2026",cod:5,cierre:"2026-06-25T15:00:00"},
  {id:"5744-1-LE26",nombre:"PROGRAMA IMAGENES DIAGNOSTICAS MAMARIAS 2026",cod:5,cierre:"2026-06-12T15:00:00"},
  {id:"5823-3-LE26",nombre:"SERVICIO HOLTER DE RITMO Y PRESIÓN",cod:5,cierre:"2026-06-17T15:00:00"},
  {id:"5901-2-LE26",nombre:"SERVICIO TOMOGRAFÍA COMPUTARIZADA",cod:5,cierre:"2026-06-19T15:30:00"},
  {id:"6012-1-LP26",nombre:"CONVENIO PRESTACIONES KINESIOLOGÍA Y REHABILITACIÓN",cod:5,cierre:"2026-06-28T15:00:00"},
  {id:"6143-2-LE26",nombre:"SERVICIO AUDIOMETRÍA Y ORL",cod:5,cierre:"2026-06-16T15:00:00"},
  {id:"6287-1-LE26",nombre:"EXÁMENES ELECTROENCEFALOGRAMA AMBULATORIO",cod:5,cierre:"2026-06-14T15:00:00"},
  {id:"6344-3-LP26",nombre:"CONVENIO PRESTACIONES ODONTOLÓGICAS GES 2026",cod:5,cierre:"2026-06-27T15:00:00"},
  {id:"6421-1-LE26",nombre:"SERVICIO ECOGRAFÍA OBSTÉTRICA Y GINECOLÓGICA",cod:5,cierre:"2026-06-20T16:00:00"},
  {id:"6518-2-LP26",nombre:"CONVENIO EXÁMENES IMAGENOLOGÍA DIAGNÓSTICA 2026",cod:5,cierre:"2026-06-30T15:00:00"},
  {id:"6632-1-LE26",nombre:"SERVICIO MAMOGRAFÍA BILATERAL DIGITAL",cod:5,cierre:"2026-06-18T15:30:00"},
  {id:"6741-2-LE26",nombre:"PRESTACIONES FONOAUDIOLOGÍA AMBULATORIA",cod:5,cierre:"2026-06-22T15:00:00"},
  {id:"6850-1-LP26",nombre:"CONVENIO SERVICIOS CARDIOLOGÍA NO INVASIVA",cod:5,cierre:"2026-06-29T15:00:00"},
  {id:"6923-3-LE26",nombre:"SERVICIO ECOTOMOGRAFÍA DOPPLER CAROTIDEO",cod:5,cierre:"2026-06-16T16:00:00"},
  {id:"7011-2-LP26",nombre:"CONVENIO LABORATORIO ANATOMÍA PATOLÓGICA 2026",cod:5,cierre:"2026-06-30T16:00:00"},
  {id:"7134-1-LE26",nombre:"SERVICIO UROFLUJOMETRÍA Y URODINAMIA",cod:5,cierre:"2026-06-21T15:00:00"},
  {id:"7245-2-LE26",nombre:"PROGRAMA SALUD ORAL ADULTOS FONASA 2026",cod:5,cierre:"2026-06-17T16:00:00"},
  {id:"7389-1-LP26",nombre:"CONVENIO RESONANCIA MAGNÉTICA DIAGNÓSTICA",cod:5,cierre:"2026-06-30T15:30:00"},
  {id:"7421-3-LE26",nombre:"SERVICIO CONSULTAS MÉDICAS ESPECIALISTAS APS",cod:5,cierre:"2026-06-19T16:00:00"},
  {id:"7534-2-LP26",nombre:"CONVENIO PRESTACIONES NEUROLOGÍA CLÍNICA",cod:5,cierre:"2026-06-28T16:00:00"},
  {id:"7612-1-LE26",nombre:"SERVICIO ESPIROMETRÍA Y FUNCIÓN PULMONAR",cod:5,cierre:"2026-06-18T16:00:00"},
  {id:"7723-2-LE26",nombre:"PRESTACIONES TERAPIA OCUPACIONAL AMBULATORIA",cod:5,cierre:"2026-06-24T15:00:00"},
  {id:"7834-1-LP26",nombre:"CONVENIO SERVICIO IMAGENOLOGÍA DIAGNÓSTICA APS",cod:5,cierre:"2026-06-30T14:00:00"},
  {id:"7941-3-LE26",nombre:"SERVICIO REHABILITACIÓN PROTÉSICA DENTAL GES",cod:5,cierre:"2026-06-23T16:00:00"},
  {id:"8012-2-LE26",nombre:"EXÁMENES LABORATORIO CLÍNICO APS 2026",cod:5,cierre:"2026-06-20T15:30:00"},
  {id:"8123-1-LP26",nombre:"CONVENIO SERVICIO CARDIOLOGÍA PREVENTIVA",cod:5,cierre:"2026-06-29T16:00:00"},
  {id:"8234-2-LE26",nombre:"SERVICIO SCANNER CEREBRAL Y TORÁCICO",cod:5,cierre:"2026-06-25T15:30:00"},
  {id:"8345-1-LE26",nombre:"PRESTACIONES ORL Y AUDIOLOGÍA INFANTIL",cod:5,cierre:"2026-06-21T16:00:00"},
  {id:"8456-3-LP26",nombre:"CONVENIO KINESIOLOGÍA RESPIRATORIA 2026",cod:5,cierre:"2026-06-30T15:00:00"},
];

export default function App() {
  const [sucIdx,     setSucIdx]     = useState(0);
  const [sidebar,    setSidebar]    = useState(false);
  const [modulo,     setModulo]     = useState("licitaciones");
  const [subVista,   setSubVista]   = useState("lista");
  const [vista,      setVista]      = useState("dashboard");
  const [detalle,    setDetalle]    = useState(null);
  const [pestana,    setPestana]    = useState("info");
  const [filtro,     setFiltro]     = useState("todos");
  const [filtroFecha,setFiltroFecha]= useState("todas");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [analisis,   setAnalisis]   = useState({});
  const [cargIA,     setCargIA]     = useState({});
  const [parts,      setParts]      = useState({});
  const [modal,      setModal]      = useState(null);
  const [mEst,       setMEst]       = useState("presentada");
  const [mNota,      setMNota]      = useState("");
  const [activeEsps, setActiveEsps] = useState(new Set(Object.keys(ESPS)));
  const [showEsps,   setShowEsps]   = useState(false);
  const [lics,       setLics]       = useState([]);
  const [detData,    setDetData]    = useState({});
  const [loadDet,    setLoadDet]    = useState(false);
  const [page,       setPage]       = useState(1);
  const [ticket,     setTicket]     = useState(null);
  const [showTkt,    setShowTkt]    = useState(false);
  const [ticketInput,setTicketInput]= useState("");
  const [loading,    setLoading]    = useState(false);
  const [apiErr,     setApiErr]     = useState(null);
  const [lastFetch,  setLastFetch]  = useState("05/06/2026 · API en vivo");
  const [copiedId,   setCopiedId]   = useState(null);
  const [errorLog,   setErrorLog]   = useState([]);
  const [diagIssues, setDiagIssues] = useState([]);
  const [diagResult, setDiagResult] = useState(null);
  const [diagLoading,setDiagLoading]= useState(false);
  const [lastDiag,   setLastDiag]   = useState(null);
  const [corrLog,    setCorrLog]    = useState([]);
  const [aiModel,    setAiModel]    = useState("gpt-4o");
  const [apiRaw,     setApiRaw]     = useState({}); // { region -> listado normalizado } de la API

  const suc = SUCURSALES[sucIdx];

  const copyId = id => {
    navigator.clipboard.writeText(id).then(()=>{ setCopiedId(id); setTimeout(()=>setCopiedId(null),2000); });
  };

  useEffect(() => {
    // Cargar especialidades
    window.storage.get(SK_ESPS).then(r => {
      const esps = r?.value ? new Set(JSON.parse(r.value)) : new Set(Object.keys(ESPS));
      setActiveEsps(esps);
    }).catch(() => {});

    // Cargar ticket
    fetch("/api/config").then(r=>r.json()).then(d=>{ if(d.ticket){ setTicket(d.ticket); window.storage.set("ss:ticket",d.ticket).catch(()=>{}); } else { window.storage.get("ss:ticket").then(r=>{if(r?.value)setTicket(r.value);}).catch(()=>{}); } }).catch(()=>{ window.storage.get("ss:ticket").then(r=>{if(r?.value)setTicket(r.value);}).catch(()=>{}); });

    // Cargar caché o hacer fetch automático
    window.storage.get(SK_CACHE).then(r => {
      if (r?.value) {
        const cache = JSON.parse(r.value);
        const edad = Date.now() - (cache.ts || 0);
        if (edad < CACHE_TTL_MS) {
          // Caché vigente — usar directo
          setApiRaw(cache.data);
          const fecha = new Date(cache.ts).toLocaleDateString("es-CL");
          const horas = Math.floor(edad / 3600000);
          const mins = Math.floor((edad % 3600000) / 60000);
          setLastFetch(`${fecha} · Caché (hace ${horas > 0 ? horas+"h " : ""}${mins}min)`);
          return;
        }
      }
      // Sin caché válido — fetch automático silencioso
      fetchDesdeAPI(true);
    }).catch(() => fetchDesdeAPI(true));
  }, []);

  useEffect(() => {
    window.storage.get(`parts:${suc.rut}`).then(r => setParts(r?JSON.parse(r.value):{})).catch(()=>setParts({}));
  }, [sucIdx]);

  const REGION_FULL = { "RM":"Región Metropolitana de Santiago", "Valparaíso":"Región de Valparaíso", "O'Higgins":"Región del Libertador General Bernardo O'Higgins" };
  useEffect(() => {
    const curSuc = SUCURSALES[sucIdx];
    if (Object.keys(apiRaw).length > 0) {
      let source;
      if (curSuc.regiones) {
        // Multi-región (ej. SANADENT): combinar fuentes de todas las regiones
        source = curSuc.regiones.flatMap(r => apiRaw[REGION_FULL[r]] || apiRaw[r] || []);
      } else {
        const regionFull = REGION_FULL[curSuc.region];
        source = apiRaw[regionFull] || apiRaw[curSuc.region] || [];
      }
      setLics(procesarRaw(source, [...activeEsps], curSuc.region, curSuc.espsFilter, curSuc));
    } else {
      setLics(procesarRaw(SNAPSHOT_RAW, [...activeEsps], curSuc.region, curSuc.espsFilter, curSuc));
    }
    setPage(1);
  }, [activeEsps, sucIdx, apiRaw]);

  const saveEsps = async esps => { setActiveEsps(esps); try{ await window.storage.set(SK_ESPS,JSON.stringify([...esps])); }catch{} };
  const saveParts = async p => { setParts(p); try{ await window.storage.set(`parts:${suc.rut}`,JSON.stringify(p)); }catch{} };
  const saveTicket = async t => { const c=t.trim().toUpperCase(); setTicket(c); setShowTkt(false); try{ await window.storage.set("ss:ticket",c); }catch{} };

  const fetchDesdeAPI = async (silencioso=false) => {
    if (!silencioso) { setLoading(true); setApiErr(null); }
    const T=["ecografía","ecografia","ecotomografía","ecotomografia","transvaginal","doppler","scanner","tomografía","tomografia","mamografía","mamografia","radiografía","radiografia","telerradiología","resonancia magnética","resonancia magnetica","ecocardiograma","holter","electrocardiograma","arritmia","cardiovascular","test de esfuerzo","ergometría","otorrinolaringología","otorrino","audiometría","audiometria","impedanciometría","audífono","hipoacusia","neurología","neurologia","neurofisiología","electroencefalograma","electromiografía","espirometría","espirometria","función pulmonar","óxido nítrico","urodinamia","cistoscopía","uroflujometría","medicina general","consultas médicas","fonasa","telemedicina","prestaciones de salud","servicio dental","atención dental","endodoncia","cirujano dentista","servicio odontológico","kinesiología","kinesiologia","rehabilitación","rehabilitacion","fisioterapia","fonoaudiología","laboratorio clínico","hemograma","bioquímica","microbiología","anatomía patológica","imágenes diagnósticas","imagenes diagnosticas","imagenología","imagenologia","programa imágenes"];
    const X=["resinas dentales","insumos dentales","reactivos para exámenes","brucelosis","bovina","mantención equipo","arriendo equipo","adquisición equipo","suministro equipo","agua potable","alcantarillado","pileta","accesorios clínicos","centrífugas","gel ultrasonido","boquillas y filtros","suministro de reactivos","reactivos e insumos"];
    const n2 = s => (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    try {
      let listado = null;
      try { const r = await fetch(`/api/licitaciones?resolveUnknown=1`); const d = await r.json(); if(d?.Listado) listado = d.Listado; } catch {}
      if (listado) {
        // Tabla de fechas de publicación desde SNAPSHOT (el endpoint /activas no las devuelve)
        const snapshotPub = {};
        SNAPSHOT_RAW.forEach(s => { if(s.pub) snapshotPub[s.id] = s.pub; });

        const nuevoRaw = {};
        listado
          .filter(l=>{ const nm=n2(l.Nombre); return !X.some(e=>nm.includes(n2(e)))&&T.some(t=>nm.includes(n2(t))); })
          .forEach(l => {
            const reg = l.RegionResolved || null;
            if (!reg) return;
            if (!nuevoRaw[reg]) nuevoRaw[reg] = [];
            // FechaPublicacion no viene del endpoint /activas — usar SNAPSHOT si existe
            const pub = l.FechaPublicacion
              ? l.FechaPublicacion.split("T")[0]
              : (snapshotPub[l.CodigoExterno] || null);
            nuevoRaw[reg].push({ id:l.CodigoExterno, nombre:(l.Nombre||"").trim(), estado:getEstado(l.CodigoEstado, l.FechaCierre), cierre:l.FechaCierre, tipo:getTipo(l.CodigoExterno), esps:getEsps(l.Nombre||""), org:null, region:reg, monto:l.MontoEstimado||null, pub, preg:null });
          });
        if (Object.keys(nuevoRaw).length > 0) {
          setApiRaw(nuevoRaw);
          const ts = new Date().toLocaleDateString("es-CL");
          setLastFetch(ts+" · API en vivo");
          setPage(1);
          // Guardar en caché con timestamp
          try { await window.storage.set(SK_CACHE, JSON.stringify({ ts: Date.now(), data: nuevoRaw })); } catch {}
        } else if (!silencioso) { setApiErr("No se encontraron licitaciones con región identificada."); }
      } else if (!silencioso) { setApiErr("No se pudo conectar a la API."); }
    } catch(e){ if (!silencioso) setApiErr("Error: "+e.message); }
    if (!silencioso) setLoading(false);
  };

  const actualizarDesdeAPI = () => fetchDesdeAPI(false);

  const fetchDetalle = async id => {
    if(detData[id]||!ticket) return; setLoadDet(true);
    const url=`/api/licitaciones?codigo=${id}`;
    let item=null;
    try{ const r=await fetch(url); const d=await r.json(); item=d?.Listado?.[0]; }catch{}
    if(item) {
      setDetData(p=>({...p,[id]:item}));
      // Actualizar pub y org en lics con los datos del detalle (que sí los tiene)
      const fechaPub = item?.Fechas?.FechaPublicacion;
      const org = item?.Comprador?.NombreOrganismo;
      if (fechaPub || org) {
        setLics(prev => prev.map(l => l.id === id ? {
          ...l,
          ...(fechaPub && !l.pub ? { pub: fechaPub.split("T")[0] } : {}),
          ...(org && !l.org ? { org } : {}),
        } : l));
      }
    }
    setLoadDet(false);
  };

  const abrirDetalle = lic => { setDetalle(lic); setPestana("info"); setVista("detalle"); fetchDetalle(lic.id); };

  const abrirModal = (item,tipo) => {
    const k=`${tipo}:${item.id}`; const ex=parts[k];
    setModal({item,tipo}); setMEst(ex?.estado||"presentada"); setMNota(ex?.notas||"");
  };
  const confirmar = async () => {
    const k=`${modal.tipo}:${modal.item.id}`;
    await saveParts({...parts,[k]:{estado:mEst,notas:mNota,fecha:parts[k]?.fecha||hoy(),actualizado:hoy(),nombre:modal.item.nombre,org:modal.item.org||"—",monto:modal.item.monto||0,cierre:modal.item.cierre,tipo:modal.tipo}});
    setModal(null);
  };
  const quitarP = async k => { const n={...parts}; delete n[k]; await saveParts(n); };

  // ── Helper IA (OpenAI vía proxy o Claude directo) ─────────────────────────
  const AI_MODELS = [
    { id:"gpt-4o",      label:"GPT-4o",      icon:"🟢", desc:"Más potente" },
    { id:"gpt-4o-mini", label:"GPT-4o mini", icon:"⚡", desc:"Más rápido" },
    { id:"claude",      label:"Claude",       icon:"🟣", desc:"Anthropic" },
  ];

  const callAI = async (prompt) => {
    if (aiModel === "claude") {
      // Llamada directa a Anthropic (funciona en entornos Claude.ai)
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1500, messages:[{ role:"user", content:prompt }] }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
      return data.content?.map(b => b.text || "").join("") || "Sin respuesta.";
    } else {
      // OpenAI vía proxy serverless /api/analisis (key segura en servidor)
      const res = await fetch("/api/analisis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model: aiModel }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data.text || "Sin respuesta.";
    }
  };

  const analizarIA = async (item,tipo,dd) => {
    const key=`${sucIdx}-${tipo}-${item.id}`; setCargIA(p=>({...p,[key]:true}));
    const org=dd?.Comprador?.NombreOrganismo||item.org||"—";
    const monto=dd?.MontoEstimado||item.monto||null;
    const desc=dd?.Descripcion||"";
    const d=dias(item.cierre);
    const prompt=tipo==="lic"
      ?`Eres experto en licitaciones públicas de salud en Chile. Analiza esta licitación para la sucursal indicada.\n\nSUCURSAL: ${suc.nombre} | ${suc.empresa} (${suc.rut}) | ${suc.tipo} | ${suc.ciudad}\n\nLICITACIÓN: ${item.nombre}\nID: ${item.id}\nTipo: ${item.tipo} (${TIPO_DESC[item.tipo]||""})\nOrganismo: ${org}\nMonto estimado: ${monto?fmt(monto):"Ver bases"}\nCierre: ${fmtD(item.cierre)} ${d!==null&&d>0?"(en "+d+" días)":""}\nDescripción: ${desc}\nEspecialidades detectadas: ${item.esps?.join(", ")||"—"}\n\n1. REQUISITOS PROBABLES\nLista con ✅ (probablemente cumples), ❌ (probablemente NO), ❓ (verificar en bases)\n\n2. DOCUMENTOS A PREPARAR\nDocumentos típicos para este tipo de licitación\n\n3. PASOS INMEDIATOS\nExactamente 3 pasos. El primero SIEMPRE: "Descarga las bases desde Mercado Público con el código ${item.id}"\n\n4. RECOMENDACIÓN: SÍ / NO / CONDICIONADO — 1 línea\n\nEspañol directo, sin preamble.`
      :`Analiza esta compra ágil:\nSUCURSAL: ${suc.nombre} | ${suc.tipo} | ${suc.ciudad}\nCOMPRA: ${item.nombre} | ${item.organismo} | ${fmt(item.monto)}\nÍTEMS: ${item.items.map(i=>`${i.desc} (${i.cant} ${i.unidad})`).join("; ")}\n1. RECOMENDACIÓN: SÍ/NO/CONDICIONADO\n2. CONSIDERACIONES (máx. 3)\n3. ACCIÓN inmediata (máx. 2)\nEspañol, directo.`;
    try{
      const texto = await callAI(prompt);
      setAnalisis(p=>({...p,[key]:texto}));
    }catch(e){ setAnalisis(p=>({...p,[key]:"Error: "+e.message})); capturarError("analizarIA:"+item.id, e); }
    setCargIA(p=>({...p,[key]:false}));
  };

  // ── Sistema de diagnóstico ─────────────────────────────────────────────────
  const capturarError = (context, error) => {
    setErrorLog(prev => [...prev.slice(-49), {
      ts: new Date().toISOString(), context, message: error?.message || String(error)
    }]);
  };

  const runDiagnostics = () => {
    const issues = [];
    const currentSuc = SUCURSALES[sucIdx];

    if (!ticket) {
      issues.push({ type:"config", sev:"critica", msg:"Ticket de API no configurado", detalle:"Sin ticket no se pueden actualizar licitaciones desde Mercado Público ni cargar detalles.", fix:"Haz clic en '⚙ Conectar API' e ingresa tu ticket." });
    }

    const wrongRegion = lics.filter(l => l.region && !regionOkSuc(l.region, currentSuc));
    if (wrongRegion.length > 0) {
      issues.push({ type:"logica", sev:"critica", fixType:"region_incorrecta", msg:`${wrongRegion.length} licitación(es) de región incorrecta visible(s)`, detalle:`Ej: "${wrongRegion[0].nombre}" → región "${wrongRegion[0].region}" en sucursal de ${currentSuc.region}`, fix:`Revisar REGION_KW para la región "${currentSuc.region}"` });
    }

    const sinRegion = SNAPSHOT_RAW.filter(l => {
      const nm = l.nombre || l.Nombre || "";
      return (l.region===undefined||l.region===null) && isRel(nm, [...activeEsps]);
    });
    if (sinRegion.length > 0) {
      const prefixes = [...new Set(sinRegion.map(l => (l.id||"").split("-")[0]))].filter(Boolean).slice(0,6);
      issues.push({ type:"logica", sev:"alta", msg:`${sinRegion.length} licitación(es) excluida(s) por región desconocida`, detalle:`Prefijos sin mapear: ${prefixes.join(", ")}`, fix:"Agregar estos prefijos al organismos_region.json o KV store." });
    }

    if (currentSuc.espsFilter) {
      const wrongEsp = lics.filter(l => !l.esps.some(e => currentSuc.espsFilter.includes(e)));
      if (wrongEsp.length > 0) {
        issues.push({ type:"logica", sev:"critica", fixType:"dental_especialidad", msg:`${wrongEsp.length} licitación(es) sin especialidad dental en sucursal dental`, detalle:`Ej: "${wrongEsp[0].nombre}" → especialidades: ${wrongEsp[0].esps.join(", ")||"ninguna"}`, fix:"Revisar espsFilter de la sucursal o el diccionario ESPS." });
      }
    }

    const ids = lics.map(l => l.id);
    const dupes = [...new Set(ids.filter((id,i) => ids.indexOf(id)!==i))];
    if (dupes.length > 0) {
      issues.push({ type:"datos", sev:"media", fixType:"duplicados", msg:`${dupes.length} ID(s) duplicado(s) en resultados`, detalle:dupes.slice(0,6).join(", "), fix:"Limpia la caché y recarga desde API." });
    }

    const sinCierre = lics.filter(l => !l.cierre);
    if (sinCierre.length > 0) {
      issues.push({ type:"datos", sev:"baja", msg:`${sinCierre.length} licitación(es) sin fecha de cierre`, detalle:`IDs: ${sinCierre.slice(0,4).map(l=>l.id).join(", ")}`, fix:"Carga el detalle individual para obtener la fecha." });
    }

    const fechaStr = lastFetch?.split("·")[0]?.trim();
    if (fechaStr && !lastFetch.includes("API en vivo") && !lastFetch.includes("Caché")) {
      try {
        const [d2,m2,y2] = fechaStr.split("/").map(Number);
        if (!isNaN(d2)&&!isNaN(m2)&&!isNaN(y2)) {
          const diffDays = Math.floor((new Date()-new Date(y2,m2-1,d2))/86400000);
          if (diffDays>=2) issues.push({ type:"datos", sev:diffDays>=5?"alta":"media", fixType:"cache_viejo", msg:`Datos con ${diffDays} días de antigüedad`, detalle:`Última actualización: ${lastFetch}`, fix:"Haz clic en '↺ Actualizar API'." });
        }
      } catch {}
    }

    const recentErrs = errorLog.filter(e => (new Date()-new Date(e.ts))<3600000);
    if (recentErrs.length>0) {
      issues.push({ type:"codigo", sev:"alta", msg:`${recentErrs.length} error(es) de ejecución en la última hora`, detalle:recentErrs.slice(-3).map(e=>`[${e.context}] ${e.message}`).join(" | "), fix:"Revisa el log de errores y usa '✦ Analizar con IA'." });
    }

    setDiagIssues(issues);
    setLastDiag(new Date().toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit",second:"2-digit"}));
    return issues;
  };

  const diagnosticarConIA = async () => {
    setDiagLoading(true); setDiagResult(null);
    const issues = runDiagnostics();
    const currentSuc = SUCURSALES[sucIdx];
    const prompt = `Eres experto en el Panel de Licitaciones Sanadent/Sanasalud (Mercado Público, Chile).
Analiza los problemas detectados y proporciona soluciones concretas y accionables.

PROBLEMAS DETECTADOS (${issues.length} total):
${issues.length===0?"Ninguno":issues.map(i=>`[${TIPO_DIAG[i.type]?.label?.toUpperCase()}/${i.sev.toUpperCase()}] ${i.msg}\n  Detalle: ${i.detalle}\n  Sugerencia: ${i.fix}`).join("\n\n")}

ERRORES RUNTIME (últimos 5):
${errorLog.slice(-5).map(e=>`[${e.ts.split("T")[1]?.slice(0,8)||""}] ${e.context}: ${e.message}`).join("\n")||"Ninguno"}

ESTADO:
- Sucursal: ${currentSuc.nombre} (${currentSuc.empresa}, región ${currentSuc.region})${currentSuc.espsFilter?" · Solo: "+currentSuc.espsFilter.join(", "):""}
- Licitaciones visibles: ${lics.length} | Especialidades activas: ${[...activeEsps].length}/${Object.keys(ESPS).length}
- Ticket API: ${ticket?"Configurado ✓":"NO configurado ✗"} | Última actualización: ${lastFetch}

Para cada problema: 1. DIAGNÓSTICO (causa raíz) 2. IMPACTO 3. CORRECCIÓN (pasos exactos, máx. 3) 4. PRIORIDAD: 🔴CRÍTICA/🟠ALTA/🟡MEDIA/🟢BAJA
Si no hay problemas, confirma qué validaciones pasaron. Español directo.`;
    try {
      const texto = await callAI(prompt);
      setDiagResult(texto);
    } catch(e){ setDiagResult("Error al conectar: "+e.message); capturarError("diagnosticarConIA",e); }
    setDiagLoading(false);
  };

  // ── Correcciones automáticas ───────────────────────────────────────────────
  const AUTO_FIXES = {
    region_incorrecta: () => {
      const s=SUCURSALES[sucIdx]; const before=lics.length;
      const fixed=lics.filter(l=>!l.region||regionOkSuc(l.region,s));
      setLics(fixed);
      setCorrLog(p=>[...p,{ts:new Date().toLocaleTimeString("es-CL"),ok:true,msg:`✅ Región: eliminadas ${before-fixed.length} licitación(es) con región incorrecta`}]);
      setTimeout(()=>runDiagnostics(),50);
    },
    dental_especialidad: () => {
      const s=SUCURSALES[sucIdx]; if(!s.espsFilter) return;
      const before=lics.length;
      const fixed=lics.filter(l=>l.esps.some(e=>s.espsFilter.includes(e)));
      setLics(fixed);
      setCorrLog(p=>[...p,{ts:new Date().toLocaleTimeString("es-CL"),ok:true,msg:`✅ Especialidad dental: eliminadas ${before-fixed.length} licitación(es) sin categoría dental`}]);
      setTimeout(()=>runDiagnostics(),50);
    },
    duplicados: () => {
      const seen=new Set(); const before=lics.length;
      const fixed=lics.filter(l=>{if(seen.has(l.id))return false;seen.add(l.id);return true;});
      setLics(fixed);
      setCorrLog(p=>[...p,{ts:new Date().toLocaleTimeString("es-CL"),ok:true,msg:`✅ Duplicados: eliminados ${before-fixed.length} registro(s) duplicado(s)`}]);
      setTimeout(()=>runDiagnostics(),50);
    },
    cache_viejo: () => {
      if(!ticket){setCorrLog(p=>[...p,{ts:new Date().toLocaleTimeString("es-CL"),ok:false,msg:"❌ Caché: necesita ticket de API. Configúralo primero."}]);return;}
      actualizarDesdeAPI();
      setCorrLog(p=>[...p,{ts:new Date().toLocaleTimeString("es-CL"),ok:true,msg:"✅ Caché: actualización desde API iniciada"}]);
    },
  };

  const autoCorregirTodo = () => {
    const s=SUCURSALES[sucIdx]; let fixed=[...lics]; const msgs=[];
    const wrongReg=fixed.filter(l=>l.region&&!regionOkSuc(l.region,s));
    if(wrongReg.length>0){fixed=fixed.filter(l=>!l.region||regionOkSuc(l.region,s));msgs.push(`${wrongReg.length} región incorrecta`);}
    if(s.espsFilter){const wrongEsp=fixed.filter(l=>!l.esps.some(e=>s.espsFilter.includes(e)));if(wrongEsp.length>0){fixed=fixed.filter(l=>l.esps.some(e=>s.espsFilter.includes(e)));msgs.push(`${wrongEsp.length} sin especialidad dental`);}}
    const seen=new Set();const dB=fixed.length;fixed=fixed.filter(l=>{if(seen.has(l.id))return false;seen.add(l.id);return true;});if(dB>fixed.length)msgs.push(`${dB-fixed.length} duplicados`);
    setLics(fixed);
    setCorrLog(p=>[...p,{ts:new Date().toLocaleTimeString("es-CL"),ok:msgs.length>0,msg:msgs.length>0?`✅ Corrección completa: ${msgs.join(" | ")}`:"ℹ️ No había correcciones automáticas aplicables"}]);
    const fechaStr=lastFetch?.split("·")[0]?.trim();
    if(fechaStr&&!lastFetch.includes("API en vivo")&&!lastFetch.includes("Caché")&&ticket){try{const[d2,m2,y2]=fechaStr.split("/").map(Number);if(!isNaN(d2)&&Math.floor((new Date()-new Date(y2,m2-1,d2))/86400000)>=2){actualizarDesdeAPI();setCorrLog(p=>[...p,{ts:new Date().toLocaleTimeString("es-CL"),ok:true,msg:"✅ Iniciando actualización de caché…"}]);}}catch{}}
    setTimeout(()=>runDiagnostics(),100);
  };

  // ── Derivados ──────────────────────────────────────────────────────────────
  const applyDate = arr => {
    if (filtroFecha==="todas") return arr;
    const now=new Date(); const y=now.getFullYear(); const m=now.getMonth();
    return arr.filter(l=>{
      if(!l.pub) return filtroFecha==="hoy" ? false : true;
      const p=new Date(l.pub);
      if(filtroFecha==="hoy")          return l.pub===hoy();
      if(filtroFecha==="mes_actual")   return p.getFullYear()===y&&p.getMonth()===m;
      if(filtroFecha==="mes_anterior") { const pm=m===0?11:m-1; const py=m===0?y-1:y; return p.getFullYear()===py&&p.getMonth()===pm; }
      if(filtroFecha==="ultimos30")    return p>=new Date(now.getTime()-30*86400000);
      if(filtroFecha==="rango"&&fechaDesde&&fechaHasta) return p>=new Date(fechaDesde)&&p<=new Date(fechaHasta);
      return true;
    });
  };
  const licsFiltered = applyDate(filtro==="todos" ? lics : lics.filter(l=>l.estado===filtro));
  const licsPaged    = licsFiltered.slice(0, page*PAGE_SIZE);
  const casRegion    = suc.regiones
    ? COMPRAS_AGILES.filter(c => suc.regiones.includes(c.region))
    : COMPRAS_AGILES.filter(c => c.region===suc.region);
  const casFiltered  = filtro==="todos"?casRegion:casRegion.filter(c=>c.estado===filtro);
  const misP         = Object.entries(parts);
  const espCounts    = Object.keys(ESPS).map(k=>({name:k,value:lics.filter(l=>l.esps.includes(k)).length})).filter(d=>d.value>0).sort((a,b)=>b.value-a.value);
  const estCounts    = Object.entries(E_LIC).map(([k,v])=>({name:v.label,value:lics.filter(l=>l.estado===k).length,color:v.dot})).filter(d=>d.value>0);
  const cambiarModulo= m=>{ setModulo(m); setVista("dashboard"); setSubVista("lista"); setFiltro("todos"); setDetalle(null); };
  const empresasUnicas=[...new Set(SUCURSALES.map(s=>s.empresa))];

  // Badge diagnóstico: issues críticos/altos en tiempo real
  const diagBadgeCount = (()=>{
    let n=0;
    if(!ticket) n++;
    if(lics.some(l=>l.region && !regionOkSuc(l.region, suc))) n++;
    if(SNAPSHOT_RAW.some(l=>(l.region===undefined||l.region===null)&&isRel(l.nombre||l.Nombre||"",[...activeEsps]))) n++;
    if(errorLog.some(e=>(new Date()-new Date(e.ts))<3600000)) n++;
    return n;
  })();

  // ── Componentes ────────────────────────────────────────────────────────────
  const Badge=({estado,map})=>{ const e=(map||E_LIC)[estado]||E_LIC.publicada; return <span style={{display:"inline-flex",alignItems:"center",gap:4,background:e.bg,color:e.color,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:500,whiteSpace:"nowrap"}}><span style={{width:6,height:6,borderRadius:"50%",background:e.dot,flexShrink:0}}/>{e.label}</span>; };
  const BtnP=({item,tipo})=>{ const k=`${tipo}:${item.id}`; const p=parts[k]; return p?<button onClick={e=>{e.stopPropagation();abrirModal(item,tipo);}} style={{display:"inline-flex",alignItems:"center",gap:4,background:E_PART[p.estado]?.bg,color:E_PART[p.estado]?.color,border:"none",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:500,cursor:"pointer"}}><span style={{width:6,height:6,borderRadius:"50%",background:E_PART[p.estado]?.dot}}/>{E_PART[p.estado]?.label} ✎</button>:<button onClick={e=>{e.stopPropagation();abrirModal(item,tipo);}} style={{display:"inline-flex",alignItems:"center",gap:4,background:"none",border:"0.5px dashed var(--color-border-secondary)",borderRadius:20,padding:"3px 10px",fontSize:11,color:"var(--color-text-tertiary)",cursor:"pointer"}}>+ Registrar</button>; };
  const EspTag=({esps})=>esps?.length>0?<span style={{display:"inline-flex",gap:4,flexWrap:"wrap"}}>{esps.slice(0,2).map(e=><span key={e} style={{fontSize:10,background:"var(--color-background-secondary)",color:"var(--color-text-secondary)",borderRadius:20,padding:"1px 7px"}}>{ESPS[e]?.icon} {e}</span>)}{esps.length>2&&<span style={{fontSize:10,color:"var(--color-text-tertiary)"}}>+{esps.length-2}</span>}</span>:null;
  const mBtn=a=>({flex:1,padding:"10px 14px",border:"none",borderBottom:a?"3px solid var(--color-text-primary)":"3px solid transparent",background:a?"var(--color-background-secondary)":"none",fontWeight:a?700:500,fontSize:14,cursor:"pointer",color:a?"var(--color-text-primary)":"var(--color-text-secondary)"});
  const fBtn=a=>({padding:"4px 12px",borderRadius:20,border:"none",background:a?"var(--color-background-secondary)":"none",color:a?"var(--color-text-primary)":"var(--color-text-secondary)",fontWeight:a?600:400,fontSize:12,cursor:"pointer"});
  const sBtn=a=>({padding:"6px 14px",borderRadius:8,border:"0.5px solid",borderColor:a?"var(--color-border-primary)":"var(--color-border-tertiary)",background:a?"var(--color-text-primary)":"transparent",color:a?"#fff":"var(--color-text-secondary)",fontWeight:a?500:400,fontSize:12,cursor:"pointer"});

  return (
    <div style={{position:"relative",minHeight:600,fontFamily:"var(--font-sans)",color:"var(--color-text-primary)"}}>

      {modal&&(
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.4)",zIndex:30,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:12,padding:"1.5rem",width:340,boxSizing:"border-box",boxShadow:"0 8px 32px rgba(0,0,0,0.2)"}}>
            <div style={{fontSize:14,fontWeight:600,color:"#1a1a1a",marginBottom:4}}>{parts[`${modal.tipo}:${modal.item.id}`]?"Actualizar":"Registrar"} participación</div>
            <div style={{fontSize:12,color:"#888",marginBottom:16,lineHeight:1.4}}>{modal.item.nombre}</div>
            {Object.entries(E_PART).map(([k,v])=><button key={k} onClick={()=>setMEst(k)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",background:mEst===k?v.bg:"none",border:`0.5px solid ${mEst===k?v.dot:"#e0e0e0"}`,borderRadius:8,padding:"8px 12px",cursor:"pointer",marginBottom:6}}><span style={{width:8,height:8,borderRadius:"50%",background:v.dot}}/><span style={{fontSize:13,color:mEst===k?v.color:"#444",fontWeight:mEst===k?500:400}}>{v.label}</span></button>)}
            <textarea value={mNota} onChange={e=>setMNota(e.target.value)} placeholder="Notas opcionales..." style={{width:"100%",height:56,fontSize:12,border:"0.5px solid #e0e0e0",borderRadius:8,padding:"8px 10px",resize:"none",boxSizing:"border-box",fontFamily:"inherit",marginTop:8}}/>
            <div style={{display:"flex",gap:8,marginTop:12}}>
              {parts[`${modal.tipo}:${modal.item.id}`]&&<button onClick={()=>{quitarP(`${modal.tipo}:${modal.item.id}`);setModal(null);}} style={{background:"none",border:"0.5px solid #fca5a5",borderRadius:8,padding:"8px 12px",fontSize:12,cursor:"pointer",color:"#A32D2D"}}>Eliminar</button>}
              <button onClick={()=>setModal(null)} style={{flex:1,background:"none",border:"0.5px solid #e0e0e0",borderRadius:8,padding:"8px",fontSize:13,cursor:"pointer",color:"#666"}}>Cancelar</button>
              <button onClick={confirmar} style={{flex:2,background:"#1a1a1a",border:"none",borderRadius:8,padding:"8px",fontSize:13,cursor:"pointer",color:"#fff",fontWeight:600}}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {sidebar&&<div onClick={()=>setSidebar(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.35)",zIndex:10,borderRadius:12}}/>}
      {sidebar&&(
        <div style={{position:"absolute",top:0,left:0,width:288,bottom:0,zIndex:20,background:"#fff",borderRight:"0.5px solid #e0ddd6",borderRadius:"12px 0 0 12px",padding:"1.25rem",overflowY:"auto",boxSizing:"border-box"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><span style={{fontSize:14,fontWeight:600,color:"#1a1a1a"}}>Sucursales</span><button onClick={()=>setSidebar(false)} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#888",padding:0}}>×</button></div>
          {empresasUnicas.map(emp=>(
            <div key={emp} style={{marginBottom:18}}>
              <div style={{fontSize:10,fontWeight:600,color:"#aaa",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:7}}>{emp}</div>
              {SUCURSALES.filter(s=>s.empresa===emp).map(s=>{ const idx=SUCURSALES.indexOf(s); const sel=idx===sucIdx; return <button key={idx} onClick={()=>{setSucIdx(idx);setSidebar(false);setVista("dashboard");setFiltro("todos");}} style={{width:"100%",textAlign:"left",background:sel?"#f0f0ec":"none",border:sel?"0.5px solid #c8c6be":"0.5px solid transparent",borderRadius:8,padding:"8px 10px",cursor:"pointer",marginBottom:4,display:"flex",gap:9,alignItems:"flex-start"}}><span style={{fontSize:17,lineHeight:1.3}}>{TIPO_ICON[s.tipo]}</span><div><div style={{fontSize:12,fontWeight:sel?600:400,color:"#1a1a1a"}}>{s.nombre}</div><div style={{fontSize:11,color:"#888",marginTop:2}}>{s.ciudad} · Región {s.region}</div></div></button>; })}
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div style={{background:"var(--color-background-primary)",borderBottom:"0.5px solid var(--color-border-tertiary)",padding:"12px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,borderRadius:"12px 12px 0 0",flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:11}}>
          <button onClick={()=>setSidebar(true)} style={{background:"var(--color-background-secondary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:500,color:"var(--color-text-secondary)"}}>⇄ Sucursal</button>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
              <span style={{fontSize:14,fontWeight:600}}>{suc.nombre}</span>
              <span style={{fontSize:10,background:"#E6F1FB",color:"#185FA5",borderRadius:20,padding:"2px 8px",fontWeight:500}}>{suc.tipo}</span>
              <span style={{fontSize:10,background:"#F1EFE8",color:"#5F5E5A",borderRadius:20,padding:"2px 8px",fontWeight:500}}>{suc.regiones ? suc.regiones.map(r=>`Región ${r}`).join(" · ") : `Región ${suc.region}`}</span>
            </div>
            <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginTop:2}}>{suc.empresa} · {suc.rut} · {suc.direccion}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {vista==="detalle"&&<button onClick={()=>setVista("dashboard")} style={{background:"var(--color-background-secondary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:500,cursor:"pointer",color:"var(--color-text-secondary)"}}>← Volver</button>}
          <button onClick={()=>setShowTkt(!showTkt)} style={{background:"none",border:"0.5px solid var(--color-border-tertiary)",borderRadius:8,padding:"5px 10px",fontSize:11,cursor:"pointer",color:ticket?"#3B6D11":"var(--color-text-tertiary)"}}>{ticket?"🟢 API conectada":"⚙ Conectar API"}</button>
          <div style={{display:"flex",gap:3,background:"var(--color-background-secondary)",borderRadius:8,padding:"3px",border:"0.5px solid var(--color-border-tertiary)"}}>
            {AI_MODELS.map(m=><button key={m.id} onClick={()=>setAiModel(m.id)} title={m.desc} style={{padding:"3px 9px",borderRadius:6,border:"none",background:aiModel===m.id?"var(--color-background-primary)":"transparent",fontWeight:aiModel===m.id?600:400,fontSize:11,cursor:"pointer",color:aiModel===m.id?"var(--color-text-primary)":"var(--color-text-tertiary)",boxShadow:aiModel===m.id?"0 1px 3px rgba(0,0,0,0.08)":"none"}}>{m.icon} {m.label}</button>)}
          </div>
        </div>
      </div>

      {showTkt&&(
        <div style={{background:"#FAEEDA",padding:"10px 18px",display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:12,color:"#854F0B",fontWeight:500}}>🔑 Ticket Mercado Público:</span>
          <input value={ticketInput||ticket||""} onChange={e=>setTicketInput(e.target.value)} placeholder="F216E3EC-9A1B-4DD5-8CA2-78F704327BAE" style={{flex:1,minWidth:260,fontSize:12,padding:"5px 10px",border:"0.5px solid #EF9F27",borderRadius:8,fontFamily:"monospace",background:"#fff"}}/>
          <button onClick={()=>saveTicket(ticketInput||ticket||"")} style={{background:"#854F0B",border:"none",borderRadius:8,padding:"6px 14px",fontSize:12,color:"#fff",cursor:"pointer",fontWeight:500}}>Guardar</button>
          <button onClick={()=>setShowTkt(false)} style={{background:"none",border:"none",fontSize:12,cursor:"pointer",color:"#854F0B"}}>Cerrar</button>
        </div>
      )}

      {/* Tabs módulo */}
      <div style={{display:"flex",borderBottom:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-primary)"}}>
        {[["licitaciones","📋 Licitaciones",lics.length,null],["compras_agiles","⚡ Compras ágiles",casRegion.length,null],["seguimiento","🎯 Mis participaciones",misP.length,null],["diagnostico","🔧 Diagnóstico",diagBadgeCount,"diag"]].map(([k,label,n,tipo])=>(
          <button key={k} onClick={()=>{cambiarModulo(k);if(k==="diagnostico")runDiagnostics();}} style={mBtn(modulo===k)}>
            {label} {n>0&&<span style={{fontSize:11,background:tipo==="diag"?"#FCEBEB":"var(--color-background-secondary)",color:tipo==="diag"?"#A32D2D":"var(--color-text-tertiary)",borderRadius:20,padding:"1px 7px",marginLeft:4,fontWeight:tipo==="diag"?600:400}}>{n}</span>}
          </button>
        ))}
      </div>

      <div style={{padding:"1.25rem 18px"}}>

        {/* ── LICITACIONES ── */}
        {modulo==="licitaciones"&&vista==="dashboard"&&(
          <>
            {/* Toolbar */}
            <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center",justifyContent:"space-between",flexWrap:"wrap"}}>
              <div style={{display:"flex",gap:6}}><button style={sBtn(subVista==="lista")} onClick={()=>setSubVista("lista")}>☰ Lista</button><button style={sBtn(subVista==="dashboard")} onClick={()=>setSubVista("dashboard")}>📊 Dashboard</button></div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{fontSize:11,color:"var(--color-text-tertiary)"}}>{lastFetch} · {lics.length} licitaciones</span>
                <button onClick={actualizarDesdeAPI} disabled={loading} style={{display:"flex",alignItems:"center",gap:5,background:"#185FA5",border:"none",borderRadius:8,padding:"6px 12px",fontSize:12,cursor:loading?"wait":"pointer",color:"#fff",fontWeight:500}}>{loading?"Actualizando…":"↺ Actualizar API"}</button>
                <button onClick={()=>setShowEsps(!showEsps)} style={{background:"none",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,padding:"5px 10px",fontSize:12,cursor:"pointer",color:"var(--color-text-secondary)",fontWeight:500}}>🔍 Especialidades ({activeEsps.size})</button>
                <button onClick={()=>exportXLSX(licsFiltered,"licitaciones",suc)} style={{background:"none",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,padding:"5px 10px",fontSize:12,cursor:"pointer",color:"#16A34A",fontWeight:600}}>⬇ Excel</button>
              </div>
            </div>

            {apiErr&&<div style={{background:"#FCEBEB",border:"0.5px solid #fca5a5",borderRadius:8,padding:"9px 14px",fontSize:12,color:"#A32D2D",marginBottom:12}}>⚠ {apiErr}</div>}

            {/* Especialidades */}
            {showEsps&&(
              <div style={{background:"var(--color-background-secondary)",borderRadius:10,padding:"12px 14px",marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontSize:12,fontWeight:600}}>Especialidades</span><div style={{display:"flex",gap:8}}><button onClick={()=>saveEsps(new Set(Object.keys(ESPS)))} style={{background:"none",border:"none",fontSize:11,cursor:"pointer",color:"#185FA5"}}>Todas</button><button onClick={()=>saveEsps(new Set())} style={{background:"none",border:"none",fontSize:11,cursor:"pointer",color:"#A32D2D"}}>Ninguna</button></div></div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {Object.entries(ESPS).map(([k,v])=>{ const on=activeEsps.has(k); return <button key={k} onClick={()=>{const n=new Set(activeEsps);on?n.delete(k):n.add(k);saveEsps(n);}} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:20,border:`0.5px solid ${on?v.c:"var(--color-border-tertiary)"}`,background:on?v.c+"22":"none",color:on?v.c:"var(--color-text-secondary)",fontSize:12,cursor:"pointer",fontWeight:on?600:400}}>{v.icon} {k} {on&&<span style={{fontSize:11,background:v.c,color:"#fff",borderRadius:20,padding:"0 5px"}}>{lics.filter(l=>l.esps.includes(k)).length}</span>}</button>; })}
                </div>
              </div>
            )}

            {/* Filtro fechas */}
            <div style={{background:"var(--color-background-secondary)",borderRadius:10,padding:"10px 14px",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                <span style={{fontSize:12,fontWeight:600,color:"var(--color-text-secondary)",whiteSpace:"nowrap"}}>📅 Publicación:</span>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {[["todas","Todas"],["hoy","🔔 Hoy"],["mes_actual","Mes actual"],["mes_anterior","Mes anterior"],["ultimos30","Últimos 30 días"],["rango","Rango"]].map(([k,l])=>(
                    <button key={k} onClick={()=>setFiltroFecha(k)} style={{padding:"4px 11px",borderRadius:20,border:`0.5px solid ${filtroFecha===k?"#185FA5":"var(--color-border-secondary)"}`,background:filtroFecha===k?"#185FA5":"var(--color-background-primary)",color:filtroFecha===k?"#fff":"var(--color-text-primary)",fontWeight:filtroFecha===k?600:400,fontSize:12,cursor:"pointer"}}>{l}</button>
                  ))}
                </div>
                {filtroFecha==="rango"&&(
                  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                    <input type="date" value={fechaDesde} onChange={e=>setFechaDesde(e.target.value)} style={{fontSize:12,padding:"4px 8px",border:"0.5px solid var(--color-border-secondary)",borderRadius:8}}/>
                    <span style={{fontSize:12,color:"var(--color-text-tertiary)"}}>–</span>
                    <input type="date" value={fechaHasta} onChange={e=>setFechaHasta(e.target.value)} style={{fontSize:12,padding:"4px 8px",border:"0.5px solid var(--color-border-secondary)",borderRadius:8}}/>
                  </div>
                )}
              </div>
            </div>

            {/* Filtros estado */}
            <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
              {[["todos","Todas"],["publicada","Publicadas"],["por_vencer","Por vencer"],["adjudicada","Adjudicadas"],["cerrada","Cerradas"],["desierta","Desiertas"]].map(([k,l])=>(
                <button key={k} onClick={()=>{setFiltro(k);setPage(1);}} style={fBtn(filtro===k)}>{l}</button>
              ))}
            </div>

            {subVista==="lista"&&(
              <>
                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:9,marginBottom:14}}>
                  {[{l:"Total",v:lics.length,c:"var(--color-text-primary)"},{l:"Activas",v:lics.filter(l=>l.estado==="publicada").length,c:"#185FA5"},{l:"Por vencer",v:lics.filter(l=>l.estado==="por_vencer").length,c:"#854F0B"},{l:"Adjudicadas",v:lics.filter(l=>l.estado==="adjudicada").length,c:"#3B6D11"},{l:"Cerradas",v:lics.filter(l=>["cerrada","desierta"].includes(l.estado)).length,c:"#5F5E5A"}].map(m=>(
                    <div key={m.l} style={{background:"var(--color-background-secondary)",borderRadius:10,padding:"10px 13px"}}>
                      <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginBottom:4}}>{m.l}</div>
                      <div style={{fontSize:22,fontWeight:600,color:m.c,lineHeight:1}}>{m.v}</div>
                    </div>
                  ))}
                </div>

                {licsFiltered.length===0
                  ? <div style={{textAlign:"center",padding:"2rem",color:"var(--color-text-tertiary)",fontSize:13}}>{filtro!=="todos"&&Object.keys(apiRaw).length===0?"Los filtros por estado (adjudicada, desierta, cerrada) requieren datos de la API en vivo. Presiona \"↺ Actualizar API\".":"Sin licitaciones para este filtro"}</div>
                  : <>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {licsPaged.map(lic=>{
                        const d=dias(lic.cierre);
                        return <div key={lic.id} style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,padding:"12px 15px",display:"grid",gridTemplateColumns:"1fr auto",gap:12,alignItems:"center"}} onMouseEnter={e=>e.currentTarget.style.borderColor="var(--color-border-secondary)"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--color-border-tertiary)"}>
                          <div onClick={()=>abrirDetalle(lic)} style={{cursor:"pointer"}}>
                            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4,flexWrap:"wrap"}}>
                              <span style={{fontSize:13,fontWeight:600}}>{lic.nombre}</span><Badge estado={lic.estado}/><BtnP item={lic} tipo="lic"/>
                            </div>
                            {lic.org&&<div style={{fontSize:12,color:"var(--color-text-secondary)",marginBottom:3}}>{lic.org}</div>}
                            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                              <EspTag esps={lic.esps}/>
                              {lic.pub&&<span style={{fontSize:10,color:"var(--color-text-tertiary)",background:"var(--color-background-secondary)",borderRadius:20,padding:"1px 7px",whiteSpace:"nowrap"}}>📅 Pub. {fmtD(lic.pub)}</span>}
                            </div>
                            <div style={{fontSize:14,fontWeight:700,color:"#185FA5",marginBottom:2}}>
                              {montoStr(lic.tipo,lic.monto)}
                              {!lic.monto&&<span style={{fontSize:10,fontWeight:400,color:"var(--color-text-tertiary)",marginLeft:4}}>*estimado</span>}
                            </div>
                            <div style={{fontSize:11,color:"var(--color-text-tertiary)",fontFamily:"monospace",display:"flex",alignItems:"center",gap:6}}>
                              <span onClick={e=>{e.stopPropagation();copyId(lic.id);}} style={{cursor:"pointer",padding:"1px 6px",borderRadius:4,background:copiedId===lic.id?"#EAF3DE":"var(--color-background-secondary)",color:copiedId===lic.id?"#3B6D11":"var(--color-text-tertiary)"}} title="Clic para copiar">{lic.id}</span>
                              {copiedId===lic.id&&<span style={{fontSize:10,color:"#3B6D11",fontFamily:"var(--font-sans)"}}>✓ Copiado</span>}
                            </div>
                          </div>
                          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,minWidth:90}}>
                            <span style={{fontSize:11,color:d!==null&&d<=7&&d>0?"#854F0B":"var(--color-text-tertiary)",fontWeight:d!==null&&d<=7&&d>0?600:400}}>{d!==null&&d>0?`Cierra en ${d}d`:d===0?"Hoy":"Cerrada"}</span>
                            <span style={{fontSize:10,color:"var(--color-text-tertiary)"}}>{fmtD(lic.cierre)}</span>
                            <span onClick={()=>abrirDetalle(lic)} style={{fontSize:10,color:"#185FA5",cursor:"pointer"}}>Ver detalle →</span>
                          </div>
                        </div>;
                      })}
                    </div>
                    <div style={{marginTop:10,padding:"12px 15px",background:"var(--color-background-secondary)",borderRadius:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:6}}>
                        <span style={{fontSize:12,color:"var(--color-text-secondary)",fontWeight:500}}>Mostrando {licsPaged.length} de {licsFiltered.length} licitaciones</span>
                        {licsPaged.length<licsFiltered.length&&<button onClick={()=>setPage(p=>p+1)} style={{background:"none",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,padding:"4px 12px",fontSize:12,cursor:"pointer",color:"var(--color-text-secondary)"}}>Ver más ({licsFiltered.length-licsPaged.length} restantes)</button>}
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:4,paddingTop:8,borderTop:"0.5px solid var(--color-border-tertiary)"}}>
                        <span style={{fontSize:12,color:"var(--color-text-secondary)"}}><b style={{color:"#3B6D11"}}>{licsFiltered.filter(l=>l.monto).length}</b> con monto publicado · <b style={{color:"var(--color-text-tertiary)"}}>{licsFiltered.filter(l=>!l.monto).length}</b> con estimado UTM</span>
                        <span style={{fontSize:13,fontWeight:700,color:"#185FA5"}}>Total: {fmt(licsFiltered.reduce((s,l)=>s+(l.monto||(()=>{const t={L1:100*UTM,LE:1000*UTM,LP:5000*UTM,B1:1000*UTM,B2:2000*UTM,LR:6000*UTM};return t[l.tipo]||0;})()),0))} <span style={{fontSize:10,fontWeight:400,color:"var(--color-text-tertiary)"}}>(*estimado)</span></span>
                      </div>
                    </div>
                  </>
                }
              </>
            )}

            {subVista==="dashboard"&&(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
                  <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,padding:"14px 16px"}}>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:12}}>Por especialidad</div>
                    <ResponsiveContainer width="100%" height={180}><BarChart data={espCounts} margin={{top:0,right:0,left:0,bottom:30}}><XAxis dataKey="name" tick={{fontSize:9}} angle={-30} textAnchor="end"/><YAxis tick={{fontSize:10}} width={25}/><Tooltip contentStyle={{fontSize:12,borderRadius:8}}/><Bar dataKey="value" fill="#378ADD" radius={[4,4,0,0]} name="Cant."/></BarChart></ResponsiveContainer>
                  </div>
                  <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,padding:"14px 16px"}}>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:12}}>Por estado</div>
                    <ResponsiveContainer width="100%" height={180}><PieChart><Pie data={estCounts} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>{estCounts.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip contentStyle={{fontSize:12,borderRadius:8}}/><Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:11}}/></PieChart></ResponsiveContainer>
                  </div>
                </div>
                <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,overflow:"hidden"}}>
                  <div style={{padding:"11px 16px",borderBottom:"0.5px solid var(--color-border-tertiary)",fontSize:13,fontWeight:600}}>Resumen por especialidad</div>
                  <div style={{padding:"0 16px"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 80px",padding:"8px 0",borderBottom:"0.5px solid var(--color-border-tertiary)",fontSize:11,color:"var(--color-text-tertiary)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}><span>Especialidad</span><span style={{textAlign:"right"}}>N°</span></div>
                    {espCounts.map((c,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1fr 80px",padding:"9px 0",borderBottom:i<espCounts.length-1?"0.5px solid var(--color-border-tertiary)":"none",alignItems:"center"}}><span style={{fontSize:13}}>{ESPS[c.name]?.icon} {c.name}</span><span style={{fontSize:13,textAlign:"right",fontWeight:600}}>{c.value}</span></div>)}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 80px",padding:"10px 0",borderTop:"1px solid var(--color-border-secondary)"}}><span style={{fontSize:13,fontWeight:600}}>Total</span><span style={{fontSize:13,textAlign:"right",fontWeight:700,color:"#185FA5"}}>{lics.length}</span></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── COMPRAS ÁGILES ── */}
        {modulo==="compras_agiles"&&vista==="dashboard"&&(
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9,flex:1}}>
                {[{l:"Total",v:casRegion.length,c:"var(--color-text-primary)"},{l:"Abiertas",v:casRegion.filter(c=>c.estado==="publicada").length,c:"#185FA5"},{l:"Adjudicadas",v:casRegion.filter(c=>c.estado==="adjudicada").length,c:"#3B6D11"}].map(m=>(
                  <div key={m.l} style={{background:"var(--color-background-secondary)",borderRadius:10,padding:"10px 13px"}}>
                    <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginBottom:4}}>{m.l}</div>
                    <div style={{fontSize:22,fontWeight:600,color:m.c,lineHeight:1}}>{m.v}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>exportXLSX(casFiltered,"compras_agiles",suc)} style={{background:"none",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer",color:"#16A34A",fontWeight:600}}>⬇ Excel</button>
            </div>
            <div style={{marginBottom:12,padding:"9px 14px",background:"#FAEEDA",borderRadius:8,fontSize:12,color:"#854F0B",fontWeight:500}}>⚡ Hasta 30 UTM (~$2M CLP) · Sin bases formales · Cotización directa</div>
            <div style={{display:"flex",gap:6,marginBottom:14}}>{[["todos","Todas"],["publicada","Abiertas"],["adjudicada","Adjudicadas"]].map(([k,l])=><button key={k} onClick={()=>setFiltro(k)} style={fBtn(filtro===k)}>{l}</button>)}</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {casFiltered.map(ca=>{
                const d=dias(ca.cierre);
                return <div key={ca.id} style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,padding:"12px 15px",display:"grid",gridTemplateColumns:"1fr auto",gap:12,alignItems:"center"}} onMouseEnter={e=>e.currentTarget.style.borderColor="var(--color-border-secondary)"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--color-border-tertiary)"}>
                  <div onClick={()=>{setDetalle(ca);setVista("detalle");}} style={{cursor:"pointer"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4,flexWrap:"wrap"}}><span style={{fontSize:13,fontWeight:600}}>{ca.nombre}</span><Badge estado={ca.estado} map={E_CA}/><BtnP item={ca} tipo="ca"/></div>
                    <div style={{fontSize:12,color:"var(--color-text-secondary)",marginBottom:3}}>{ca.organismo} · {ca.categoria}</div>
                    <div style={{fontSize:14,fontWeight:700,color:"#185FA5"}}>{fmt(ca.monto)}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,minWidth:90}}>
                    <span style={{fontSize:11,color:d!==null&&d<=3&&d>0?"#854F0B":"var(--color-text-tertiary)"}}>{d!==null&&d>0?`Cierra en ${d}d`:"Cerrada"}</span>
                    <span style={{fontSize:10,color:"var(--color-text-tertiary)"}}>{ca.items.length} ítems</span>
                  </div>
                </div>;
              })}
            </div>
            <div style={{marginTop:10,padding:"12px 14px",background:"var(--color-background-secondary)",borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12,fontWeight:500,color:"var(--color-text-secondary)"}}>{casFiltered.length} compras</span>
              <span style={{fontSize:13,fontWeight:700,color:"#185FA5"}}>Total: {fmt(casFiltered.reduce((s,c)=>s+c.monto,0))}</span>
            </div>
          </>
        )}

        {/* ── MIS PARTICIPACIONES ── */}
        {modulo==="seguimiento"&&(
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,flex:1}}>
                {[{l:"Total",v:misP.length,c:"var(--color-text-primary)"},{l:"En curso",v:misP.filter(([,v])=>["presentada","en_evaluacion"].includes(v.estado)).length,c:"#534AB7"},{l:"Ganadas",v:misP.filter(([,v])=>v.estado==="ganada").length,c:"#3B6D11"},{l:"Perdidas",v:misP.filter(([,v])=>["perdida","desierta"].includes(v.estado)).length,c:"#A32D2D"}].map(m=>(
                  <div key={m.l} style={{background:"var(--color-background-secondary)",borderRadius:10,padding:"10px 13px"}}>
                    <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginBottom:4}}>{m.l}</div>
                    <div style={{fontSize:22,fontWeight:600,color:m.c,lineHeight:1}}>{m.v}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>exportXLSX(misP.map(([,v])=>v),"participaciones",suc)} style={{background:"none",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer",color:"#16A34A",fontWeight:600}}>⬇ Excel</button>
            </div>
            {misP.length===0
              ?<div style={{textAlign:"center",padding:"3rem 0",color:"var(--color-text-tertiary)",fontSize:13}}><div style={{fontSize:32,marginBottom:12}}>📋</div>Sin participaciones para {suc.nombre}.<br/>Usa "+ Registrar" en cualquier licitación.</div>
              :<>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {misP.map(([k,v])=>(
                    <div key={k} style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,padding:"12px 15px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",gap:10,marginBottom:8,flexWrap:"wrap"}}>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}><span style={{fontSize:13,fontWeight:600}}>{v.nombre}</span><span style={{fontSize:10,background:"#F1EFE8",color:"#5F5E5A",borderRadius:20,padding:"2px 7px",fontWeight:500}}>{v.tipo==="lic"?"Licitación":"Compra ágil"}</span></div>
                          <div style={{fontSize:12,color:"var(--color-text-secondary)"}}>{v.org||"—"}</div>
                          {v.monto>0&&<div style={{fontSize:13,fontWeight:700,color:"#185FA5",marginTop:2}}>{fmt(v.monto)}</div>}
                        </div>
                        <div style={{display:"flex",gap:6,alignItems:"center"}}>
                          {(()=>{const ep=E_PART[v.estado];return ep?<span style={{display:"inline-flex",alignItems:"center",gap:4,background:ep.bg,color:ep.color,borderRadius:20,padding:"3px 9px",fontSize:11,fontWeight:500}}><span style={{width:6,height:6,borderRadius:"50%",background:ep.dot}}/>{ep.label}</span>:null;})()}
                          <button onClick={()=>{const item=lics.find(l=>l.id===k.split(":")[1])||COMPRAS_AGILES.find(l=>l.id===k.split(":")[1])||{id:k.split(":")[1],nombre:v.nombre,cierre:v.cierre};abrirModal(item,v.tipo);}} style={{background:"none",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,padding:"4px 10px",fontSize:11,cursor:"pointer",color:"var(--color-text-secondary)",fontWeight:500}}>✎ Editar</button>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:12,flexWrap:"wrap",fontSize:11,color:"var(--color-text-tertiary)"}}>
                        <span>Registrado {v.fecha}</span>
                        {v.cierre&&<span style={{color:dias(v.cierre)!==null&&dias(v.cierre)<=7&&dias(v.cierre)>0?"#854F0B":"var(--color-text-tertiary)"}}>· Cierre {fmtD(v.cierre)}</span>}
                      </div>
                      {v.notas&&<div style={{marginTop:8,fontSize:12,color:"var(--color-text-secondary)",background:"var(--color-background-secondary)",borderRadius:6,padding:"6px 10px"}}>{v.notas}</div>}
                    </div>
                  ))}
                </div>
                <div style={{marginTop:10,padding:"12px 14px",background:"var(--color-background-secondary)",borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,fontWeight:500,color:"var(--color-text-secondary)"}}>{misP.length} participacion{misP.length!==1?"es":""}</span>
                  <span style={{fontSize:13,fontWeight:700,color:"#185FA5"}}>Total involucrado: {fmt(misP.reduce((s,[,v])=>s+(v.monto||0),0))}</span>
                </div>
              </>
            }
          </>
        )}

        {/* ── DIAGNÓSTICO ── */}
        {modulo==="diagnostico"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
              <div>
                <span style={{fontSize:14,fontWeight:600}}>Panel de Diagnóstico</span>
                {lastDiag&&<span style={{fontSize:11,color:"var(--color-text-tertiary)",marginLeft:10}}>Revisado a las {lastDiag}</span>}
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button onClick={runDiagnostics} style={{background:"var(--color-background-secondary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,padding:"6px 14px",fontSize:12,cursor:"pointer",color:"var(--color-text-primary)",fontWeight:500}}>↺ Ejecutar diagnóstico</button>
                {diagIssues.some(i=>i.fixType)&&<button onClick={autoCorregirTodo} style={{background:"#3B6D11",border:"none",borderRadius:8,padding:"6px 14px",fontSize:12,cursor:"pointer",color:"#fff",fontWeight:600}}>⚡ Corregir todo automáticamente</button>}
                <button onClick={diagnosticarConIA} disabled={diagLoading} style={{background:"#1a1a1a",border:"none",borderRadius:8,padding:"6px 14px",fontSize:12,cursor:diagLoading?"wait":"pointer",color:"#fff",fontWeight:500}}>{diagLoading?"Analizando…":"✦ Analizar con IA"}</button>
              </div>
            </div>

            {lastDiag&&(
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:14}}>
                {Object.entries(SEV).map(([k,v])=>{const cnt=diagIssues.filter(i=>i.sev===k).length;return <div key={k} style={{background:cnt>0?v.bg:"var(--color-background-secondary)",borderRadius:10,padding:"10px 13px",border:`0.5px solid ${cnt>0?v.dot:"var(--color-border-tertiary)"}`}}><div style={{fontSize:11,color:cnt>0?v.color:"var(--color-text-tertiary)",marginBottom:4,fontWeight:600}}>{v.icon} {v.label}</div><div style={{fontSize:22,fontWeight:700,color:cnt>0?v.color:"var(--color-text-tertiary)",lineHeight:1}}>{cnt}</div></div>;})}
              </div>
            )}

            {!lastDiag
              ?<div style={{textAlign:"center",padding:"3rem 0",color:"var(--color-text-tertiary)",fontSize:13}}><div style={{fontSize:32,marginBottom:12}}>🔧</div>Haz clic en "Ejecutar diagnóstico" para revisar el estado del panel.</div>
              :diagIssues.length===0
                ?<div style={{background:"#EAF3DE",borderRadius:10,padding:"18px 20px",display:"flex",alignItems:"center",gap:12,marginBottom:14}}><span style={{fontSize:24}}>✅</span><div><div style={{fontSize:13,fontWeight:600,color:"#3B6D11"}}>Todo en orden</div><div style={{fontSize:12,color:"#3B6D11",marginTop:2}}>8 verificaciones pasaron correctamente para {suc.nombre}.</div></div></div>
                :<div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
                  {diagIssues.map((issue,i)=>{const s=SEV[issue.sev]||SEV.media;const t=TIPO_DIAG[issue.type]||TIPO_DIAG.datos;return <div key={i} style={{background:"var(--color-background-primary)",border:`0.5px solid ${s.dot}`,borderLeft:`3px solid ${s.dot}`,borderRadius:10,padding:"12px 15px"}}><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6,flexWrap:"wrap"}}><span style={{background:s.bg,color:s.color,borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:600}}>{s.icon} {s.label}</span><span style={{background:"var(--color-background-secondary)",color:"var(--color-text-secondary)",borderRadius:20,padding:"2px 9px",fontSize:11}}>{t.icon} {t.label}</span><span style={{fontSize:13,fontWeight:600,flex:1}}>{issue.msg}</span>{issue.fixType&&AUTO_FIXES[issue.fixType]&&<button onClick={()=>AUTO_FIXES[issue.fixType]()} style={{background:"#EAF3DE",border:"0.5px solid #639922",borderRadius:8,padding:"4px 11px",fontSize:11,cursor:"pointer",color:"#3B6D11",fontWeight:600,whiteSpace:"nowrap"}}>⚡ Corregir</button>}</div><div style={{fontSize:12,color:"var(--color-text-secondary)",marginBottom:8,lineHeight:1.5}}>{issue.detalle}</div><div style={{background:"#F8F8F5",borderRadius:7,padding:"7px 11px",fontSize:12,lineHeight:1.5}}><span style={{fontWeight:600,color:"#3B6D11"}}>💡 Corrección: </span>{issue.fix}</div></div>;})}
                </div>
            }

            {diagResult&&(
              <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,padding:"15px 17px",marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><span style={{fontSize:13,fontWeight:600}}>Análisis con IA</span><button onClick={()=>setDiagResult(null)} style={{background:"none",border:"none",fontSize:11,color:"var(--color-text-tertiary)",cursor:"pointer",padding:0}}>↺ Volver a analizar</button></div>
                <div style={{fontSize:13,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{diagResult}</div>
              </div>
            )}

            {corrLog.length>0&&(
              <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,overflow:"hidden",marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",borderBottom:"0.5px solid var(--color-border-tertiary)"}}><span style={{fontSize:13,fontWeight:600}}>Correcciones aplicadas <span style={{fontSize:11,color:"var(--color-text-tertiary)",fontWeight:400}}>({corrLog.length})</span></span><button onClick={()=>setCorrLog([])} style={{background:"none",border:"0.5px solid var(--color-border-secondary)",borderRadius:6,padding:"3px 10px",fontSize:11,cursor:"pointer",color:"var(--color-text-tertiary)"}}>Limpiar</button></div>
                <div style={{padding:"8px 16px"}}>{corrLog.slice().reverse().map((c,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"70px 1fr",gap:10,padding:"5px 0",borderBottom:i<corrLog.length-1?"0.5px solid var(--color-border-tertiary)":"none"}}><span style={{fontSize:10,fontFamily:"monospace",color:"var(--color-text-tertiary)"}}>{c.ts}</span><span style={{fontSize:12,color:c.ok===false?"#A32D2D":c.ok===null?"#854F0B":"#3B6D11"}}>{c.msg}</span></div>)}</div>
              </div>
            )}

            {errorLog.length>0&&(
              <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,overflow:"hidden"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",borderBottom:"0.5px solid var(--color-border-tertiary)"}}><span style={{fontSize:13,fontWeight:600}}>Log de errores <span style={{fontSize:11,color:"var(--color-text-tertiary)",fontWeight:400}}>({errorLog.length})</span></span><button onClick={()=>setErrorLog([])} style={{background:"none",border:"0.5px solid var(--color-border-secondary)",borderRadius:6,padding:"3px 10px",fontSize:11,cursor:"pointer",color:"var(--color-text-tertiary)"}}>Limpiar</button></div>
                <div style={{padding:"8px 16px"}}>{errorLog.slice(-10).reverse().map((e,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"80px 140px 1fr",gap:10,padding:"6px 0",borderBottom:i<Math.min(errorLog.length,10)-1?"0.5px solid var(--color-border-tertiary)":"none"}}><span style={{fontSize:10,fontFamily:"monospace",color:"var(--color-text-tertiary)"}}>{e.ts.split("T")[1]?.slice(0,8)||"—"}</span><span style={{fontSize:11,color:"#854F0B",fontFamily:"monospace",wordBreak:"break-all"}}>{e.context}</span><span style={{fontSize:11,color:"var(--color-text-secondary)"}}>{e.message}</span></div>)}</div>
              </div>
            )}
          </div>
        )}

        {/* ── DETALLE LICITACIÓN ── */}
        {vista==="detalle"&&detalle&&modulo==="licitaciones"&&(()=>{
          const dd=detData[detalle.id];
          const org=dd?.Comprador?.NombreOrganismo||detalle.org||"—";
          const region2=dd?.Comprador?.RegionUnidad||detalle.region||"—";
          const monto=dd?.MontoEstimado||detalle.monto||null;
          const fPub=fmtD(dd?.Fechas?.FechaPublicacion||detalle.pub);
          const fCie=detalle.cierre;
          const fPre=fmtD(dd?.Fechas?.FechaFinal||detalle.preg);
          const items=dd?.Items?.Listado||[];
          const d=dias(fCie);
          const key=`${sucIdx}-lic-${detalle.id}`;
          return (
            <div>
              {loadDet&&<div style={{textAlign:"center",padding:"1rem",fontSize:12,color:"var(--color-text-tertiary)"}}>Cargando detalle…</div>}
              <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,padding:"15px 17px",marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:10}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                      <span onClick={()=>copyId(detalle.id)} style={{fontSize:12,fontFamily:"monospace",background:"var(--color-background-secondary)",padding:"2px 8px",borderRadius:6,cursor:"pointer",color:copiedId===detalle.id?"#3B6D11":"var(--color-text-secondary)",border:"0.5px solid var(--color-border-tertiary)"}}>{detalle.id}</span>
                      {copiedId===detalle.id&&<span style={{fontSize:11,color:"#3B6D11"}}>✓ Copiado</span>}
                      <span style={{fontSize:11,color:"var(--color-text-tertiary)"}}>{detalle.tipo} · {TIPO_DESC[detalle.tipo]||detalle.tipo}</span>
                    </div>
                    <h2 style={{margin:0,fontSize:16,fontWeight:600,lineHeight:1.4}}>{detalle.nombre}</h2>
                    <div style={{fontSize:12,color:"var(--color-text-secondary)",marginTop:3}}>{org!=="—"?org:"Cargando organismo…"}</div>
                    {region2!=="—"&&<div style={{fontSize:11,color:"var(--color-text-tertiary)",marginTop:2}}>📍 {region2}</div>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}><Badge estado={detalle.estado}/><BtnP item={detalle} tipo="lic"/></div>
                </div>
                {dd?.Descripcion&&<div style={{fontSize:13,color:"var(--color-text-secondary)",lineHeight:1.65,marginBottom:12}}>{dd.Descripcion}</div>}
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                  {[["Publicación",fPub||"—",null],["Cierre",`${fmtD(fCie)}${d!==null?` · ${d>0?d+"d":"vencida"}`:""}`,d!==null&&d<=7&&d>0?"#854F0B":null],["Preguntas hasta",fPre||"—",null],["Monto estimado",montoStr(detalle.tipo,monto),null],["Especialidades",detalle.esps?.join(", ")||"—",null],["Tipo",`${detalle.tipo} · ${TIPO_DESC[detalle.tipo]||""}`,null]].map(([k,v,c])=>(
                    <div key={k}><div style={{fontSize:11,color:"var(--color-text-tertiary)",marginBottom:2}}>{k}</div><div style={{fontSize:13,fontWeight:600,color:c||"var(--color-text-primary)"}}>{v}</div></div>
                  ))}
                </div>
              </div>
              <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,padding:"15px 17px",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:analisis[key]?12:0}}>
                  <div><span style={{fontSize:13,fontWeight:600}}>Análisis con IA</span><span style={{fontSize:11,color:"var(--color-text-tertiary)",marginLeft:8}}>para {suc.nombre}</span></div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    {!dd&&<button onClick={()=>fetchDetalle(detalle.id)} disabled={loadDet} style={{background:"none",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,padding:"5px 10px",fontSize:11,cursor:"pointer",color:"var(--color-text-secondary)"}}>{loadDet?"Cargando…":"↺ Cargar detalle"}</button>}
                    {!analisis[key]&&<button onClick={()=>analizarIA(detalle,"lic",dd)} disabled={cargIA[key]} style={{background:"var(--color-background-secondary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,padding:"7px 14px",fontSize:12,cursor:cargIA[key]?"wait":"pointer",color:"var(--color-text-primary)",fontWeight:500}}>{cargIA[key]?"Analizando…":`✦ Analizar con ${AI_MODELS.find(m=>m.id===aiModel)?.label||aiModel} ↗`}</button>}
                  </div>
                </div>
                {analisis[key]&&<div><div style={{fontSize:13,lineHeight:1.75,whiteSpace:"pre-wrap"}}>{analisis[key]}</div><button onClick={()=>setAnalisis(p=>{const n={...p};delete n[key];return n;})} style={{marginTop:10,background:"none",border:"none",fontSize:11,color:"var(--color-text-tertiary)",cursor:"pointer",padding:0}}>↺ Volver a analizar</button></div>}
              </div>
              <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,overflow:"hidden"}}>
                <div style={{display:"flex",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                  {[["info","Información"],["items","Ítems"+(items.length>0?" ("+items.length+")":"")]].map(([k,l])=>(
                    <button key={k} onClick={()=>setPestana(k)} style={{flex:1,padding:"10px 0",background:"none",border:"none",borderBottom:pestana===k?"2px solid var(--color-text-primary)":"2px solid transparent",fontWeight:pestana===k?600:400,fontSize:13,cursor:"pointer",color:pestana===k?"var(--color-text-primary)":"var(--color-text-secondary)"}}>{l}</button>
                  ))}
                </div>
                <div style={{padding:"15px 17px"}}>
                  {pestana==="info"&&(dd
                    ?[["Organismo",org],["Región",region2],["Monto estimado",monto?fmt(monto):"No publicado"],["Publicación",fPub||"—"],["Cierre",fmtD(fCie)],["Preguntas hasta",fPre||"No aplica"],["Tipo",`${detalle.tipo} – ${TIPO_DESC[detalle.tipo]||detalle.tipo}`]].map(([k,v],i,a)=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",fontSize:13,borderBottom:i<a.length-1?"0.5px solid var(--color-border-tertiary)":"none"}}><span style={{color:"var(--color-text-secondary)"}}>{k}</span><span style={{fontWeight:600,textAlign:"right",maxWidth:"60%"}}>{v}</span></div>)
                    :<div style={{color:"var(--color-text-tertiary)",fontSize:13,textAlign:"center",padding:"1rem"}}>{ticket?"Usa '↺ Cargar detalle' o 'Analizar con IA' para obtener información completa":"Conecta el ticket de API para cargar el detalle"}</div>
                  )}
                  {pestana==="items"&&(items.length>0
                    ?<div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 80px 80px",padding:"8px 0",borderBottom:"0.5px solid var(--color-border-tertiary)",fontSize:11,color:"var(--color-text-tertiary)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}><span>Descripción</span><span style={{textAlign:"right"}}>Cant.</span><span style={{textAlign:"right"}}>Unidad</span></div>
                      {items.map((it,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1fr 80px 80px",padding:"9px 0",borderBottom:i<items.length-1?"0.5px solid var(--color-border-tertiary)":"none",alignItems:"center"}}><span style={{fontSize:13}}>{it.Descripcion||it.NombreProducto||"—"}</span><span style={{fontSize:13,fontWeight:600,textAlign:"right"}}>{it.Cantidad||"—"}</span><span style={{fontSize:12,color:"var(--color-text-secondary)",textAlign:"right"}}>{it.UnidadMedida||"—"}</span></div>)}
                    </div>
                    :<div style={{color:"var(--color-text-tertiary)",fontSize:13,textAlign:"center",padding:"1rem"}}>{loadDet?"Cargando…":"Sin ítems disponibles"}</div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── DETALLE COMPRA ÁGIL ── */}
        {vista==="detalle"&&detalle&&modulo==="compras_agiles"&&(()=>{
          const d=dias(detalle.cierre); const key=`${sucIdx}-ca-${detalle.id}`;
          return (
            <div>
              <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,padding:"15px 17px",marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:10}}>
                  <div><div style={{fontSize:11,color:"var(--color-text-tertiary)",marginBottom:3}}>{detalle.id}</div><h2 style={{margin:0,fontSize:16,fontWeight:600,lineHeight:1.4}}>{detalle.nombre}</h2><div style={{fontSize:12,color:"var(--color-text-secondary)",marginTop:3}}>{detalle.organismo}</div></div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}><Badge estado={detalle.estado} map={E_CA}/><BtnP item={detalle} tipo="ca"/></div>
                </div>
                <div style={{fontSize:13,color:"var(--color-text-secondary)",lineHeight:1.65,marginBottom:12}}>{detalle.descripcion}</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                  {[["Publicación",detalle.publicacion,null],["Cierre",`${detalle.cierre}${d!==null?` · ${d>0?d+"d":"cerrada"}`:""}`,d!==null&&d<=3&&d>0?"#854F0B":null],["Monto máximo",fmt(detalle.monto),null],["Categoría",detalle.categoria,null],["Ítems",`${detalle.items.length} productos`,null],["Proceso","Compra ágil · Sin bases",null]].map(([k,v,c])=>(
                    <div key={k}><div style={{fontSize:11,color:"var(--color-text-tertiary)",marginBottom:2}}>{k}</div><div style={{fontSize:13,fontWeight:600,color:c||"var(--color-text-primary)"}}>{v}</div></div>
                  ))}
                </div>
              </div>
              <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,padding:"15px 17px",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:analisis[key]?12:0}}>
                  <span style={{fontSize:13,fontWeight:600}}>Análisis con IA</span>
                  {!analisis[key]&&<button onClick={()=>analizarIA(detalle,"ca",null)} disabled={cargIA[key]} style={{background:"var(--color-background-secondary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,padding:"7px 14px",fontSize:12,cursor:"pointer",color:"var(--color-text-primary)",fontWeight:500}}>{cargIA[key]?"Analizando…":`✦ Analizar con ${AI_MODELS.find(m=>m.id===aiModel)?.label||aiModel} ↗`}</button>}
                </div>
                {analisis[key]&&<div><div style={{fontSize:13,lineHeight:1.75,whiteSpace:"pre-wrap"}}>{analisis[key]}</div><button onClick={()=>setAnalisis(p=>{const n={...p};delete n[key];return n;})} style={{marginTop:10,background:"none",border:"none",fontSize:11,color:"var(--color-text-tertiary)",cursor:"pointer",padding:0}}>↺ Volver a analizar</button></div>}
              </div>
              <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,overflow:"hidden"}}>
                <div style={{padding:"11px 17px",borderBottom:"0.5px solid var(--color-border-tertiary)",fontSize:13,fontWeight:600}}>Ítems solicitados</div>
                <div style={{padding:"0 17px"}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 60px 70px",padding:"8px 0",borderBottom:"0.5px solid var(--color-border-tertiary)",fontSize:11,color:"var(--color-text-tertiary)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}><span>Descripción</span><span style={{textAlign:"right"}}>Cant.</span><span style={{textAlign:"right"}}>Unidad</span></div>
                  {detalle.items.map((it,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1fr 60px 70px",padding:"9px 0",borderBottom:i<detalle.items.length-1?"0.5px solid var(--color-border-tertiary)":"none",alignItems:"center"}}><span style={{fontSize:13}}>{it.desc}</span><span style={{fontSize:13,fontWeight:600,textAlign:"right"}}>{it.cant}</span><span style={{fontSize:12,color:"var(--color-text-secondary)",textAlign:"right"}}>{it.unidad}</span></div>)}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}


