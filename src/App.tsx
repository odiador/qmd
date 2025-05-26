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
import VerCiudadano from './components/VerCiudadano';

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
  const [infoModalOpen, setInfoModalOpen] = useState(false);
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
            <Route path="/productos" element={ciudadanoId ? <Productos ciudadanoId={ciudadanoId} abrirCarro={() => setModalCarroOpen(true)} carroId={carroId} /> : <Navigate to="/login" />} />
            <Route path="/productos/:id" element={<DetallesProductoWrapper />} />
            <Route path="/admin-panel" element={<AdminPanel />} />
            <Route path="/admin-panel/ciudadano/nuevo" element={<NuevoCiudadano />} />
            <Route path="/admin-panel/ciudadano/:id" element={<DetalleCiudadanoWrapper />} />
            <Route path="/ciudadano/:id/ver" element={<VerCiudadanoWrapper />} />
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
      {/* Footer con copyright y botón de información */}
      <footer className="w-full flex items-center justify-center gap-2 py-4 border-t bg-gray-50 text-gray-500 text-sm mt-8">
        <span>&copy; {new Date().getFullYear()} QMD</span>
        <button
          className="ml-2 rounded-full bg-gray-200 hover:bg-gray-300 w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-700 focus:outline-none"
          onClick={() => setInfoModalOpen(true)}
          title="Información del proyecto"
        >
          ?
        </button>
      </footer>
      {/* Modal de información del proyecto */}
      <Modal isOpen={infoModalOpen} onClose={() => setInfoModalOpen(false)} title="Acerca de QMD">
        <div className="p-4 text-gray-700 text-base max-w-md">
          <p><b>QMD - Quién Me Debe</b> es un sistema de gestión de compras y deudores desarrollado para facilitar el control de productos, carros de compra y tramitaciones para ciudadanos y administradores.</p>
          <ul className="list-disc pl-6 mt-3 text-sm">
            <li>Permite a los ciudadanos gestionar sus compras y ver el historial de carros tramitados.</li>
            <li>Incluye panel de administración para gestión de usuarios y productos.</li>
            <li>Desarrollado con React, TypeScript, Hono y SQLite.</li>
            <li>Proyecto académico y de demostración, no apto para producción real.</li>
          </ul>
          <div className="mt-4 text-xs text-gray-400">
            <b>Requisitos funcionales de la aplicación QMD:</b>
            <ol className="list-decimal pl-6 mt-2 text-xs text-gray-500">
              <li>Los ciudadanos pueden registrarse y gestionar su información personal.</li>
              <li>Los ciudadanos pueden ver, crear y gestionar carros de compra.</li>
              <li>Los ciudadanos pueden agregar productos a su carro, incrementando cantidad si ya existe el producto.</li>
              <li>El sistema valida el stock al agregar o actualizar productos en el carro, mostrando mensajes claros si no hay suficiente stock.</li>
              <li>Los ciudadanos pueden tramitar su carro, lo que descuenta stock y registra la fecha/hora de tramitación.</li>
              <li>Los carros tramitados muestran fecha, hora, cantidad de productos y total, y pueden ser consultados en el historial.</li>
              <li>Los administradores pueden acceder a un panel para gestionar ciudadanos, productos y carros tramitados.</li>
              <li>El sistema permite editar atributos de los carros (descripción, observaciones, concepto) desde el frontend y backend.</li>
              <li>El frontend muestra mensajes claros y modales para errores, confirmaciones y detalles de carros tramitados.</li>
              <li>El sistema envía notificaciones por correo al tramitar un carro (si está configurado).</li>
              <li>El sistema cuenta con autenticación de administrador mediante login y token seguro.</li>
            </ol>
            <div className="mt-4">
              Desarrollado por:
              <ul className="list-none pl-0">
                <li>Juan Camilo Albarán</li>
                <li>Juan Manuel Amador</li>
                <li>Luis Carlos Calderón Calvo</li>
              </ul>
            </div>
          </div>
        </div>
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

// Wrapper para extraer el id de la URL y pasar a VerCiudadano
function VerCiudadanoWrapper() {
  const { id } = useParams();
  if (!id) return <div className="p-4">ID de ciudadano no especificado</div>;
  return <VerCiudadano ciudadanoId={id} />;
}

function App() {
  return (
    <HashRouter>
      <MainApp />
    </HashRouter>
  );
}

export default App;
