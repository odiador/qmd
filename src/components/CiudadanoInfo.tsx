import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCiudadano } from '../services/api';

interface Ciudadano {
  id: string;
  cedula: string;
  nombre: string;
  apellido: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  fechaNacimiento?: string;
  genero?: string;
  estado?: string;
}

interface Props {
  ciudadanoId: string;
}

const CiudadanoInfo: React.FC<Props> = ({ ciudadanoId }) => {
  const [ciudadano, setCiudadano] = useState<Ciudadano | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!ciudadanoId) return;
    setLoading(true);
    fetchCiudadano(ciudadanoId)
      .then(data => setCiudadano(data))
      .catch(() => setError('Error al cargar ciudadano'))
      .finally(() => setLoading(false));
  }, [ciudadanoId]);

  if (loading) return <div className="text-gray-500">Cargando ciudadano...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!ciudadano) return <div className="text-gray-500">No se encontró el ciudadano.</div>;

  return (
    <div className="flex flex-col gap-2 relative">
      {/* Botón de solo ver perfil */}
      <button
        title="Ver perfil"
        className="absolute top-0 right-0 p-2 hover:bg-gray-100 rounded-full"
        onClick={() => navigate(`/ciudadano/${ciudadanoId}/ver`)}
        style={{ lineHeight: 0 }}
      >
        {/* Ícono de perfil en negro (SVG) */}
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" fill="#111" />
          <path d="M4 20c0-3.3137 3.134-6 8-6s8 2.6863 8 6" fill="#111" />
        </svg>
      </button>
      <div className="text-lg font-bold text-blue-700">{ciudadano.nombre} {ciudadano.apellido}</div>
      <div className="text-gray-700">Cédula: <span className="font-mono">{ciudadano.cedula}</span></div>
      {ciudadano.direccion && (
        <div className="text-gray-700">Dirección: <span className="font-mono">{ciudadano.direccion}</span></div>
      )}
      {ciudadano.telefono && (
        <div className="text-gray-700">Teléfono: <span className="font-mono">{ciudadano.telefono}</span></div>
      )}
      {ciudadano.email && (
        <div className="text-gray-700">Email: <span className="font-mono">{ciudadano.email}</span></div>
      )}
      {ciudadano.fechaNacimiento && (
        <div className="text-gray-700">Fecha de nacimiento: <span className="font-mono">{ciudadano.fechaNacimiento}</span></div>
      )}
      {ciudadano.genero && (
        <div className="text-gray-700">Género: <span className="font-mono">{ciudadano.genero}</span></div>
      )}
      {ciudadano.estado && (
        <div className="text-gray-700">Estado: <span className="font-mono">{ciudadano.estado}</span></div>
      )}
    </div>
  );
};

export default CiudadanoInfo;
