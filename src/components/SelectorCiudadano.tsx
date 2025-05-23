import React, { useEffect, useState } from 'react';
import { fetchCiudadanos } from '../services/api';

interface Ciudadano {
  id: string;
  cedula: string;
  nombre: string;
  apellido: string;
}

interface Props {
  ciudadanoId: string;
  setCiudadanoId: (id: string) => void;
}

const SelectorCiudadano: React.FC<Props> = ({ ciudadanoId, setCiudadanoId }) => {
  const [ciudadanos, setCiudadanos] = useState<Ciudadano[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchCiudadanos()
      .then(data => setCiudadanos(data))
      .catch(() => setError('Error al cargar ciudadanos'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mb-6">
      <label className="block mb-2 text-sm font-medium text-gray-700">Selecciona un ciudadano</label>
      {loading ? (
        <div className="text-gray-500">Cargando ciudadanos...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <select
          className="w-full p-2 border rounded"
          value={ciudadanoId}
          onChange={e => setCiudadanoId(e.target.value)}
        >
          <option value="">-- Selecciona --</option>
          {ciudadanos.map(c => (
            <option key={c.id} value={c.id}>
              {c.nombre} {c.apellido} (Cédula: {c.cedula})
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default SelectorCiudadano;
