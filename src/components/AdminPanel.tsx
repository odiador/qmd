import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronUp } from 'react-icons/fa';
import { fetchCiudadanos, eliminarCiudadano, fetchCarrosByCiudadano, actualizarCiudadano } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Ciudadano {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
}

interface Carro {
  id: number;
  codigo: string;
  estado?: string;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const [ciudadanos, setCiudadanos] = useState<Ciudadano[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [carrosPorCiudadano, setCarrosPorCiudadano] = useState<Record<number, Carro[]>>({});
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Ciudadano>>({});
  const [showCarros, setShowCarros] = useState<Record<number, boolean>>({});
  const [accionError, setAccionError] = useState('');
  // Estados para mostrar/ocultar secciones
  const [showCiudadanos, setShowCiudadanos] = useState(true);
  // Aquí puedes agregar más estados para otras funciones admin

  useEffect(() => {
    const isAdmin = document.cookie.split('; ').find(row => row.startsWith('adminSession='));
    if (!isAdmin) {
      navigate('/admin-login');
      return;
    }
    fetchCiudadanos()
      .then(setCiudadanos)
      .catch(() => setError('Error al cargar ciudadanos'))
      .finally(() => setLoading(false));
  }, [navigate]);

  // Función para cargar carritos de un ciudadano
  const handleToggleCarros = async (ciudadanoId: number) => {
    setShowCarros((prev) => ({ ...prev, [ciudadanoId]: !prev[ciudadanoId] }));
    if (!carrosPorCiudadano[ciudadanoId]) {
      try {
        const carros = await fetchCarrosByCiudadano(ciudadanoId);
        setCarrosPorCiudadano((prev) => ({ ...prev, [ciudadanoId]: carros }));
      } catch {
        setCarrosPorCiudadano((prev) => ({ ...prev, [ciudadanoId]: [] }));
      }
    }
  };

  // Eliminar ciudadano
  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este ciudadano?')) return;
    setAccionError('');
    try {
      await eliminarCiudadano(id);
      setCiudadanos((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setAccionError('Error al eliminar ciudadano');
    }
  };

  // Editar ciudadano
  const handleEditar = (c: Ciudadano) => {
    setEditId(c.id);
    setEditForm({ ...c });
    setAccionError('');
  };
  const handleGuardar = async () => {
    if (!editId) return;
    setAccionError('');
    try {
      await actualizarCiudadano(editId, editForm);
      setCiudadanos((prev) => prev.map((c) => c.id === editId ? { ...c, ...editForm } : c));
      setEditId(null);
      setEditForm({});
    } catch {
      setAccionError('Error al actualizar ciudadano');
    }
  };
  const handleCancelar = () => {
    setEditId(null);
    setEditForm({});
    setAccionError('');
  };

  return (
    <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded shadow">
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
            <h3 className="text-xl font-semibold mb-2">Gestión de Ciudadanos</h3>
            {loading && <div className="text-gray-500">Cargando ciudadanos...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {!loading && !error && (
              <table className="w-full border mt-2 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">ID</th>
                    <th className="p-2 border">Nombre</th>
                    <th className="p-2 border">Apellido</th>
                    <th className="p-2 border">Cédula</th>
                    <th className="p-2 border">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ciudadanos.map((c) => (
                    <tr key={c.id}>
                      {editId === c.id ? (
                        <>
                          <td className="p-2 border"><input className="border rounded p-1 w-16" value={editForm.nombre || ''} onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))} /></td>
                          <td className="p-2 border"><input className="border rounded p-1 w-16" value={editForm.apellido || ''} onChange={e => setEditForm(f => ({ ...f, apellido: e.target.value }))} /></td>
                          <td className="p-2 border"><input className="border rounded p-1 w-16" value={editForm.cedula || ''} onChange={e => setEditForm(f => ({ ...f, cedula: e.target.value }))} /></td>
                          <td className="p-2 border">
                            <button className="text-green-600 hover:underline mr-2" onClick={handleGuardar}>Guardar</button>
                            <button className="text-gray-600 hover:underline" onClick={handleCancelar}>Cancelar</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-2 border">{c.nombre}</td>
                          <td className="p-2 border">{c.apellido}</td>
                          <td className="p-2 border">{c.cedula}</td>
                          <td className="p-2 border">
                            <button className="text-blue-600 hover:underline mr-2" onClick={() => handleEditar(c)}>Editar</button>
                            <button className="text-red-600 hover:underline" onClick={() => handleEliminar(c.id)}>Eliminar</button>
                            <button className="ml-2 text-gray-600 hover:underline" onClick={() => handleToggleCarros(c.id)}>
                              Carros <span className={showCarros[c.id] ? 'rotate-180 inline-block' : ''}><FaChevronUp /></span>
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {accionError && <div className="text-red-500 mt-2">{accionError}</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
