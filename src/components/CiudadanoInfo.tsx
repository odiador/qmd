import React, { useEffect, useState } from 'react';
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
    <div className="flex flex-col gap-2">
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
