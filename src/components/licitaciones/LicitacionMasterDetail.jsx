import React, { useState, useRef, useMemo } from "react";
import {
  Plus, ChevronDown, ChevronRight, FileText, MessageSquare, Sparkles, Paperclip,
  DollarSign, Check, X, Printer, ArrowLeft, Building2, TrendingUp, Search, Trash2,
  Clock, AlertTriangle, PackageSearch, Layers, ExternalLink, Truck, Loader2, Award, Pencil,
} from "lucide-react";
import {
  uid, nowISO, num, fmtDate, fmtDateTime, MONEDAS, fmtMoney, ESTADOS, estadoInfo,
  ESTADO_CONSULTA, consultaInfo, providerColor, emptyItem, computeLicitacion
} from "../../services/calculationService";
import {
  Badge, Field, TextInput, TextArea, Select, PrimaryBtn, GhostBtn, IconBtn, Empty, SourcingBar, useConfirm
} from "../ui/Components";
import { investigarItemConGemini } from "../../services/geminiService";

/* ---------------- Historiales por ítem ---------------- */
function NotasTab({ item, patch }) {
  const [text, setText] = useState("");
  const confirmar = useConfirm();
  const add = () => {
    if (!text.trim()) return;
    patch((it) => ({ ...it, notas: [{ id: uid(), texto: text.trim(), fecha: nowISO() }, ...(it.notas || [])] }));
    setText("");
  };
  const borrar = async (n) => {
    const ok = await confirmar({
      titulo: "¿Eliminar esta nota?",
      mensaje: n.texto.length > 90 ? n.texto.slice(0, 90) + "…" : n.texto,
    });
    if (ok) patch((it) => ({ ...it, notas: (it.notas || []).filter((x) => x.id !== n.id) }));
  };
  return (
    <div>
      {(!item.notas || item.notas.length === 0) && <p className="pb-3 text-sm text-[#A6ADBB]">Sin notas todavía.</p>}
      <ul className="mb-3 space-y-2">
        {(item.notas || []).map((n) => (
          <li key={n.id} className="group rounded-lg border border-[#EDEFF3] bg-white px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <p className="flex-1 whitespace-pre-wrap text-sm text-[#131A2C]">{n.texto}</p>
              <IconBtn onClick={() => borrar(n)}><Trash2 size={13} /></IconBtn>
            </div>
            <p className="mt-1 font-mono text-[11px] text-[#A6ADBB]">{fmtDateTime(n.fecha)}</p>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2 sm:flex-row">
        <TextArea rows={2} placeholder="Nota de seguimiento…" value={text} onChange={(e) => setText(e.target.value)} className="flex-1" />
        <PrimaryBtn onClick={add} className="sm:self-end"><Plus size={15} />Agregar</PrimaryBtn>
      </div>
    </div>
  );
}

function IATab({ item, licitacion, patch }) {
  const [pregunta, setPregunta] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const confirmar = useConfirm();

  const borrar = async (r) => {
    const ok = await confirmar({ titulo: "¿Eliminar esta investigación?", mensaje: r.consulta });
    if (ok) patch((it) => ({ ...it, investigaciones: (it.investigaciones || []).filter((x) => x.id !== r.id) }));
  };

  const sugerencias = [
    "Analiza especificaciones y posibles equivalencias",
    "¿Qué riesgos técnicos o de cumplimiento tiene este ítem?",
    "¿Qué tipo de proveedores debería consultar?",
  ];

  const investigar = async (q) => {
    const consultaStr = (q ?? pregunta).trim();
    if (!consultaStr) return;
    setCargando(true); setError("");
    try {
      const respuestaTexto = await investigarItemConGemini({ item, licitacion, consulta: consultaStr });
      if (!respuestaTexto) throw new Error("Respuesta vacía");
      patch((it) => ({
        ...it,
        investigaciones: [{ id: uid(), consulta: consultaStr, resultado: respuestaTexto, fecha: nowISO(), fuente: "Gemini IA" }, ...(it.investigaciones || [])]
      }));
      setPregunta("");
    } catch (e) {
      setError("No se pudo completar el análisis. Revisa la conexión e inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      {(!item.investigaciones || item.investigaciones.length === 0) && <p className="pb-3 text-sm text-[#A6ADBB]">Sin investigaciones todavía.</p>}
      <ul className="mb-3 space-y-2">
        {(item.investigaciones || []).map((r) => (
          <li key={r.id} className="rounded-lg border border-[#EDEFF3] bg-white px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <p className="flex-1 text-sm font-semibold text-[#131A2C]">{r.consulta}</p>
              <IconBtn onClick={() => borrar(r)}><Trash2 size={13} /></IconBtn>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-[#3B4356]">{r.resultado}</p>
            <p className="mt-1.5 font-mono text-[11px] text-[#A6ADBB]">{fmtDateTime(r.fecha)}</p>
          </li>
        ))}
      </ul>

      <div className="space-y-2 rounded-lg border border-dashed border-[#DDE1E8] p-2.5">
        <TextArea rows={2} placeholder="¿Qué quieres analizar de este ítem?" value={pregunta} onChange={(e) => setPregunta(e.target.value)} disabled={cargando} />
        <div className="flex flex-wrap gap-1.5">
          {sugerencias.map((s) => (
            <button key={s} type="button" disabled={cargando} onClick={() => investigar(s)}
              className="rounded-full border border-[#DDE1E8] bg-white px-2.5 py-1 text-[11px] text-[#5B6478] transition hover:border-[#7C5CBF] hover:text-[#7C5CBF] disabled:opacity-40 cursor-pointer">
              {s}
            </button>
          ))}
        </div>
        {error && <p className="text-xs text-[#B3261E]">{error}</p>}
        <PrimaryBtn onClick={() => investigar()} disabled={cargando || !pregunta.trim()} className="w-full">
          {cargando ? <><Loader2 size={15} className="animate-spin" />Analizando con Gemini…</> : <><Sparkles size={15} />Analizar con IA</>}
        </PrimaryBtn>
      </div>
    </div>
  );
}

function AdjuntosList({ adjuntos = [], onAdd, onRemove, nota }) {
  const [nombre, setNombre] = useState("");
  const [url, setUrl] = useState("");
  const confirmar = useConfirm();
  const add = () => {
    if (!nombre.trim()) return;
    onAdd({ id: uid(), nombre: nombre.trim(), url: url.trim(), fecha: nowISO() });
    setNombre(""); setUrl("");
  };
  const borrar = async (a) => {
    const ok = await confirmar({ titulo: "¿Eliminar este adjunto?", mensaje: a.nombre });
    if (ok) onRemove(a.id);
  };
  return (
    <div>
      {nota && <p className="mb-2 text-[11px] text-[#A6ADBB]">{nota}</p>}
      {adjuntos.length === 0 && <p className="pb-3 text-sm text-[#A6ADBB]">Sin adjuntos todavía.</p>}
      <ul className="mb-3 space-y-2">
        {adjuntos.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-2 rounded-lg border border-[#EDEFF3] bg-white px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-sm text-[#131A2C]"><Paperclip size={13} className="shrink-0 text-[#8A93A6]" />{a.nombre}</p>
              {a.url && <a href={a.url} target="_blank" rel="noreferrer" className="truncate text-[11px] text-[#2B3A67] underline">{a.url}</a>}
            </div>
            <span className="shrink-0 font-mono text-[11px] text-[#A6ADBB]">{fmtDate(a.fecha)}</span>
            <IconBtn onClick={() => borrar(a)}><Trash2 size={13} /></IconBtn>
          </li>
        ))}
      </ul>
      <div className="grid gap-2 rounded-lg border border-dashed border-[#DDE1E8] p-2.5 sm:grid-cols-[1fr_1fr_auto]">
        <TextInput placeholder="Nombre del archivo" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <TextInput placeholder="Enlace (Drive, etc.)" value={url} onChange={(e) => setUrl(e.target.value)} />
        <PrimaryBtn onClick={add}><Plus size={15} />Agregar</PrimaryBtn>
      </div>
    </div>
  );
}

/* ---------------- Consultas de precio ---------------- */
function FormConsulta({ form, setForm, item, moneda, onGuardar, onCancelar, textoGuardar, iconoGuardar: Icono = DollarSign }) {
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <div className="grid grid-cols-2 gap-2 rounded-lg border border-dashed border-[#DDE1E8] p-2.5">
      <TextInput placeholder="Proveedor *" value={form.proveedor} onChange={set("proveedor")} className="col-span-2" />
      <TextInput placeholder="Contacto" value={form.contacto} onChange={set("contacto")} className="col-span-2" />
      <Field label={`Precio unit. (${moneda})`}>
        <TextInput type="number" inputMode="decimal" step="0.01" placeholder="0.00" value={form.precioUnitario} onChange={set("precioUnitario")} className="font-mono" />
      </Field>
      <Field label="Cant. disponible">
        <TextInput type="number" inputMode="numeric" placeholder={`${item.cantidad}`} value={form.cantidadDisponible} onChange={set("cantidadDisponible")} className="font-mono" />
      </Field>
      <Field label="Entrega (días)">
        <TextInput type="number" inputMode="numeric" placeholder="0" value={form.plazoDias} onChange={set("plazoDias")} className="font-mono" />
      </Field>
      <Field label="Válida hasta"><TextInput type="date" value={form.validezHasta} onChange={set("validezHasta")} /></Field>
      <Field label="Estado" className="col-span-2">
        <Select value={form.estado} onChange={set("estado")}>
          {ESTADO_CONSULTA.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
        </Select>
      </Field>
      <TextInput placeholder="Notas" value={form.notas} onChange={set("notas")} className="col-span-2" />
      {onCancelar && <GhostBtn onClick={onCancelar} className="col-span-1">Cancelar</GhostBtn>}
      <PrimaryBtn onClick={onGuardar} disabled={!form.proveedor.trim()} className={onCancelar ? "col-span-1" : "col-span-2"}>
        <Icono size={15} />{textoGuardar}
      </PrimaryBtn>
    </div>
  );
}

const CONSULTA_VACIA = { proveedor: "", contacto: "", precioUnitario: "", cantidadDisponible: "", plazoDias: "", validezHasta: "", estado: "recibida", notas: "" };

function PreciosTab({ item, patch, moneda }) {
  const [form, setForm] = useState(CONSULTA_VACIA);
  const [editandoId, setEditandoId] = useState(null);
  const [editForm, setEditForm] = useState(CONSULTA_VACIA);
  const confirmar = useConfirm();

  const consultas = item.consultas || [];
  const recibidas = consultas.filter((c) => c.estado === "recibida" && num(c.precioUnitario) > 0);
  const mejor = recibidas.length ? Math.min(...recibidas.map((c) => num(c.precioUnitario))) : null;

  const add = () => {
    if (!form.proveedor.trim()) return;
    patch((it) => ({
      ...it,
      consultas: [{
        id: uid(),
        proveedor: form.proveedor.trim(),
        contacto: form.contacto.trim(),
        precioUnitario: num(form.precioUnitario),
        cantidadDisponible: form.cantidadDisponible === "" ? num(it.cantidad) : num(form.cantidadDisponible),
        plazoDias: num(form.plazoDias),
        validezHasta: form.validezHasta,
        estado: form.estado,
        notas: form.notas.trim(),
        fecha: nowISO(),
      }, ...(it.consultas || [])],
    }));
    setForm(CONSULTA_VACIA);
  };

  const abrirEdicion = (c) => {
    setEditandoId(c.id);
    setEditForm({
      proveedor: c.proveedor ?? "",
      contacto: c.contacto ?? "",
      precioUnitario: c.precioUnitario ?? "",
      cantidadDisponible: c.cantidadDisponible ?? "",
      plazoDias: c.plazoDias ?? "",
      validezHasta: c.validezHasta ?? "",
      estado: c.estado ?? "recibida",
      notas: c.notas ?? "",
    });
  };

  const guardarEdicion = async (original) => {
    if (!editForm.proveedor.trim()) return;
    const nuevaDisp = editForm.cantidadDisponible === "" ? num(item.cantidad) : num(editForm.cantidadDisponible);
    const asignada = (item.asignaciones || []).find((a) => a.consultaId === original.id);
    const nuevoEstado = editForm.estado;

    if (asignada && nuevaDisp < num(asignada.cantidad)) {
      const ok = await confirmar({
        titulo: "¿Ajustar el reparto?",
        mensaje: `Tenías ${asignada.cantidad} ${item.unidad} asignadas a ${original.proveedor}, pero la nueva disponibilidad es ${nuevaDisp}.`,
        detalle: `La asignación se reducirá a ${nuevaDisp} ${item.unidad} y los totales cambiarán.`,
        textoConfirmar: "Ajustar",
      });
      if (!ok) return;
    }
    if (asignada && nuevoEstado !== "recibida") {
      const ok = await confirmar({
        titulo: "¿Cambiar el estado?",
        mensaje: `${editForm.proveedor.trim()} pasará a "${consultaInfo(nuevoEstado).label}".`,
        detalle: `Tiene ${asignada.cantidad} ${item.unidad} asignadas. Se quitarán del reparto.`,
        textoConfirmar: "Cambiar",
      });
      if (!ok) return;
    }

    patch((it) => {
      const nextConsultas = (it.consultas || []).map((c) => (c.id === original.id ? {
        ...c,
        proveedor: editForm.proveedor.trim(),
        contacto: editForm.contacto.trim(),
        precioUnitario: num(editForm.precioUnitario),
        cantidadDisponible: nuevaDisp,
        plazoDias: num(editForm.plazoDias),
        validezHasta: editForm.validezHasta,
        estado: nuevoEstado,
        notas: editForm.notas.trim(),
        editadoEn: nowISO(),
      } : c));

      let asignaciones = it.asignaciones || [];
      if (nuevoEstado !== "recibida") {
        asignaciones = asignaciones.filter((a) => a.consultaId !== original.id);
      } else {
        asignaciones = asignaciones.map((a) =>
          a.consultaId === original.id && num(a.cantidad) > nuevaDisp ? { ...a, cantidad: nuevaDisp } : a
        );
      }
      return { ...it, consultas: nextConsultas, asignaciones };
    });
    setEditandoId(null);
  };

  const remove = async (c) => {
    const asignada = (item.asignaciones || []).find((a) => a.consultaId === c.id);
    const ok = await confirmar({
      titulo: "¿Eliminar esta consulta de precio?",
      mensaje: `${c.proveedor} — ${fmtMoney(c.precioUnitario, moneda)}/${item.unidad}`,
      detalle: asignada
        ? `Este proveedor tiene ${asignada.cantidad} ${item.unidad} asignadas en la cotización. Se quitarán del reparto.`
        : null,
    });
    if (!ok) return;
    patch((it) => ({
      ...it,
      consultas: (it.consultas || []).filter((x) => x.id !== c.id),
      asignaciones: (it.asignaciones || []).filter((a) => a.consultaId !== c.id),
    }));
  };

  const setEstado = async (c, estado) => {
    const asignada = (item.asignaciones || []).find((a) => a.consultaId === c.id);
    if (estado !== "recibida" && asignada) {
      const ok = await confirmar({
        titulo: "¿Cambiar el estado?",
        mensaje: `${c.proveedor} pasará a "${consultaInfo(estado).label}".`,
        detalle: `Tiene ${asignada.cantidad} ${item.unidad} asignadas. Se quitarán del reparto.`,
        textoConfirmar: "Cambiar",
      });
      if (!ok) return;
    }
    patch((it) => ({
      ...it,
      consultas: (it.consultas || []).map((x) => (x.id === c.id ? { ...x, estado } : x)),
      asignaciones: estado === "recibida" ? it.asignaciones : (it.asignaciones || []).filter((a) => a.consultaId !== c.id),
    }));
  };

  return (
    <div>
      {consultas.length === 0 && <p className="pb-3 text-sm text-[#A6ADBB]">Aún no has solicitado cotizaciones para este ítem.</p>}
      <ul className="mb-3 space-y-2">
        {consultas.map((c) => {
          const info = consultaInfo(c.estado);
          const esMejor = mejor != null && c.estado === "recibida" && num(c.precioUnitario) === mejor;
          const vencida = c.validezHasta && new Date(c.validezHasta) < new Date();
          const asignada = (item.asignaciones || []).find((a) => a.consultaId === c.id);

          if (editandoId === c.id) {
            return (
              <li key={c.id}>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#2B3A67]">Editando consulta</p>
                <FormConsulta
                  form={editForm} setForm={setEditForm} item={item} moneda={moneda}
                  onGuardar={() => guardarEdicion(c)}
                  onCancelar={() => setEditandoId(null)}
                  textoGuardar="Guardar" iconoGuardar={Check}
                />
              </li>
            );
          }

          return (
            <li key={c.id} className="rounded-lg border border-[#EDEFF3] bg-white px-3 py-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-[#131A2C]">
                    {c.proveedor}
                    {esMejor && <Badge color="#8A6A08" bg="#FBF3D9"><Award size={10} />Mejor precio</Badge>}
                    {asignada && <Badge color="#2B3A67" bg="#E7EAF3">Asignado {asignada.cantidad}</Badge>}
                  </p>
                  {c.contacto && <p className="text-[11px] text-[#A6ADBB]">{c.contacto}</p>}
                  <p className="mt-0.5 text-xs text-[#5B6478]">
                    <span className="font-mono font-semibold text-[#131A2C]">{fmtMoney(c.precioUnitario, moneda)}</span> /{item.unidad}
                    {" · "}disp. {c.cantidadDisponible}
                    {c.plazoDias > 0 && <> · {c.plazoDias}d entrega</>}
                  </p>
                  {c.validezHasta && (
                    <p className={`text-[11px] ${vencida ? "font-semibold text-[#B3261E]" : "text-[#A6ADBB]"}`}>
                      {vencida ? "Cotización vencida el " : "Válida hasta "}{fmtDate(c.validezHasta)}
                    </p>
                  )}
                  {c.notas && <p className="mt-0.5 text-[11px] text-[#8A93A6]">{c.notas}</p>}
                  <p className="mt-0.5 font-mono text-[10px] text-[#C7CCD6]">
                    {fmtDateTime(c.fecha)}{c.editadoEn && ` · editada ${fmtDateTime(c.editadoEn)}`}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <select value={c.estado} onChange={(e) => setEstado(c, e.target.value)}
                    style={{ color: info.color, backgroundColor: info.bg }}
                    className="rounded-full border-0 px-2 py-0.5 text-[11px] font-semibold focus:outline-none cursor-pointer">
                    {ESTADO_CONSULTA.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
                  </select>
                  <div className="flex">
                    <IconBtn onClick={() => abrirEdicion(c)} title="Editar"><Pencil size={13} /></IconBtn>
                    <IconBtn onClick={() => remove(c)} title="Eliminar"><Trash2 size={13} /></IconBtn>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {editandoId === null && (
        <FormConsulta
          form={form} setForm={setForm} item={item} moneda={moneda}
          onGuardar={add} textoGuardar="Registrar consulta de precio"
        />
      )}
    </div>
  );
}

function ItemPanel({ item, licitacion, onChange, moneda }) {
  const [tab, setTab] = useState("precios");
  const patch = (fn) => onChange(fn(item));
  const tabs = [
    { id: "precios", label: "Precios", icon: DollarSign, count: (item.consultas || []).length },
    { id: "notas", label: "Notas", icon: MessageSquare, count: (item.notas || []).length },
    { id: "ia", label: "IA", icon: Sparkles, count: (item.investigaciones || []).length },
    { id: "adjuntos", label: "Adjuntos", icon: Paperclip, count: (item.adjuntos || []).length },
  ];
  return (
    <div className="border-t border-[#EDEFF3] bg-[#FAFAFC] px-3 py-3 sm:px-4">
      <div className="mb-3 flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
              tab === t.id ? "bg-[#2B3A67] text-white" : "border border-[#DDE1E8] bg-white text-[#5B6478]"}`}>
            <t.icon size={13} />{t.label}
            <span className={`rounded-full px-1.5 text-[10px] ${tab === t.id ? "bg-white/20 text-white" : "bg-[#ECEEF2] text-[#5B6478]"}`}>{t.count}</span>
          </button>
        ))}
      </div>
      {tab === "precios" && <PreciosTab item={item} patch={patch} moneda={moneda} />}
      {tab === "notas" && <NotasTab item={item} patch={patch} />}
      {tab === "ia" && <IATab item={item} licitacion={licitacion} patch={patch} />}
      {tab === "adjuntos" && (
        <AdjuntosList
          adjuntos={item.adjuntos || []}
          nota="Registra enlaces o referencias de especificaciones de este ítem."
          onAdd={(a) => patch((it) => ({ ...it, adjuntos: [a, ...(it.adjuntos || [])] }))}
          onRemove={(id) => patch((it) => ({ ...it, adjuntos: (it.adjuntos || []).filter((x) => x.id !== id) }))}
        />
      )}
    </div>
  );
}

/* ---------------- Pestaña Ítems ---------------- */
function ItemsTab({ licitacion, onChange, calc }) {
  const [openId, setOpenId] = useState(licitacion.items[0]?.id ?? null);
  const moneda = licitacion.config?.moneda || "USD";
  const confirmar = useConfirm();

  const borrarItem = async (item) => {
    const historiales = [
      (item.consultas || []).length && `${item.consultas.length} consulta(s)`,
      (item.notas || []).length && `${item.notas.length} nota(s)`,
      (item.investigaciones || []).length && `${item.investigaciones.length} investigación(es)`,
      (item.adjuntos || []).length && `${item.adjuntos.length} adjunto(s)`,
    ].filter(Boolean);
    const ok = await confirmar({
      titulo: "¿Eliminar este ítem?",
      mensaje: item.descripcion || "(Sin descripción)",
      detalle: historiales.length ? `Se perderá todo su historial: ${historiales.join(", ")}.` : null,
    });
    if (ok) onChange({ ...licitacion, items: licitacion.items.filter((x) => x.id !== item.id) });
  };

  const updateItem = (id, updater) =>
    onChange({ ...licitacion, items: licitacion.items.map((it) => (it.id === id ? updater(it) : it)) });

  const addItem = () => {
    const it = emptyItem();
    onChange({ ...licitacion, items: [...licitacion.items, it] });
    setOpenId(it.id);
  };

  return (
    <div className="space-y-3">
      {licitacion.items.map((item, idx) => {
        const open = openId === item.id;
        const ci = calc.items.find((c) => c.itemId === item.id) || { lineas: [], pendiente: 0, unidad: item.unidad };
        return (
          <div key={item.id} className="overflow-hidden rounded-xl border border-[#EDEFF3] bg-white">
            <div className="flex items-start gap-2 px-3 py-3 sm:px-4">
              <button type="button" onClick={() => setOpenId(open ? null : item.id)} className="mt-0.5 shrink-0 text-[#8A93A6] cursor-pointer">
                {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
              <span className="mt-1 shrink-0 font-mono text-xs text-[#A6ADBB]">{String(idx + 1).padStart(2, "0")}</span>
              <div className="min-w-0 flex-1">
                <input
                  value={item.descripcion}
                  onChange={(e) => updateItem(item.id, (it) => ({ ...it, descripcion: e.target.value }))}
                  placeholder="Descripción del ítem"
                  className="w-full bg-transparent text-sm font-semibold text-[#131A2C] placeholder-[#A6ADBB] focus:outline-none"
                />
                <div className="mt-1 flex items-center gap-2">
                  <input type="number" inputMode="numeric" value={item.cantidad}
                    onChange={(e) => updateItem(item.id, (it) => ({ ...it, cantidad: e.target.value }))}
                    className="w-16 rounded-md border border-[#DDE1E8] px-2 py-1 text-right font-mono text-xs text-[#131A2C]" />
                  <input value={item.unidad}
                    onChange={(e) => updateItem(item.id, (it) => ({ ...it, unidad: e.target.value }))}
                    className="w-16 rounded-md border border-[#DDE1E8] px-2 py-1 text-xs text-[#131A2C]" />
                  {ci.mixta && <Badge color="#0F6E8C" bg="#E1F1F5">Mixta</Badge>}
                  {ci.pendiente > 0 && ci.lineas.length > 0 && <Badge color="#B3261E" bg="#FBE7E6">Faltan {ci.pendiente}</Badge>}
                </div>
                <div className="mt-2"><SourcingBar calcItem={ci} compact={!open} /></div>
              </div>
              {licitacion.items.length > 1 && (
                <IconBtn onClick={() => borrarItem(item)}><Trash2 size={15} /></IconBtn>
              )}
            </div>
            {open && (
              <>
                <div className="px-3 pb-3 sm:px-4">
                  <TextArea rows={2} placeholder="Especificaciones técnicas solicitadas…" value={item.especificaciones || ""}
                    onChange={(e) => updateItem(item.id, (it) => ({ ...it, especificaciones: e.target.value }))} />
                </div>
                <ItemPanel item={item} licitacion={licitacion} moneda={moneda} onChange={(next) => updateItem(item.id, () => next)} />
              </>
            )}
          </div>
        );
      })}
      <GhostBtn onClick={addItem} className="w-full"><Plus size={15} />Agregar ítem</GhostBtn>
    </div>
  );
}

/* ---------------- Pestaña Cotización ---------------- */
function CotizacionTab({ licitacion, onChange, calc, onEmitir }) {
  const moneda = licitacion.config?.moneda || "USD";
  const setConfig = (k, v) => onChange({ ...licitacion, config: { ...(licitacion.config || {}), [k]: v } });

  const setAsig = (itemId, consultaId, cantidad) =>
    onChange({
      ...licitacion,
      items: licitacion.items.map((it) => {
        if (it.id !== itemId) return it;
        const asigs = it.asignaciones || [];
        const existe = asigs.some((a) => a.consultaId === consultaId);
        return { ...it, asignaciones: existe ? asigs.map((a) => (a.consultaId === consultaId ? { ...a, cantidad } : a)) : [...asigs, { consultaId, cantidad }] };
      }),
    });

  const toggle = (item, consulta) =>
    onChange({
      ...licitacion,
      items: licitacion.items.map((it) => {
        if (it.id !== item.id) return it;
        const asigs = it.asignaciones || [];
        if (asigs.some((a) => a.consultaId === consulta.id)) {
          return { ...it, asignaciones: asigs.filter((a) => a.consultaId !== consulta.id) };
        }
        const yaAsignado = asigs.reduce((s, a) => s + num(a.cantidad), 0);
        const restante = Math.max(num(it.cantidad) - yaAsignado, 0);
        const cantidad = Math.min(restante || num(it.cantidad), num(consulta.cantidadDisponible) || num(it.cantidad));
        return { ...it, asignaciones: [...asigs, { consultaId: consulta.id, cantidad }] };
      }),
    });

  const autoAsignar = (item) => {
    const disponibles = (item.consultas || [])
      .filter((c) => c.estado === "recibida" && num(c.precioUnitario) > 0)
      .sort((a, b) => num(a.precioUnitario) - num(b.precioUnitario));
    let restante = num(item.cantidad);
    const asignaciones = [];
    for (const c of disponibles) {
      if (restante <= 0) break;
      const toma = Math.min(restante, num(c.cantidadDisponible) || restante);
      if (toma > 0) { asignaciones.push({ consultaId: c.id, cantidad: toma }); restante -= toma; }
    }
    onChange({ ...licitacion, items: licitacion.items.map((it) => (it.id === item.id ? { ...it, asignaciones } : it)) });
  };

  return (
    <div className="space-y-4">
      {/* Configuración + totales */}
      <div className="rounded-xl border border-[#EDEFF3] bg-white p-4">
        <div className="grid grid-cols-3 gap-2">
          <Field label="Margen global"><TextInput type="number" inputMode="decimal" step="0.5" value={licitacion.config?.margenGlobal ?? 20} onChange={(e) => setConfig("margenGlobal", e.target.value)} className="font-mono" /></Field>
          <Field label="IVA %"><TextInput type="number" inputMode="decimal" step="0.5" value={licitacion.config?.iva ?? 0} onChange={(e) => setConfig("iva", e.target.value)} className="font-mono" /></Field>
          <Field label="Moneda"><Select value={moneda} onChange={(e) => setConfig("moneda", e.target.value)}>{MONEDAS.map((m) => <option key={m}>{m}</option>)}</Select></Field>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#EDEFF3] pt-3 sm:grid-cols-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A93A6]">Costo compra</p>
            <p className="font-mono text-base font-semibold text-[#131A2C]">{fmtMoney(calc.totalCosto, moneda)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A93A6]">Venta (sin IVA)</p>
            <p className="font-mono text-base font-semibold text-[#131A2C]">{fmtMoney(calc.subtotalVenta, moneda)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#C9A227]">Ganancia</p>
            <p className="font-mono text-base font-bold text-[#C9A227]">{fmtMoney(calc.ganancia, moneda)}</p>
            <p className="font-mono text-[11px] text-[#A6ADBB]">{calc.margenEfectivo.toFixed(1)}% s/ venta</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A93A6]">Total al cliente</p>
            <p className="font-mono text-base font-bold text-[#131A2C]">{fmtMoney(calc.totalVenta, moneda)}</p>
            {calc.plazoGlobal > 0 && <p className="font-mono text-[11px] text-[#A6ADBB]">entrega {calc.plazoGlobal}d</p>}
          </div>
        </div>
      </div>

      {/* Asignación por ítem */}
      {licitacion.items.map((item) => {
        const ci = calc.items.find((c) => c.itemId === item.id) || { lineas: [], costo: 0, venta: 0, precioUnitarioVenta: 0 };
        const recibidas = (item.consultas || []).filter((c) => c.estado === "recibida");
        const mejor = recibidas.length ? Math.min(...recibidas.map((c) => num(c.precioUnitario))) : null;
        return (
          <div key={item.id} className="rounded-xl border border-[#EDEFF3] bg-white p-4">
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#131A2C]">{item.descripcion || "(Sin descripción)"}</p>
                <p className="text-xs text-[#8A93A6]">Solicitan {item.cantidad} {item.unidad}</p>
              </div>
              <div className="flex items-end gap-2">
                <Field label="Margen ítem" className="w-24">
                  <TextInput type="number" inputMode="decimal" step="0.5" placeholder={`${licitacion.config?.margenGlobal ?? 20}`}
                    value={item.margenOverride || ""} onChange={(e) => onChange({ ...licitacion, items: licitacion.items.map((x) => (x.id === item.id ? { ...x, margenOverride: e.target.value } : x)) })}
                    className="font-mono text-xs" />
                </Field>
                {recibidas.length > 0 && <GhostBtn onClick={() => autoAsignar(item)} className="text-xs">Auto</GhostBtn>}
              </div>
            </div>

            <SourcingBar calcItem={ci} />

            {recibidas.length === 0 ? (
              <p className="mt-3 text-xs text-[#A6ADBB]">Sin cotizaciones recibidas. Regístralas en la pestaña Ítems → Precios.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {recibidas.map((c) => {
                  const asig = (item.asignaciones || []).find((a) => a.consultaId === c.id);
                  const sel = !!asig;
                  const linea = ci.lineas.find((l) => l.consultaId === c.id);
                  const esMejor = num(c.precioUnitario) === mejor;
                  return (
                    <div key={c.id} className={`rounded-lg border p-2.5 transition ${sel ? "border-[#2B3A67] bg-[#F6F7FB]" : "border-[#EDEFF3]"}`}>
                      <div className="flex items-center gap-2.5">
                        <button type="button" onClick={() => toggle(item, c)}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition cursor-pointer ${sel ? "border-[#2B3A67] bg-[#2B3A67]" : "border-[#C7CCD6]"}`}>
                          {sel && <Check size={13} className="text-white" strokeWidth={3} />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-[#131A2C]">
                            {c.proveedor}
                            {esMejor && <Badge color="#8A6A08" bg="#FBF3D9"><Award size={10} />Mejor</Badge>}
                          </p>
                          <p className="font-mono text-xs text-[#5B6478]">
                            {fmtMoney(c.precioUnitario, moneda)}/{item.unidad} · disp. {c.cantidadDisponible}
                            {c.plazoDias > 0 && ` · ${c.plazoDias}d`}
                          </p>
                        </div>
                        {sel && (
                          <div className="shrink-0 text-right">
                            <input type="number" inputMode="numeric" value={asig.cantidad}
                              onChange={(e) => setAsig(item.id, c.id, num(e.target.value))}
                              className="w-20 rounded-md border border-[#DDE1E8] px-2 py-1 text-right font-mono text-sm text-[#131A2C]" />
                            <p className="mt-0.5 font-mono text-[11px] text-[#8A93A6]">= {fmtMoney(linea?.costo, moneda)}</p>
                          </div>
                        )}
                      </div>
                      {sel && (
                        <div className="mt-2 flex justify-end gap-3 border-t border-[#E6E9EF] pt-2 font-mono text-[11px]">
                          <span className="text-[#8A93A6]">venta {fmtMoney(linea?.venta, moneda)}</span>
                          <span className="font-semibold text-[#C9A227]">+{fmtMoney(linea?.ganancia, moneda)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-3 flex flex-wrap justify-end gap-x-4 gap-y-1 border-t border-[#EDEFF3] pt-2 font-mono text-xs">
              <span className="text-[#8A93A6]">costo {fmtMoney(ci.costo, moneda)}</span>
              <span className="text-[#8A93A6]">venta {fmtMoney(ci.venta, moneda)}</span>
              <span className="text-[#8A93A6]">unit. cliente {fmtMoney(ci.precioUnitarioVenta, moneda)}</span>
            </div>
          </div>
        );
      })}

      {/* Órdenes de compra por proveedor */}
      {calc.porProveedor.length > 0 && (
        <div className="rounded-xl border border-[#EDEFF3] bg-white p-4">
          <h3 style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="mb-1 flex items-center gap-1.5 text-sm font-bold text-[#131A2C]">
            <Truck size={15} className="text-[#2B3A67]" />Compras por proveedor
          </h3>
          <p className="mb-3 text-xs text-[#8A93A6]">Lo que debes ordenar a cada proveedor si ganas la licitación.</p>
          <div className="space-y-2">
            {calc.porProveedor.map((p) => {
              const names = calc.porProveedor.map((x) => x.proveedor);
              return (
                <div key={p.proveedor} className="rounded-lg border border-[#EDEFF3] p-3">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-[#131A2C]">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: providerColor(p.proveedor, names) }} />
                      {p.proveedor}
                    </p>
                    <p className="font-mono text-sm font-semibold text-[#131A2C]">{fmtMoney(p.costo, moneda)}</p>
                  </div>
                  <ul className="space-y-0.5">
                    {p.lineas.map((l, i) => (
                      <li key={i} className="flex justify-between gap-2 text-xs text-[#5B6478]">
                        <span className="min-w-0 flex-1 truncate">{l.descripcion}</span>
                        <span className="shrink-0 font-mono">{l.cantidad} {l.unidad} × {fmtMoney(l.precioUnitario, moneda)}</span>
                      </li>
                    ))}
                  </ul>
                  {p.plazoMax > 0 && <p className="mt-1 font-mono text-[11px] text-[#A6ADBB]">entrega máx. {p.plazoMax} días</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(calc.incompletos.length > 0 || calc.excedidos.length > 0) && (
        <div className="flex items-start gap-2 rounded-lg bg-[#FBEEDB] px-3 py-2.5 text-xs text-[#8A5A12]">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          <div>
            {calc.incompletos.length > 0 && <p>{calc.incompletos.length} ítem(s) con cantidades sin cubrir por un proveedor.</p>}
            {calc.excedidos.length > 0 && <p>{calc.excedidos.length} ítem(s) con cantidad asignada mayor a la solicitada.</p>}
          </div>
        </div>
      )}

      <PrimaryBtn onClick={onEmitir} className="w-full"><FileText size={15} />Emitir cotización (nueva versión)</PrimaryBtn>
    </div>
  );
}

/* ---------------- Historial de versiones y PDF ---------------- */
function HistorialTab({ licitacion, onChange }) {
  const [viendo, setViendo] = useState(null);
  const confirmar = useConfirm();
  const versiones = [...(licitacion.cotizacionesEmitidas || [])].sort((a, b) => b.version - a.version);
  if (!versiones.length) return <Empty icon={FileText}>Aún no se ha emitido ninguna cotización. Genera la primera desde la pestaña Cotización.</Empty>;

  const vigente = versiones[0];
  const borrarVersion = async (v) => {
    const esVigente = v.id === vigente.id;
    const ok = await confirmar({
      titulo: `¿Eliminar la versión ${v.version}?`,
      mensaje: `${fmtDateTime(v.fecha)} — ${fmtMoney(v.totalVenta, v.moneda)}`,
      detalle: esVigente
        ? "Es la versión vigente. La anterior pasará a ser la cotización vigente."
        : "El historial de versiones dejará de estar completo.",
    });
    if (ok) onChange({ ...licitacion, cotizacionesEmitidas: licitacion.cotizacionesEmitidas.filter((x) => x.id !== v.id) });
  };
  return (
    <div className="space-y-2">
      {versiones.map((v) => {
        const esVigente = v.id === vigente.id;
        return (
          <div key={v.id} className={`rounded-xl border bg-white p-3.5 ${esVigente ? "border-[#2B3A67]" : "border-[#EDEFF3]"}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="flex items-center gap-2 font-mono text-sm font-bold text-[#131A2C]">
                  v{v.version}
                  {esVigente ? <Badge color="#2F7D5A" bg="#E4F3EC">Vigente</Badge> : <Badge color="#8A93A6" bg="#EEF0F4">Histórica</Badge>}
                </p>
                <p className="text-xs text-[#8A93A6]">{fmtDateTime(v.fecha)}</p>
                {v.motivo && <p className="mt-0.5 text-xs text-[#5B6478]">{v.motivo}</p>}
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-bold text-[#131A2C]">{fmtMoney(v.totalVenta, v.moneda)}</p>
                <p className="font-mono text-[11px] text-[#C9A227]">+{fmtMoney(v.ganancia, v.moneda)}</p>
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <GhostBtn onClick={() => setViendo(v)} className="flex-1"><FileText size={13} />Ver / PDF</GhostBtn>
              <IconBtn onClick={() => borrarVersion(v)}><Trash2 size={15} /></IconBtn>
            </div>
          </div>
        );
      })}
      {viendo && <PreviewCotizacion licitacion={licitacion} version={viendo} onClose={() => setViendo(null)} />}
    </div>
  );
}

function PreviewCotizacion({ licitacion, version, onClose }) {
  const ref = useRef(null);
  const m = version.moneda;
  const imprimir = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Cotización v${version.version} — ${licitacion.titulo || "Licitación"}</title>
<style>
 body{font-family:Inter,system-ui,sans-serif;color:#131A2C;padding:36px;max-width:760px;margin:0 auto}
 h1{font-size:19px;margin:0 0 2px}
 .muted{color:#8A93A6;font-size:12px;margin:0}
 table{width:100%;border-collapse:collapse;margin-top:18px}
 th,td{padding:7px 8px;font-size:12px;text-align:left;border-bottom:1px solid #EDEFF3}
 th{color:#8A93A6;font-size:10px;text-transform:uppercase;letter-spacing:.06em}
 .r{text-align:right;font-variant-numeric:tabular-nums}
 .tot{font-size:16px;font-weight:700}
 .box{margin-top:20px;display:flex;justify-content:flex-end}
</style></head><body>${ref.current.innerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white sm:max-w-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-[#EDEFF3] bg-white px-4 py-3">
          <p className="text-sm font-semibold text-[#131A2C]">Cotización v{version.version}</p>
          <div className="flex items-center gap-2">
            <GhostBtn onClick={imprimir}><Printer size={13} />PDF</GhostBtn>
            <IconBtn onClick={onClose}><X size={18} /></IconBtn>
          </div>
        </div>
        <div ref={ref} className="px-5 py-4">
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif" }} className="text-lg font-bold text-[#131A2C]">{licitacion.titulo || "Licitación sin título"}</h1>
          <p className="muted text-xs text-[#8A93A6]">Cliente: {licitacion.cliente || "—"} · Ref: {licitacion.referencia || "—"}</p>
          <p className="muted text-xs text-[#8A93A6]">Cotización v{version.version} · {fmtDateTime(version.fecha)}</p>
          {version.plazoGlobal > 0 && <p className="muted text-xs text-[#8A93A6]">Plazo de entrega estimado: {version.plazoGlobal} días</p>}

          <table className="mt-4 w-full text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-[#8A93A6]">
                <th className="border-b border-[#EDEFF3] py-1.5 text-left">Ítem</th>
                <th className="border-b border-[#EDEFF3] py-1.5 text-right r">Cant.</th>
                <th className="border-b border-[#EDEFF3] py-1.5 text-right r">P. unit.</th>
                <th className="border-b border-[#EDEFF3] py-1.5 text-right r">Total</th>
              </tr>
            </thead>
            <tbody>
              {(version.items || []).map((i) => (
                <tr key={i.itemId}>
                  <td className="border-b border-[#EDEFF3] py-1.5 text-[#131A2C]">{i.descripcion || "(sin descripción)"}</td>
                  <td className="border-b border-[#EDEFF3] py-1.5 text-right r font-mono text-[#131A2C]">{i.cantidadAsignada} {i.unidad}</td>
                  <td className="border-b border-[#EDEFF3] py-1.5 text-right r font-mono text-[#131A2C]">{fmtMoney(i.precioUnitarioVenta, m)}</td>
                  <td className="border-b border-[#EDEFF3] py-1.5 text-right r font-mono text-[#131A2C]">{fmtMoney(i.venta, m)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="box mt-4 flex justify-end">
            <div className="w-56 space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-[#8A93A6]">Subtotal</span><span className="r font-mono text-[#131A2C]">{fmtMoney(version.subtotalVenta, m)}</span></div>
              {version.iva > 0 && <div className="flex justify-between"><span className="text-[#8A93A6]">IVA {version.iva}%</span><span className="r font-mono text-[#131A2C]">{fmtMoney(version.montoIva, m)}</span></div>}
              <div className="flex justify-between border-t border-[#DDE1E8] pt-1.5"><span className="font-semibold text-[#131A2C]">Total</span><span className="tot r font-mono text-base font-bold text-[#131A2C]">{fmtMoney(version.totalVenta, m)}</span></div>
            </div>
          </div>
        </div>

        {/* Datos internos */}
        <div className="border-t border-[#EDEFF3] bg-[#FAFAFC] px-5 py-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8A93A6]">Interno — no se imprime</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs">
            <span className="text-[#5B6478]">costo {fmtMoney(version.totalCosto, m)}</span>
            <span className="font-semibold text-[#C9A227]">ganancia {fmtMoney(version.ganancia, m)}</span>
            <span className="text-[#5B6478]">{version.margenEfectivo?.toFixed(1)}% margen</span>
          </div>
          {version.porProveedor?.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {version.porProveedor.map((p) => (
                <li key={p.proveedor} className="flex justify-between text-xs text-[#5B6478]">
                  <span>{p.proveedor}</span><span className="font-mono">{fmtMoney(p.costo, m)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Cabecera ---------------- */
function Cabecera({ licitacion, onChange, onDelete }) {
  const info = estadoInfo(licitacion.estado);
  const dias = licitacion.fechaLimite ? Math.ceil((new Date(licitacion.fechaLimite) - new Date()) / 86400000) : null;
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="rounded-2xl border border-[#EDEFF3] bg-white p-4">
      <div className="flex items-start gap-2">
        <input
          value={licitacion.titulo}
          onChange={(e) => onChange({ ...licitacion, titulo: e.target.value })}
          placeholder="Título de la licitación"
          style={{ fontFamily: "'Space Grotesk',sans-serif" }}
          className="min-w-0 flex-1 bg-transparent text-lg font-bold text-[#131A2C] placeholder-[#C7CCD6] focus:outline-none"
        />
        <IconBtn onClick={onDelete}><Trash2 size={16} /></IconBtn>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select value={licitacion.estado} onChange={(e) => onChange({ ...licitacion, estado: e.target.value })}
          style={{ color: info.color, backgroundColor: info.bg }}
          className="rounded-full border-0 px-3 py-1 text-xs font-semibold focus:outline-none cursor-pointer">
          {ESTADOS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
        </select>
        {dias != null && (
          <Badge color={dias < 0 ? "#B3261E" : dias <= 3 ? "#B45309" : "#2F7D5A"} bg={dias < 0 ? "#FBE7E6" : dias <= 3 ? "#FBEEDB" : "#E4F3EC"}>
            <Clock size={11} />{dias < 0 ? "Vencida" : dias === 0 ? "Vence hoy" : `${dias} días`}
          </Badge>
        )}
        <button type="button" onClick={() => setAbierto(!abierto)} className="ml-auto text-xs font-semibold text-[#2B3A67] cursor-pointer">
          {abierto ? "Ocultar datos" : "Ver datos"}
        </button>
      </div>

      {abierto && (
        <div className="mt-3 space-y-3 border-t border-[#EDEFF3] pt-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Cliente que licita"><TextInput value={licitacion.cliente} onChange={(e) => onChange({ ...licitacion, cliente: e.target.value })} placeholder="Ej. Hospital Nacional" /></Field>
            <Field label="Referencia / N° proceso"><TextInput value={licitacion.referencia} onChange={(e) => onChange({ ...licitacion, referencia: e.target.value })} placeholder="LIC-2026-0143" className="font-mono" /></Field>
            <Field label="Portal de origen" className="sm:col-span-2">
              <div className="flex gap-1.5">
                <TextInput value={licitacion.portalUrl} onChange={(e) => onChange({ ...licitacion, portalUrl: e.target.value })} placeholder="https://portal.compras…" />
                {licitacion.portalUrl && <a href={licitacion.portalUrl} target="_blank" rel="noreferrer" className="flex items-center rounded-lg border border-[#DDE1E8] px-3 text-[#8A93A6]"><ExternalLink size={15} /></a>}
              </div>
            </Field>
            <Field label="Publicación"><TextInput type="date" value={licitacion.fechaPublicacion} onChange={(e) => onChange({ ...licitacion, fechaPublicacion: e.target.value })} /></Field>
            <Field label="Fecha límite"><TextInput type="date" value={licitacion.fechaLimite} onChange={(e) => onChange({ ...licitacion, fechaLimite: e.target.value })} /></Field>
          </div>
          <Field label="Notas generales"><TextArea rows={2} value={licitacion.notasGenerales} onChange={(e) => onChange({ ...licitacion, notasGenerales: e.target.value })} placeholder="Contexto capturado del portal…" /></Field>
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8A93A6]">Bases y anexos</p>
            <AdjuntosList
              adjuntos={licitacion.adjuntos || []}
              onAdd={(a) => onChange({ ...licitacion, adjuntos: [a, ...(licitacion.adjuntos || [])] })}
              onRemove={(id) => onChange({ ...licitacion, adjuntos: (licitacion.adjuntos || []).filter((x) => x.id !== id) })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Componente Máster Detail Principal ---------------- */
export default function LicitacionMasterDetail({ licitacion, onChange, onDelete, onBack }) {
  const [tab, setTab] = useState("items");
  const calc = useMemo(() => computeLicitacion(licitacion), [licitacion]);

  const emitir = () => {
    const cotizaciones = licitacion.cotizacionesEmitidas || [];
    const version = cotizaciones.reduce((m, v) => Math.max(m, v.version), 0) + 1;
    const snapshot = {
      id: uid(), version, fecha: nowISO(),
      moneda: calc.moneda, iva: calc.iva,
      margenGlobal: licitacion.config?.margenGlobal ?? 20,
      items: calc.items, porProveedor: calc.porProveedor,
      totalCosto: calc.totalCosto, subtotalVenta: calc.subtotalVenta,
      montoIva: calc.montoIva, totalVenta: calc.totalVenta,
      ganancia: calc.ganancia, margenEfectivo: calc.margenEfectivo,
      plazoGlobal: calc.plazoGlobal,
      motivo: version === 1 ? "Cotización inicial" : "Actualización de precios / alcance",
    };
    onChange({ ...licitacion, cotizacionesEmitidas: [...cotizaciones, snapshot] });
    setTab("historial");
  };

  const tabs = [
    { id: "items", label: "Ítems", icon: Layers, count: (licitacion.items || []).length },
    { id: "cotizacion", label: "Cotización", icon: TrendingUp },
    { id: "historial", label: "Emitidas", icon: FileText, count: (licitacion.cotizacionesEmitidas || []).length },
  ];

  return (
    <div className="space-y-4">
      {onBack && (
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm font-semibold text-[#5B6478] md:hidden cursor-pointer">
          <ArrowLeft size={16} />Licitaciones
        </button>
      )}

      <Cabecera licitacion={licitacion} onChange={onChange} onDelete={onDelete} />

      <div className="flex gap-1 overflow-x-auto border-b border-[#EDEFF3]">
        {tabs.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-semibold transition cursor-pointer ${
              tab === t.id ? "border-[#2B3A67] text-[#2B3A67]" : "border-transparent text-[#8A93A6]"}`}>
            <t.icon size={15} />{t.label}
            {t.count != null && <span className="rounded-full bg-[#ECEEF2] px-1.5 text-[10px] text-[#5B6478]">{t.count}</span>}
          </button>
        ))}
      </div>

      {tab === "items" && <ItemsTab licitacion={licitacion} onChange={onChange} calc={calc} />}
      {tab === "cotizacion" && <CotizacionTab licitacion={licitacion} onChange={onChange} calc={calc} onEmitir={emitir} />}
      {tab === "historial" && <HistorialTab licitacion={licitacion} onChange={onChange} />}
    </div>
  );
}
