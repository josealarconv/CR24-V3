import React, { useState } from 'react';
import { Settings, Save, Check } from 'lucide-react';
import { Button, Card, Input } from '../ui/Components';
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
    <div className="max-w-3xl space-y-5">
      <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 backdrop-blur-sm">
        <h1 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          <span>Configuración de Empresa & Sistema</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">Parámetros globales que se aplican a cotizaciones e impresiones de PDF.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Razón Social</label>
              <Input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">RUT Empresa</label>
              <Input
                type="text"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Teléfono de Contacto</label>
              <Input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Email Comercial</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Dirección Comercial</label>
            <Input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Condiciones Predetermonadas para Cotizaciones PDF</label>
            <textarea
              rows={3}
              value={condiciones}
              onChange={(e) => setCondiciones(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-[10px] text-zinc-500 mb-1">Logo App</p>
                <img src={ASSETS.APP_LOGO_URL} alt="App Logo" className="w-8 h-8 object-contain bg-zinc-900 p-1 border border-zinc-800 rounded-md" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 mb-1">Logo Empresa (PDF)</p>
                <img src={ASSETS.COMPANY_LOGO_URL} alt="Company Logo" className="h-8 object-contain bg-white p-1 rounded-md" />
              </div>
            </div>

            <Button type="submit" variant="primary" size="md">
              {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{saved ? 'Guardado' : 'Guardar Cambios'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
