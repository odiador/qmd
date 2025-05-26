import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearCiudadano } from '../services/api';

const NuevoCiudadano = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        cedula: '',
        email: '',
        direccion: '',
        telefono: '',
        fechaNacimiento: '',
        genero: '',
        estado: 'activo'
    });

    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Verificar token de admin en localStorage
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            navigate('/admin-login');
        }
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validación básica
        if (!form.nombre || !form.apellido || !form.cedula) {
            setError('Los campos nombre, apellido y cédula son obligatorios');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const nuevoCiudadano = await crearCiudadano(form);
            navigate(`/admin-panel/ciudadano/${nuevoCiudadano.id}`);
        } catch (err) {
            const ex = err as Error;
            if (ex.message)
                setError(ex.message);
            else setError('Error al crear ciudadano');
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-16 p-8 bg-white rounded shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Nuevo Ciudadano</h2>
                <button
                    onClick={() => navigate('/admin-panel')}
                    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-gray-700 transition-colors"
                >
                    Volver al panel
                </button>
            </div>

            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                        <input
                            type="text"
                            className="border p-2 rounded w-full"
                            value={form.nombre}
                            onChange={e => setForm({ ...form, nombre: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                        <input
                            type="text"
                            className="border p-2 rounded w-full"
                            value={form.apellido}
                            onChange={e => setForm({ ...form, apellido: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cédula *</label>
                        <input
                            type="text"
                            className="border p-2 rounded w-full"
                            value={form.cedula}
                            onChange={e => setForm({ ...form, cedula: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="border p-2 rounded w-full"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                        <input
                            type="text"
                            className="border p-2 rounded w-full"
                            value={form.direccion}
                            onChange={e => setForm({ ...form, direccion: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <input
                            type="text"
                            className="border p-2 rounded w-full"
                            value={form.telefono}
                            onChange={e => setForm({ ...form, telefono: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
                        <input
                            type="date"
                            className="border p-2 rounded w-full"
                            value={form.fechaNacimiento}
                            onChange={e => setForm({ ...form, fechaNacimiento: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                        <select
                            className="border p-2 rounded w-full"
                            value={form.genero}
                            onChange={e => setForm({ ...form, genero: e.target.value })}
                        >
                            <option value="">Selecciona género</option>
                            <option value="masculino">Masculino</option>
                            <option value="femenino">Femenino</option>
                            <option value="otro">Otro</option>
                            <option value="no especifica">Prefiero no decir</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select
                            className="border p-2 rounded w-full"
                            value={form.estado}
                            onChange={e => setForm({ ...form, estado: e.target.value })}
                        >
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                            <option value="suspendido">Suspendido</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Creando...' : 'Crear ciudadano'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NuevoCiudadano;
