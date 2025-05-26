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
  const response = await fetch(`${API_BASE_URL}/carro/detalle/${carroId}`);
  if (!response.ok) throw new Error('Error al cargar el carro');
  return response.json();
};

export const agregarProductoAlCarro = async (carroId: string, productoId: string | number, cantidad: number) => {
  const response = await fetch(`${API_BASE_URL}/carro/${carroId}/producto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productoId: Number(productoId), cantidad: Number(cantidad) }),
  });
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

// Definir la interfaz para el error de stock insuficiente
export interface StockError {
  ok: false;
  error: 'Stock insuficiente';
  producto: string;
  stockDisponible: number;
  solicitado: number;
  detalleId: number;
  productoId: number;
}

export const actualizarCantidadDetalle = async (
  carroId: string,
  detalleId: string,
  cantidad: number
): Promise<StockError> => {
  const response = await fetch(`${API_BASE_URL}/carro/${carroId}/detalle/${detalleId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cantidad }),
  });
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
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

export const updateCarro = async (carroId: string | number, data: { descripcion?: string; observaciones?: string; concepto?: string }) => {
  const token = localStorage.getItem('adminToken');
  const response = await fetch(`${API_BASE_URL}/carro/${carroId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': token || '' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al actualizar el carro');
  return response.json();
};

export const crearCarro = async (ciudadanoId: string) => {
  const response = await fetch(`${API_BASE_URL}/carro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ciudadanoId })
  });
  if (!response.ok) throw new Error('Error al crear el carro');
  return response.json();
};

// Ciudadanos
export const fetchCiudadanos = async () => {
  const response = await fetch(`${API_BASE_URL}/ciudadanos`);
  if (!response.ok) throw new Error('Error al cargar ciudadanos');
  return response.json();
};

export const fetchCiudadano = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/ciudadanos/${id}`);
  if (!response.ok) throw new Error('Error al cargar ciudadano');
  return response.json();
};

export const crearCiudadano = async (data: {
  nombre: string;
  apellido: string;
  cedula: string;
  email?: string;
  direccion?: string;
  telefono?: string;
  fechaNacimiento?: string;
  genero?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/ciudadanos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al crear ciudadano');
  return response.json();
};

// Eliminar ADMIN_SESSION_SECRET y usar token seguro
export const eliminarCiudadano = async (id: number) => {
  const token = localStorage.getItem('adminToken');
  const response = await fetch(`${API_BASE_URL}/ciudadanos/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-token': token || '' }
  });
  if (!response.ok) throw new Error('Error al eliminar ciudadano');
  return response.json();
};

export const actualizarCiudadano = async (id: number, data: Partial<{ nombre: string; apellido: string; cedula: string; }>) => {
  const token = localStorage.getItem('adminToken');
  const response = await fetch(`${API_BASE_URL}/editciudadano/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': token || '' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al actualizar ciudadano');
  return response.json();
};

export const fetchCarrosByCiudadano = async (ciudadanoId: string) => {
  const response = await fetch(`${API_BASE_URL}/carro/lista/${ciudadanoId}`);
  if (!response.ok) throw new Error('Error al cargar los carros');
  return response.json();
};

export const fetchCarrosTramitadosByCiudadano = async (ciudadanoId: string) => {
  const token = localStorage.getItem('adminToken');
  const response = await fetch(`${API_BASE_URL}/carro/tramitados/${ciudadanoId}`, {
    headers: { 'x-admin-token': token || '' }
  });
  if (!response.ok) throw new Error('Error al cargar los carros tramitados');
  return response.json();
};

// Notificaciones
export const fetchNotificaciones = async (ciudadanoId: string) => {
  const response = await fetch(`${API_BASE_URL}/notificaciones/${ciudadanoId}`);
  if (!response.ok) throw new Error('Error al cargar notificaciones');
  return response.json();
};

export const fetchDetallesPorProducto = async (productoId: string) => {
  const response = await fetch(`${API_BASE_URL}/carro/producto/${productoId}`);
  if (!response.ok) throw new Error('Error al obtener detalles del producto');
  return response.json();
};

// Login de administrador
export const loginAdmin = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Error de autenticación');
  }
  const data = await response.json();
  if (data.token) {
    localStorage.setItem('adminToken', data.token);
  }
  return data;
};
