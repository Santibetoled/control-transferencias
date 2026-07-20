import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase.js";

/* ── Helpers ── */
function today() { return new Date().toISOString().split("T")[0]; }
function fmtDate(d) {
  if (!d) return "-";
  return new Date(d + "T12:00:00").toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}
function fmtMoney(n) { return "$" + Number(n || 0).toLocaleString("es-AR"); }

async function compressImage(file, maxW = 700, quality = 0.5) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width, h = img.height;
        if (w > maxW) { h = (maxW / w) * h; w = maxW; }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ── Progress Bar ── */
function PBar({ pct, h = 18 }) {
  const p = Math.min(pct, 100);
  const color = p >= 100 ? "#16a34a" : p >= 50 ? "#d97706" : "#dc2626";
  return (
    <div style={{ width: "100%", background: "#e5e7eb", borderRadius: 8, overflow: "hidden", height: h, position: "relative" }}>
      <div style={{ width: p + "%", background: color, height: "100%", borderRadius: 8, transition: "width 0.4s" }} />
      <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: h > 22 ? 14 : 11, fontWeight: 700, color: p > 40 ? "#fff" : "#374151" }}>
        {Math.round(p)}%
      </span>
    </div>
  );
}

/* ── Report HTML Generator ── */
function buildReport(cuenta, transfers) {
  var total = transfers.reduce(function (s, t) { return s + Number(t.monto); }, 0);
  var cantComp = transfers.filter(function (t) { return t.comprobante; }).length;

  var comprobantes = transfers.filter(function (t) { return t.comprobante; }).map(function (t, i) {
    return '<div style="page-break-inside:avoid;margin:16px 0;border:2px solid #cbd5e1;border-radius:10px;overflow:hidden;">'
      + '<div style="background:#f1f5f9;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e8f0;">'
      + '<span style="font-weight:700;font-size:13px;color:#1e3a5f;">COMPROBANTE ' + (i + 1) + ' de ' + cantComp + '</span>'
      + '<span style="font-weight:700;font-size:14px;color:#16a34a;">' + fmtMoney(t.monto) + '</span></div>'
      + '<div style="padding:8px 14px;font-size:12px;color:#475569;">'
      + (t.fecha ? '<span>Fecha: ' + fmtDate(t.fecha) + '</span>' : '')
      + (t.hora ? ' <span style="margin-left:12px;">Hora: ' + t.hora + '</span>' : '')
      + (t.cliente ? ' <span style="margin-left:12px;">Cliente: ' + t.cliente + '</span>' : '')
      + (t.chofer ? ' <span style="margin-left:12px;">Chofer: ' + t.chofer + '</span>' : '')
      + '</div>'
      + '<div style="padding:6px 14px 14px;"><img src="' + t.comprobante + '" style="width:100%;border-radius:6px;border:1px solid #e2e8f0;" /></div>'
      + '</div>';
  }).join("");

  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reporte - ' + cuenta.nombre + '</title>'
    + '<style>'
    + '*{box-sizing:border-box}'
    + 'body{font-family:Arial,sans-serif;max-width:780px;margin:0 auto;padding:24px;color:#1e293b}'
    + '.header{background:linear-gradient(135deg,#1e3a5f,#2d5a8e);color:#fff;padding:24px;border-radius:12px;margin-bottom:20px}'
    + '.header h1{margin:0;font-size:20px}.header p{margin:6px 0 0;font-size:13px;opacity:.9}'
    + '.resumen{background:#f0fdf4;border:2px solid #86efac;border-radius:10px;padding:20px;margin-bottom:20px;text-align:center}'
    + '.resumen p{margin:0;font-size:15px;color:#166534;line-height:1.6}.resumen strong{font-size:17px}'
    + '.stats{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap}'
    + '.stat{flex:1;min-width:110px;background:#f8fafc;border:1px solid #e2e8f0;padding:14px;border-radius:8px;text-align:center}'
    + '.stat .label{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-weight:600}'
    + '.stat .value{font-size:22px;font-weight:700;color:#1e3a5f;margin-top:3px}'
    + 'h2{color:#1e3a5f;border-bottom:2px solid #e2e8f0;padding-bottom:6px;font-size:16px;margin-top:28px}'
    + 'table{width:100%;border-collapse:collapse;margin-bottom:20px}'
    + 'th{background:#f1f5f9;text-align:left;padding:9px 10px;font-size:11px;text-transform:uppercase;color:#64748b}'
    + 'td{padding:9px 10px;border-bottom:1px solid #e2e8f0;font-size:12px}'
    + '.total-row{background:#f0fdf4;font-weight:700}'
    + '.footer{text-align:center;color:#94a3b8;font-size:10px;margin-top:28px;padding-top:14px;border-top:1px solid #e2e8f0}'
    + '@media print{body{padding:12px}.no-print{display:none!important}}'
    + '</style></head><body>'
    + '<div class="no-print" style="text-align:right;margin-bottom:16px;"><button onclick="window.print()" style="background:#16a34a;color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:13px;font-weight:600;cursor:pointer;">Imprimir / Guardar PDF</button></div>'
    + '<div class="header"><h1>REPORTE DE PAGO</h1>'
    + '<p>' + cuenta.nombre + (cuenta.alias ? ' \u2014 Alias: ' + cuenta.alias : '') + '</p>'
    + '<p>Inicio: ' + fmtDate(cuenta.fecha_inicio) + ' | Cubierta: ' + fmtDate(cuenta.fecha_completa) + '</p></div>'
    + '<div class="resumen"><p>La cuenta <strong>' + cuenta.nombre.toUpperCase() + '</strong> por un valor de <strong>' + fmtMoney(cuenta.monto) + '</strong><br/>'
    + 'fue cubierta a trav\u00e9s de <strong>' + transfers.length + ' transferencia' + (transfers.length !== 1 ? 's' : '') + '</strong>'
    + ' que suman <strong>' + fmtMoney(total) + '</strong></p></div>'
    + '<div class="stats">'
    + '<div class="stat"><div class="label">Monto Objetivo</div><div class="value">' + fmtMoney(cuenta.monto) + '</div></div>'
    + '<div class="stat"><div class="label">Total Cubierto</div><div class="value">' + fmtMoney(total) + '</div></div>'
    + '<div class="stat"><div class="label">Comprobantes</div><div class="value">' + cantComp + '</div></div></div>'
    + '<h2>Detalle de Transferencias</h2>'
    + '<table><thead><tr><th>#</th><th>Fecha</th><th>Hora</th><th>Cliente</th><th>Monto</th><th>Chofer</th></tr></thead><tbody>'
    + transfers.map(function (t, i) { return '<tr><td>' + (i + 1) + '</td><td>' + fmtDate(t.fecha) + '</td><td>' + (t.hora || "-") + '</td><td>' + (t.cliente || "-") + '</td><td>' + fmtMoney(t.monto) + '</td><td>' + (t.chofer || "-") + '</td></tr>'; }).join("")
    + '<tr class="total-row"><td></td><td colspan="3">TOTAL</td><td>' + fmtMoney(total) + '</td><td></td></tr>'
    + '</tbody></table>'
    + '<h2>Comprobantes (' + cantComp + ')</h2>'
    + (comprobantes || '<p style="color:#94a3b8;text-align:center;">Sin comprobantes cargados.</p>')
    + '<div class="footer">Generado: ' + new Date().toLocaleString("es-AR") + ' \u2014 Control de Transferencias</div>'
    + '</body></html>';
}

/* ── Styles ── */
const S = {
  app: { fontFamily: "'Segoe UI',Arial,sans-serif", background: "#f1f5f9", minHeight: "100vh", color: "#1e293b" },
  hdr: { background: "linear-gradient(135deg,#1e3a5f,#2d5a8e)", padding: "18px 20px", color: "#fff" },
  tabs: { display: "flex", background: "#fff", borderBottom: "2px solid #e2e8f0", overflowX: "auto" },
  tab: function (a) { return { padding: "12px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: "none", color: a ? "#1e3a5f" : "#94a3b8", borderBottom: a ? "2px solid #1e3a5f" : "2px solid transparent", marginBottom: -2, whiteSpace: "nowrap" }; },
  body: { padding: 16, maxWidth: 880, margin: "0 auto" },
  card: { background: "#fff", borderRadius: 10, padding: 16, marginBottom: 12, boxShadow: "0 1px 3px rgba(0,0,0,.07)" },
  kpiRow: { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  kpi: { flex: "1 1 100px", background: "#fff", borderRadius: 10, padding: "14px 10px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,.07)" },
  kpiLabel: { fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 },
  kpiValue: { fontSize: 22, fontWeight: 700, color: "#1e3a5f", marginTop: 2 },
  btn: function (c) { return { background: c || "#1e3a5f", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }; },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" },
  label: { display: "block", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.4 },
  select: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, background: "#fff", boxSizing: "border-box", fontFamily: "inherit" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  badge: function (c) { return { display: "inline-block", padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: c === "g" ? "#dcfce7" : c === "y" ? "#fef3c7" : "#fee2e2", color: c === "g" ? "#166534" : c === "y" ? "#92400e" : "#991b1b" }; },
};

/* ══════════════════════════════════════════ */
/* ══  MAIN APP                           ══ */
/* ══════════════════════════════════════════ */
export default function App() {
  const [cuentas, setCuentas] = useState([]);
  const [transferencias, setTransferencias] = useState([]);
  const [archivadas, setArchivadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [addC, setAddC] = useState(false);
  const [addT, setAddT] = useState(false);
  const [nC, setNC] = useState({ nombre: "", alias: "", monto: "", prioridad: "", responsable: "" });
  const [nT, setNT] = useState({ hora: "", cliente: "", monto: "", chofer: "", cuenta_id: "", comprobante: null, responsable: "" });
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [reportHTML, setReportHTML] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  /* ── Load Data ── */
  const loadData = useCallback(async function () {
    var cRes = await supabase.from("cuentas").select("*").eq("archivada", false).order("created_at");
    var tRes = await supabase.from("transferencias").select("*").order("created_at");
    var aRes = await supabase.from("cuentas").select("*").eq("archivada", true).order("fecha_completa", { ascending: false });

    if (cRes.data) setCuentas(cRes.data);
    if (tRes.data) setTransferencias(tRes.data);
    if (aRes.data) {
      // Load transfers for archived accounts
      var archivedWithTransfers = [];
      for (var i = 0; i < aRes.data.length; i++) {
        var a = aRes.data[i];
        var atRes = await supabase.from("transferencias").select("*").eq("cuenta_id", a.id).order("created_at");
        archivedWithTransfers.push({ ...a, transferencias: atRes.data || [] });
      }
      setArchivadas(archivedWithTransfers);
    }
    setLoading(false);
  }, []);

  useEffect(function () { loadData(); }, [loadData]);

  /* ── Helpers ── */
  function getProgress(cuentaId) {
    var ts = transferencias.filter(function (t) { return t.cuenta_id === cuentaId; });
    var total = ts.reduce(function (s, t) { return s + Number(t.monto); }, 0);
    return { total: total, transfers: ts };
  }

  /* ── Add Cuenta ── */
  async function addCuenta() {
    if (!nC.nombre || !nC.monto) return;
    setSaving(true);
    var res = await supabase.from("cuentas").insert({
      nombre: nC.nombre,
      alias: nC.alias || null,
      monto: Number(nC.monto),
      prioridad: nC.prioridad || null,
      responsable: nC.responsable || null,
      fecha_inicio: today(),
      archivada: false
    }).select();
    if (res.data) setCuentas(function (prev) { return [...prev, res.data[0]]; });
    setNC({ nombre: "", alias: "", monto: "", prioridad: "", responsable: "" });
    setAddC(false);
    setSaving(false);
  }

  /* ── Delete Cuenta ── */
  async function deleteCuenta(id) {
    if (!confirm("¿Eliminar esta cuenta y sus transferencias?")) return;
    await supabase.from("transferencias").delete().eq("cuenta_id", id);
    await supabase.from("cuentas").delete().eq("id", id);
    setCuentas(function (prev) { return prev.filter(function (c) { return c.id !== id; }); });
    setTransferencias(function (prev) { return prev.filter(function (t) { return t.cuenta_id !== id; }); });
  }

  /* ── Handle File ── */
  async function handleFile(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    var compressed = await compressImage(file);
    setNT(function (prev) { return { ...prev, comprobante: compressed }; });
    setUploading(false);
  }

  /* ── Add Transfer ── */
  async function addTransferencia() {
    if (!nT.monto || !nT.cuenta_id) return;
    setSaving(true);
    var res = await supabase.from("transferencias").insert({
      cuenta_id: nT.cuenta_id,
      hora: nT.hora || null,
      cliente: nT.cliente || null,
      monto: Number(nT.monto),
      chofer: nT.chofer || null,
      comprobante: nT.comprobante || null,
      responsable: nT.responsable || null,
      fecha: today()
    }).select();

    if (res.data) {
      var newTransf = res.data[0];
      var updatedTransfers = [...transferencias, newTransf];
      setTransferencias(updatedTransfers);

      // Check if the assigned account is now complete
      var cuenta = cuentas.find(function (c) { return c.id === nT.cuenta_id; });
      if (cuenta && !cuenta.fecha_completa) {
        var assignedTotal = updatedTransfers
          .filter(function (t) { return t.cuenta_id === nT.cuenta_id; })
          .reduce(function (s, t) { return s + Number(t.monto); }, 0);
        if (assignedTotal >= cuenta.monto) {
          await supabase.from("cuentas").update({ fecha_completa: today() }).eq("id", nT.cuenta_id);
          setCuentas(function (prev) {
            return prev.map(function (c) { return c.id === nT.cuenta_id ? { ...c, fecha_completa: today() } : c; });
          });
        }
      }
    }
    setNT({ hora: "", cliente: "", monto: "", chofer: "", cuenta_id: "", comprobante: null, responsable: "" });
    setAddT(false);
    setSaving(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  /* ── Delete Transfer ── */
  async function deleteTransferencia(id) {
    var t = transferencias.find(function (x) { return x.id === id; });
    await supabase.from("transferencias").delete().eq("id", id);
    var updated = transferencias.filter(function (x) { return x.id !== id; });
    setTransferencias(updated);

    // Re-check completion
    if (t) {
      var cuenta = cuentas.find(function (c) { return c.id === t.cuenta_id; });
      if (cuenta && cuenta.fecha_completa) {
        var remaining = updated
          .filter(function (x) { return x.cuenta_id === t.cuenta_id; })
          .reduce(function (s, x) { return s + Number(x.monto); }, 0);
        if (remaining < cuenta.monto) {
          await supabase.from("cuentas").update({ fecha_completa: null }).eq("id", t.cuenta_id);
          setCuentas(function (prev) {
            return prev.map(function (c) { return c.id === t.cuenta_id ? { ...c, fecha_completa: null } : c; });
          });
        }
      }
    }
  }

  /* ── Archive ── */
  async function archivar(id) {
    var cuenta = cuentas.find(function (c) { return c.id === id; });
    if (!cuenta) return;
    var fechaComp = cuenta.fecha_completa || today();
    await supabase.from("cuentas").update({ archivada: true, fecha_completa: fechaComp }).eq("id", id);
    setCuentas(function (prev) { return prev.filter(function (c) { return c.id !== id; }); });
    var ts = transferencias.filter(function (t) { return t.cuenta_id === id; });
    setTransferencias(function (prev) { return prev.filter(function (t) { return t.cuenta_id !== id; }); });
    setArchivadas(function (prev) { return [{ ...cuenta, fecha_completa: fechaComp, archivada: true, transferencias: ts }, ...prev]; });
  }

  /* ── Delete Archivada ── */
  async function deleteArchivada(id) {
    if (!confirm("¿Eliminar esta cuenta archivada y todos sus comprobantes?")) return;
    await supabase.from("transferencias").delete().eq("cuenta_id", id);
    await supabase.from("cuentas").delete().eq("id", id);
    setArchivadas(function (prev) { return prev.filter(function (a) { return a.id !== id; }); });
  }

  /* ── Open Report ── */
  function openReport(cuenta, transfers) {
    setReportHTML(buildReport(cuenta, transfers));
  }

  /* ── Loading State ── */
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "Arial" }}>
        <p style={{ color: "#64748b" }}>Cargando datos...</p>
      </div>
    );
  }

  /* ── Report View ── */
  if (reportHTML) {
    return (
      <div style={{ fontFamily: "'Segoe UI',Arial,sans-serif" }}>
        <style dangerouslySetInnerHTML={{__html: "@media print { .no-print { display: none !important; } }"}} />
        <div className="no-print" style={{ position: "sticky", top: 0, zIndex: 10, background: "linear-gradient(135deg,#1e3a5f,#2d5a8e)", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Reporte</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={function () { window.print(); }} style={S.btn("#16a34a")}>Imprimir / Guardar PDF</button>
            <button onClick={function () { setReportHTML(null); }} style={S.btn("rgba(255,255,255,.2)")}>Volver</button>
          </div>
        </div>
        <div dangerouslySetInnerHTML={{ __html: reportHTML }} />
      </div>
    );
  }

  /* ── Computed Values ── */
  var totalObj = cuentas.reduce(function (s, c) { return s + Number(c.monto); }, 0);
  var totalCub = transferencias.reduce(function (s, t) { return s + Number(t.monto); }, 0);
  var totalPct = totalObj > 0 ? (totalCub / totalObj) * 100 : 0;
  var completadas = cuentas.filter(function (c) { return c.fecha_completa; }).length;

  // Group archived by fecha_inicio
  var archivedByDate = {};
  archivadas.forEach(function (a) {
    var key = a.fecha_inicio || "sin-fecha";
    if (!archivedByDate[key]) archivedByDate[key] = [];
    archivedByDate[key].push(a);
  });
  var archDates = Object.keys(archivedByDate).sort().reverse();

  var TABS = [
    ["dashboard", "Dashboard"],
    ["cuentas", "Cuentas a Cubrir"],
    ["transferencias", "Transferencias"],
    ["historial", "Cubiertas (" + archivadas.length + ")"],
  ];

  /* ══════════════════════════════════════════ */
  /* ══  RENDER                             ══ */
  /* ══════════════════════════════════════════ */
  return (
    <div style={S.app}>
      {/* Header */}
      <div style={S.hdr}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Control de Transferencias</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.8 }}>Distribuidora — {fmtDate(today())}</p>
      </div>

      {/* Tabs */}
      <div style={S.tabs}>
        {TABS.map(function (item) {
          return <button key={item[0]} onClick={function () { setTab(item[0]); }} style={S.tab(tab === item[0])}>{item[1]}</button>;
        })}
      </div>

      <div style={S.body}>

        {/* ═══ DASHBOARD ═══ */}
        {tab === "dashboard" && (
          <div>
            <div style={S.kpiRow}>
              {[["Objetivo", fmtMoney(totalObj)], ["Cubierto", fmtMoney(totalCub)], ["Pendiente", fmtMoney(Math.max(totalObj - totalCub, 0))], ["Transf.", transferencias.length], ["Completas", completadas + "/" + cuentas.length]].map(function (item) {
                return <div key={item[0]} style={S.kpi}><div style={S.kpiLabel}>{item[0]}</div><div style={S.kpiValue}>{item[1]}</div></div>;
              })}
            </div>

            <div style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Progreso General</span>
                <span style={{ fontSize: 13, color: "#64748b" }}>{fmtMoney(totalCub)} / {fmtMoney(totalObj)}</span>
              </div>
              <PBar pct={totalPct} h={30} />
            </div>

            {cuentas.length === 0 ? (
              <div style={{ ...S.card, textAlign: "center", color: "#94a3b8", padding: 36 }}>
                <p style={{ margin: "0 0 6px", fontSize: 16 }}>No hay cuentas cargadas</p>
                <p style={{ fontSize: 13, margin: 0 }}>Andá a "Cuentas a Cubrir" para agregar destinos</p>
              </div>
            ) : (
              cuentas.map(function (c) {
                var prog = getProgress(c.id);
                var pct = c.monto > 0 ? (prog.total / c.monto) * 100 : 0;
                var done = pct >= 100;
                return (
                  <div key={c.id} style={{ ...S.card, borderLeft: "4px solid " + (done ? "#16a34a" : pct > 0 ? "#d97706" : "#e2e8f0") }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 15, fontWeight: 700 }}>{c.nombre}</span>
                          <span style={S.badge(done ? "g" : pct > 0 ? "y" : "r")}>{done ? "COMPLETO" : pct > 0 ? "EN CURSO" : "PENDIENTE"}</span>
                        </div>
                        {c.alias && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Alias: {c.alias}</div>}
                        {c.prioridad && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{c.prioridad}</div>}
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
                          Inicio: {fmtDate(c.fecha_inicio)}{c.fecha_completa ? " — Cubierta: " + fmtDate(c.fecha_completa) : ""}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#1e3a5f" }}>{fmtMoney(prog.total)}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>de {fmtMoney(c.monto)}</div>
                      </div>
                    </div>
                    <PBar pct={pct} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, fontSize: 12, color: "#64748b", flexWrap: "wrap", gap: 6 }}>
                      <span>{prog.transfers.length} transf. — Faltan {fmtMoney(Math.max(c.monto - prog.total, 0))}</span>
                      {done && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={function () { openReport(c, prog.transfers); }} style={S.btn("#2563eb")}>Ver Reporte</button>
                          <button onClick={function () { archivar(c.id); }} style={S.btn("#16a34a")}>Archivar ✓</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ═══ CUENTAS ═══ */}
        {tab === "cuentas" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 17, color: "#1e3a5f" }}>Cuentas a Cubrir</h2>
              <button onClick={function () { setAddC(!addC); }} style={S.btn()}>{addC ? "Cancelar" : "+ Agregar"}</button>
            </div>

            {addC && (
              <div style={{ ...S.card, border: "2px dashed #93c5fd" }}>
                <div style={S.grid2}>
                  <div><label style={S.label}>Destino / Proveedor</label><input style={S.input} placeholder="Ej: Sueldo Mariano" value={nC.nombre} onChange={function (e) { setNC({ ...nC, nombre: e.target.value }); }} /></div>
                  <div><label style={S.label}>Alias</label><input style={S.input} placeholder="Ej: bebida.tele.biblia" value={nC.alias} onChange={function (e) { setNC({ ...nC, alias: e.target.value }); }} /></div>
                  <div><label style={S.label}>Monto Objetivo ($)</label><input type="number" style={S.input} placeholder="500000" value={nC.monto} onChange={function (e) { setNC({ ...nC, monto: e.target.value }); }} /></div>
                  <div><label style={S.label}>Prioridad / Regla</label><input style={S.input} placeholder="Ej: Menores $300.000" value={nC.prioridad} onChange={function (e) { setNC({ ...nC, prioridad: e.target.value }); }} /></div>
                  <div><label style={S.label}>Responsable</label><input style={S.input} placeholder="Quién carga esta cuenta" value={nC.responsable} onChange={function (e) { setNC({ ...nC, responsable: e.target.value }); }} /></div>
                </div>
                <div style={{ marginTop: 12, textAlign: "right" }}>
                  <button onClick={addCuenta} style={S.btn()} disabled={!nC.nombre || !nC.monto || saving}>{saving ? "Guardando..." : "Guardar"}</button>
                </div>
              </div>
            )}

            {cuentas.length === 0 ? (
              <div style={{ ...S.card, textAlign: "center", color: "#94a3b8", padding: 36 }}>Todavía no hay cuentas. Agregá la primera.</div>
            ) : (
              cuentas.map(function (c) {
                var prog = getProgress(c.id);
                var pct = c.monto > 0 ? (prog.total / c.monto) * 100 : 0;
                return (
                  <div key={c.id} style={S.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{c.nombre}</span>
                        {c.alias && <span style={{ marginLeft: 8, fontSize: 12, color: "#64748b" }}>({c.alias})</span>}
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Cargada: {fmtDate(c.fecha_inicio)}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontWeight: 700, color: "#1e3a5f", fontSize: 15 }}>{fmtMoney(c.monto)}</span>
                        <button onClick={function () { deleteCuenta(c.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 18, lineHeight: 1 }}>×</button>
                      </div>
                    </div>
                    {c.prioridad && <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{c.prioridad}</div>}
                    <PBar pct={pct} />
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ═══ TRANSFERENCIAS ═══ */}
        {tab === "transferencias" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 17, color: "#1e3a5f" }}>Transferencias</h2>
              <button onClick={function () { setAddT(!addT); }} style={S.btn()} disabled={cuentas.length === 0}>{addT ? "Cancelar" : "+ Cargar"}</button>
            </div>

            {cuentas.length === 0 && (
              <div style={{ ...S.card, textAlign: "center", color: "#d97706", background: "#fffbeb", border: "1px solid #fde68a", padding: 14, fontSize: 13 }}>
                Primero cargá cuentas en "Cuentas a Cubrir"
              </div>
            )}

            {addT && (
              <div style={{ ...S.card, border: "2px dashed #93c5fd" }}>
                <div style={S.grid2}>
                  <div><label style={S.label}>Hora</label><input type="time" style={S.input} value={nT.hora} onChange={function (e) { setNT({ ...nT, hora: e.target.value }); }} /></div>
                  <div><label style={S.label}>Cliente / Pedido</label><input style={S.input} placeholder="Ej: Almacén López #142" value={nT.cliente} onChange={function (e) { setNT({ ...nT, cliente: e.target.value }); }} /></div>
                  <div><label style={S.label}>Monto ($)</label><input type="number" style={S.input} placeholder="125000" value={nT.monto} onChange={function (e) { setNT({ ...nT, monto: e.target.value }); }} /></div>
                  <div><label style={S.label}>Chofer / Vehículo</label><input style={S.input} placeholder="Ej: Camión 1 - Marcos" value={nT.chofer} onChange={function (e) { setNT({ ...nT, chofer: e.target.value }); }} /></div>
                  <div><label style={S.label}>Responsable</label><input style={S.input} placeholder="Quién carga" value={nT.responsable} onChange={function (e) { setNT({ ...nT, responsable: e.target.value }); }} /></div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <label style={S.label}>Asignar a cuenta</label>
                  <select style={S.select} value={nT.cuenta_id} onChange={function (e) { setNT({ ...nT, cuenta_id: e.target.value }); }}>
                    <option value="">— Seleccionar destino —</option>
                    {cuentas.map(function (c) {
                      var prog = getProgress(c.id);
                      return <option key={c.id} value={c.id}>{c.nombre} ({fmtMoney(prog.total)} / {fmtMoney(c.monto)})</option>;
                    })}
                  </select>
                </div>
                <div style={{ marginTop: 12 }}>
                  <label style={S.label}>Comprobante (foto)</label>
                  <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ fontSize: 13 }} />
                  {uploading && <span style={{ fontSize: 12, color: "#64748b", marginLeft: 8 }}>Comprimiendo...</span>}
                  {nT.comprobante && <div style={{ marginTop: 8 }}><img src={nT.comprobante} style={{ maxHeight: 120, borderRadius: 8, border: "1px solid #e2e8f0" }} alt="" /></div>}
                </div>
                <div style={{ marginTop: 12, textAlign: "right" }}>
                  <button onClick={addTransferencia} style={S.btn()} disabled={!nT.monto || !nT.cuenta_id || saving}>{saving ? "Guardando..." : "Guardar"}</button>
                </div>
              </div>
            )}

            {transferencias.length === 0 ? (
              <div style={{ ...S.card, textAlign: "center", color: "#94a3b8", padding: 36 }}>No hay transferencias cargadas.</div>
            ) : (
              transferencias.slice().reverse().map(function (t) {
                var cuenta = cuentas.find(function (c) { return c.id === t.cuenta_id; });
                return (
                  <div key={t.id} style={{ ...S.card, display: "flex", gap: 12, alignItems: "flex-start" }}>
                    {t.comprobante ? (
                      <img src={t.comprobante} onClick={function () { setPreview(t.comprobante); }} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0", cursor: "pointer", flexShrink: 0 }} alt="" />
                    ) : (
                      <div style={{ width: 60, height: 60, background: "#f1f5f9", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#94a3b8", flexShrink: 0, textAlign: "center" }}>Sin foto</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: "#1e3a5f" }}>{fmtMoney(t.monto)}</span>
                        <button onClick={function () { deleteTransferencia(t.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 18, lineHeight: 1 }}>×</button>
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                        {t.fecha ? fmtDate(t.fecha) + " " : ""}{t.hora ? t.hora + " — " : ""}{t.cliente || "S/C"}{t.chofer ? " — " + t.chofer : ""}{t.responsable ? " — Cargó: " + t.responsable : ""}
                      </div>
                      {cuenta && <div style={{ marginTop: 4 }}><span style={{ fontSize: 11, background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: 12 }}>→ {cuenta.nombre}</span></div>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ═══ HISTORIAL ═══ */}
        {tab === "historial" && (
          <div>
            <h2 style={{ margin: "0 0 14px", fontSize: 17, color: "#1e3a5f" }}>Cuentas Cubiertas — Historial</h2>

            {archDates.length === 0 ? (
              <div style={{ ...S.card, textAlign: "center", color: "#94a3b8", padding: 36 }}>
                <p style={{ margin: "0 0 6px", fontSize: 15 }}>No hay cuentas archivadas</p>
                <p style={{ fontSize: 13, margin: 0 }}>Cuando una cuenta se completa, archivala desde el Dashboard</p>
              </div>
            ) : (
              archDates.map(function (date) {
                return (
                  <div key={date} style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f", marginBottom: 10, padding: "8px 14px", background: "#e2e8f0", borderRadius: 8 }}>
                      Cargadas el {fmtDate(date)}
                    </div>
                    {archivedByDate[date].map(function (a) {
                      var total = (a.transferencias || []).reduce(function (s, t) { return s + Number(t.monto); }, 0);
                      return (
                        <div key={a.id} style={{ ...S.card, borderLeft: "4px solid #16a34a" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6 }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 15, fontWeight: 700 }}>{a.nombre}</span>
                                <span style={S.badge("g")}>CUBIERTA</span>
                              </div>
                              {a.alias && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Alias: {a.alias}</div>}
                              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                                Inicio: {fmtDate(a.fecha_inicio)} — Cubierta: {fmtDate(a.fecha_completa)}
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: 17, fontWeight: 700, color: "#16a34a" }}>{fmtMoney(total)}</div>
                              <div style={{ fontSize: 12, color: "#64748b" }}>Objetivo: {fmtMoney(a.monto)}</div>
                            </div>
                          </div>
                          <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                            <span style={{ fontSize: 12, color: "#64748b" }}>{(a.transferencias || []).length} transferencias{a.responsable ? " — Cargó: " + a.responsable : ""}</span>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={function () { openReport(a, a.transferencias || []); }} style={S.btn("#2563eb")}>Ver Reporte</button>
                              <button onClick={function () { deleteArchivada(a.id); }} style={S.btn("#ef4444")}>Eliminar</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {preview && (
        <div onClick={function () { setPreview(null); }} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, cursor: "pointer", padding: 16 }}>
          <img src={preview} style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: 10 }} alt="" />
        </div>
      )}

      {/* Saving indicator */}
      {saving && (
        <div style={{ position: "fixed", bottom: 20, right: 20, background: "#1e3a5f", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 12px rgba(0,0,0,.2)", zIndex: 999 }}>
          Guardando...
        </div>
      )}
    </div>
  );
}
