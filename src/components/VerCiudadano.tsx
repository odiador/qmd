import React, { useEffect, useState } from 'react';
import { fetchCiudadano, fetchCarrosByCiudadano, fetchCarrosTramitadosByCiudadano, fetchCarroDetalle } from '../services/api';
import Modal from './Modal';

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

interface Carro {
  id: number;
  codigo: string;
  estado: string;
  fecha: string;
  cantidadProductos?: number;
  total?: number;
}

interface ProductoDetalle {
  id: number;
  producto: {
    id: number;
    nombre: string;
    precio: number;
    codigo: string;
  };
  cantidad: number;
  subtotal: number;
}

interface CarroDetalle {
  carro: Carro;
  detalles: ProductoDetalle[];
  total: number;
  error?: string;
}

interface Props {
  ciudadanoId: string;
}

const VerCiudadano: React.FC<Props> = ({ ciudadanoId }) => {
  const [ciudadano, setCiudadano] = useState<Ciudadano | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [carros, setCarros] = useState<Carro[]>([]);
  const [loadingCarros, setLoadingCarros] = useState(false);
  const [carrosTramitados, setCarrosTramitados] = useState<Carro[]>([]);
  const [loadingCarrosTramitados, setLoadingCarrosTramitados] = useState(false);
  const [carroDetalle, setCarroDetalle] = useState<CarroDetalle | null>(null);
  const [carroDetalleOpen, setCarroDetalleOpen] = useState(false);
  const [carroDetalleLoading, setCarroDetalleLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchCiudadano(ciudadanoId)
      .then(data => {
        setCiudadano(data);
        setLoadingCarros(true);
        fetchCarrosByCiudadano(String(ciudadanoId))
          .then(carrosData => setCarros(carrosData))
          .catch(() => setError('Error al cargar carros del ciudadano'))
          .finally(() => setLoadingCarros(false));
        setLoadingCarrosTramitados(true);
        fetchCarrosTramitadosByCiudadano(String(ciudadanoId))
          .then(data => setCarrosTramitados(data))
          .catch(() => {/* no error visible, es solo admin */})
          .finally(() => setLoadingCarrosTramitados(false));
      })
      .catch(() => setError('Error al cargar información del ciudadano'))
      .finally(() => setLoading(false));
  }, [ciudadanoId]);

  const handleVerDetalleCarro = async (carroId: number) => {
    setCarroDetalleOpen(true);
    setCarroDetalleLoading(true);
    setCarroDetalle(null);
    try {
      const data = await fetchCarroDetalle(String(carroId));
      setCarroDetalle(data);
    } catch (e) {
      const error = e as Error;
      console.error('Error al cargar detalle del carro:', error);
      setCarroDetalle({ carro: { id: 0, codigo: '', estado: '', fecha: '' }, detalles: [], total: 0, error: 'Error al cargar el detalle del carro' });
    } finally {
      setCarroDetalleLoading(false);
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto mt-16 p-8 bg-white rounded shadow text-center">Cargando...</div>;
  if (!ciudadano) return <div className="max-w-3xl mx-auto mt-16 p-8 bg-white rounded shadow text-center text-red-500">No se encontró el ciudadano</div>;

  return (
    <div className="max-w-3xl mx-auto mt-16 p-8 bg-white rounded shadow">
      {/* <h2 className="text-2xl font-bold mb-6">Información del Ciudadano</h2> */}
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">{error}</div>}
      {/* Eliminada la info del ciudadano, solo se muestran los carros */}
      <hr className="my-8 border-gray-300" />
      <div>
        <h3 className="text-xl font-semibold mb-4">Carros de compra</h3>
        {loadingCarros ? (
          <div className="text-center py-4">Cargando carros...</div>
        ) : carros.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border text-left">ID</th>
                  <th className="p-2 border text-left">Código</th>
                  <th className="p-2 border text-left">Estado</th>
                  <th className="p-2 border text-left">Fecha</th>
                  <th className="p-2 border text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {carros.map(carro => (
                  <tr key={carro.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{carro.id}</td>
                    <td className="p-2 border">{carro.codigo}</td>
                    <td className="p-2 border">{carro.estado}</td>
                    <td className="p-2 border">{carro.fecha}</td>
                    <td className="p-2 border text-center">
                      <button
                        className="text-blue-600 underline hover:text-blue-800"
                        onClick={() => handleVerDetalleCarro(carro.id)}
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 text-gray-500 p-4 rounded text-center">
            Este ciudadano no tiene carros de compra registrados
          </div>
        )}
      </div>
      <hr className="my-8 border-gray-300" />
      <div>
        <h3 className="text-xl font-semibold mb-4">Carros tramitados</h3>
        {loadingCarrosTramitados ? (
          <div className="text-center py-4">Cargando carros tramitados...</div>
        ) : carrosTramitados.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border text-left">ID</th>
                  <th className="p-2 border text-left">Fecha</th>
                  <th className="p-2 border text-left">Hora</th>
                  <th className="p-2 border text-right">Cantidad de productos</th>
                  <th className="p-2 border text-right">Total</th>
                  <th className="p-2 border text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {carrosTramitados.map(carro => {
                  // Separar fecha y hora
                  let fecha = '';
                  let hora = '';
                  if (carro.fecha) {
                    const dt = new Date(carro.fecha);
                    fecha = dt.toLocaleDateString('es-ES');
                    hora = dt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                  }
                  // Usar cantidadProductos y total del backend si existen
                  let cantidadProductos = '-';
                  let total = '-';
                  if (typeof carro.cantidadProductos === 'number') {
                    cantidadProductos = String(carro.cantidadProductos);
                  }
                  if (typeof carro.total === 'number') {
                    total = carro.total.toLocaleString('es-ES', { style: 'currency', currency: 'USD' });
                  }
                  return (
                    <tr key={carro.id} className="hover:bg-gray-50">
                      <td className="p-2 border">{carro.id}</td>
                      <td className="p-2 border">{fecha}</td>
                      <td className="p-2 border">{hora}</td>
                      <td className="p-2 border text-right">{cantidadProductos}</td>
                      <td className="p-2 border text-right">{total}</td>
                      <td className="p-2 border text-center">
                        <button
                          className="text-blue-600 underline hover:text-blue-800"
                          onClick={() => handleVerDetalleCarro(carro.id)}
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 text-gray-500 p-4 rounded text-center">
            Este ciudadano no tiene carros tramitados
          </div>
        )}
      </div>
      <Modal isOpen={carroDetalleOpen} onClose={() => setCarroDetalleOpen(false)} title="Detalle del Carro">
        {carroDetalleLoading ? (
          <div className="text-center py-8">Cargando detalle...</div>
        ) : carroDetalle && carroDetalle.error ? (
          <div className="text-red-500 text-center py-4">{carroDetalle.error}</div>
        ) : carroDetalle ? (
          <div>
            <div className="mb-2 text-sm text-gray-700">Código: <span className="font-mono">{carroDetalle.carro?.codigo}</span></div>
            <div className="mb-2 text-sm text-gray-700">Estado: <span className="font-mono">{carroDetalle.carro?.estado}</span></div>
            <div className="mb-2 text-sm text-gray-700">Fecha: <span className="font-mono">{carroDetalle.carro?.fecha}</span></div>
            <table className="w-full border border-collapse mt-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border text-left">Producto</th>
                  <th className="p-2 border text-right">Cantidad</th>
                  <th className="p-2 border text-right">Precio</th>
                  <th className="p-2 border text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {carroDetalle?.detalles?.map((d) => (
                  <tr key={d.id}>
                    <td className="p-2 border">{d.producto?.nombre}</td>
                    <td className="p-2 border text-right">{d.cantidad}</td>
                    <td className="p-2 border text-right">{d.producto?.precio?.toLocaleString('es-ES', { style: 'currency', currency: 'USD' })}</td>
                    <td className="p-2 border text-right">{d.subtotal?.toLocaleString('es-ES', { style: 'currency', currency: 'USD' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-right font-bold">Total: {carroDetalle.total?.toLocaleString?.('es-ES', { style: 'currency', currency: 'USD' })}</div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default VerCiudadano;
