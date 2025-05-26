import React, { useEffect, useState } from 'react';
import { fetchDetallesPorProducto, fetchProductos } from '../services/api';

interface Detalle {
  id: number;
  carroCodigo: string;
  carroEstado: string;
  carroFecha: string;
  ciudadanoNombre: string;
  ciudadanoApellido: string;
  ciudadanoCedula: string;
  ciudadanoEmail: string;
  cantidad: number;
  monto: number;
  subtotal: number;
}

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  codigo?: string;
  categoriaPrincipal?: string;
  categoriaSecundaria?: string;
  stock?: number;
  detalle?: string;
  caracteristicas?: string;
  garantia?: string;
  estado?: string;
}

interface Props {
  productoId: string;
}

const DetallesProducto: React.FC<Props> = ({ productoId }) => {
  const [detalles, setDetalles] = useState<Detalle[]>([]);
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchDetallesPorProducto(productoId),
      fetchProductos()
    ])
      .then(([detallesData, productosData]) => {
        setDetalles(detallesData.detalles || []);
        const prod = (productosData || []).find((p: Producto) => String(p.id) === String(productoId));
        setProducto(prod || null);
      })
      .catch(() => setError('Error al cargar los detalles'))
      .finally(() => setLoading(false));
  }, [productoId]);

  if (loading) return <div className="p-4">Cargando detalles...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto">
      {producto && (
        <div className="mb-6 p-4 border rounded bg-white shadow">
          <h2 className="text-2xl font-bold text-blue-700 mb-2">{producto.nombre}</h2>
          <div className="flex flex-wrap gap-4 items-center mb-2">
            {producto.categoriaPrincipal && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{producto.categoriaPrincipal}</span>
            )}
            {producto.categoriaSecundaria && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{producto.categoriaSecundaria}</span>
            )}
            {producto.codigo && (
              <span className="text-xs text-gray-500">Código: {producto.codigo}</span>
            )}
            {producto.estado && (
              <span className="text-xs text-gray-500">Estado: {producto.estado}</span>
            )}
          </div>
          <p className="text-gray-700 mb-2">{producto.descripcion}</p>
          {producto.detalle && <div className="text-sm text-gray-700 mb-1"><span className="font-semibold">Detalle:</span> {producto.detalle}</div>}
          {producto.caracteristicas && <div className="text-sm text-gray-700 mb-1"><span className="font-semibold">Características:</span> {producto.caracteristicas}</div>}
          {producto.garantia && <div className="text-sm text-gray-700 mb-1"><span className="font-semibold">Garantía:</span> {producto.garantia}</div>}
          <div className="flex flex-wrap gap-6 items-center mb-2">
            <span className="font-bold text-lg text-green-700">${producto.precio?.toLocaleString('es-CO')}</span>
            {producto.stock !== undefined && (
              <span className={`text-sm ${producto.stock > 10 ? 'text-green-600' : producto.stock > 0 ? 'text-orange-500' : 'text-red-600'}`}>
                {producto.stock > 0 ? `${producto.stock} en stock` : 'Agotado'}
              </span>
            )}
          </div>
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">Movimientos / Compradores</h3>
      {detalles.length === 0 ? (
        <div className="p-4">No hay movimientos para este producto.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full border border-gray-200 rounded shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Carro</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Ciudadano</th>
                <th className="px-4 py-2 text-left">Cédula</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-right">Cantidad</th>
                <th className="px-4 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {detalles.map((d) => (
                <tr key={d.id} className="even:bg-gray-50">
                  <td className="px-4 py-2">{d.carroCodigo}</td>
                  <td className="px-4 py-2">{d.carroEstado}</td>
                  <td className="px-4 py-2">{d.carroFecha}</td>
                  <td className="px-4 py-2">{d.ciudadanoNombre} {d.ciudadanoApellido}</td>
                  <td className="px-4 py-2">{d.ciudadanoCedula}</td>
                  <td className="px-4 py-2">{d.ciudadanoEmail}</td>
                  <td className="px-4 py-2 text-right">{d.cantidad}</td>
                  <td className="px-4 py-2 text-right">${d.subtotal?.toLocaleString('es-CO')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DetallesProducto;
