const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Productos
export const fetchProductos = async () => {
  const response = await fetch(`${API_BASE_URL}/productos`);
  if (!response.ok) throw new Error('Error al cargar productos');
  return response.json();
};

// Carro
export const fetchOrCreateCarro = async (ciudadanoId: string) => {
  const response = await fetch(`${API_BASE_URL}/carro/${ciudadanoId}`);
  if (!response.ok) throw new Error('Error al obtener el carro');
  return response.json();
};

export const fetchCarroDetalle = async (carroId: string) => {
  const response = await fetch(`${API_BASE_URL}/carro/${carroId}`);
  if (!response.ok) throw new Error('Error al cargar el carro');
  return response.json();
};

export const agregarProductoAlCarro = async (carroId: string, productoId: string, cantidad: number) => {
  const response = await fetch(`${API_BASE_URL}/carro/${carroId}/producto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productoId, cantidad }),
  });
  if (!response.ok) throw new Error('Error al agregar producto al carro');
  return response.json();
};

export const actualizarCantidadDetalle = async (carroId: string, detalleId: string, cantidad: number) => {
  const response = await fetch(`${API_BASE_URL}/carro/${carroId}/detalle/${detalleId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cantidad }),
  });
  if (!response.ok) throw new Error('Error al actualizar cantidad');
  return response.json();
};

export const eliminarDetalleDelCarro = async (carroId: string, detalleId: string) => {
  const response = await fetch(`${API_BASE_URL}/carro/${carroId}/detalle/${detalleId}`, { 
    method: 'DELETE' 
  });
  if (!response.ok) throw new Error('Error al eliminar producto');
  return response.json();
};

export const tramitarCarro = async (carroId: string) => {
  const response = await fetch(`${API_BASE_URL}/carro/${carroId}/tramitar`, { 
    method: 'POST' 
  });
  if (!response.ok) throw new Error('Error al tramitar el carro');
  return response.json();
};

// Notificaciones
export const fetchNotificaciones = async (ciudadanoId: string) => {
  const response = await fetch(`${API_BASE_URL}/notificaciones/${ciudadanoId}`);
  if (!response.ok) throw new Error('Error al cargar notificaciones');
  return response.json();
};
