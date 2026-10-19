"""Filtro CMPV — capa 1 (nombre) y capa 2 (detalle: UNSPSC, región, descripción)."""
import re, unicodedata
def n(s): return unicodedata.normalize("NFD",(s or "").lower()).encode("ascii","ignore").decode()

# Términos positivos (catálogo CMPV validado 19/10/2026)
POS = {
 "Imagenología":["ecograf","ecotomograf","eco mamaria","eco obstetr","eco ginec","transvaginal","doppler","mamograf","radiograf","rayos x","scanner","tomograf","tac ","imagenolog","imagenes diagnost","imagen diagnost","programa imagenes","ultrasonido","proyecciones complementarias","magnificacion"],
 "Resonancia":["resonancia"],
 "Cardiología":["ecocardiogra","holter","electrocardiogra","ecg","test de esfuerzo","ergometr","cardiolog","mapa ","monitoreo ambulatorio de presion"],
 "ORL":["otorrino","orl","audiometr","impedanciometr","nasofibro","nasofaringo","hipoacusia","audiolog"],
 "Endoscopía":["endoscop","colonoscop","gastroscop","gastroenterolog","biopsia digestiva","esofagogastro"],
 "Neurología":["electroencefalogra","eeg","electromiogra","emg","neurolog","neurofisiolog","potenciales evocados"],
 "Respiratorio":["espirometr","funcion pulmonar","broncopulmonar","broncodilatad"],
 "Urología":["urodinam","uroflujometr","cistoscop","urolog"],
 "Consultas":["consulta medica","consultas medicas","consulta de especialid","consultas de especialid","medico especialista","medicos especialistas","resolutividad","lista de espera","listas de espera","canasta","atencion de especialid","prestaciones medicas","prestaciones de salud","ginecolog","dermatolog","traumatolog","pediatr","psiquiatr","endocrinolog","nutriolog","reumatolog","nefrolog","geriatr"],
 "Rehabilitación":["kinesiolog","kinesioterap","fonoaudiolog","rehabilitacion","fisioterap","terapia ocupacional"],
 "Odontología":["odontolog","dental","endodoncia","protesis","salud bucal","salud oral","periodonc","ortodonc","exodoncia","altas integrales"],
 "Laboratorio":["laboratorio clinico","examenes de laboratorio","anatomia patolog","biopsia","histopatolog","citolog","papanicolau","pap "],
}
# Exclusión dura por nombre (no son servicios que presta CMPV)
NEG = ["mantencion","mantenimiento","reparacion","calibracion","adquisicion de equipo","compra de equipo","arriendo de equipo","arriendo equipo",
 "suministro de insumo","insumos","reactivo","farmaco","medicamento","material","repuesto","obra","construccion","habilitacion de","mobiliario",
 "aseo","alimentacion","vigilancia","transporte","traslado","capacitacion","software","licencia","polisomnograf","veterinar","bovin","canin",
 "equipamiento","equipo de","equipos de","accesorio","adquisicion de","compra de","suministro de gel","dispositivo","vestuario","impresion","gas ",
 "residuos","lavanderia","oftalmolog","catarata","vitreo","mtto","arriendo","hemodialisis","dialisis","cirugia","quirurg","pabellon","hospitaliz","protesis de cadera","endoprotesis","stent","placa","aguja","kit ","instrumental","ecografo","sillon","canasta de navidad","canastas de alimentos","ropa","residencia","seguro","esteriliz","informes de","informe de","telerradiolog","teleinforme","operativo","clinica movil","unidad movil","en terreno"]
# Segmento UNSPSC válido para servicios: 85 (servicios de salud). Excluye 42 (equipo médico), 51 (fármacos), 72/73/81 (mantención, servicios técnicos).
UNSPSC_OK = ("85",)

def capa1(nombre):
    t = n(nombre)
    neg = [w for w in NEG if w in t]
    esp = [k for k,ws in POS.items() if any(w in t for w in ws)]
    if neg: return "descartada", esp, "nombre excluido: "+", ".join(neg[:3])
    if not esp: return "descartada", esp, "sin especialidad del catálogo"
    return "candidata", esp, ""

def capa2(det):
    """det = objeto Listado[0] del detalle. Devuelve (estado, motivo, datos)."""
    items = (det.get("Items") or {}).get("Listado") or []
    cats = [str(i.get("CodigoCategoria") or i.get("CodigoProducto") or "") for i in items]
    seg85 = [c for c in cats if c.startswith(UNSPSC_OK)]
    region = (det.get("Comprador") or {}).get("RegionUnidad") or ""
    desc = n(det.get("Descripcion","")) + " " + " ".join(n(i.get("Descripcion","")) for i in items)
    datos = {"organismo":(det.get("Comprador") or {}).get("NombreOrganismo"),"region":region,
             "comuna":(det.get("Comprador") or {}).get("ComunaUnidad"),"monto":det.get("MontoEstimado"),
             "subcontratacion":det.get("SubContratacion"),"unspsc":cats,
             "publicacion":(det.get("Fechas") or {}).get("FechaPublicacion"),"cierre":det.get("FechaCierre") or (det.get("Fechas") or {}).get("FechaCierre"),
             "preguntas_hasta":(det.get("Fechas") or {}).get("FechaFinal"),"descripcion":det.get("Descripcion","")[:600],
             "items":[i.get("Descripcion") for i in items][:15]}
    segs = sorted(set(c[:2] for c in cats))
    if items and not seg85:
        bienes = all(c[:2].isdigit() and 10 <= int(c[:2]) <= 60 for c in cats)
        servicio_nombre = any(w in n(det.get("Nombre","")) for w in ["servicio","prestacion","examen","consulta","convenio","resolutividad","atencion"])
        if bienes and not servicio_nombre:
            return "descartada","ítems de bienes (UNSPSC "+",".join(segs)+"), no servicios",datos
        datos["alerta_unspsc"] = "rubro "+",".join(segs)+" (no 85): verificar si es servicio"
    if "metropolitana" not in n(region): return "descartada","fuera de RM ("+region+")",datos
    if any(w in desc for w in ["mantencion","adquisicion de equipo","insumos","reactivos"]) and len(seg85)<len(cats): return "revisar","mezcla servicios con equipos/insumos",datos
    return "pasa","",datos
