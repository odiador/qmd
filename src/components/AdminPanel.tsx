import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronUp } from 'react-icons/fa';
import { fetchCiudadanos } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Ciudadano {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const [ciudadanos, setCiudadanos] = useState<Ciudadano[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // const [carrosPorCiudadano, setCarrosPorCiudadano] = useState<Record<number, Carro[]>>({});
  // const [showCarros, setShowCarros] = useState<Record<number, boolean>>({});
  // Estados para mostrar/ocultar secciones
  const [showCiudadanos, setShowCiudadanos] = useState(true);
  // Aquí puedes agregar más estados para otras funciones admin

  useEffect(() => {
    // Verificar token de admin en localStorage en lugar de cookie
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin-login');
      return;
    }
    fetchCiudadanos()
      .then(setCiudadanos)
      .catch(() => setError('Error al cargar ciudadanos'))
      .finally(() => setLoading(false));
  }, [navigate]);

  // Función para ir a la página de detalle del ciudadano
  const handleVerDetalle = (id: number) => {
    navigate(`/admin-panel/ciudadano/${id}`);
  };

  return (
    <div className="max-w-5xl mx-auto mt-16 p-8 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Panel de Administración</h2>
      <p className="text-center mb-6">¡Bienvenido, administrador!</p>
      <div className="flex gap-4 mb-4 justify-center">
        <button
          className="flex items-center gap-1 px-3 py-1 border rounded hover:bg-gray-100"
          onClick={() => setShowCiudadanos((v) => !v)}
        >
          <span>Ciudadanos</span>
          <span className={showCiudadanos ? 'rotate-180 transition-transform' : 'transition-transform'}>
            <FaChevronUp />
          </span>
        </button>
        {/* Ejemplo de otro botón de función admin */}
        <button
          className="flex items-center gap-1 px-3 py-1 border rounded hover:bg-gray-100"
          disabled
        >
          <span>Productos</span>
          <span className="text-gray-400">
            <FaChevronUp />
          </span>
        </button>
      </div>
      <AnimatePresence>
        {showCiudadanos && (
          <motion.div
            key="ciudadanos-section"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold mb-2">Gestión de Ciudadanos</h3>
              <button 
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                onClick={() => navigate('/admin-panel/ciudadano/nuevo')}
              >
                + Nuevo Ciudadano
              </button>
            </div>
            {loading && <div className="text-gray-500 text-center py-4">Cargando ciudadanos...</div>}
            {error && <div className="text-red-500 text-center py-4">{error}</div>}
            {!loading && !error && (
              <div className="overflow-x-auto mt-2">
                <table className="w-full border border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 border text-left">ID</th>
                      <th className="p-3 border text-left">Nombre</th>
                      <th className="p-3 border text-left">Apellido</th>
                      <th className="p-3 border text-left">Cédula</th>
                      <th className="p-3 border text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ciudadanos.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="p-3 border">{c.id}</td>
                        <td className="p-3 border">{c.nombre}</td>
                        <td className="p-3 border">{c.apellido}</td>
                        <td className="p-3 border">{c.cedula}</td>
                        <td className="p-3 border text-center">
                          <div className="flex justify-center gap-2">
                            <button 
                              className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                              onClick={() => handleVerDetalle(c.id)}
                              title="Ver detalles"
                            >
                              Ver detalle
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {ciudadanos.length === 0 && !loading && (
                      <tr>
                        <td colSpan={5} className="p-3 text-center text-gray-500">No hay ciudadanos registrados</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
