import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const isAdmin = document.cookie.split('; ').find(row => row.startsWith('adminSession='));
    if (!isAdmin) {
      navigate('/admin-login');
    }
  }, [navigate]);

  return (
    <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Panel de Administración</h2>
      <p className="text-center">¡Bienvenido, administrador!</p>
      {/* Aquí puedes agregar las opciones de administración */}
    </div>
  );
};

export default AdminPanel;
