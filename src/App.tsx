import { useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import CarroDrawer from './components/CarroDrawer';
import CiudadanoInfo from './components/CiudadanoInfo';
import Modal from './components/Modal';
import Navigation from './components/Navigation';
import Productos from './components/Productos';
import SelectorCiudadano from './components/SelectorCiudadano';
import DetallesProducto from './components/DetallesProducto';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import DetalleCiudadano from './components/DetalleCiudadano';
import NuevoCiudadano from './components/NuevoCiudadano';

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}
function getCookie(name: string) {
  return document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1] || '';
}
function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

function MainApp() {
  const [ciudadanoId, setCiudadanoIdState] = useState(() => getCookie('ciudadanoId') || '');
  const [carroId, setCarroId] = useState(() => getCookie('carroId') || '');
  const [modalCarroOpen, setModalCarroOpen] = useState(false);
  const navigate = useNavigate();

  // Guardar carroId en cookie
  useEffect(() => {
    if (carroId) {
      setCookie('carroId', carroId);
    } else {
      deleteCookie('carroId');
    }
  }, [carroId]);

  const setCiudadanoId = (id: string) => {
    setCiudadanoIdState(id);
    if (id) {
      setCookie('ciudadanoId', id);
      navigate('/productos');
    } else {
      deleteCookie('ciudadanoId');
      deleteCookie('carroId'); // Limpiar carroId al cerrar sesión
      setCarroId('');
      navigate('/login');
    }
  };

  const cerrarSesion = () => {
    setCiudadanoId('');
    setCarroId('');
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-screen bg-gray bg-white text-gray-900 flex flex-col">
      <Navigation ciudadanoId={ciudadanoId} cerrarSesion={cerrarSesion} abrirCarro={() => setModalCarroOpen(true)} />
      <div className="pt-24"> {/* Padding para que el contenido no quede debajo del nav fijo */}
        <main className="flex-grow container mx-auto p-6 max-w-4xl">
          {ciudadanoId && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <CiudadanoInfo ciudadanoId={ciudadanoId} />
            </div>
          )}
          <Routes>
            <Route path="/login" element={
              <div className='flex flex-col gap-1 items-center justify-center h-full'>
                {ciudadanoId && (<Navigate to={'/productos'} />)}
                <h1 className="text-2xl font-bold mb-6 text-center">Selecciona tu usuario</h1>
                <SelectorCiudadano ciudadanoId={ciudadanoId} setCiudadanoId={setCiudadanoId} />
              </div>
            } />            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/productos" element={ciudadanoId ? <Productos ciudadanoId={ciudadanoId} setCarroId={setCarroId} abrirCarro={() => setModalCarroOpen(true)} /> : <Navigate to="/login" />} />
            <Route path="/productos/:id" element={<DetallesProductoWrapper />} />
            <Route path="/admin-panel" element={<AdminPanel />} />
            <Route path="/admin-panel/ciudadano/nuevo" element={<NuevoCiudadano />} />
            <Route path="/admin-panel/ciudadano/:id" element={<DetalleCiudadanoWrapper />} />
            <Route path="*" element={<Navigate to={ciudadanoId ? '/productos' : '/login'} />} />
          </Routes>
        </main>
      </div>
      {/* Modal tipo drawer para el carro */}
      <Modal
        isOpen={modalCarroOpen}
        onClose={() => setModalCarroOpen(false)}
        title="Carrito de compras"
        side
        size="xl"
      >
        {/* Nuevo: selector de carro y gestión de detalles */}
        <CarroDrawer
          ciudadanoId={ciudadanoId}
          carroId={carroId}
          setCarroId={setCarroId}
          closeDrawer={() => setModalCarroOpen(false)}
        />
      </Modal>
    </div>
  );
}

// Wrapper para extraer el id de la URL y pasar a DetallesProducto
function DetallesProductoWrapper() {
  const { id } = useParams();
  if (!id) return <div className="p-4">ID de producto no especificado</div>;
  return <DetallesProducto productoId={id} />;
}

// Wrapper para extraer el id de la URL y pasar a DetalleCiudadano
function DetalleCiudadanoWrapper() {
  const { id } = useParams();
  if (!id) return <div className="p-4">ID de ciudadano no especificado</div>;
  return <DetalleCiudadano ciudadanoId={id} />;
}

function App() {
  return (
    <HashRouter>
      <MainApp />
    </HashRouter>
  );
}

export default App;
