import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, X, Image as ImageIcon } from 'lucide-react';
import { Button, Card, Input } from '../ui/Components';
import { ASSETS } from '../../config/assets';

export default function ConfiguracionView({ config = {}, onSaveConfig }) {
  const getInitialValues = () => ({
    empresa: config.empresa || ASSETS.COMPANY_NAME,
    rut: config.rut || ASSETS.COMPANY_RUT,
    direccion: config.direccion || ASSETS.COMPANY_ADDRESS,
    telefono: config.telefono || ASSETS.COMPANY_PHONE,
    email: config.email || ASSETS.COMPANY_EMAIL,
    logoUrl: config.logoUrl || ASSETS.COMPANY_LOGO_URL,
    condiciones: config.condicionesCotizacionDefecto || ASSETS.condicionesCotizacionDefecto
  });

  const [initials, setInitials] = useState(getInitialValues());
  const [empresa, setEmpresa] = useState(initials.empresa);
  const [rut, setRut] = useState(initials.rut);
  const [direccion, setDireccion] = useState(initials.direccion);
  const [telefono, setTelefono] = useState(initials.telefono);
  const [email, setEmail] = useState(initials.email);
  const [logoUrl, setLogoUrl] = useState(initials.logoUrl);
  const [condiciones, setCondiciones] = useState(initials.condiciones);
  const [saved, setSaved] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const updatedInit = getInitialValues();
    setInitials(updatedInit);
    setEmpresa(updatedInit.empresa);
    setRut(updatedInit.rut);
    setDireccion(updatedInit.direccion);
    setTelefono(updatedInit.telefono);
    setEmail(updatedInit.email);
    setLogoUrl(updatedInit.logoUrl);
    setCondiciones(updatedInit.condiciones);
  }, [config]);

  const isDirty =
    empresa !== initials.empresa ||
    rut !== initials.rut ||
    direccion !== initials.direccion ||
    telefono !== initials.telefono ||
    email !== initials.email ||
    logoUrl !== initials.logoUrl ||
    condiciones !== initials.condiciones;

  const handleCancel = () => {
    setEmpresa(initials.empresa);
    setRut(initials.rut);
    setDireccion(initials.direccion);
    setTelefono(initials.telefono);
    setEmail(initials.email);
    setLogoUrl(initials.logoUrl);
    setCondiciones(initials.condiciones);
    setImageError(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = {
      ...config,
      empresa,
      rut,
      direccion,
      telefono,
      email,
      logoUrl,
      condicionesCotizacionDefecto: condiciones
    };
    onSaveConfig(updatedData);

    const newInitials = {
      empresa,
      rut,
      direccion,
      telefono,
      email,
      logoUrl,
      condiciones
    };
    setInitials(newInitials);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-5 w-full">
      <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 backdrop-blur-sm w-full">
        <h1 className="text-base font-bold text-zinc-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          <span>Configuración de Empresa y Parámetros Globales</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">Parámetros corporativos que se imprimen por defecto en las cotizaciones PDF.</p>
      </div>

      <Card className="w-full">
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
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

          {/* Logo URL & Live Visual Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="md:col-span-2 space-y-1">
              <label className="block text-xs font-medium text-zinc-400 mb-1">URL del Logotipo de la Empresa (Membrete PDF)</label>
              <Input
                type="text"
                value={logoUrl}
                onChange={(e) => {
                  setLogoUrl(e.target.value);
                  setImageError(false);
                }}
                placeholder="https://..."
              />
              <p className="text-[10px] text-zinc-500 font-mono mt-1">
                Esta imagen se imprime automáticamente en la cabecera de las cotizaciones PDF oficiales.
              </p>
            </div>

            {/* Live Preview Box */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Previsualización del Logotipo</label>
              <div className="bg-white p-3 rounded-xl border border-zinc-800 min-h-[96px] max-h-28 flex items-center justify-center shadow-xs">
                {logoUrl && !imageError ? (
                  <img
                    src={logoUrl}
                    alt="Logotipo de la empresa"
                    onError={() => setImageError(true)}
                    className="max-h-20 max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-zinc-400 space-y-1">
                    <ImageIcon className="w-5 h-5 mx-auto text-zinc-400" />
                    <span className="block text-[10px]">Sin imagen o URL no válida</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Condiciones Predeterminadas para Cotizaciones PDF</label>
            <textarea
              rows={3}
              value={condiciones}
              onChange={(e) => setCondiciones(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Action Buttons: ONLY visible if form has changes (isDirty === true) */}
          {isDirty && (
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-end space-x-2 animate-fadeIn">
              <Button type="button" variant="ghost" size="md" onClick={handleCancel}>
                <X className="w-4 h-4" />
                <span>Cancelar</span>
              </Button>
              <Button type="submit" variant="primary" size="md">
                {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
                <span>{saved ? 'Guardado' : 'Guardar Cambios'}</span>
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
