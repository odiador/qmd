import React, { useEffect, useState } from 'react';
import { fetchProductos, fetchOrCreateCarro, agregarProductoAlCarro } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  codigo?: string;
  categoriaPrincipal?: string;
  stock?: number;
}

interface Props {
  ciudadanoId: string;
  setCarroId: (id: string) => void;
  abrirCarro?: () => void; // Nuevo: función para abrir el modal del carro
}

const Productos: React.FC<Props> = ({ ciudadanoId, setCarroId, abrirCarro }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [carroId, setCarroIdLocal] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchProductos()
      .then(data => {
        console.log('Productos cargados:', data);
        setProductos(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Error al cargar productos:', err);
        setError('Error al cargar productos');
      })
      .finally(() => setLoading(false));
  }, []);

  const agregarAlCarro = async (productoId: string) => {
    if (!ciudadanoId) return alert('Ingresa un Ciudadano ID');
    setAddingToCart(productoId);
    
    try {
      let carro = carroId;
      if (!carro) {
        // Obtener o crear carro
        const data = await fetchOrCreateCarro(ciudadanoId);
        carro = data.id;
        setCarroId(carro);
        setCarroIdLocal(carro);
      }
      await agregarProductoAlCarro(carro, productoId, 1);
      // Solo abrir el modal del carro, sin forzar fetchCarroDetalle aquí
      if (abrirCarro) abrirCarro();
      // Mostrar notificación de éxito
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 z-[3000] bg-green-500 text-white px-4 py-2 rounded shadow-lg';
      toast.textContent = 'Producto agregado al carro';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 2000);
    } catch (err) {
      console.error('Error al agregar al carro:', err);
      alert('Error al agregar producto al carro');
    } finally {
      setAddingToCart(null);
    }
  };

  const filteredProductos = searchTerm 
    ? productos.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoriaPrincipal?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : productos;

  if (loading) return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      <strong className="font-bold">Error:</strong>
      <span className="block sm:inline"> {error}</span>
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
        <h2 className="text-2xl font-bold mb-2 sm:mb-0">Productos Disponibles</h2>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg 
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      {filteredProductos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchTerm ? 'No se encontraron productos para esta búsqueda' : 'No hay productos disponibles'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProductos.map(p => (
            <div key={p.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white flex flex-col">
              <div className="p-4 flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg text-blue-700">{p.nombre}</h3>
                  {p.categoriaPrincipal && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {p.categoriaPrincipal}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2 mb-2">{p.descripcion}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-lg">${p.precio?.toLocaleString('es-CO')}</span>
                  {p.stock !== undefined && (
                    <span className={`text-sm ${p.stock > 10 ? 'text-green-600' : p.stock > 0 ? 'text-orange-500' : 'text-red-600'}`}>
                      {p.stock > 0 ? `${p.stock} en stock` : 'Agotado'}
                    </span>
                  )}
                </div>
                {p.codigo && <div className="text-xs text-gray-500 mt-1">Código: {p.codigo}</div>}
              </div>
              <div className="px-4 pb-4 flex flex-col gap-2">
                <button
                  className={`w-full py-2 px-4 rounded ${
                    addingToCart === p.id 
                      ? 'bg-blue-400 cursor-wait' 
                      : 'bg-blue-600 hover:bg-blue-700 transition-colors'
                  } text-white font-medium flex justify-center items-center`}
                  onClick={() => agregarAlCarro(p.id)}
                  disabled={addingToCart === p.id}
                >
                  {addingToCart === p.id ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Agregando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      Agregar al carro
                    </>
                  )}
                </button>
                <button
                  className="w-full py-2 px-4 rounded border border-blue-600 text-blue-700 font-medium hover:bg-blue-50 transition-colors flex justify-center items-center"
                  onClick={() => navigate(`/productos/${p.id}`)}
                  type="button"
                >
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Productos;
