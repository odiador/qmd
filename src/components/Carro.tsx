import React, { useEffect, useState } from 'react';
import { 
  fetchOrCreateCarro, 
  fetchCarroDetalle, 
  actualizarCantidadDetalle, 
  eliminarDetalleDelCarro,
  tramitarCarro as tramitar
} from '../services/api';
import { motion } from 'framer-motion';

interface Detalle {
  id: string;
  producto: { 
    id: string; 
    nombre: string; 
    precio: number;
    codigo?: string;
  };
  cantidad: number;
  subtotal: number;
}

interface Props {
  ciudadanoId: string;
  carroId: string;
  setCarroId: (id: string) => void;
}

const Carro: React.FC<Props> = ({ ciudadanoId, carroId, setCarroId }) => {
  const [detalles, setDetalles] = useState<Detalle[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [carroTramitado, setCarroTramitado] = useState(false);

  useEffect(() => {
    if (!carroId && ciudadanoId) {
      fetchOrCreateCarro(ciudadanoId)
        .then(data => setCarroId(data.id));
    }
    
    if (carroId) {
      setLoading(true);
      fetchCarroDetalle(carroId)
        .then(data => {
          const items = data.detalles || [];
          setDetalles(items);
          setTotal(data.total || 0);
          
          // Inicializar cantidades desde los detalles
          const cantidadesIniciales = items.reduce((acc: Record<string, number>, item: Detalle) => {
            acc[item.id] = item.cantidad;
            return acc;
          }, {});
          setCantidades(cantidadesIniciales);
        })
        .catch((err) => {
          console.error('Error al cargar el carro', err);
          setError('Error al cargar el carro');
        })
        .finally(() => setLoading(false));
    }
  }, [carroId, ciudadanoId, setCarroId]);

  const handleCantidadChange = async (detalleId: string, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;
    
    // Actualizar estado local inmediatamente para UI responsiva
    setCantidades({...cantidades, [detalleId]: nuevaCantidad});
    
    try {
      await actualizarCantidadDetalle(carroId, detalleId, nuevaCantidad);
      
      // Actualizar el detalle y subtotales
      setDetalles(detalles.map(d => {
        if (d.id === detalleId) {
          const nuevoSubtotal = d.producto.precio * nuevaCantidad;
          return { ...d, cantidad: nuevaCantidad, subtotal: nuevoSubtotal };
        }
        return d;
      }));
      
      // Recalcular total
      const nuevoTotal = detalles.reduce((sum, d) => {
        return sum + (d.id === detalleId 
          ? d.producto.precio * nuevaCantidad 
          : d.subtotal);
      }, 0);
      setTotal(nuevoTotal);
      
      // Mostrar notificación visual
      mostrarToast('Cantidad actualizada', 'bg-blue-500');
      
    } catch (err) {
      console.error('Error al actualizar cantidad', err);
      // Revertir cambio local si hay error
      setCantidades({...cantidades, [detalleId]: detalles.find(d => d.id === detalleId)?.cantidad || 1});
      mostrarToast('Error al actualizar cantidad', 'bg-red-500');
    }
  };

  const eliminarDetalle = async (detalleId: string) => {
    try {
      await eliminarDetalleDelCarro(carroId, detalleId);
      
      // Actualizar UI
      const detalleEliminado = detalles.find(d => d.id === detalleId);
      const nuevosDetalles = detalles.filter(d => d.id !== detalleId);
      setDetalles(nuevosDetalles);
      
      // Actualizar total
      if (detalleEliminado) {
        setTotal(total - detalleEliminado.subtotal);
      }
      
      // Mostrar confirmación
      mostrarToast('Producto eliminado del carro', 'bg-blue-500');
      
    } catch (err) {
      console.error('Error al eliminar producto', err);
      mostrarToast('Error al eliminar el producto', 'bg-red-500');
    }
  };
  
  const tramitarCarro = async () => {
    if (!carroId) return;
    setProcesando(true);
    
    try {
      await tramitar(carroId);
      
      // Resetear el carro después de tramitar
      setDetalles([]);
      setTotal(0);
      setCarroId('');
      setCarroTramitado(true);
      
      // Mostrar confirmación
      mostrarToast('¡Carro tramitado exitosamente!', 'bg-green-500');
      
    } catch (err) {
      console.error('Error al tramitar carro', err);
      mostrarToast('Error al tramitar el carro', 'bg-red-500');
    } finally {
      setProcesando(false);
    }
  };
  
  const mostrarToast = (mensaje: string, bgColor: string) => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 z-[3000] ${bgColor} text-white px-4 py-3 rounded shadow-lg flex items-center justify-between min-w-[250px]`;
    
    // Contenido del toast
    const contenido = document.createElement('span');
    contenido.textContent = mensaje;
    toast.appendChild(contenido);
    
    // Botón de cerrar
    const botonCerrar = document.createElement('button');
    botonCerrar.innerHTML = '&times;';
    botonCerrar.className = 'ml-4 font-bold text-xl focus:outline-none';
    botonCerrar.onclick = () => document.body.removeChild(toast);
    toast.appendChild(botonCerrar);
    
    document.body.appendChild(toast);
    
    // Animación de entrada
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 10);
    
    // Auto-eliminar después de 3 segundos
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  if (carroTramitado) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-6 rounded shadow-md">
          <svg className="w-20 h-20 mx-auto text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <h3 className="text-2xl font-bold mb-3">¡Compra realizada con éxito!</h3>
          <p className="mb-4">Tu compra ha sido tramitada correctamente.</p>
          <button
            className="mt-2 bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded transition-colors"
            onClick={() => {
              // Crear nuevo carro
              fetchOrCreateCarro(ciudadanoId)
                .then(data => {
                  setCarroId(data.id);
                  setCarroTramitado(false);
                });
            }}
          >
            Nueva compra
          </button>
        </div>
      </motion.div>
    );
  }

  if (!ciudadanoId) {
    return (
      <div className="text-center py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md">
          <p className="font-medium">Por favor, ingresa un ID de Ciudadano para ver tu carro de compras.</p>
        </div>
      </div>
    );
  }
  
  if (!carroId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded shadow-md">
          <p>Primero debes seleccionar productos para crear un carro de compras.</p>
          <button 
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
            onClick={async () => {
              // Crear carro vacío
              const data = await fetchOrCreateCarro(ciudadanoId);
              setCarroId(data.id);
            }}
          >
            Crear carro vacío
          </button>
        </div>
      </motion.div>
    );
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Detalle del Carro</h2>
        <div className="text-sm text-gray-500">Carro ID: {carroId}</div>
      </div>
      
      {detalles.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <svg 
            className="w-16 h-16 mx-auto text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <p className="mt-4 text-gray-600">El carro está vacío</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-x-auto max-w-full">
            <table className="min-w-[600px] w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider basis-1/3">Producto</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider basis-1/3">Precio</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider basis-1/3">Cantidad</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider basis-1/3">Subtotal</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {detalles.map(d => (
                  <motion.tr 
                    key={d.id}
                    className="hover:bg-gray-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap basis-1/3">
                      <div className="text-sm font-medium text-gray-900">{d.producto.nombre}</div>
                      {d.producto.codigo && <div className="text-xs text-gray-500">Código: {d.producto.codigo}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap basis-1/3">
                      <div className="text-sm text-gray-900">${d.producto.precio.toLocaleString('es-CO')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap basis-1/3">
                      <div className="flex items-center">
                        <button 
                          className="w-8 h-8 rounded-l bg-gray-200 flex items-center justify-center border border-gray-300"
                          onClick={() => handleCantidadChange(d.id, Math.max(1, (cantidades[d.id] || d.cantidad) - 1))}
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={cantidades[d.id] || d.cantidad}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val > 0) {
                              handleCantidadChange(d.id, val);
                            }
                          }}
                          className="w-12 h-8 text-center border-t border-b border-gray-300"
                        />
                        <button 
                          className="w-8 h-8 rounded-r bg-gray-200 flex items-center justify-center border border-gray-300"
                          onClick={() => handleCantidadChange(d.id, (cantidades[d.id] || d.cantidad) + 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap basis-1/3">
                      <div className="text-sm font-medium text-gray-900">
                        ${((cantidades[d.id] || d.cantidad) * d.producto.precio).toLocaleString('es-CO')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => eliminarDetalle(d.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right font-medium">
                    Total:
                  </td>
                  <td colSpan={2} className="px-6 py-4 font-bold text-lg text-blue-700">
                    ${total.toLocaleString('es-CO')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              className={`px-6 py-3 rounded ${
                procesando 
                  ? 'bg-gray-400 cursor-wait' 
                  : 'bg-green-600 hover:bg-green-700 transition-colors'
              } text-white font-medium flex items-center`}
              onClick={tramitarCarro}
              disabled={procesando}
            >
              {procesando ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Tramitar Carro
                </>
              )}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Carro;
