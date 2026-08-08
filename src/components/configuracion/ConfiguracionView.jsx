import React, { useState } from 'react';
import { Settings, Building, Save, ShieldCheck, Check } from 'lucide-react';
import { ASSETS } from '../../config/assets';

export default function ConfiguracionView({ config = {}, onSaveConfig }) {
  const [empresa, setEmpresa] = useState(config.empresa || ASSETS.COMPANY_NAME);
  const [rut, setRut] = useState(config.rut || ASSETS.COMPANY_RUT);
  const [direccion, setDireccion] = useState(config.direccion || ASSETS.COMPANY_ADDRESS);
  const [telefono, setTelefono] = useState(config.telefono || ASSETS.COMPANY_PHONE);
  const [email, setEmail] = useState(config.email || ASSETS.COMPANY_EMAIL);
  const [condiciones, setCondiciones] = useState(config.condicionesCotizacionDefecto || ASSETS.condicionesCotizacionDefecto);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveConfig({
      ...config,
      empresa,
      rut,
      direccion,
      telefono,
      email,
      condicionesCotizacionDefecto: condiciones
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <span>Configuración de Empresa & Sistema</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Parámetros globales que se aplican a cotizaciones e impresiones de PDF.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Razón Social</label>
            <input
              type="text"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">RUT Empresa</label>
            <input
              type="text"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Teléfono de Contacto</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Email Comercial</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Dirección Comercial</label>
          <input
            type="text"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Condiciones Predeterminadas para Cotizaciones PDF</label>
          <textarea
            rows={3}
            value={condiciones}
            onChange={(e) => setCondiciones(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none leading-relaxed"
          />
        </div>

        {/* Branding logos preview */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-[11px] text-slate-400 mb-1">Logo de la App</p>
              <img src={ASSETS.APP_LOGO_URL} alt="App Logo" className="w-9 h-9 object-contain bg-slate-800 p-1 border border-slate-700 rounded-md" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 mb-1">Logo Empresa (PDF)</p>
              <img src={ASSETS.COMPANY_LOGO_URL} alt="Company Logo" className="h-9 object-contain bg-white p-1 rounded-md" />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs shadow-md transition-all cursor-pointer"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Guardado Correctamente' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
