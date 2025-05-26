import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../services/api';

// Nuevo componente para login de administrador
const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginAdmin(email, password);
      setLoading(false);
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        navigate('/admin-panel');
      } else {
        setError('No se recibió token de autenticación');
      }
    } catch (err) {
      setLoading(false);
      if (err instanceof Error) {
        setError(err.message || 'Error de autenticación');
      } else {
        setError('Error de autenticación');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Login Administrador</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="text-sm font-medium text-gray-700">Correo electrónico
          <input
            type="email"
            className="border p-2 rounded w-full mt-1"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
        </label>
        <label className="text-sm font-medium text-gray-700">Contraseña
          <input
            type="password"
            className="border p-2 rounded w-full mt-1"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 disabled:opacity-50"
          disabled={loading}
        >{loading ? 'Ingresando...' : 'Ingresar'}</button>
      </form>
    </div>
  );
};

export default AdminLogin;