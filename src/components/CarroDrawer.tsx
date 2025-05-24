import React, { useEffect, useState } from 'react';
import { fetchOrCreateCarro } from '../services/api';
import Carro from './Carro';

interface CarroDrawerProps {
  ciudadanoId: string;
  carroId: string;
  setCarroId: (id: string) => void;
  closeDrawer: () => void;
}

const CarroDrawer: React.FC<CarroDrawerProps> = ({ ciudadanoId, carroId, setCarroId, closeDrawer }) => {
  const [carros, setCarros] = useState<any[]>([]); // Si hay soporte multi-carro, si no, solo uno
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [seleccionando, setSeleccionando] = useState(!carroId);
  const [creando, setCreando] = useState(false);

  useEffect(() => {
    if (!ciudadanoId) return;
    setLoading(true);
    // Si hay soporte multi-carro, aquí se listan. Si no, solo obtener o crear uno.
    fetchOrCreateCarro(ciudadanoId)
      .then(data => {
        setCarros([data]);
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
        {carros.length > 0 && carros[0].id ? (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => handleSeleccionar(carros[0].id)}
          >
            Usar carrito existente (ID: {carros[0].id})
          </button>
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
