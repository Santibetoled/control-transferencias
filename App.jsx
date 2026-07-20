import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase.js";


/* ── Logos ── */
var LOGO_BIG = "data:image/jpeg;base64,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";
var LOGO_SMALL = "data:image/jpeg;base64,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";

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
  const color = pct > 100 ? "#dc2626" : pct >= 100 ? "#16a34a" : pct >= 50 ? "#d97706" : "#dc2626";
  return (
    <div style={{ width: "100%", background: "#e5e7eb", borderRadius: 8, overflow: "hidden", height: h, position: "relative" }}>
      <div style={{ width: p + "%", background: color, height: "100%", borderRadius: 8, transition: "width 0.4s" }} />
      <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: h > 22 ? 14 : 11, fontWeight: 700, color: p > 40 ? "#fff" : "#374151" }}>
        {Math.round(pct)}%
      </span>
    </div>
  );
}

/* ── Report HTML Generator ── */
function buildReport(cuenta, transfers) {
  var total = transfers.reduce(function (s, t) { return s + Number(t.monto); }, 0);
  var cantComp = transfers.filter(function (t) { return t.comprobante; }).length;
  var excedido = total > Number(cuenta.monto);
  var exceso = total - Number(cuenta.monto);

  var comprobantes = transfers.filter(function (t) { return t.comprobante; }).map(function (t, i) {
    return '<div style="page-break-inside:avoid;margin:16px 0;border:2px solid #cbd5e1;border-radius:10px;overflow:hidden;">'
      + '<div style="background:#f1f5f9;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e8f0;">'
      + '<span style="font-weight:700;font-size:13px;color:#E65100;">COMPROBANTE ' + (i + 1) + ' de ' + cantComp + '</span>'
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
    + '.header{background:linear-gradient(135deg,#1a1a1a,#2d2d2d);color:#fff;padding:24px;border-radius:12px;margin-bottom:20px}'
    + '.header h1{margin:0;font-size:20px}.header p{margin:6px 0 0;font-size:13px;opacity:.9}'
    + '.resumen{background:#f0fdf4;border:2px solid #86efac;border-radius:10px;padding:20px;margin-bottom:20px;text-align:center}'
    + '.resumen p{margin:0;font-size:15px;color:#166534;line-height:1.6}.resumen strong{font-size:17px}'
    + '.stats{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap}'
    + '.stat{flex:1;min-width:110px;background:#f8fafc;border:1px solid #e2e8f0;padding:14px;border-radius:8px;text-align:center}'
    + '.stat .label{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-weight:600}'
    + '.stat .value{font-size:22px;font-weight:700;color:#E65100;margin-top:3px}'
    + 'h2{color:#E65100;border-bottom:2px solid #e2e8f0;padding-bottom:6px;font-size:16px;margin-top:28px}'
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
    + (excedido ? '<div style="background:#fef2f2;border:2px solid #fca5a5;border-radius:10px;padding:16px;margin-bottom:20px;text-align:center;"><p style="margin:0;font-size:15px;color:#991b1b;font-weight:700;">\u26a0\ufe0f EXCEDIDO EN ' + fmtMoney(exceso) + '</p></div>' : '')
    + '<div class="stats">'
    + '<div class="stat"><div class="label">Monto Objetivo</div><div class="value">' + fmtMoney(cuenta.monto) + '</div></div>'
    + '<div class="stat"><div class="label">Total Cubierto</div><div class="value">' + fmtMoney(total) + '</div></div>'
    + '<div class="stat"><div class="label">Comprobantes</div><div class="value">' + cantComp + '</div></div>'
    + (excedido ? '<div class="stat"><div class="label">Excedente</div><div class="value" style="color:#dc2626">' + fmtMoney(exceso) + '</div></div>' : '')
    + '</div>'
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


/* ── Provider Report ── */
function buildProviderReport(cuenta, transfers) {
  var total = transfers.reduce(function (s, t) { return s + Number(t.monto); }, 0);
  var cantComp = transfers.filter(function (t) { return t.comprobante; }).length;
  var excedido = total > Number(cuenta.monto);
  var exceso = total - Number(cuenta.monto);

  var lista = transfers.map(function (t, i) {
    return '<tr><td style="font-weight:600;">' + (i + 1) + '</td><td>' + fmtDate(t.fecha) + ' ' + (t.hora || "-") + '</td><td style="font-weight:700;">' + fmtMoney(t.monto) + '</td></tr>';
  }).join("");

  var comprobantes = transfers.filter(function (t) { return t.comprobante; }).map(function (t, i) {
    return '<div style="page-break-inside:avoid;margin:14px 0;border:2px solid #ddd;border-radius:10px;overflow:hidden;">'
      + '<div style="background:#f8f8f8;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e5e5e5;">'
      + '<span style="font-weight:700;font-size:13px;">COMPROBANTE ' + (i + 1) + ' de ' + cantComp + '</span>'
      + '<span style="font-weight:700;font-size:14px;">' + fmtMoney(t.monto) + '</span></div>'
      + '<div style="padding:6px 14px 14px;"><img src="' + t.comprobante + '" style="width:100%;border-radius:6px;" /></div>'
      + '</div>';
  }).join("");

  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Comprobantes - ' + cuenta.nombre + '</title>'
    + '<style>'
    + '*{box-sizing:border-box}'
    + 'body{font-family:Arial,sans-serif;max-width:780px;margin:0 auto;padding:24px;color:#222}'
    + '.header{background:#1a1a1a;color:#fff;padding:24px;border-radius:12px;margin-bottom:20px}'
    + '.header h1{margin:0;font-size:20px}.header p{margin:6px 0 0;font-size:13px;opacity:.9}'
    + '.resumen{background:#f0fdf4;border:2px solid #86efac;border-radius:10px;padding:20px;margin-bottom:20px;text-align:center}'
    + '.resumen p{margin:0;font-size:15px;color:#166534;line-height:1.6}.resumen strong{font-size:17px}'
    + '.excedido-box{background:#fef2f2;border:2px solid #fca5a5;border-radius:10px;padding:16px;margin-bottom:20px;text-align:center}'
    + '.excedido-box p{margin:0;font-size:15px;color:#991b1b;line-height:1.6;font-weight:700}'
    + '.stats{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap}'
    + '.stat{flex:1;min-width:110px;background:#f8f8f8;border:1px solid #e5e5e5;padding:14px;border-radius:8px;text-align:center}'
    + '.stat .label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;font-weight:600}'
    + '.stat .value{font-size:22px;font-weight:700;color:#222;margin-top:3px}'
    + '.stat .value.red{color:#dc2626}'
    + 'h2{color:#222;border-bottom:2px solid #e5e5e5;padding-bottom:6px;font-size:16px;margin-top:28px}'
    + 'table{width:100%;border-collapse:collapse;margin-bottom:20px}'
    + 'th{background:#f5f5f5;text-align:left;padding:9px 10px;font-size:11px;text-transform:uppercase;color:#888}'
    + 'td{padding:9px 10px;border-bottom:1px solid #eee;font-size:13px}'
    + '.total-row{background:#f5f5f5;font-weight:700}'
    + '.footer{text-align:center;color:#aaa;font-size:10px;margin-top:28px;padding-top:14px;border-top:1px solid #eee}'
    + '@media print{body{padding:12px}.no-print{display:none!important}}'
    + '</style></head><body>'
    + '<div class="no-print" style="text-align:right;margin-bottom:16px;"><button onclick="window.print()" style="background:#1a1a1a;color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:13px;font-weight:600;cursor:pointer;">Imprimir / Guardar PDF</button></div>'
    + '<div class="header"><h1>COMPROBANTES DE PAGO</h1>'
    + '<p>' + cuenta.nombre + (cuenta.alias ? ' \u2014 Alias: ' + cuenta.alias : '') + '</p></div>'
    + '<div class="resumen"><p>La cuenta <strong>' + cuenta.nombre.toUpperCase() + '</strong> por un valor de <strong>' + fmtMoney(cuenta.monto) + '</strong><br/>'
    + 'fue cubierta con <strong>' + transfers.length + ' transferencia' + (transfers.length !== 1 ? 's' : '') + '</strong>'
    + ' que suman <strong>' + fmtMoney(total) + '</strong></p></div>'
    + (excedido ? '<div class="excedido-box"><p>\u26a0\ufe0f ATENCI\u00d3N: SE EXCEDI\u00d3 EL MONTO OBJETIVO EN ' + fmtMoney(exceso) + '</p><p style="font-size:13px;font-weight:400;margin-top:6px;color:#b91c1c;">El monto transferido supera el acordado. Contactar al proveedor.</p></div>' : '')
    + '<div class="stats">'
    + '<div class="stat"><div class="label">Monto Objetivo</div><div class="value">' + fmtMoney(cuenta.monto) + '</div></div>'
    + '<div class="stat"><div class="label">Total Transferido</div><div class="value' + (excedido ? ' red' : '') + '">' + fmtMoney(total) + '</div></div>'
    + '<div class="stat"><div class="label">Comprobantes</div><div class="value">' + cantComp + '</div></div>'
    + (excedido ? '<div class="stat"><div class="label">Excedente</div><div class="value red">' + fmtMoney(exceso) + '</div></div>' : '')
    + '</div>'
    + '<h2>Detalle de Transferencias</h2>'
    + '<table><thead><tr><th>N\u00b0</th><th>Fecha / Hora</th><th>Monto</th></tr></thead><tbody>'
    + lista
    + '<tr class="total-row"><td></td><td>TOTAL</td><td>' + fmtMoney(total) + '</td></tr>'
    + '</tbody></table>'
    + '<h2>Comprobantes (' + cantComp + ')</h2>'
    + (comprobantes || '<p style="color:#aaa;text-align:center;">Sin comprobantes.</p>')
    + '<div class="footer">Generado: ' + new Date().toLocaleString("es-AR") + '</div>'
    + '</body></html>';
}

/* ── Category/Filtered Report ── */
function buildFilteredReport(cuentasList, filtroLabel) {
  var totalObj = cuentasList.reduce(function (s, c) { return s + Number(c.monto); }, 0);
  var allTransf = cuentasList.reduce(function (arr, c) { return arr.concat(c.transferencias || []); }, []);
  var totalCub = allTransf.reduce(function (s, t) { return s + Number(t.monto); }, 0);
  var rows = cuentasList.map(function (c) {
    var t = (c.transferencias || []).reduce(function (s, t) { return s + Number(t.monto); }, 0);
    var exc = t > Number(c.monto);
    return '<tr><td>' + c.nombre + '</td><td>' + (c.categoria || "-") + '</td><td>' + fmtDate(c.fecha_inicio) + '</td><td>' + fmtDate(c.fecha_completa) + '</td><td>' + fmtMoney(c.monto) + '</td><td' + (exc ? ' style="color:#dc2626;font-weight:700"' : '') + '>' + fmtMoney(t) + (exc ? ' ⚠️' : '') + '</td><td>' + (c.transferencias || []).length + '</td></tr>';
  }).join("");
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reporte ' + filtroLabel + '</title>'
    + '<style>*{box-sizing:border-box}body{font-family:Arial,sans-serif;max-width:850px;margin:0 auto;padding:24px;color:#222}'
    + '.header{background:#1a1a1a;color:#fff;padding:24px;border-radius:12px;margin-bottom:20px}'
    + '.header h1{margin:0;font-size:20px}.header p{margin:6px 0 0;font-size:13px;opacity:.9}'
    + '.stats{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap}'
    + '.stat{flex:1;min-width:110px;background:#f8f8f8;border:1px solid #e5e5e5;padding:14px;border-radius:8px;text-align:center}'
    + '.stat .label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;font-weight:600}'
    + '.stat .value{font-size:22px;font-weight:700;color:#222;margin-top:3px}'
    + 'table{width:100%;border-collapse:collapse;margin-bottom:20px}'
    + 'th{background:#f5f5f5;text-align:left;padding:9px 10px;font-size:11px;text-transform:uppercase;color:#888}'
    + 'td{padding:9px 10px;border-bottom:1px solid #eee;font-size:12px}'
    + '.total-row{background:#f5f5f5;font-weight:700}'
    + '.footer{text-align:center;color:#aaa;font-size:10px;margin-top:28px;padding-top:14px;border-top:1px solid #eee}'
    + '@media print{body{padding:12px}.no-print{display:none!important}}'
    + '</style></head><body>'
    + '<div class="no-print" style="text-align:right;margin-bottom:16px;"><button onclick="window.print()" style="background:#1a1a1a;color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:13px;font-weight:600;cursor:pointer;">Imprimir / Guardar PDF</button></div>'
    + '<div class="header"><h1>REPORTE: ' + filtroLabel.toUpperCase() + '</h1>'
    + '<p>Generado: ' + new Date().toLocaleString("es-AR") + '</p></div>'
    + '<div class="stats">'
    + '<div class="stat"><div class="label">Cuentas</div><div class="value">' + cuentasList.length + '</div></div>'
    + '<div class="stat"><div class="label">Objetivo Total</div><div class="value">' + fmtMoney(totalObj) + '</div></div>'
    + '<div class="stat"><div class="label">Total Cubierto</div><div class="value">' + fmtMoney(totalCub) + '</div></div>'
    + '<div class="stat"><div class="label">Transferencias</div><div class="value">' + allTransf.length + '</div></div>'
    + '</div>'
    + '<table><thead><tr><th>Cuenta</th><th>Categoría</th><th>Inicio</th><th>Cubierta</th><th>Objetivo</th><th>Cubierto</th><th>Transf.</th></tr></thead><tbody>'
    + rows
    + '<tr class="total-row"><td colspan="4">TOTALES</td><td>' + fmtMoney(totalObj) + '</td><td>' + fmtMoney(totalCub) + '</td><td>' + allTransf.length + '</td></tr>'
    + '</tbody></table>'
    + '<div class="footer">Distribuidora Pianyi — Control de Transferencias</div>'
    + '</body></html>';
}

/* ── Styles ── */
const S = {
  app: { fontFamily: "'Segoe UI',Arial,sans-serif", background: "#f1f5f9", minHeight: "100vh", color: "#1e293b" },
  hdr: { background: "linear-gradient(135deg,#1a1a1a,#2d2d2d)", padding: "18px 20px", color: "#fff" },
  tabs: { display: "flex", background: "#fff", borderBottom: "2px solid #e2e8f0", overflowX: "auto" },
  tab: function (a) { return { padding: "12px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: "none", color: a ? "#E65100" : "#94a3b8", borderBottom: a ? "2px solid #E65100" : "2px solid transparent", marginBottom: -2, whiteSpace: "nowrap" }; },
  body: { padding: 16, maxWidth: 880, margin: "0 auto" },
  card: { background: "#fff", borderRadius: 10, padding: 16, marginBottom: 12, boxShadow: "0 1px 3px rgba(0,0,0,.07)" },
  kpiRow: { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  kpi: { flex: "1 1 100px", background: "#fff", borderRadius: 10, padding: "14px 10px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,.07)" },
  kpiLabel: { fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 },
  kpiValue: { fontSize: 22, fontWeight: 700, color: "#1a1a1a", marginTop: 2 },
  btn: function (c) { return { background: c || "#E65100", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }; },
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
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ usuario: "", contrasena: "" });
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [cuentas, setCuentas] = useState([]);
  const [transferencias, setTransferencias] = useState([]);
  const [archivadas, setArchivadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [addC, setAddC] = useState(false);
  const [addT, setAddT] = useState(false);
  const [nC, setNC] = useState({ nombre: "", alias: "", monto: "", prioridad: "", categoria: "" });
  const [nT, setNT] = useState({ hora: "", cliente: "", monto: "", chofer: "", cuenta_id: "", comprobante: null });
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [reportHTML, setReportHTML] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filtCat, setFiltCat] = useState("");
  const [filtDesde, setFiltDesde] = useState("");
  const [filtHasta, setFiltHasta] = useState("");
  const fileRef = useRef();

  /* ── Auth ── */
  useEffect(function () {
    try {
      var saved = localStorage.getItem("ct-user");
      if (saved) setUser(JSON.parse(saved));
    } catch (e) {}
  }, []);

  async function handleLogin() {
    if (!loginForm.usuario || !loginForm.contrasena) return;
    setLoggingIn(true);
    setLoginError("");
    var res = await supabase.from("usuarios").select("*").eq("usuario", loginForm.usuario).eq("contrasena", loginForm.contrasena).single();
    if (res.data) {
      var u = { id: res.data.id, usuario: res.data.usuario, nombre: res.data.nombre_display };
      setUser(u);
      try { localStorage.setItem("ct-user", JSON.stringify(u)); } catch (e) {}
    } else {
      setLoginError("Usuario o contraseña incorrectos");
    }
    setLoggingIn(false);
  }

  function handleLogout() {
    setUser(null);
    try { localStorage.removeItem("ct-user"); } catch (e) {}
  }

  /* ── Load Data ── */
  const loadData = useCallback(async function () {
    if (!user) { setLoading(false); return; }
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
    // Auto-archive cuentas cubiertas > 48h
    if (aRes.data) {
      var now = new Date();
      for (var j = 0; j < aRes.data.length; j++) {
        var ac = aRes.data[j];
        if (!ac.en_historial && ac.fecha_completa) {
          var completedAt = new Date(ac.fecha_completa + "T12:00:00");
          var hoursAgo = (now - completedAt) / (1000 * 60 * 60);
          if (hoursAgo > 48) {
            await supabase.from("cuentas").update({ en_historial: true }).eq("id", ac.id);
          }
        }
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(function () { loadData(); }, [loadData, user]);

  
/* ── Logos ── */
var LOGO_BIG = "data:image/jpeg;base64,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";
var LOGO_SMALL = "data:image/jpeg;base64,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";

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
      responsable: user ? user.nombre : null,
      categoria: nC.categoria || null,
      fecha_inicio: today(),
      archivada: false
    }).select();
    if (res.data) setCuentas(function (prev) { return [...prev, res.data[0]]; });
    setNC({ nombre: "", alias: "", monto: "", prioridad: "", categoria: "" });
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
      responsable: user ? user.nombre : null,
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
    setNT({ hora: "", cliente: "", monto: "", chofer: "", cuenta_id: "", comprobante: null });
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

  /* ── Mover a Historial ── */
  async function moverAHistorial(id) {
    await supabase.from("cuentas").update({ en_historial: true }).eq("id", id);
    setArchivadas(function (prev) {
      return prev.map(function (a) { return a.id === id ? { ...a, en_historial: true } : a; });
    });
  }

  /* ── Open Report ── */
  function openReport(cuenta, transfers) {
    setReportHTML(buildReport(cuenta, transfers));
  }

  function openProviderReport(cuenta, transfers) {
    setReportHTML(buildProviderReport(cuenta, transfers));
  }

  function openFilteredReport() {
    var label = (filtCat || "Todas las categorías") + (filtDesde || filtHasta ? " (" + (filtDesde || "inicio") + " a " + (filtHasta || "hoy") + ")" : "");
    setReportHTML(buildFilteredReport(histFiltrado, label));
  }

  /* ── Login Screen ── */
  if (!user) {
    return (
      <div style={{ fontFamily: "'Segoe UI',Arial,sans-serif", background: "linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 380, boxShadow: "0 8px 32px rgba(0,0,0,.3)" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <img src={LOGO_BIG} alt="Pianyi" style={{ width: 140, height: 140, objectFit: "contain", marginBottom: 12 }} />
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1a1a1a", letterSpacing: "1px" }}>DISTRIBUIDORA PIANYI</h1>
            <div style={{ width: 60, height: 3, background: "linear-gradient(90deg,#E65100,#FFD600)", margin: "10px auto", borderRadius: 2 }} />
            <p style={{ color: "#64748b", fontSize: 13, margin: "8px 0 0" }}>Control de Transferencias</p>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>Usuario</label>
            <input style={S.input} placeholder="Tu usuario" value={loginForm.usuario} onChange={function (e) { setLoginForm({ ...loginForm, usuario: e.target.value }); }} onKeyDown={function (e) { if (e.key === "Enter") handleLogin(); }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>Contraseña</label>
            <input type="password" style={S.input} placeholder="Tu contraseña" value={loginForm.contrasena} onChange={function (e) { setLoginForm({ ...loginForm, contrasena: e.target.value }); }} onKeyDown={function (e) { if (e.key === "Enter") handleLogin(); }} />
          </div>
          {loginError && <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{loginError}</div>}
          <button onClick={handleLogin} disabled={loggingIn || !loginForm.usuario || !loginForm.contrasena} style={{ ...S.btn(), width: "100%", padding: 12, fontSize: 15, background: "linear-gradient(135deg,#E65100,#FF8F00)" }}>{loggingIn ? "Ingresando..." : "Ingresar"}</button>
        </div>
      </div>
    );
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
        <div className="no-print" style={{ position: "sticky", top: 0, zIndex: 10, background: "linear-gradient(135deg,#1a1a1a,#2d2d2d)", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
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
  var hoy = today();
  // Weekly bounds (Monday to Sunday)
  var nowDate = new Date(hoy + "T12:00:00");
  var dayOfWeek = nowDate.getDay() || 7; // Sunday=7
  var mondayDate = new Date(nowDate);
  mondayDate.setDate(nowDate.getDate() - dayOfWeek + 1);
  var lunes = mondayDate.toISOString().split("T")[0];
  var mesActual = hoy.substring(0, 7); // "YYYY-MM"

  // Helper to get all cuentas+archivadas for period stats
  var todasCuentas = cuentas.concat(archivadas);
  var todasTransf = transferencias.concat(archivadas.reduce(function (arr, a) { return arr.concat(a.transferencias || []); }, []));

  // Daily
  var dailyCuentas = todasCuentas.filter(function (c) { return c.fecha_inicio === hoy; });
  var dailyTransf = todasTransf.filter(function (t) { return t.fecha === hoy; });
  var dailyObj = dailyCuentas.reduce(function (s, c) { return s + Number(c.monto); }, 0);
  var dailyCub = dailyTransf.reduce(function (s, t) { return s + Number(t.monto); }, 0);
  var dailyComp = dailyCuentas.filter(function (c) { return c.fecha_completa; }).length;

  // Weekly
  var weeklyCuentas = todasCuentas.filter(function (c) { return c.fecha_inicio >= lunes; });
  var weeklyTransf = todasTransf.filter(function (t) { return t.fecha >= lunes; });
  var weeklyObj = weeklyCuentas.reduce(function (s, c) { return s + Number(c.monto); }, 0);
  var weeklyCub = weeklyTransf.reduce(function (s, t) { return s + Number(t.monto); }, 0);
  var weeklyComp = weeklyCuentas.filter(function (c) { return c.fecha_completa; }).length;

  // Monthly
  var monthlyCuentas = todasCuentas.filter(function (c) { return (c.fecha_inicio || "").substring(0, 7) === mesActual; });
  var monthlyTransf = todasTransf.filter(function (t) { return (t.fecha || "").substring(0, 7) === mesActual; });
  var monthlyObj = monthlyCuentas.reduce(function (s, c) { return s + Number(c.monto); }, 0);
  var monthlyCub = monthlyTransf.reduce(function (s, t) { return s + Number(t.monto); }, 0);
  var monthlyComp = monthlyCuentas.filter(function (c) { return c.fecha_completa; }).length;

  // Active dashboard (today only for progress bar)
  var totalObj = cuentas.reduce(function (s, c) { return s + Number(c.monto); }, 0);
  var totalCub = transferencias.reduce(function (s, t) { return s + Number(t.monto); }, 0);
  var totalPct = totalObj > 0 ? (totalCub / totalObj) * 100 : 0;

  // Split: cubiertas diarias vs historial
  var cubiertas = archivadas.filter(function (a) { return !a.en_historial; });
  var historial = archivadas.filter(function (a) { return a.en_historial; });

  // Filter historial
  var histFiltrado = historial.filter(function (a) {
    if (filtCat && a.categoria !== filtCat) return false;
    if (filtDesde && (a.fecha_completa || a.fecha_inicio) < filtDesde) return false;
    if (filtHasta && (a.fecha_completa || a.fecha_inicio) > filtHasta) return false;
    return true;
  });

  // Group filtered historial by month/year
  var historialByMonth = {};
  histFiltrado.forEach(function (a) {
    var d = new Date((a.fecha_completa || a.fecha_inicio) + "T12:00:00");
    var key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    var label = d.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
    if (!historialByMonth[key]) historialByMonth[key] = { label: label, items: [] };
    historialByMonth[key].items.push(a);
  });
  var histMeses = Object.keys(historialByMonth).sort().reverse();

  var TABS = [
    ["dashboard", "Dashboard"],
    ["cuentas", "Cuentas a Cubrir"],
    ["transferencias", "Transferencias"],
    ["cubiertas", "Cubiertas (" + cubiertas.length + ")"],
    ["historial", "Historial (" + historial.length + ")"],
  ];

  /* ══════════════════════════════════════════ */
  /* ══  RENDER                             ══ */
  /* ══════════════════════════════════════════ */
  return (
    <div style={S.app}>
      {/* Header */}
      <div style={{ ...S.hdr, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={LOGO_SMALL} alt="Pianyi" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "contain", background: "#fff", padding: 2 }} />
          <div>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 800, letterSpacing: "0.5px" }}>DISTRIBUIDORA PIANYI</h1>
            <p style={{ margin: "2px 0 0", fontSize: 11, opacity: 0.7 }}>Control de Transferencias — {fmtDate(today())}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, opacity: 0.9 }}>{user.nombre}</span>
          <button onClick={handleLogout} style={{ background: "rgba(255,255,255,.15)", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>Salir</button>
        </div>
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
            {[
              ["Hoy", dailyObj, dailyCub, dailyTransf.length, dailyComp, dailyCuentas.length],
              ["Esta Semana", weeklyObj, weeklyCub, weeklyTransf.length, weeklyComp, weeklyCuentas.length],
              ["Este Mes", monthlyObj, monthlyCub, monthlyTransf.length, monthlyComp, monthlyCuentas.length],
            ].map(function (seg) {
              return (
                <div key={seg[0]} style={{ ...S.card, marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#E65100", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{seg[0]}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[["Objetivo", fmtMoney(seg[1])], ["Cubierto", fmtMoney(seg[2])], ["Pendiente", fmtMoney(Math.max(seg[1] - seg[2], 0))], ["Transferencias", seg[3]], ["Completadas", seg[4] + "/" + seg[5]]].map(function (k) {
                      return <div key={k[0]} style={{ flex: "1 1 80px", textAlign: "center", padding: "6px 4px", background: "#f8f8f8", borderRadius: 6 }}><div style={{ fontSize: 9, color: "#888", textTransform: "uppercase", fontWeight: 600 }}>{k[0]}</div><div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginTop: 1 }}>{k[1]}</div></div>;
                    })}
                  </div>
                </div>
              );
            })}

            <div style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Progreso Activo</span>
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
                var excedido = prog.total > Number(c.monto);
                var exceso = prog.total - Number(c.monto);
                return (
                  <div key={c.id} style={{ ...S.card, borderLeft: "4px solid " + (excedido ? "#dc2626" : done ? "#16a34a" : pct > 0 ? "#d97706" : "#e2e8f0") }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 15, fontWeight: 700 }}>{c.nombre}</span>
                          {excedido ? (
                            <span style={S.badge("r")}>EXCEDIDO +{fmtMoney(exceso)}</span>
                          ) : (
                            <span style={S.badge(done ? "g" : pct > 0 ? "y" : "r")}>{done ? "COMPLETO" : pct > 0 ? "EN CURSO" : "PENDIENTE"}</span>
                          )}
                          {c.categoria && <span style={{ fontSize: 10, background: "#FFF3E0", color: "#E65100", padding: "1px 7px", borderRadius: 10 }}>{c.categoria}</span>}
                        </div>
                        {c.alias && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Alias: {c.alias}</div>}
                        {c.prioridad && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{c.prioridad}</div>}
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
                          Inicio: {fmtDate(c.fecha_inicio)}{c.fecha_completa ? " — Cubierta: " + fmtDate(c.fecha_completa) : ""}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: excedido ? "#dc2626" : "#E65100" }}>{fmtMoney(prog.total)}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>de {fmtMoney(c.monto)}</div>
                      </div>
                    </div>
                    {excedido && (
                      <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "8px 12px", marginBottom: 8, fontSize: 12, color: "#991b1b", fontWeight: 600 }}>
                        ⚠️ Se excedió en {fmtMoney(exceso)} del monto objetivo. Notificar al proveedor.
                      </div>
                    )}
                    <PBar pct={pct} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, fontSize: 12, color: "#64748b", flexWrap: "wrap", gap: 6 }}>
                      <span>{prog.transfers.length} transf.{!excedido && !done ? " — Faltan " + fmtMoney(Math.max(c.monto - prog.total, 0)) : ""}</span>
                      {done && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button onClick={function () { openReport(c, prog.transfers); }} style={S.btn("#1a1a1a")}>Reporte Interno</button>
                          <button onClick={function () { openProviderReport(c, prog.transfers); }} style={S.btn("#E65100")}>Reporte Proveedor</button>
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
              <h2 style={{ margin: 0, fontSize: 17, color: "#1a1a1a" }}>Cuentas a Cubrir</h2>
              <button onClick={function () { setAddC(!addC); }} style={S.btn()}>{addC ? "Cancelar" : "+ Agregar"}</button>
            </div>

            {addC && (
              <div style={{ ...S.card, border: "2px dashed #FFB74D" }}>
                <div style={S.grid2}>
                  <div><label style={S.label}>Destino / Proveedor</label><input style={S.input} placeholder="Ej: Sueldo Mariano" value={nC.nombre} onChange={function (e) { setNC({ ...nC, nombre: e.target.value }); }} /></div>
                  <div><label style={S.label}>Alias</label><input style={S.input} placeholder="Ej: bebida.tele.biblia" value={nC.alias} onChange={function (e) { setNC({ ...nC, alias: e.target.value }); }} /></div>
                  <div><label style={S.label}>Monto Objetivo ($)</label><input type="number" style={S.input} placeholder="500000" value={nC.monto} onChange={function (e) { setNC({ ...nC, monto: e.target.value }); }} /></div>
                  <div><label style={S.label}>Prioridad / Regla</label><input style={S.input} placeholder="Ej: Menores $300.000" value={nC.prioridad} onChange={function (e) { setNC({ ...nC, prioridad: e.target.value }); }} /></div>
                  <div><label style={S.label}>Categoría</label><select style={S.select} value={nC.categoria} onChange={function (e) { setNC({ ...nC, categoria: e.target.value }); }}><option value="">— Seleccionar —</option><option value="Gasto de Trabajo">Gasto de Trabajo</option><option value="Sueldos/Adelantos">Sueldos/Adelantos</option><option value="Pago a Proveedor">Pago a Proveedor</option><option value="Retiro de Socios">Retiro de Socios</option></select></div>
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
                        <span style={{ fontWeight: 700, color: "#1a1a1a", fontSize: 15 }}>{fmtMoney(c.monto)}</span>
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
              <h2 style={{ margin: 0, fontSize: 17, color: "#1a1a1a" }}>Transferencias</h2>
              <button onClick={function () { setAddT(!addT); }} style={S.btn()} disabled={cuentas.length === 0}>{addT ? "Cancelar" : "+ Cargar"}</button>
            </div>

            {cuentas.length === 0 && (
              <div style={{ ...S.card, textAlign: "center", color: "#d97706", background: "#fffbeb", border: "1px solid #fde68a", padding: 14, fontSize: 13 }}>
                Primero cargá cuentas en "Cuentas a Cubrir"
              </div>
            )}

            {addT && (
              <div style={{ ...S.card, border: "2px dashed #FFB74D" }}>
                <div style={S.grid2}>
                  <div><label style={S.label}>Hora</label><input type="time" style={S.input} value={nT.hora} onChange={function (e) { setNT({ ...nT, hora: e.target.value }); }} /></div>
                  <div><label style={S.label}>Cliente / Pedido</label><input style={S.input} placeholder="Ej: Almacén López #142" value={nT.cliente} onChange={function (e) { setNT({ ...nT, cliente: e.target.value }); }} /></div>
                  <div><label style={S.label}>Monto ($)</label><input type="number" style={S.input} placeholder="125000" value={nT.monto} onChange={function (e) { setNT({ ...nT, monto: e.target.value }); }} /></div>
                  <div><label style={S.label}>Chofer / Vehículo</label><input style={S.input} placeholder="Ej: Camión 1 - Marcos" value={nT.chofer} onChange={function (e) { setNT({ ...nT, chofer: e.target.value }); }} /></div>
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
                        <span style={{ fontWeight: 700, fontSize: 15, color: "#E65100" }}>{fmtMoney(t.monto)}</span>
                        <button onClick={function () { deleteTransferencia(t.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 18, lineHeight: 1 }}>×</button>
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                        {t.fecha ? fmtDate(t.fecha) + " " : ""}{t.hora ? t.hora + " — " : ""}{t.cliente || "S/C"}{t.chofer ? " — " + t.chofer : ""}{t.responsable ? " — Cargó: " + t.responsable : ""}
                      </div>
                      {cuenta && <div style={{ marginTop: 4 }}><span style={{ fontSize: 11, background: "#FFF3E0", color: "#E65100", padding: "2px 8px", borderRadius: 12 }}>→ {cuenta.nombre}</span></div>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ═══ CUBIERTAS DIARIA ═══ */}
        {tab === "cubiertas" && (
          <div>
            <h2 style={{ margin: "0 0 14px", fontSize: 17, color: "#1a1a1a" }}>Cubiertas del Día</h2>
            {cubiertas.length === 0 ? (
              <div style={{ ...S.card, textAlign: "center", color: "#94a3b8", padding: 36 }}>
                <p style={{ margin: "0 0 6px", fontSize: 15 }}>No hay cuentas cubiertas pendientes</p>
                <p style={{ fontSize: 13, margin: 0 }}>Cuando una cuenta se completa, archivala desde el Dashboard</p>
              </div>
            ) : (
              cubiertas.map(function (a) {
                var total = (a.transferencias || []).reduce(function (s, t) { return s + Number(t.monto); }, 0);
                return (
                  <div key={a.id} style={{ ...S.card, borderLeft: "4px solid #16a34a" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 700 }}>{a.nombre}</span>
                          <span style={S.badge("g")}>CUBIERTA</span>
                          {a.categoria && <span style={{ fontSize: 10, background: "#FFF3E0", color: "#E65100", padding: "1px 7px", borderRadius: 10 }}>{a.categoria}</span>}
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
                        <button onClick={function () { openReport(a, a.transferencias || []); }} style={S.btn("#1a1a1a")}>Reporte Interno</button>
                        <button onClick={function () { openProviderReport(a, a.transferencias || []); }} style={S.btn("#E65100")}>Reporte Proveedor</button>
                        <button onClick={function () { moverAHistorial(a.id); }} style={{ ...S.btn("#16a34a"), display: "flex", alignItems: "center", gap: 4 }}>Historial →</button>
                        <button onClick={function () { deleteArchivada(a.id); }} style={S.btn("#ef4444")}>Eliminar</button>
                      </div>
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
            <h2 style={{ margin: "0 0 14px", fontSize: 17, color: "#1a1a1a" }}>Historial de Cuentas Cubiertas</h2>

            <div style={{ ...S.card, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#E65100", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Filtros</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label style={S.label}>Categoría</label>
                  <select style={S.select} value={filtCat} onChange={function (e) { setFiltCat(e.target.value); }}>
                    <option value="">Todas</option>
                    <option value="Gasto de Trabajo">Gasto de Trabajo</option>
                    <option value="Sueldos/Adelantos">Sueldos/Adelantos</option>
                    <option value="Pago a Proveedor">Pago a Proveedor</option>
                    <option value="Retiro de Socios">Retiro de Socios</option>
                  </select>
                </div>
                <div>
                  <label style={S.label}>Desde</label>
                  <input type="date" style={S.input} value={filtDesde} onChange={function (e) { setFiltDesde(e.target.value); }} />
                </div>
                <div>
                  <label style={S.label}>Hasta</label>
                  <input type="date" style={S.input} value={filtHasta} onChange={function (e) { setFiltHasta(e.target.value); }} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>{histFiltrado.length} cuenta{histFiltrado.length !== 1 ? "s" : ""} encontrada{histFiltrado.length !== 1 ? "s" : ""}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={function () { setFiltCat(""); setFiltDesde(""); setFiltHasta(""); }} style={{ background: "none", border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer", color: "#64748b" }}>Limpiar</button>
                  <button onClick={openFilteredReport} disabled={histFiltrado.length === 0} style={S.btn("#1a1a1a")}>Generar Reporte</button>
                </div>
              </div>
            </div>

            {histMeses.length === 0 ? (
              <div style={{ ...S.card, textAlign: "center", color: "#94a3b8", padding: 36 }}>
                <p style={{ margin: "0 0 6px", fontSize: 15 }}>No hay cuentas en el historial</p>
                <p style={{ fontSize: 13, margin: 0 }}>Mové cuentas cubiertas al historial con el botón "Historial →"</p>
              </div>
            ) : (
              histMeses.map(function (mesKey) {
                var mes = historialByMonth[mesKey];
                var totalMes = mes.items.reduce(function (s, a) {
                  return s + (a.transferencias || []).reduce(function (s2, t) { return s2 + Number(t.monto); }, 0);
                }, 0);
                return (
                  <div key={mesKey} style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 10, padding: "10px 16px", background: "linear-gradient(135deg,#1a1a1a,#2d2d2d)", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", textTransform: "capitalize" }}>
                      <span>{mes.label}</span>
                      <span style={{ fontSize: 13, opacity: 0.9 }}>{mes.items.length} cuentas — {fmtMoney(totalMes)}</span>
                    </div>
                    {mes.items.map(function (a) {
                      var total = (a.transferencias || []).reduce(function (s, t) { return s + Number(t.monto); }, 0);
                      return (
                        <div key={a.id} style={{ ...S.card, borderLeft: "4px solid #16a34a" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6 }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 15, fontWeight: 700 }}>{a.nombre}</span>
                                <span style={S.badge("g")}>CUBIERTA</span>
                                {a.categoria && <span style={{ fontSize: 10, background: "#FFF3E0", color: "#E65100", padding: "1px 7px", borderRadius: 10 }}>{a.categoria}</span>}
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
                              <button onClick={function () { openReport(a, a.transferencias || []); }} style={S.btn("#1a1a1a")}>Reporte Interno</button>
                              <button onClick={function () { openProviderReport(a, a.transferencias || []); }} style={S.btn("#E65100")}>Reporte Proveedor</button>
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
        <div style={{ position: "fixed", bottom: 20, right: 20, background: "#E65100", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 12px rgba(0,0,0,.2)", zIndex: 999 }}>
          Guardando...
        </div>
      )}
    </div>
  );
}
