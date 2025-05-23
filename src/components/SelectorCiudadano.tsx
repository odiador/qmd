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
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchCiudadanos()
      .then(data => setCiudadanos(data))
      .catch(() => setError('Error al cargar ciudadanos'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mb-6 relative">
      <label className="block mb-2 text-sm font-medium text-gray-700">Selecciona un ciudadano</label>
      <input
        type="text"
        className="w-full p-2 border rounded"
        placeholder="Nombre, apellido o cédula..."
        value={inputValue}
        onChange={e => {
          setInputValue(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
        autoComplete="off"
      />
      {loading && <div className="text-gray-500 mt-1">Cargando ciudadanos...</div>}
      {error && <div className="text-red-500 mt-1">{error}</div>}
      {showDropdown && inputValue && ciudadanos.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow max-h-48 overflow-y-auto">
          {ciudadanos.filter(c =>
            c.nombre.toLowerCase().includes(inputValue.toLowerCase()) ||
            c.apellido.toLowerCase().includes(inputValue.toLowerCase()) ||
            c.cedula.includes(inputValue)
          ).map(c => (
            <li
              key={c.id}
              className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${ciudadanoId === c.id ? 'bg-blue-200 font-semibold' : ''}`}
              onMouseDown={() => {
                setCiudadanoId(c.id);
                setInputValue(`${c.nombre} ${c.apellido} (${c.cedula})`);
                setShowDropdown(false);
              }}
            >
              {c.nombre} {c.apellido} (Cédula: {c.cedula})
            </li>
          ))}
          {ciudadanos.filter(c =>
            c.nombre.toLowerCase().includes(inputValue.toLowerCase()) ||
            c.apellido.toLowerCase().includes(inputValue.toLowerCase()) ||
            c.cedula.includes(inputValue)
          ).length === 0 && (
            <li className="px-4 py-2 text-gray-500">Sin coincidencias</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SelectorCiudadano;
