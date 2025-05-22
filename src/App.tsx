import { useState } from 'react';
import Productos from './components/Productos';
import Carro from './components/Carro';
import Notificaciones from './components/Notificaciones';

function App() {
  const [view, setView] = useState<'productos' | 'carro' | 'notificaciones'>('productos');
  const [ciudadanoId, setCiudadanoId] = useState('');
  const [carroId, setCarroId] = useState('');

  return (
    <div className="min-h-screen w-screen bg-gray bg-white text-gray-900 flex flex-col">
      <header className="bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-md">
        <div className="container mx-auto py-4 px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <h1 className="text-3xl font-bold">
              <span className="text-yellow-300">QMD</span> - Carro de Productos
            </h1>
            <nav className="flex mt-4 md:mt-0">
              {['productos', 'carro', 'notificaciones'].map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 mx-1 rounded-t-lg transition-colors ${
                    view === tab 
                      ? 'bg-white text-blue-700 font-semibold shadow-inner' 
                      : 'hover:bg-blue-600 text-white'
                  }`}
                  onClick={() => setView(tab as any)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto p-6 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">ID del Ciudadano</label>
              <input
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Ingrese ID del ciudadano"
                value={ciudadanoId}
                onChange={e => setCiudadanoId(e.target.value)}
              />
            </div>
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">ID del Carro (opcional)</label>
              <input
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="ID del carro (se genera automáticamente)"
                value={carroId}
                onChange={e => setCarroId(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          {view === 'productos' && <Productos ciudadanoId={ciudadanoId} setCarroId={setCarroId} />}
          {view === 'carro' && <Carro ciudadanoId={ciudadanoId} carroId={carroId} setCarroId={setCarroId} />}
          {view === 'notificaciones' && <Notificaciones ciudadanoId={ciudadanoId} />}
        </div>
      </main>
      
      <footer className="bg-gray-800 text-gray-300 py-4 text-center text-sm">
        <p>© {new Date().getFullYear()} QMD Sistema de Carros de Productos</p>
      </footer>
    </div>
  );
}

export default App;
