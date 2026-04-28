import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
  ChevronRight,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/product';
import { PRODUCTS_BUCKET } from '../constants/products';

const getSupabaseImageUrl = (imagePath: string) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;

  const { data } = supabase.storage.from(PRODUCTS_BUCKET).getPublicUrl(imagePath);
  return data.publicUrl;
};

const getVisiblePages = (current: number, total: number) => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, '...', total];
  if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
};

const SalvatoreStore = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mugs');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  const categories = [
    { id: 'mugs', name: t('tienda.categorias.mugs'), icon: Coffee },
    { id: 'termos', name: t('tienda.categorias.termos'), icon: Thermometer },
    { id: 'camisetas', name: t('tienda.categorias.camisetas'), icon: Shirt },
    { id: 'tipis', name: t('tienda.categorias.tipis'), icon: Home },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.from('products').select('*').order('name', { ascending: true });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();

    const channel = supabase
      .channel('store-realtime')
      .on('postgres_changes', { event: '*', table: 'products', schema: 'public' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newProduct = payload.new as Product;
          setProducts((prev) => [...prev, newProduct].sort((a, b) => a.name.localeCompare(b.name)));
        } else if (payload.eventType === 'UPDATE') {
          const updatedProduct = payload.new as Product;
          setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)).sort((a, b) => a.name.localeCompare(b.name)));
          setSelectedProduct((prev) => (prev?.id === updatedProduct.id ? updatedProduct : prev));
        } else if (payload.eventType === 'DELETE') {
          setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
        }
      })
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

  const activeProducts = useMemo(() => groupedProducts[activeTab] || [], [groupedProducts, activeTab]);
  const totalPages = Math.ceil(activeProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return activeProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [activeProducts, currentPage]);

  const tipiSteps = t('tienda.tipis.pasos', { returnObjects: true }) as string[];
  const tshirtColumns = t('tienda.camisetas.columnas', { returnObjects: true }) as string[];

  return (
    <section id="tienda" className="overflow-hidden bg-neutral-soft py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mb-8 inline-block"
          >
            <img
              src="/images/salvatore-souvenirs-logo.png"
              alt="Salvatore Souvenirs"
              className="mx-auto h-44 relative z-10 drop-shadow-2xl transition-transform duration-500 hover:scale-105"
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 text-4xl font-extrabold tracking-tight text-text-h md:text-6xl"
          >
            {t('tienda.titulo')} <span className="italic underline decoration-8 decoration-accent/30 underline-offset-8 text-primary">Salvatore</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-2xl text-xl font-medium leading-relaxed text-text-muted"
          >
            {t('tienda.descripcion')}
          </motion.p>
        </div>

        <div className="mb-16 flex flex-wrap justify-center gap-4">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              onClick={() => {
                setActiveTab(cat.id);
                setCurrentPage(1);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-3 rounded-2xl px-8 py-4 font-bold transition-all duration-300 shadow-lg ${activeTab === cat.id
                ? 'bg-primary text-white shadow-primary/20 ring-4 ring-primary/10'
                : 'border border-slate-100 bg-white text-text-muted shadow-sm hover:bg-neutral-soft'
                }`}
            >
              <cat.icon size={20} />
              {cat.name}
            </motion.button>
          ))}
        </div>

        <div className="relative min-h-[600px]">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm font-bold uppercase tracking-widest text-text-muted">{t('tienda.estados.cargando')}</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
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
                      className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-xl shadow-slate-200/50 transition-all hover:border-primary/20 ${product.stock === 0 ? 'grayscale-[0.5]' : ''}`}
                    >
                      <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-neutral-soft">
                        {product.image ? (
                          <img
                            src={getSupabaseImageUrl(product.image)}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
                            fetchPriority="low"
                            className={`h-full w-full object-cover transition-transform duration-700 ${product.stock > 0 ? 'group-hover:scale-110' : ''}`}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-primary/10">
                            {activeTab === 'mugs' && <Coffee size={80} strokeWidth={1} />}
                            {activeTab === 'termos' && <Thermometer size={80} strokeWidth={1} />}
                            {activeTab === 'camisetas' && <Shirt size={80} strokeWidth={1} />}
                            {activeTab === 'tipis' && <Home size={80} strokeWidth={1} />}
                          </div>
                        )}

                        <div className="absolute bottom-4 left-4 z-10">
                          {product.stock > 0 ? (
                            <span className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase text-primary shadow-sm backdrop-blur-md">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {product.stock} {t('tienda.estados.disponibles')}
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 rounded-full bg-red-500 px-3 py-1.5 text-[10px] font-black uppercase text-white shadow-lg">
                              <AlertCircle size={12} /> {t('tienda.estados.agotado')}
                            </span>
                          )}
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-accent/90 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
                          <BadgePercent size={14} /> {t('tienda.estados.producto_social')}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-8">
                        <div className="mb-2 flex items-start justify-between gap-4">
                          <h3 className="text-xl font-bold text-text-h transition-colors group-hover:text-primary">{product.name}</h3>
                          <span className="whitespace-nowrap text-xl font-black text-primary">
                            {product.price?.toString().startsWith('$') ? product.price : `$${product.price}`}
                          </span>
                        </div>
                        <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary/80">
                          <ShoppingCart size={14} /> {product.spec}
                        </p>
                        <p className="mb-8 line-clamp-2 text-sm leading-relaxed text-text-muted">{product.detail}</p>
                        <button
                          disabled={product.stock === 0}
                          className={`mt-auto flex w-full items-center justify-center gap-2 rounded-2xl border py-4 font-bold transition-all ${product.stock > 0
                            ? 'border-primary/10 bg-neutral-soft text-primary hover:bg-primary hover:text-white'
                            : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                            }`}
                        >
                          {product.stock > 0 ? t('tienda.estados.ver_detalle') : t('tienda.estados.sin_stock')} <Send size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center">
                    <p className="font-medium italic text-text-muted">{t('tienda.estados.proximamente')}</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {!isLoading && totalPages > 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-2xl border border-slate-200 bg-white p-3 text-text-h shadow-sm transition-all hover:border-primary/20 hover:bg-neutral-soft disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex gap-2">
                {getVisiblePages(currentPage, totalPages).map((page, i) => (
                  <button
                    key={i}
                    onClick={() => (typeof page === 'number' ? setCurrentPage(page) : undefined)}
                    disabled={page === '...'}
                    className={`h-12 w-12 rounded-2xl font-bold shadow-sm transition-all ${page === '...'
                      ? 'w-8 cursor-default border-none bg-transparent text-text-muted shadow-none'
                      : currentPage === page
                        ? 'bg-primary text-white shadow-primary/20 ring-4 ring-primary/10'
                        : 'border border-slate-200 bg-white text-text-muted hover:border-primary/20 hover:bg-neutral-soft'
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-2xl border border-slate-200 bg-white p-3 text-text-h shadow-sm transition-all hover:border-primary/20 hover:bg-neutral-soft disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </motion.div>
          )}
        </div>

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
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[40px] bg-white shadow-2xl md:flex-row md:rounded-[56px]"
              >
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute right-6 top-6 z-20 rounded-full bg-black/10 p-2 text-text-h transition-all hover:bg-black/20"
                >
                  <X size={20} />
                </button>

                <div className="relative h-[300px] overflow-hidden bg-neutral-soft md:h-auto md:w-[45%]">
                  <img
                    src={getSupabaseImageUrl(selectedProduct.image)}
                    alt={selectedProduct.name}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-6 top-6 rounded-full bg-accent px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                    Salvatore Souvenirs
                  </div>
                </div>

                <div className="overflow-y-auto p-8 md:w-[55%] md:p-14">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <h3 className="text-3xl font-bold leading-tight text-text-h md:text-4xl lg:text-5xl">{selectedProduct.name}</h3>
                    <div className="shrink-0 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2">
                      <span className="text-2xl font-black text-primary md:text-3xl">
                        {selectedProduct.price?.toString().startsWith('$') ? selectedProduct.price : `$${selectedProduct.price}`}
                      </span>
                    </div>
                  </div>

                  <div className="mb-8 flex flex-wrap gap-4">
                    <div className="min-w-[150px] flex-1 rounded-[24px] border border-primary/10 bg-primary/5 p-5">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-primary/70">{t('tienda.modal.especificaciones')}</p>
                      <p className="text-lg font-bold text-text-h">{selectedProduct.spec}</p>
                    </div>
                    <div className={`min-w-[150px] flex-1 rounded-[24px] border p-5 ${selectedProduct.stock > 0 ? 'border-emerald-100 bg-emerald-50' : 'border-red-100 bg-red-50'}`}>
                      <p className={`mb-1 text-[10px] font-bold uppercase tracking-widest opacity-70 ${selectedProduct.stock > 0 ? 'text-emerald-700' : 'text-red-700'}`}>{t('tienda.modal.disponibilidad')}</p>
                      <p className={`text-lg font-bold ${selectedProduct.stock > 0 ? 'text-emerald-900' : 'text-red-900'}`}>
                        {selectedProduct.stock > 0 ? `${selectedProduct.stock} ${t('tienda.estados.unidades')}` : t('tienda.estados.agotado')}
                      </p>
                    </div>
                  </div>

                  <div className="mb-10">
                    <p className="mb-6 text-lg leading-relaxed text-text-muted">{selectedProduct.detail}</p>
                    <div className="flex items-start gap-3 rounded-2xl bg-neutral-soft p-5">
                      <Info className="shrink-0 text-primary mt-1" size={18} />
                      <p className="text-sm italic leading-relaxed text-text-muted">{t('tienda.modal.info')}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button
                      disabled={selectedProduct.stock === 0}
                      onClick={() => {
                        const message = encodeURIComponent(`${t('tienda.modal.whatsapp_msg')} ${selectedProduct.name}`);
                        window.open(`https://wa.me/573148114884?text=${message}`, '_blank');
                      }}
                      className={`flex w-full items-center justify-center gap-3 rounded-[24px] py-5 text-lg font-bold transition-all shadow-xl ${selectedProduct.stock > 0
                        ? 'bg-primary text-white shadow-primary/20 hover:-translate-y-1 hover:shadow-primary/40'
                        : 'cursor-not-allowed bg-slate-200 text-slate-400 shadow-none'
                        }`}
                    >
                      {selectedProduct.stock > 0 ? t('tienda.modal.btn_pedir') : t('tienda.modal.btn_agotado')} <MessageCircle size={22} />
                    </button>
                    <p className="text-center text-xs font-medium text-text-muted opacity-60">{t('tienda.modal.envio')}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {activeTab === 'tipis' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-16">
              <div className="grid gap-8 md:grid-cols-2 items-stretch">
                <div className="flex h-full flex-col rounded-[40px] border border-slate-100 bg-white p-10 shadow-xl">
                  <h4 className="mb-8 flex items-center gap-3 text-2xl font-bold text-text-h">
                    <Info className="text-primary" /> {t('tienda.tipis.armado_titulo')}
                  </h4>
                  <ul className="flex-1 space-y-6">
                    {tipiSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-4 font-medium text-text-muted">
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{i + 1}</span>
                        <p className="leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex h-full flex-col rounded-[40px] border border-slate-200/50 bg-neutral-soft p-10">
                  <h4 className="mb-8 flex items-center gap-3 text-2xl font-bold text-text-h">
                    <BadgePercent className="text-primary" /> {t('tienda.tipis.medidas_titulo')}
                  </h4>
                  <div className="grid flex-1 grid-cols-1 gap-4">
                    {[
                      { t: t('tienda.tipis.tallas.s'), m: '60 x 50 cm', h: '90cm' },
                      { t: t('tienda.tipis.tallas.m'), m: '68 x 54 cm', h: '1mt' },
                      { t: t('tienda.tipis.tallas.l'), m: '75 x 64 cm', h: '1.10mt' },
                    ].map((size) => (
                      <div key={size.t} className="group flex items-center justify-between rounded-2xl border border-white bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:bg-white">
                        <div>
                          <p className="font-bold text-text-h">{size.t}</p>
                          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{t('tienda.tipis.altura')}: {size.h}</p>
                        </div>
                        <span className="text-lg font-bold text-primary">{size.m}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-8 text-center text-xs font-medium italic leading-relaxed text-text-muted opacity-70">{t('tienda.tipis.disclaimer')}</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'camisetas' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-16 overflow-x-auto rounded-[40px] border border-slate-100 bg-white p-10 shadow-2xl">
              <h4 className="mb-8 flex items-center gap-3 text-2xl font-bold text-text-h">
                <Shirt className="text-primary" /> {t('tienda.camisetas.guia_titulo')}
              </h4>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-primary">
                    {tshirtColumns.map((col, idx) => (
                      <th key={idx} className="px-4 py-4">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-medium text-text-muted">
                  {[
                    ['S', '58', '39', '7', '10'],
                    ['M', '62', '41', '7', '11'],
                    ['L', '64', '42', '8', '12'],
                    ['XL', '65', '44', '9', '14'],
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-slate-50 leading-6 transition-colors hover:bg-neutral-soft">
                      <td className="px-4 py-4 font-bold text-primary">{row[0]}</td>
                      <td className="px-4 py-4">{row[1]}</td>
                      <td className="px-4 py-4">{row[2]}</td>
                      <td className="px-4 py-4">{row[3]}</td>
                      <td className="px-4 py-4">{row[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-24 grid gap-8 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-[48px] bg-primary p-12 text-white shadow-2xl shadow-primary/30">
            <div className="relative z-10">
              <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-bold uppercase tracking-widest">{t('tienda.banner.etiqueta')}</span>
              <h3 className="mb-6 text-3xl font-bold">{t('tienda.banner.titulo')}</h3>
              <p className="mb-10 text-lg leading-relaxed text-primary-foreground/90">{t('tienda.banner.descripcion')}</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-primary-dark/30 p-4 backdrop-blur-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 font-bold">D</div>
                  <div>
                    <p className="text-xs opacity-70">Nequi / Daviplata</p>
                    <p className="font-bold">314 811 48 84</p>
                  </div>
                </div>
              </div>
            </div>
            <PawIcon className="absolute -bottom-12 -right-12 h-64 w-64 rotate-12 text-white/5" />
          </div>

          <div className="relative overflow-hidden rounded-[48px] border border-slate-100 bg-white p-12 shadow-xl">
            <h3 className="mb-6 text-3xl font-bold text-text-h">Pedidos y consultas</h3>
            <p className="mb-10 text-lg leading-relaxed text-text-muted">
              Revisa los productos disponibles, entra a la ficha de cada uno y pide por WhatsApp desde el detalle.
              Si necesitas ayuda para elegir, sigue estos pasos rápidos.
            </p>

            <div className="space-y-4">
              {[
                'Selecciona la categoría que te interesa.',
                'Abre el producto para revisar stock, detalle y precio.',
                'Haz el pedido directamente por WhatsApp desde la ficha.',
              ].map((step, index) => (
                <div key={step} className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-neutral-soft px-5 py-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-white">{index + 1}</span>
                  <p className="pt-1 text-sm font-medium leading-relaxed text-text-muted">{step}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-4 text-sm text-text-muted">
                <CheckCircle2 className="text-primary" size={18} />
                Atención personalizada en horario administrativo.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex justify-center">
          <div className="flex items-center gap-4 rounded-full border border-slate-100 bg-white px-8 py-4 font-bold text-text-muted shadow-sm">
            <CheckCircle2 className="text-primary" />
            <p>{t('tienda.sello')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const PawIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 8.3 8.3 9.8 9.5 10.7C10.2 11.2 11.1 11.5 12 11.5C12.9 11.5 13.8 11.2 14.5 10.7C15.7 9.8 16.5 8.3 16.5 6.5C16.5 4 14.5 2 12 2ZM5.5 11C4.1 11 3 12.1 3 13.5C3 14.9 4.1 16 5.5 16C6.9 16 8 14.9 8 13.5C8 12.1 6.9 11 5.5 11ZM18.5 11C17.1 11 16 12.1 16 13.5C16 14.9 17.1 16 18.5 16C19.9 16 21 14.9 21 13.5C21 12.1 19.9 11 18.5 11ZM12 13C10.3 13 9 14.3 9 16C9 17.7 10.3 19 12 19C13.7 19 15 17.7 15 16C15 14.3 13.7 13 12 13ZM12 20C10.3 20 9 21.3 9 23H15C15 21.3 13.7 20 12 20Z" />
  </svg>
);

export default SalvatoreStore;