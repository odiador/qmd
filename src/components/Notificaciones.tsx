import React, { useEffect, useState } from 'react';

interface Notificacion {
  id?: string;
  mensaje: string;
  fecha: string;
  leida?: boolean;
  tipo?: 'info' | 'success' | 'warning' | 'error';
}

interface Props {
  ciudadanoId: string;
}

const Notificaciones: React.FC<Props> = ({ ciudadanoId }) => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ciudadanoId) return;
    setLoading(true);
    import('../services/api').then(({ fetchNotificaciones }) => {
      fetchNotificaciones(ciudadanoId)
        .then(data => {
          // Asignar un tipo aleatorio para demostración si no viene del backend
          const notificacionesFormateadas = data.notificaciones?.map((n: Notificacion, i: number) => ({
            ...n,
            id: n.id || `notif-${i}`,
            tipo: n.tipo || ['info', 'success', 'warning', 'error'][Math.floor(Math.random() * 4)] as 'info' | 'success' | 'warning' | 'error'
          })) || [];
          setNotificaciones(notificacionesFormateadas);
        })
        .catch((err) => {
          console.error('Error al cargar notificaciones', err);
          setError('Error al cargar notificaciones');
        })
        .finally(() => setLoading(false));
    });
  }, [ciudadanoId]);

  const marcarComoLeida = (id: string) => {
    setNotificaciones(notificaciones.map(n => 
      n.id === id ? { ...n, leida: true } : n
    ));
  };

  const eliminarNotificacion = (id: string) => {
    setNotificaciones(notificaciones.filter(n => n.id !== id));
  };

  const formatearFecha = (fechaString: string) => {
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-CO', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return fechaString;
    }
  };

  const getIconoTipo = (tipo: string = 'info') => {
    switch (tipo) {
      case 'success':
        return (
          <div className="bg-green-100 rounded-full p-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="bg-yellow-100 rounded-full p-2">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="bg-red-100 rounded-full p-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        );
      default: // info
        return (
          <div className="bg-blue-100 rounded-full p-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        );
    }
  };

  if (!ciudadanoId) {
    return (
      <div className="text-center py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md">
          <p className="font-medium">Por favor, ingresa un ID de Ciudadano para ver tus notificaciones.</p>
        </div>
      </div>
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Notificaciones</h2>
        {notificaciones.length > 0 && (
          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            {notificaciones.filter(n => !n.leida).length} sin leer
          </span>
        )}
      </div>
      
      {notificaciones.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <svg 
            className="w-16 h-16 mx-auto text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
          </svg>
          <p className="mt-4 text-gray-600">No tienes notificaciones</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notificaciones.map(n => (
            <div 
              key={n.id} 
              className={`rounded-lg border p-4 flex items-start transition-colors ${
                n.leida 
                  ? 'bg-white border-gray-200' 
                  : 'bg-blue-50 border-blue-200 shadow-sm'
              }`}
            >
              <div className="mr-4 mt-1">
                {getIconoTipo(n.tipo)}
              </div>
              <div className="flex-grow">
                <div className="font-medium">{n.mensaje}</div>
                <div className="text-sm text-gray-500 mt-1">{formatearFecha(n.fecha)}</div>
              </div>
              <div className="flex space-x-2">
                {!n.leida && (
                  <button 
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    onClick={() => marcarComoLeida(n.id || '')}
                  >
                    Marcar como leída
                  </button>
                )}
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => eliminarNotificacion(n.id || '')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notificaciones;
