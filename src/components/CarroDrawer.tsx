import React, { useEffect, useState } from 'react';
import { fetchOrCreateCarro, fetchCarrosByCiudadano } from '../services/api';
import Carro from './Carro';

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
}

const CarroDrawer: React.FC<CarroDrawerProps> = ({ ciudadanoId, carroId, setCarroId, closeDrawer }) => {
  const [carros, setCarros] = useState<Carro[]>([]); // Si hay soporte multi-carro, si no, solo uno
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [seleccionando, setSeleccionando] = useState(!carroId);
  const [creando, setCreando] = useState(false);

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
  }, [ciudadanoId]);

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
              <button
                key={carro.id}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                onClick={() => handleSeleccionar(carro.id)}
              >
                Usar carrito (ID: {carro.id}) {carro.estado ? `[${carro.estado}]` : ''} {typeof carro.subtotal === 'number' ? `- Subtotal: $${carro.subtotal.toLocaleString('es-CO')}` : ''}
              </button>
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
    </div>
  );
};

export default CarroDrawer;
