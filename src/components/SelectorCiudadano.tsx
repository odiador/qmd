import React, { useEffect, useState } from 'react';
import { fetchCiudadanos } from '../services/api';
import { HiOutlineUserCircle, HiOutlineSearch, HiOutlineIdentification } from 'react-icons/hi';

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
  const [selectedCitizen, setSelectedCitizen] = useState<Ciudadano | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchCiudadanos()
      .then(data => {
        setCiudadanos(data);
        if (ciudadanoId) {
          const selected = data.find((c: Ciudadano) => c.id === ciudadanoId);
          if (selected) {
            setSelectedCitizen(selected);
            setInputValue(`${selected.nombre} ${selected.apellido}`);
          }
        }
      })
      .catch(() => setError('Error al cargar ciudadanos'))
      .finally(() => setLoading(false));
  }, [ciudadanoId]);

  const filteredCiudadanos = inputValue 
    ? ciudadanos.filter(c =>
        c.nombre.toLowerCase().includes(inputValue.toLowerCase()) ||
        c.apellido.toLowerCase().includes(inputValue.toLowerCase()) ||
        c.cedula.includes(inputValue)
      )
    : ciudadanos.slice(0, 5); // Mostrar los primeros 5 ciudadanos si no hay filtro

  const handleCitizenSelect = (citizen: Ciudadano) => {
    setCiudadanoId(citizen.id);
    setSelectedCitizen(citizen);
    setInputValue(`${citizen.nombre} ${citizen.apellido}`);
    setShowDropdown(false);
  };

  const getRandomPlaceholder = () => {
    const placeholders = [
      "Busca por nombre...",
      "Ingresa un apellido...",
      "Escribe una cédula...",
      "Ej: Juan Pérez...",
      "Busca tu nombre aquí..."
    ];
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  };

  return (
    <div className="mb-6">
      <label className="mb-2 text-sm font-medium text-gray-700 flex items-center gap-1">
        <HiOutlineUserCircle className="text-lg" /> 
        ¿Quién eres tú?
      </label>
      
      {/* Input de búsqueda con ícono */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <HiOutlineSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder={getRandomPlaceholder()}
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          autoComplete="off"
        />
        {inputValue && (
          <button 
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            onClick={() => {
              setInputValue('');
              setCiudadanoId('');
              setSelectedCitizen(null);
              setShowDropdown(true);
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Estado de carga y error */}
      {loading && <div className="text-gray-500 mt-1 flex items-center gap-1"><div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div> Cargando ciudadanos...</div>}
      {error && <div className="text-red-500 mt-1">{error}</div>}
      
      {/* Sugerencias */}
      {!selectedCitizen && !loading && !error && (
        <div className="mt-2 text-sm text-gray-500">
          👆 Comienza a escribir para buscar tu nombre o cédula, o selecciona una opción de la lista
        </div>
      )}

      {/* Dropdown de resultados */}
      {showDropdown && ciudadanos.length > 0 && (
        <ul className="mt-1 border border-gray-200 rounded-lg shadow-lg overflow-hidden bg-white max-h-64 overflow-y-auto z-50">
          {filteredCiudadanos.length > 0 ? (
            filteredCiudadanos.map(c => (
              <li
                key={c.id}
                className={`p-3 cursor-pointer hover:bg-blue-50 transition-colors border-b border-gray-100 flex items-center gap-2
                  ${ciudadanoId === c.id ? 'bg-blue-100' : ''}`}
                onMouseDown={() => handleCitizenSelect(c)}
              >
                <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                  {c.nombre.charAt(0)}{c.apellido.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{c.nombre} {c.apellido}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <HiOutlineIdentification />
                    {c.cedula}
                  </div>
                </div>
                {ciudadanoId === c.id && (
                  <div className="text-green-500 font-medium flex items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Seleccionado
                  </div>
                )}
              </li>
            ))
          ) : (
            <li className="p-4 text-gray-500 text-center">
              No se encontraron resultados para "{inputValue}"
            </li>
          )}
        </ul>
      )}

      {/* Resumen del ciudadano seleccionado */}
      {selectedCitizen && !showDropdown && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-3">
          <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
            {selectedCitizen.nombre.charAt(0)}{selectedCitizen.apellido.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-blue-800">{selectedCitizen.nombre} {selectedCitizen.apellido}</div>
            <div className="text-sm text-blue-600">Cédula: {selectedCitizen.cedula}</div>
          </div>
          <button 
            className="ml-auto bg-white p-2 rounded-full hover:bg-blue-100 transition-colors"
            onClick={() => setShowDropdown(true)}
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default SelectorCiudadano;
