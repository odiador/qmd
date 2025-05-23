import { useState } from 'react';
import { HashRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Carro from './components/Carro';
import CiudadanoInfo from './components/CiudadanoInfo';
import Navigation from './components/Navigation';
import Productos from './components/Productos';
import SelectorCiudadano from './components/SelectorCiudadano';

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
  const [carroId, setCarroId] = useState('');
  const navigate = useNavigate();

  const setCiudadanoId = (id: string) => {
    setCiudadanoIdState(id);
    if (id) {
      setCookie('ciudadanoId', id);
      navigate('/productos');
    } else {
      deleteCookie('ciudadanoId');
      navigate('/login');
    }
    setCarroId('');
  };

  const cerrarSesion = () => {
    setCiudadanoId('');
    setCarroId('');
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-screen bg-gray bg-white text-gray-900 flex flex-col">
      <Navigation ciudadanoId={ciudadanoId} cerrarSesion={cerrarSesion} />
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
            } />
            <Route path="/productos" element={ciudadanoId ? <Productos ciudadanoId={ciudadanoId} setCarroId={setCarroId} /> : <Navigate to="/login" />} />
            <Route path="/carro" element={ciudadanoId ? <Carro ciudadanoId={ciudadanoId} carroId={carroId} setCarroId={setCarroId} /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to={ciudadanoId ? '/productos' : '/login'} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <MainApp />
    </HashRouter>
  );
}

export default App;
