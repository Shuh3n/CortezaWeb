import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
    id: number;
    nombre: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: number | string | null;
    onChange: (id: number) => void;
    placeholder: string;
    label: string;
    icon: React.ElementType;
    required?: boolean;
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder,
    label,
    icon: Icon,
    required = false
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

    const selectedOption = options.find(opt => opt.id === Number(value));

    const filteredOptions = options.filter(opt =>
        opt.nombre.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                // Si el click es fuera del disparador también
                if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // Determinamos si hay más espacio arriba o abajo
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const dropdownHeight = Math.min(filteredOptions.length * 45 + 60, 300);

            if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
                // Abrir hacia arriba
                setDropdownStyle({
                    position: 'fixed',
                    top: rect.top - 8,
                    left: rect.left,
                    width: rect.width,
                    transform: 'translateY(-100%)',
                    zIndex: 9999
                });
            } else {
                // Abrir hacia abajo
                setDropdownStyle({
                    position: 'fixed',
                    top: rect.bottom + 8,
                    left: rect.left,
                    width: rect.width,
                    zIndex: 9999
                });
            }
        }
    }, [isOpen, filteredOptions.length]);

    // Cerrar si se hace scroll en el modal o ventana (opcional, pero recomendado para Portals)
    useEffect(() => {
        if (!isOpen) return;
        const handleScroll = () => {
            if (triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                setDropdownStyle(prev => ({
                    ...prev,
                    top: prev.transform ? rect.top - 8 : rect.bottom + 8,
                    left: rect.left,
                }));
            }
        };
        window.addEventListener('scroll', handleScroll, true);
        return () => window.removeEventListener('scroll', handleScroll, true);
    }, [isOpen]);

    return (
        <div className="flex flex-col">
            <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main">
                <Icon className="h-4 w-4 text-primary" /> {label} {required && '*'}
            </span>
            
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 text-sm font-bold text-text-h outline-none transition focus:border-primary cursor-pointer"
            >
                <span className={selectedOption ? 'text-text-h' : 'text-text-muted/60'}>
                    {selectedOption ? selectedOption.nombre : placeholder}
                </span>
                <ChevronDown className={`h-4 w-4 text-primary/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && createPortal(
                <div ref={dropdownRef} style={dropdownStyle} className="pointer-events-auto">
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-2xl"
                        >
                            <div className="p-2">
                                <div className="relative flex items-center rounded-xl bg-neutral-soft px-3 py-2 border border-primary/5 focus-within:border-primary/20">
                                    <Search className="h-4 w-4 text-primary/30" />
                                    <input
                                        type="text"
                                        autoFocus
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Buscar..."
                                        className="ml-2 w-full bg-transparent text-xs font-bold outline-none"
                                    />
                                </div>
                            </div>

                            <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map((opt) => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => {
                                                onChange(opt.id);
                                                setIsOpen(false);
                                                setSearch('');
                                            }}
                                            className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm font-bold transition hover:bg-primary/5 cursor-pointer ${
                                                Number(value) === opt.id ? 'bg-primary/10 text-primary' : 'text-text-h'
                                            }`}
                                        >
                                            {opt.nombre}
                                            {Number(value) === opt.id && <Check className="h-4 w-4" />}
                                        </button>
                                    ))
                                ) : (
                                    <p className="p-4 text-center text-xs font-bold text-text-muted opacity-50">Sin resultados</p>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>,
                document.body
            )}
        </div>
    );
}

