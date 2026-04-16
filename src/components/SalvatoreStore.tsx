import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coffee,
  Thermometer,
  Shirt,
  Home,
  ShoppingCart,
  Send,
  MessageCircle,
  CheckCircle2,
  Info,
  BadgePercent,
  X,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/product';
import { PRODUCTS_BUCKET } from '../constants/products';

const getSupabaseImageUrl = (imagePath: string) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;

  const { data } = supabase.storage
    .from(PRODUCTS_BUCKET)
    .getPublicUrl(imagePath);

  return data.publicUrl;
};

const getVisiblePages = (current: number, total: number) => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, '...', total];
  if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
};

const SalvatoreStore = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mugs');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  const categories = [
    { id: 'mugs', name: 'Mugs', icon: Coffee },
    { id: 'termos', name: 'Termos', icon: Thermometer },
    { id: 'camisetas', name: 'Camisetas', icon: Shirt },
    { id: 'tipis', name: 'Tipis', icon: Home },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();

    // Sincronización en tiempo real
    const channel = supabase
      .channel('store-realtime')
      .on(
        'postgres_changes',
        { event: '*', table: 'products', schema: 'public' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newProduct = payload.new as Product;
            setProducts(prev => [...prev, newProduct].sort((a, b) => a.name.localeCompare(b.name)));
          } else if (payload.eventType === 'UPDATE') {
            const updatedProduct = payload.new as Product;
            setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
              .sort((a, b) => a.name.localeCompare(b.name)));
          } else if (payload.eventType === 'DELETE') {
            setProducts(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const groupedProducts = useMemo(() => {
    return products.reduce((acc, product) => {
      const cat = product.category || 'mugs';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [products]);

  const activeProducts = useMemo(() => {
    return groupedProducts[activeTab] || [];
  }, [groupedProducts, activeTab]);

  const totalPages = Math.ceil(activeProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return activeProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [activeProducts, currentPage]);

  return (
    <section id="tienda" className="py-24 bg-neutral-soft overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Store Header (Minimalist Premium) */}
        <div className="text-center mb-20 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 relative inline-block"
          >
            <img
              src="/images/salvatore-souvenirs-logo.png"
              alt="Salvatore Souvenirs"
              className="h-44 mx-auto relative z-10 hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-extrabold text-text-h mb-6 tracking-tight"
          >
            Tienda <span className="text-primary underline decoration-accent/30 decoration-8 underline-offset-8 italic">Salvatore</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Cada producto es una huella de amor. El 100% de las ganancias se destina a la transformación de vidas en nuestro refugio.
          </motion.p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              onClick={() => {
                setActiveTab(cat.id);
                setCurrentPage(1);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg ${activeTab === cat.id
                ? 'bg-primary text-white shadow-primary/20 ring-4 ring-primary/10'
                : 'bg-white text-text-muted hover:bg-neutral-soft shadow-sm border border-slate-100'
                }`}
            >
              <cat.icon size={20} />
              {cat.name}
            </motion.button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="min-h-[600px] relative">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 py-20">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-text-muted font-bold tracking-widest uppercase text-sm">Cargando catálogo...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product, idx) => (
                    <motion.div
                      key={product.id || idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedProduct(product)}
                      className={`bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 group hover:border-primary/20 transition-all cursor-pointer flex flex-col h-full relative ${product.stock === 0 ? 'grayscale-[0.5]' : ''}`}
                    >
                      <div className="aspect-[4/3] bg-neutral-soft relative overflow-hidden shrink-0">
                        {product.image ? (
                          <img
                            src={getSupabaseImageUrl(product.image)}
                            alt={product.name}
                            className={`w-full h-full object-cover transition-transform duration-700 ${product.stock > 0 ? 'group-hover:scale-110' : ''}`}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-primary/10">
                            {activeTab === 'mugs' && <Coffee size={80} strokeWidth={1} />}
                            {activeTab === 'termos' && <Thermometer size={80} strokeWidth={1} />}
                            {activeTab === 'camisetas' && <Shirt size={80} strokeWidth={1} />}
                            {activeTab === 'tipis' && <Home size={80} strokeWidth={1} />}
                          </div>
                        )}

                        {/* Stock Status Badge */}
                        <div className="absolute bottom-4 left-4 z-10">
                          {product.stock > 0 ? (
                            <span className="bg-white/90 backdrop-blur-md text-primary text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {product.stock} disponibles
                            </span>
                          ) : (
                            <span className="bg-red-500 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                              <AlertCircle size={12} /> Agotado
                            </span>
                          )}
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-4 right-4 bg-accent/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                          <BadgePercent size={14} /> Producto Social
                        </div>
                      </div>

                      <div className="p-8 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-2 gap-4">
                          <h3 className="text-xl font-bold text-text-h group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                          <span className="text-xl font-black text-primary whitespace-nowrap">
                            {product.price?.toString().startsWith('$') ? product.price : `$${product.price}`}
                          </span>
                        </div>
                        <p className="text-sm text-primary/80 font-semibold mb-4 flex items-center gap-2">
                          <ShoppingCart size={14} /> {product.spec}
                        </p>
                        <p className="text-text-muted text-sm leading-relaxed mb-8 line-clamp-2">
                          {product.detail}
                        </p>
                        <button
                          disabled={product.stock === 0}
                          className={`w-full mt-auto py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border ${product.stock > 0
                            ? 'bg-neutral-soft text-primary hover:bg-primary hover:text-white border-primary/10'
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                            }`}
                        >
                          {product.stock > 0 ? 'Ver detalle' : 'Sin Stock'} <Send size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center">
                    <p className="text-text-muted font-medium italic">Próximamente estaremos agregando nuevos productos a esta categoría.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Pagination Controls */}
          {!isLoading && totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center gap-2 mt-12"
            >
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-3 rounded-2xl bg-white border border-slate-200 text-text-h disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-soft hover:border-primary/20 transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex gap-2">
                {getVisiblePages(currentPage, totalPages).map((page, i) => (
                  <button
                    key={i}
                    onClick={() => typeof page === 'number' ? setCurrentPage(page) : undefined}
                    disabled={page === '...'}
                    className={`w-12 h-12 rounded-2xl font-bold transition-all shadow-sm ${page === '...'
                      ? 'bg-transparent text-text-muted border-none cursor-default shadow-none w-8'
                      : currentPage === page
                        ? 'bg-primary text-white shadow-primary/20 ring-4 ring-primary/10'
                        : 'bg-white text-text-muted border border-slate-200 hover:bg-neutral-soft hover:border-primary/20'
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-3 rounded-2xl bg-white border border-slate-200 text-text-h disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-soft hover:border-primary/20 transition-all shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </motion.div>
          )}
        </div>

        {/* Product Detail Modal */}
        <AnimatePresence>
          {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProduct(null)}
                className="absolute inset-0 bg-black/40 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-[40px] md:rounded-[56px] overflow-hidden shadow-2xl w-full max-w-5xl max-h-[90vh] relative z-10 flex flex-col md:flex-row"
              >
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-6 right-6 z-20 bg-black/10 hover:bg-black/20 text-text-h p-2 rounded-full transition-all"
                >
                  <X size={20} />
                </button>

                <div className="md:w-[45%] h-[300px] md:h-auto bg-neutral-soft relative overflow-hidden">
                  <img
                    src={getSupabaseImageUrl(selectedProduct.image)}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-6 left-6 bg-accent text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg uppercase tracking-wider">
                    Salvatore Souvenirs
                  </div>
                </div>

                <div className="md:w-[55%] p-8 md:p-14 overflow-y-auto">
                  <div className="flex justify-between items-start gap-4 mb-6">
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-h leading-tight">
                      {selectedProduct.name}
                    </h3>
                    <div className="bg-primary/10 px-4 py-2 rounded-2xl shrink-0 border border-primary/20">
                      <span className="text-2xl md:text-3xl font-black text-primary">
                        {selectedProduct.price?.toString().startsWith('$') ? selectedProduct.price : `$${selectedProduct.price}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-8">
                    <div className="bg-primary/5 border border-primary/10 rounded-[24px] p-5 flex-1 min-w-[150px]">
                      <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1 opacity-70">Especificaciones</p>
                      <p className="text-text-h font-bold text-lg">{selectedProduct.spec}</p>
                    </div>
                    <div className={`rounded-[24px] p-5 flex-1 min-w-[150px] border ${selectedProduct.stock > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70 ${selectedProduct.stock > 0 ? 'text-emerald-700' : 'text-red-700'}`}>Disponibilidad</p>
                      <p className={`font-bold text-lg ${selectedProduct.stock > 0 ? 'text-emerald-900' : 'text-red-900'}`}>
                        {selectedProduct.stock > 0 ? `${selectedProduct.stock} unidades` : 'Agotado'}
                      </p>
                    </div>
                  </div>

                  <div className="mb-10">
                    <p className="text-text-muted text-lg leading-relaxed mb-6">
                      {selectedProduct.detail}
                    </p>
                    <div className="bg-neutral-soft p-5 rounded-2xl flex items-start gap-3">
                      <Info className="text-primary mt-1 shrink-0" size={18} />
                      <p className="text-text-muted text-sm italic leading-relaxed">
                        Cada compra ayuda directamente al refugio. El 100% de las ganancias se destina a alimentación y salud animal.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button
                      disabled={selectedProduct.stock === 0}
                      onClick={() => {
                        const message = encodeURIComponent(`¡Hola! Me interesa el producto: ${selectedProduct.name}`);
                        window.open(`https://wa.me/573148114884?text=${message}`, '_blank');
                      }}
                      className={`w-full py-5 rounded-[24px] font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-xl ${selectedProduct.stock > 0
                        ? 'bg-primary text-white shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        }`}
                    >
                      {selectedProduct.stock > 0 ? 'Pedir por WhatsApp' : 'Producto Agotado'} <MessageCircle size={22} />
                    </button>
                    <p className="text-center text-xs text-text-muted font-medium opacity-60">
                      Disponibilidad inmediata para envíos nacionales
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Special Info (Section footer) */}
        <AnimatePresence>
          {activeTab === 'tipis' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-16"
            >
              <div className="grid md:grid-cols-2 gap-8 items-stretch">
                {/* Armado Card */}
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl flex flex-col h-full">
                  <h4 className="text-2xl font-bold text-text-h mb-8 flex items-center gap-3">
                    <Info className="text-primary" /> Instrucciones de Armado
                  </h4>
                  <ul className="space-y-6 flex-1">
                    {[
                      'Sacar el teepee de su bolsa protectora e identificar los palos.',
                      'Acomodar la colchoneta acolchada en su lugar definitivo.',
                      'Insertar los palos por las guías y abrir la carpa sobre la base.',
                      'Amarrar firmemente las tiras de seguridad superiores.'
                    ].map((step, i) => (
                      <li key={i} className="flex gap-4 text-text-muted font-medium items-start">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">{i + 1}</span>
                        <p className="leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Medidas Card */}
                <div className="bg-neutral-soft p-10 rounded-[40px] border border-slate-200/50 flex flex-col h-full">
                  <h4 className="text-2xl font-bold text-text-h mb-8 flex items-center gap-3">
                    <BadgePercent className="text-primary" /> Medidas Disponibles
                  </h4>
                  <div className="grid grid-cols-1 gap-4 flex-1">
                    {[
                      { t: 'S (Pequeño)', m: '60 x 50 cm', h: '90cm' },
                      { t: 'M (Mediano)', m: '68 x 54 cm', h: '1mt' },
                      { t: 'L (Grande)', m: '75 x 64 cm', h: '1.10mt' }
                    ].map((size) => (
                      <div key={size.t} className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl flex justify-between items-center shadow-sm border border-white group hover:bg-white hover:scale-[1.02] transition-all duration-300">
                        <div>
                          <p className="font-bold text-text-h">{size.t}</p>
                          <p className="text-xs text-text-muted font-semibold tracking-wide uppercase">Altura: {size.h}</p>
                        </div>
                        <span className="text-primary font-bold text-lg">{size.m}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-8 text-xs text-text-muted italic leading-relaxed text-center font-medium opacity-70">
                    * Todos nuestros teepees son fabricados de forma artesanal con materiales de alta densidad para máxima durabilidad.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'camisetas' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-16 bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl overflow-x-auto"
            >
              <h4 className="text-2xl font-bold text-text-h mb-8 flex items-center gap-3">
                <Shirt className="text-primary" /> Guía de Tallas (cm)
              </h4>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-primary border-b border-slate-100">
                    <th className="py-4 px-4">Talla</th>
                    <th className="py-4 px-4">Largo Cuerpo</th>
                    <th className="py-4 px-4">Ancho Cuerpo</th>
                    <th className="py-4 px-4">Hombro</th>
                    <th className="py-4 px-4">Manga</th>
                  </tr>
                </thead>
                <tbody className="text-text-muted font-medium">
                  {[
                    ['S', '58', '39', '7', '10'],
                    ['M', '62', '41', '7', '11'],
                    ['L', '64', '42', '8', '12'],
                    ['XL', '65', '44', '9', '14'],
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-neutral-soft transition-colors leading-6">
                      <td className="py-4 px-4 font-bold text-primary">{row[0]}</td>
                      <td className="py-4 px-4">{row[1]}</td>
                      <td className="py-4 px-4">{row[2]}</td>
                      <td className="py-4 px-4">{row[3]}</td>
                      <td className="py-4 px-4">{row[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Donation/Salvatón Banner */}
        <div className="mt-24 grid lg:grid-cols-2 gap-8">
          <div className="bg-primary rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl shadow-primary/30">
            <div className="relative z-10">
              <span className="inline-block px-4 py-1 bg-white/10 rounded-full text-xs font-bold mb-4 uppercase tracking-widest">Iniciativa Solidaria</span>
              <h3 className="text-3xl font-bold mb-6">Salvatón Animal</h3>
              <p className="text-primary-foreground/90 text-lg leading-relaxed mb-10">
                Sostener el refugio no es fácil. Tenemos deudas veterinarias y necesitamos adecuaciones constantes. ¿Contamos contigo?
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-primary-dark/30 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                  <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center font-bold">D</div>
                  <div>
                    <p className="text-xs opacity-70">Nequi / Daviplata</p>
                    <p className="font-bold">314 811 48 84</p>
                  </div>
                </div>
              </div>
            </div>
            <PawIcon className="absolute -bottom-12 -right-12 w-64 h-64 text-white/5 rotate-12" />
          </div>

          <div className="bg-white rounded-[48px] p-12 border border-slate-100 shadow-xl relative overflow-hidden group">
            <h3 className="text-3xl font-bold text-text-h mb-6">Haz tu Pedido</h3>
            <p className="text-text-muted text-lg mb-10 leading-relaxed">
              Nuestros productos son personalizados. Envíanos un mensaje y nos pondremos en contacto para coordinar los diseños y la entrega.
            </p>
            <form className="space-y-4">
              <input type="text" placeholder="Tu Nombre" className="w-full bg-neutral-soft border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              <input type="email" placeholder="Correo Electrónico" className="w-full bg-neutral-soft border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              <textarea placeholder="¿Qué producto te interesa?" rows={3} className="w-full bg-neutral-soft border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"></textarea>
              <button className="w-full bg-primary text-white py-5 rounded-[24px] font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-3">
                Enviar Mensaje <Send size={20} />
              </button>
            </form>
          </div>
        </div>

        {/* Quality Seal integrated */}
        <div className="mt-16 flex justify-center">
          <div className="flex items-center gap-4 text-text-muted font-bold bg-white px-8 py-4 rounded-full border border-slate-100 shadow-sm">
            <CheckCircle2 className="text-primary" />
            <p>100% materiales de calidad y sentido social</p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Internal Decorative Components
const PawIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 8.3 8.3 9.8 9.5 10.7C10.2 11.2 11.1 11.5 12 11.5C12.9 11.5 13.8 11.2 14.5 10.7C15.7 9.8 16.5 8.3 16.5 6.5C16.5 4 14.5 2 12 2ZM5.5 11C4.1 11 3 12.1 3 13.5C3 14.9 4.1 16 5.5 16C6.9 16 8 14.9 8 13.5C8 12.1 6.9 11 5.5 11ZM18.5 11C17.1 11 16 12.1 16 13.5C16 14.9 17.1 16 18.5 16C19.9 16 21 14.9 21 13.5C21 12.1 19.9 11 18.5 11ZM12 13C10.3 13 9 14.3 9 16C9 17.7 10.3 19 12 19C13.7 19 15 17.7 15 16C15 14.3 13.7 13 12 13ZM12 20C10.3 20 9 21.3 9 23H15C15 21.3 13.7 20 12 20Z" />
  </svg>
);

export default SalvatoreStore;
