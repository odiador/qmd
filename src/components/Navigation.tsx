import { AnimatePresence, motion, useScroll } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { AiFillProduct } from 'react-icons/ai';
import { BiX } from 'react-icons/bi';
import { IoLogOut } from 'react-icons/io5';
import { PiShoppingCartFill } from 'react-icons/pi';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

interface Props {
    ciudadanoId: string;
    cerrarSesion: () => void;
    abrirCarro?: () => void; // Nuevo: función para abrir el modal del carro
}

const Navigation: React.FC<Props> = ({ ciudadanoId, cerrarSesion, abrirCarro }) => {
    const { scrollY } = useScroll();
    const [bgOpacity, setBgOpacity] = useState(0);
    const [calcHeight, setHeight] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();


    useEffect(() => {
        const unsubscribe = scrollY.on('change', (latest) => {
            setBgOpacity(latest < 50 ? 0 : 0.2);
            setHeight(latest < 50 ? 6 : 4);
        });
        return () => unsubscribe();
    }, [scrollY]);

    // Cerrar menú al hacer click fuera
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (showMenu && menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [showMenu]);

    return (
        <>
            <motion.nav
                className="bg-black z-[999] min-h-16 px-4 sm:px-8 md:px-16 py-2 fixed w-full top-0 left-0 hover:backdrop-blur-lg transition-all flex justify-center items-center"
                style={{
                    backgroundColor: `rgba(0,0,0,${0})`,
                    borderWidth: '0 0 1px 0',
                    height: `${calcHeight}rem`,
                    borderColor: bgOpacity ? 'rgba(0,0,0,0.1)' : 'transparent',
                    backdropFilter: `blur(${bgOpacity * 100}px)`,
                }}
            >
                <div className="flex justify-between items-center size-full max-w-4xl w-full">
                    <h1 className="text-3xl font-nanum text-center align-middle">
                        Quien Me Debe</h1>
                    <div className="flex gap-2 items-center">
                        {/* Menú de opciones (solo si NO hay sesión) */}
                        {!ciudadanoId && (
                            <div className="relative">
                                <button
                                    className="p-2 rounded-full hover:bg-neutral-100 transition-all focus:outline-none"
                                    onClick={() => setShowMenu((v) => !v)}
                                    aria-label="Más opciones"
                                    type="button"
                                >
                                    <BsThreeDotsVertical className="text-2xl text-black" />
                                </button>
                                {showMenu && (
                                    <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
                                        <button
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                                            onClick={() => {
                                                setShowMenu(false);
                                                navigate('/admin-login');
                                            }}
                                        >Modo administrador</button>
                                    </div>
                                )}
                            </div>
                        )}
                        {ciudadanoId && (
                            <nav className="flex text-black gap-10">
                                <button
                                    className="hover:scale-110 text-3xl transition-all cursor-pointer flex items-center gap-1"
                                    onClick={() => navigate('/productos')}
                                ><AiFillProduct />
                                <span className='hidden md:block text-xl'>Productos</span>
                                </button>
                                <button
                                    className="hover:scale-110 text-3xl transition-all cursor-pointer flex items-center gap-1"
                                    onClick={abrirCarro}
                                >
                                    <PiShoppingCartFill />
                                    <span className='hidden md:block text-xl'>Carrito</span>
                                </button>
                                <button
                                    className="hover:scale-110 text-3xl transition-all cursor-pointer flex items-center gap-1"
                                    onClick={cerrarSesion}
                                ><IoLogOut />
                                <span className='hidden md:block text-xl'>Cerrar Sesión</span>
                                </button>
                            </nav>
                        )}
                    </div>
                </div>
            </motion.nav>

            {/* MENÚ LATERAL MÓVIL */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        className="fixed z-[1000] top-0 left-0 h-full w-64 bg-black p-6 flex flex-col gap-6 font-questrial text-2xl leading-none"
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-white font-questrial text-lg font-semibold">Menú</span>
                            <button onClick={() => setIsMenuOpen(false)}>
                                <BiX className="text-3xl hover:scale-110 transition-all" />
                            </button>
                        </div>
                        <button onClick={() => { navigate('/productos'); setIsMenuOpen(false); }} className="hover:underline">Productos</button>
                        <button onClick={() => { navigate('/carro'); setIsMenuOpen(false); }} className="hover:underline">Carro</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navigation;
