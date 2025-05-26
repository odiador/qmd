import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCiudadano, actualizarCiudadano, eliminarCiudadano, fetchCarrosByCiudadano, fetchCarroDetalle } from '../services/api';
import Modal from './Modal';

interface Ciudadano {
    id: number;
    cedula: string;
    nombre: string;
    apellido: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    fechaNacimiento?: string;
    genero?: string;
    estado?: string;
}

interface Carro {
    id: number;
    codigo: string;
    estado?: string;
    fecha?: string;
}

interface CarroDetalleProducto {
    id: number;
    producto: {
        nombre: string;
        codigo?: string;
        precio?: number;
    };
    cantidad: number;
    subtotal: number;
}

interface CarroDetalle {
    carro?: {
        codigo?: string;
        id?: number;
        estado?: string;
        fecha?: string;
    };
    detalles?: CarroDetalleProducto[];
    total?: number;
    error?: string;
}

interface Props {
    ciudadanoId: string;
}

const DetalleCiudadano = ({ ciudadanoId }: Props) => {
    const navigate = useNavigate();
    const [ciudadano, setCiudadano] = useState<Ciudadano | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');
    const [carros, setCarros] = useState<Carro[]>([]);
    const [loadingCarros, setLoadingCarros] = useState(false);
    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        cedula: '',
        direccion: '',
        telefono: '',
        email: '',
        fechaNacimiento: '',
        genero: '',
        estado: '',
    });
    const [carroDetalle, setCarroDetalle] = useState<CarroDetalle | null>(null);
    const [carroDetalleOpen, setCarroDetalleOpen] = useState(false);
    const [carroDetalleLoading, setCarroDetalleLoading] = useState(false);

    useEffect(() => {
        // Verificar token de admin en localStorage
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            navigate('/admin-login');
            return;
        }

        setLoading(true);
        fetchCiudadano(ciudadanoId)
            .then(data => {
                setCiudadano(data);
                setForm({
                    nombre: data.nombre || '',
                    apellido: data.apellido || '',
                    cedula: data.cedula || '',
                    direccion: data.direccion || '',
                    telefono: data.telefono || '',
                    email: data.email || '',
                    fechaNacimiento: data.fechaNacimiento || '',
                    genero: data.genero || '',
                    estado: data.estado || '',
                });

                // Cargar carros del ciudadano
                setLoadingCarros(true);
                fetchCarrosByCiudadano(Number(ciudadanoId))
                    .then(carrosData => setCarros(carrosData))
                    .catch(() => setError('Error al cargar carros del ciudadano'))
                    .finally(() => setLoadingCarros(false));
            })
            .catch(() => setError('Error al cargar información del ciudadano'))
            .finally(() => setLoading(false));
    }, [ciudadanoId, navigate]);

    const handleSave = async () => {
        if (!ciudadano) return;

        setSaving(true);
        setError('');

        try {
            await actualizarCiudadano(Number(ciudadanoId), form);
            // Actualizar datos locales
            setCiudadano({ ...ciudadano, ...form });
            // Pequeño retraso para feedback visual
            setTimeout(() => setSaving(false), 500);
        } catch (err) {
            const ex = err as Error;
            console.error('Error al actualizar ciudadano:', ex);
            setError('Error al guardar cambios');
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!ciudadano || !window.confirm('¿Estás seguro de eliminar este ciudadano? Esta acción no se puede deshacer.')) return;

        setDeleting(true);
        setError('');

        try {
            await eliminarCiudadano(Number(ciudadanoId));
            navigate('/admin-panel');
        } catch (err) {
            const ex = err as Error;
            console.error('Error al eliminar ciudadano:', ex);
            setError('Error al eliminar ciudadano');
            setDeleting(false);
        }
    };

    const handleVerDetalleCarro = async (carroId: number) => {
        setCarroDetalleOpen(true);
        setCarroDetalleLoading(true);
        setCarroDetalle(null);
        try {
            const data = await fetchCarroDetalle(String(carroId));
            setCarroDetalle(data);
        } catch (e) {
            const ex = e as Error;
            console.error('Error al cargar detalle del carro:', ex);
            setCarroDetalle({ error: 'Error al cargar el detalle del carro' });
        } finally {
            setCarroDetalleLoading(false);
        }
    };

    if (loading) return <div className="max-w-3xl mx-auto mt-16 p-8 bg-white rounded shadow text-center">Cargando...</div>;
    if (!ciudadano) return <div className="max-w-3xl mx-auto mt-16 p-8 bg-white rounded shadow text-center text-red-500">No se encontró el ciudadano</div>;

    return (
        <div className="max-w-3xl mx-auto mt-16 p-8 bg-white rounded shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Detalle del Ciudadano</h2>
                <button
                    onClick={() => navigate('/admin-panel')}
                    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-gray-700 transition-colors"
                >
                    Volver al panel
                </button>
            </div>

            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                        type="text"
                        className="border p-2 rounded w-full"
                        value={form.nombre}
                        onChange={e => setForm({ ...form, nombre: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                    <input
                        type="text"
                        className="border p-2 rounded w-full"
                        value={form.apellido}
                        onChange={e => setForm({ ...form, apellido: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
                    <input
                        type="text"
                        className="border p-2 rounded w-full"
                        value={form.cedula}
                        onChange={e => setForm({ ...form, cedula: e.target.value })}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        className="border p-2 rounded w-full"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
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
                        <option value="">Selecciona estado</option>
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                        <option value="suspendido">Suspendido</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-3 justify-end">
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
                >
                    {deleting ? 'Eliminando...' : 'Eliminar ciudadano'}
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
                >
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
            </div>

            <hr className="my-8 border-gray-300" />

            <div>
                <h3 className="text-xl font-semibold mb-4">Información adicional</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {ciudadano.email && (
                        <div>
                            <span className="font-medium">Email:</span> {ciudadano.email}
                        </div>
                    )}
                    {ciudadano.direccion && (
                        <div>
                            <span className="font-medium">Dirección:</span> {ciudadano.direccion}
                        </div>
                    )}
                    {ciudadano.telefono && (
                        <div>
                            <span className="font-medium">Teléfono:</span> {ciudadano.telefono}
                        </div>
                    )}
                    {ciudadano.fechaNacimiento && (
                        <div>
                            <span className="font-medium">Fecha de nacimiento:</span> {ciudadano.fechaNacimiento}
                        </div>
                    )}
                    {ciudadano.genero && (
                        <div>
                            <span className="font-medium">Género:</span> {ciudadano.genero}
                        </div>
                    )}
                    {ciudadano.estado && (
                        <div>
                            <span className="font-medium">Estado:</span> {ciudadano.estado}
                        </div>
                    )}
                </div>
            </div>

            <hr className="my-8 border-gray-300" />

            <div>
                <h3 className="text-xl font-semibold mb-4">Carros de compra</h3>

                {loadingCarros ? (
                    <div className="text-center py-4">Cargando carros...</div>
                ) : carros.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 border text-left">ID</th>
                                    <th className="p-2 border text-left">Código</th>
                                    <th className="p-2 border text-left">Estado</th>
                                    <th className="p-2 border text-left">Fecha</th>
                                    <th className="p-2 border text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {carros.map(carro => (
                                    <tr key={carro.id} className="hover:bg-gray-50">
                                        <td className="p-2 border">{carro.id}</td>
                                        <td className="p-2 border">{carro.codigo}</td>
                                        <td className="p-2 border">{carro.estado || 'N/A'}</td>
                                        <td className="p-2 border">{carro.fecha || 'N/A'}</td>
                                        <td className="p-2 border text-center">
                                            <button
                                                className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                                                onClick={() => handleVerDetalleCarro(carro.id)}
                                            >
                                                Ver detalle
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="bg-gray-50 text-gray-500 p-4 rounded text-center">
                        Este ciudadano no tiene carros de compra registrados
                    </div>
                )}
                <Modal isOpen={carroDetalleOpen} onClose={() => setCarroDetalleOpen(false)} title="Detalle del Carro">
                    {carroDetalleLoading ? (
                        <div className="text-center py-8">Cargando detalle...</div>
                    ) : carroDetalle && carroDetalle.error ? (
                        <div className="text-red-500 text-center py-4">{carroDetalle.error}</div>
                    ) : carroDetalle ? (
                        <div>
                            <div className="mb-2 text-sm text-gray-700">Código: <span className="font-mono">{carroDetalle.carro?.codigo || carroDetalle.carro?.id}</span></div>
                            <div className="mb-2 text-sm text-gray-700">Estado: <span className="font-mono">{carroDetalle.carro?.estado || 'N/A'}</span></div>
                            <div className="mb-2 text-sm text-gray-700">Fecha: <span className="font-mono">{carroDetalle.carro?.fecha || 'N/A'}</span></div>
                            <table className="w-full border border-collapse mt-4">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-2 border text-left">Producto</th>
                                        <th className="p-2 border text-left">Precio</th>
                                        <th className="p-2 border text-left">Cantidad</th>
                                        <th className="p-2 border text-left">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {carroDetalle.detalles?.map((d: CarroDetalleProducto) => (
                                        <tr key={d.id}>
                                            <td className="p-2 border">
                                                <span className="font-medium">{d.producto?.nombre}</span>
                                                {d.producto?.codigo && (
                                                    <div className="text-xs text-gray-500">Código: {d.producto.codigo}</div>
                                                )}
                                            </td>
                                            <td className="p-2 border">${d.producto?.precio?.toLocaleString('es-CO')}</td>
                                            <td className="p-2 border">{d.cantidad}</td>
                                            <td className="p-2 border">${d.subtotal?.toLocaleString('es-CO')}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-indigo-50 font-bold">
                                        <td colSpan={3} className="text-right p-2 border">Total:</td>
                                        <td className="p-2 border">${carroDetalle.total?.toLocaleString('es-CO')}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ) : null}
                </Modal>
            </div>
        </div>
    );
};

export default DetalleCiudadano;
