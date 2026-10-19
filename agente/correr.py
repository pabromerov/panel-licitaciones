"""Agente diario CMPV — recolección (capas 1 y 2) y publicación del reporte.
Uso:
  python3 agente/correr.py recolectar        → escribe candidatos.json y descartadas.json
  python3 agente/correr.py publicar rep.json → POST a /api/reporte
Requiere variables: PANEL_URL (https://panel-licitaciones.vercel.app) y AGENTE_KEY.
"""
import json, os, sys, time, urllib.request, datetime as dt
sys.path.insert(0, os.path.dirname(__file__))
from filtro import capa1, capa2

PANEL = os.environ.get("PANEL_URL", "https://panel-licitaciones.vercel.app").rstrip("/")
KEY = os.environ["AGENTE_KEY"]
CL = dt.timezone(dt.timedelta(hours=-3))

def get(path, intentos=3):
    for i in range(intentos):
        try:
            req = urllib.request.Request(PANEL + path, headers={"x-agente-key": KEY})
            return json.load(urllib.request.urlopen(req, timeout=60))
        except Exception as e:
            if i == intentos - 1: raise
            time.sleep(3 * (i + 1))

def ventana():
    """Desde el día siguiente al último reporte publicado hasta ayer (máx. 7 días).
    Así el lunes cubre vie–dom y un feriado o una corrida fallida no deja huecos."""
    hoy = dt.datetime.now(CL).date(); ayer = hoy - dt.timedelta(days=1)
    try:
        ult = (json.load(urllib.request.urlopen(PANEL + "/api/reporte", timeout=30)).get("reporte") or {})
        hasta_prev = dt.date.fromisoformat(ult["ventana"]["hasta"])
        if ult.get("prueba"): raise ValueError
        desde = hasta_prev + dt.timedelta(days=1)
    except Exception:
        desde = hoy - dt.timedelta(days=3 if hoy.weekday() == 0 else 1)
    desde = max(desde, hoy - dt.timedelta(days=7))
    return desde, ayer

def recolectar():
    desde, hasta = ventana()
    vistos, todas = set(), []
    d = desde
    while d <= hasta:
        data = get(f"/api/agente?fecha={d.strftime('%d%m%Y')}")
        for l in data.get("Listado") or []:
            if l["CodigoExterno"] not in vistos:
                vistos.add(l["CodigoExterno"]); todas.append(l)
        d += dt.timedelta(days=1); time.sleep(1)
    cand, desc = [], []
    for l in todas:
        est, esps, motivo = capa1(l.get("Nombre", ""))
        if est == "descartada": desc.append({"codigo": l["CodigoExterno"], "nombre": l.get("Nombre"), "capa": "nombre", "motivo": motivo})
        else: cand.append((l, esps))
    out = []
    for l, esps in cand:   # detalle secuencial: la API falla con llamadas en paralelo
        try: det = (get(f"/api/agente?codigo={l['CodigoExterno']}").get("Listado") or [None])[0]
        except Exception: det = None
        time.sleep(1.5)
        if not det:
            out.append({"codigo": l["CodigoExterno"], "nombre": l.get("Nombre"), "especialidades": esps, "estado_filtro": "sin_detalle"}); continue
        est, motivo, datos = capa2(det)
        reg = {"codigo": l["CodigoExterno"], "nombre": det.get("Nombre"), "especialidades": esps, "estado_filtro": est, "motivo_filtro": motivo, "tipo": det.get("Tipo"), **datos}
        if est == "descartada": desc.append({"codigo": reg["codigo"], "nombre": reg["nombre"], "capa": "detalle", "motivo": motivo})
        else: out.append(reg)
    meta = {"ventana": {"desde": desde.isoformat(), "hasta": hasta.isoformat()}, "revisadas": len(todas), "candidatas_nombre": len(cand)}
    json.dump({"meta": meta, "candidatos": out}, open("candidatos.json", "w"), ensure_ascii=False, indent=1)
    json.dump(desc, open("descartadas.json", "w"), ensure_ascii=False, indent=1)
    print(json.dumps(meta), "| para clasificar:", len(out), "| descartadas:", len(desc))

def publicar(path):
    body = open(path, "rb").read()
    req = urllib.request.Request(PANEL + "/api/reporte", data=body, method="POST",
                                 headers={"x-agente-key": KEY, "Content-Type": "application/json"})
    print(urllib.request.urlopen(req, timeout=60).read().decode())

if __name__ == "__main__":
    {"recolectar": lambda: recolectar(), "publicar": lambda: publicar(sys.argv[2])}[sys.argv[1]]()
