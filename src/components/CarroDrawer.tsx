import React, { useEffect, useState } from 'react';
import { fetchOrCreateCarro, fetchCarrosByCiudadano, updateCarro } from '../services/api';
import Carro from './Carro';
import Modal from './Modal';

interface CarroDrawerProps {
  ciudadanoId: string;
  carroId: string;
  setCarroId: (id: string) => void;
  closeDrawer: () => void;
}

interface Carro {
  id: string;
  codigo?: string;
  estado?: string;
  fecha?: string;
  subtotal?: number; // Agregado para el subtotal
  descripcion?: string;
  observaciones?: string;
  concepto?: string;
}

const CarroDrawer: React.FC<CarroDrawerProps> = ({ ciudadanoId, carroId, setCarroId, closeDrawer }) => {
  const [carros, setCarros] = useState<Carro[]>([]); // Si hay soporte multi-carro, si no, solo uno
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [seleccionando, setSeleccionando] = useState(!carroId);
  const [creando, setCreando] = useState(false);
  const [carroEditModalOpen, setCarroEditModalOpen] = useState(false);
  const [carroEdit, setCarroEdit] = useState<Carro | null>(null);
  const [carroEditForm, setCarroEditForm] = useState({
    descripcion: '',
    observaciones: '',
    concepto: '',
  });
  const [carroEditSaving, setCarroEditSaving] = useState(false);

  useEffect(() => {
    if (!ciudadanoId) return;
    setLoading(true);
    // Usar el nuevo endpoint que trae todos los carros con subtotal
    fetchCarrosByCiudadano(ciudadanoId)
      .then(data => {
        setCarros(Array.isArray(data) ? data : [data]);
        if (!carroId) setSeleccionando(true);
      })
      .catch(() => setError('Error al cargar carros'))
      .finally(() => setLoading(false));
  }, [ciudadanoId, carroId]);

  const handleSeleccionar = (id: string) => {
    setCarroId(id);
    setSeleccionando(false);
  };

  const handleCrear = async () => {
    setCreando(true);
    try {
      const data = await fetchOrCreateCarro(ciudadanoId);
      setCarros([data]);
      setCarroId(data.id);
      setSeleccionando(false);
    } catch {
      setError('Error al crear carro');
    } finally {
      setCreando(false);
    }
  };

  const handleDeseleccionar = () => {
    setCarroId('');
    setSeleccionando(true);
  };

  const handleAbrirEditarCarro = (carro: Carro) => {
    setCarroEdit(carro);
    setCarroEditForm({
      descripcion: carro.descripcion || '',
      observaciones: carro.observaciones || '',
      concepto: carro.concepto || '',
    });
    setCarroEditModalOpen(true);
  };

  const handleGuardarEdicionCarro = async () => {
    if (!carroEdit) return;
    setCarroEditSaving(true);
    try {
      // Debes implementar el endpoint en el backend y el método en api.ts
      await updateCarro(carroEdit.id, carroEditForm);
      // Refrescar lista de carros
      const data = await fetchCarrosByCiudadano(ciudadanoId);
      setCarros(Array.isArray(data) ? data : [data]);
      setCarroEditModalOpen(false);
    } catch {
      // Manejo de error opcional
    } finally {
      setCarroEditSaving(false);
    }
  };

  if (!ciudadanoId) return <div className="p-4">Debes iniciar sesión.</div>;

  if (loading) return <div className="p-4 text-center">Cargando...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  if (seleccionando || !carroId) {
    return (
      <div className="p-4 flex flex-col gap-4 items-center">
        <h2 className="text-lg font-bold">Selecciona tu carrito</h2>
        {carros.length > 0 ? (
          <div className="flex flex-col gap-2 w-full">
            {carros.map((carro) => (
              <div key={carro.id} className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="font-semibold text-blue-700">Carro #{carro.id} {carro.estado ? <span className={`ml-2 px-2 py-1 rounded text-xs ${carro.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{carro.estado}</span> : null}</div>
                  {carro.codigo && <div className="text-xs text-gray-500">Código: {carro.codigo}</div>}
                  {carro.fecha && <div className="text-xs text-gray-500">Fecha: {carro.fecha}</div>}
                  {typeof carro.subtotal === 'number' && <div className="text-sm text-gray-700 mt-1">Subtotal: <span className="font-mono">${carro.subtotal.toLocaleString('es-CO')}</span></div>}
                </div>
                <div className="mt-2 md:mt-0 md:ml-4 flex-shrink-0 flex gap-2">
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full md:w-auto"
                    onClick={() => handleSeleccionar(carro.id)}
                  >
                    Seleccionar
                  </button>
                  <button
                    className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 w-full md:w-auto"
                    onClick={() => handleAbrirEditarCarro(carro)}
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={handleCrear}
          disabled={creando}
        >
          {creando ? 'Creando...' : 'Crear nuevo carrito'}
        </button>
      </div>
    );
  }

  // Carro seleccionado
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b">
        <span className="text-sm text-gray-700">Carrito seleccionado: <b>{carroId}</b></span>
        <button
          className="text-xs text-blue-600 underline ml-2"
          onClick={handleDeseleccionar}
        >
          Deseleccionar
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <Carro ciudadanoId={ciudadanoId} carroId={carroId} setCarroId={setCarroId} />
      </div>
      <div className="p-2 flex justify-end">
        <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300" onClick={closeDrawer}>Cerrar</button>
      </div>
      <Modal isOpen={carroEditModalOpen} onClose={() => setCarroEditModalOpen(false)} title="Editar Carrito">
        <div className="flex flex-col gap-4">
          <label className="block">
            <span className="text-sm font-medium">Descripción</span>
            <input type="text" className="border p-2 rounded w-full" value={carroEditForm.descripcion} onChange={e => setCarroEditForm(f => ({ ...f, descripcion: e.target.value }))} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Observaciones</span>
            <input type="text" className="border p-2 rounded w-full" value={carroEditForm.observaciones} onChange={e => setCarroEditForm(f => ({ ...f, observaciones: e.target.value }))} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Concepto</span>
            <input type="text" className="border p-2 rounded w-full" value={carroEditForm.concepto} onChange={e => setCarroEditForm(f => ({ ...f, concepto: e.target.value }))} />
          </label>
          <div className="flex gap-2 justify-end">
            <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => setCarroEditModalOpen(false)}>Cancelar</button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleGuardarEdicionCarro} disabled={carroEditSaving}>{carroEditSaving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CarroDrawer;
