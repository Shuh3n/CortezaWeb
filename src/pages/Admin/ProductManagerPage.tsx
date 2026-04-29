import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  PlusCircle,
  Search,
  PencilLine,
  Trash2,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2,
  Filter,
  SlidersHorizontal,
  Type,
  Tag,
  ImageUp,
  Ruler,
  DollarSign,
  FileText,
  Package
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types/product';
import { PRODUCTS_BUCKET, buildProductStoragePath } from '../../constants/products';

export default function AdminProductManagerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchName, setSearchName] = useState('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    spec: '',
    detail: '',
    price: 'Consultar',
    category: 'mugs',
    stock: 0
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dropdown state management
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
  const [isSortFilterOpen, setIsSortFilterOpen] = useState(false);
  const [isModalCategoryOpen, setIsModalCategoryOpen] = useState(false);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const [filterCategoryRect, setFilterCategoryRect] = useState<DOMRect | null>(null);
  const [filterSortRect, setFilterSortRect] = useState<DOMRect | null>(null);

  const categoryFilterTriggerRef = useRef<HTMLButtonElement>(null);
  const sortFilterTriggerRef = useRef<HTMLButtonElement>(null);
  const modalCategoryRef = useRef<HTMLDivElement>(null);
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null);

  const categories = [
    { id: 'mugs', name: 'Mugs' },
    { id: 'termos', name: 'Termos' },
    { id: 'camisetas', name: 'Camisetas' },
    { id: 'tipis', name: 'Tipis' },
  ];

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      // Implementamos un límite razonable para el administrador también
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200); // Límite de seguridad

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setFeedback({ type: 'error', msg: 'No se pudieron cargar los productos.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalCategoryRef.current && !modalCategoryRef.current.contains(event.target as Node)) {
        setIsModalCategoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchProducts();

    // Real-time synchronization
    const channel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        { event: '*', table: 'products', schema: 'public' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProducts(prev => [payload.new as Product, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setProducts(prev => prev.map(p => p.id === payload.new.id ? payload.new as Product : p));
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

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchName.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Sorting logic
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'stock-asc':
          return a.stock - b.stock;
        case 'stock-desc':
          return b.stock - a.stock;
        case 'newest':
          return (b.created_at || '').localeCompare(a.created_at || '');
        case 'oldest':
          return (a.created_at || '').localeCompare(b.created_at || '');
        default:
          return 0;
      }
    });

    return result;
  }, [products, activeCategory, searchName, sortBy]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchName, sortBy]);

  // Auto-hide feedback notifications after 3.5 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handleOpenModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
      setImagePreview(getProductImageUrl(product.image));
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        spec: '',
        detail: '',
        price: 'Consultar',
        category: 'mugs',
        stock: 0
      });
      setImagePreview(null);
    }
    setUploadFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({});
    setUploadFile(null);
    setImagePreview(null);
    setUploadProgress(0);
  };

  const processImageFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      setUploadFile(file);
      setImagePreview(URL.createObjectURL(file));
      setIsDragOver(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processImageFile(files[0]);
    }
  };

  const getProductImageUrl = (image: string) => {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    const { data } = supabase.storage.from(PRODUCTS_BUCKET).getPublicUrl(image);
    return data.publicUrl;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    setUploadProgress(10);

    try {
      let imageName = formData.image || '';

      // Upload image if new file selected
      if (uploadFile) {
        setUploadProgress(30);
        const fileName = buildProductStoragePath(uploadFile.name);

        const { error: uploadError } = await supabase.storage
          .from(PRODUCTS_BUCKET)
          .upload(fileName, uploadFile!);

        if (uploadError) throw uploadError;
        imageName = fileName;
        setUploadProgress(60);
      }

      // Clean data for Supabase

      const productData = {
        name: formData.name,
        spec: formData.spec,
        detail: formData.detail,
        price: formData.price,
        image: imageName,
        category: formData.category,
        stock: isNaN(Number(formData.stock)) ? 0 : Number(formData.stock)
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        if (error) throw error;
        setFeedback({ type: 'success', msg: 'Producto actualizado correctamente.' });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        if (error) throw error;
        setFeedback({ type: 'success', msg: 'Producto creado correctamente.' });
      }

      setUploadProgress(100);
      setTimeout(() => {
        closeModal();
        // El real-time listener actualizará automáticamente la lista
      }, 500);

    } catch (error) {
      console.error('Error saving product:', error);
      setFeedback({ type: 'error', msg: 'Ocurrió un error al guardar el producto.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', pendingDelete?.id);

      if (error) throw error;
      setFeedback({ type: 'success', msg: 'Producto eliminado.' });
      setProducts(products.filter(p => p.id !== pendingDelete?.id));
      setPendingDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      setFeedback({ type: 'error', msg: 'No se pudo eliminar el producto.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }} className="space-y-8">
      {/* Floating Toast Notification */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
            className={`fixed top-6 right-6 z-[200] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${feedback.type === 'success'
              ? 'bg-emerald-50/90 border-emerald-100 text-emerald-800'
              : 'bg-red-50/90 border-red-100 text-red-800'
              }`}
          >
            <div className={`p-2 rounded-xl ${feedback.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
              }`}>
              {feedback.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            <div className="flex flex-col">
              <p className="font-black text-sm uppercase tracking-widest leading-none mb-1">
                {feedback.type === 'success' ? 'Éxito' : 'Error'}
              </p>
              <p className="text-sm font-bold opacity-80">{feedback.msg}</p>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="ml-4 opacity-40 hover:opacity-100 transition-opacity"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Header Section */}
      <section className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,_rgba(45,90,39,1),_rgba(139,69,19,0.95))] px-6 py-10 text-white shadow-2xl shadow-primary/20 sm:px-10">
        <motion.div animate={{ scale: [1, 1.06, 1], opacity: [0.18, 0.28, 0.18] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/70">Tienda</p>
            <h1 className="mt-3 text-4xl font-black md:text-5xl">Gestión de Productos</h1>
            <p className="mt-4 max-w-2xl text-lg text-white/85">Crea, edita y controla el inventario de la Fundación Salvatore desde un solo lugar.</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-white px-8 text-base font-black text-primary shadow-xl transition-all hover:scale-[1.03] active:scale-95 whitespace-nowrap"
          >
            <PlusCircle size={24} />
            Nuevo Producto
          </button>
        </div>
      </section>

      {/* Filters & Search Card */}
      <div className="bg-white rounded-[28px] border border-primary/5 p-6 shadow-lg shadow-primary/5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full h-12 pl-12 pr-5 rounded-2xl border border-primary/10 bg-neutral-soft/50 text-sm font-bold text-text-h outline-none focus:border-primary focus:bg-white transition-all placeholder:text-text-muted/40"
            />
          </div>

          <button
            ref={categoryFilterTriggerRef}
            type="button"
            onClick={() => {
              if (categoryFilterTriggerRef.current) {
                const rect = categoryFilterTriggerRef.current.getBoundingClientRect();
                setFilterCategoryRect(rect);
                setIsCategoryFilterOpen(!isCategoryFilterOpen);
              }
            }}
            className="w-full h-12 px-4 rounded-2xl border border-primary/10 bg-neutral-soft/50 text-sm font-bold text-text-h outline-none hover:border-primary/20 hover:bg-white transition-all flex items-center justify-between relative cursor-pointer"
          >
            <span>{categories.find(c => c.id === activeCategory)?.name || 'Todas las categorías'}</span>
            <Filter className={`h-5 w-5 text-primary/40 transition-transform ${isCategoryFilterOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {isCategoryFilterOpen && filterCategoryRect && (
              <>
                <div 
                  className="fixed inset-0 z-[110]" 
                  onClick={() => setIsCategoryFilterOpen(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="fixed z-[120] mt-2 max-h-60 overflow-y-auto rounded-2xl border border-primary/10 bg-white p-2 shadow-2xl custom-scrollbar"
                  style={{
                    top: filterCategoryRect.bottom,
                    left: filterCategoryRect.left,
                    width: filterCategoryRect.width
                  }}
                >
                  {[{ id: 'all', name: 'Todas las categorías' }, ...categories].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setActiveCategory(c.id);
                        setIsCategoryFilterOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition-all hover:bg-primary/5 ${
                        activeCategory === c.id ? 'bg-primary/10 text-primary' : 'text-text-h'
                      }`}
                    >
                      <div className={`h-2 w-2 rounded-full ${activeCategory === c.id ? 'bg-primary' : 'bg-primary/20'}`} />
                      {c.name}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <button
            ref={sortFilterTriggerRef}
            type="button"
            onClick={() => {
              if (sortFilterTriggerRef.current) {
                const rect = sortFilterTriggerRef.current.getBoundingClientRect();
                setFilterSortRect(rect);
                setIsSortFilterOpen(!isSortFilterOpen);
              }
            }}
            className="w-full h-12 px-4 rounded-2xl border border-primary/10 bg-neutral-soft/50 text-sm font-bold text-text-h outline-none hover:border-primary/20 hover:bg-white transition-all flex items-center justify-between relative cursor-pointer"
          >
            <span>
              {sortBy === 'newest' ? 'Más recientes' :
                sortBy === 'oldest' ? 'Más antiguos' :
                sortBy === 'name-asc' ? 'Nombre (A-Z)' :
                sortBy === 'name-desc' ? 'Nombre (Z-A)' :
                sortBy === 'stock-asc' ? 'Menor stock' :
                sortBy === 'stock-desc' ? 'Mayor stock' :
                'Ordenar por'}
            </span>
            <motion.div
              animate={isSortFilterOpen ? {
                x: [0, -1, 1, -1, 0],
                scale: [1, 1.05, 1]
              } : { x: 0, scale: 1 }}
              transition={isSortFilterOpen ? {
                duration: 0.5,
                ease: 'easeInOut'
              } : { duration: 0.3 }}
            >
              <SlidersHorizontal className="h-5 w-5 text-primary/40" />
            </motion.div>
          </button>
          <AnimatePresence>
            {isSortFilterOpen && filterSortRect && (
              <>
                <div 
                  className="fixed inset-0 z-[110]" 
                  onClick={() => setIsSortFilterOpen(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="fixed z-[120] mt-2 max-h-60 overflow-y-auto rounded-2xl border border-primary/10 bg-white p-2 shadow-2xl custom-scrollbar"
                  style={{
                    top: filterSortRect.bottom,
                    left: filterSortRect.left,
                    width: filterSortRect.width
                  }}
                >
                  {[
                    { id: 'newest', name: 'Más recientes' },
                    { id: 'oldest', name: 'Más antiguos' },
                    { id: 'name-asc', name: 'Nombre (A-Z)' },
                    { id: 'name-desc', name: 'Nombre (Z-A)' },
                    { id: 'stock-asc', name: 'Menor stock' },
                    { id: 'stock-desc', name: 'Mayor stock' }
                  ].map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setSortBy(option.id);
                        setIsSortFilterOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition-all hover:bg-primary/5 ${
                        sortBy === option.id ? 'bg-primary/10 text-primary' : 'text-text-h'
                      }`}
                    >
                      <div className={`h-2 w-2 rounded-full ${sortBy === option.id ? 'bg-primary' : 'bg-primary/20'}`} />
                      {option.name}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <button
            onClick={() => { setSearchName(''); setActiveCategory('all'); setSortBy('newest'); }}
            className={`h-12 px-5 rounded-2xl border border-primary/5 text-primary font-black text-[11px] uppercase tracking-widest hover:bg-neutral-soft transition-all ${searchName || activeCategory !== 'all' || sortBy !== 'newest' ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
            className={`fixed top-6 right-6 z-[200] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${feedback.type === 'success'
              ? 'bg-emerald-50/90 border-emerald-100 text-emerald-800'
              : 'bg-red-50/90 border-red-100 text-red-800'
              }`}
          >
            <div className={`p-2 rounded-xl ${feedback.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
              }`}>
              {feedback.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            <div className="flex flex-col">
              <p className="font-black text-sm uppercase tracking-widest leading-none mb-1">
                {feedback.type === 'success' ? 'Éxito' : 'Error'}
              </p>
              <p className="text-sm font-bold opacity-80">{feedback.msg}</p>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="ml-4 opacity-40 hover:opacity-100 transition-opacity"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Area */}
      {isLoading ? (
        <div className="py-24 text-center">
          <Loader2 className="h-14 w-14 animate-spin text-primary/20 mx-auto" />
          <p className="mt-4 text-xs font-black text-primary/30 uppercase tracking-[0.25em]">Cargando Inventario</p>
        </div>
      ) : paginatedProducts.length === 0 ? (
        <div className="rounded-[32px] border border-dashed border-primary/20 bg-primary/5 py-16 text-center">
          <div className="mx-auto w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-primary/20 mb-4 shadow-sm">
            <Search size={36} />
          </div>
          <p className="text-text-muted font-bold">No se encontraron productos con esos criterios.</p>
        </div>
      ) : (
        <>
          {/* Mobile/Tablet Card View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:hidden">
            {paginatedProducts.map(p => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[28px] p-5 shadow-lg shadow-primary/5 border border-primary/5 group"
              >
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-neutral-soft shrink-0 border border-primary/5">
                    <img src={getProductImageUrl(p.image)} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">{categories.find(c => c.id === p.category)?.name || p.category}</span>
                    <h3 className="text-xl font-black text-text-h truncate mt-1">{p.name}</h3>
                    <p className="text-xl font-black text-primary mt-1">{p.price}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-primary/5 pt-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${p.stock === 0 ? 'bg-red-500' : p.stock <= 5 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <span className="text-sm font-black text-text-h">{p.stock} <span className="text-[10px] text-text-muted">UNID.</span></span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(p)} className="p-2.5 rounded-xl bg-neutral-soft text-primary hover:bg-primary/10 transition-colors">
                      <PencilLine size={18} />
                    </button>
                    <button onClick={() => setPendingDelete(p)} className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-[32px] shadow-lg shadow-primary/5 border border-primary/5 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-soft/20 text-[11px] font-black uppercase tracking-[0.2em] text-primary/40">
                  <th className="px-8 py-5">Producto</th>
                  <th className="px-8 py-5">Categoría</th>
                  <th className="px-8 py-5">Inventario</th>
                  <th className="px-8 py-5">Precio</th>
                  <th className="px-8 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {paginatedProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-soft/20 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl overflow-hidden bg-neutral-soft border border-primary/5 shrink-0">
                          <img src={getProductImageUrl(p.image)} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-text-h text-base truncate">{p.name}</p>
                          <p className="text-[10px] text-text-muted font-black uppercase mt-0.5 tracking-widest">{p.spec}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-flex px-3 py-1 rounded-lg bg-neutral-soft text-text-muted text-[10px] font-black uppercase tracking-widest border border-primary/5">
                        {categories.find(c => c.id === p.category)?.name || p.category}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${p.stock === 0 ? 'bg-red-500' : p.stock <= 5 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <span className="text-sm font-black text-text-h">{p.stock} <span className="text-[10px] text-text-muted font-bold ml-0.5">UNID.</span></span>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-black text-primary text-lg">
                      {p.price}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(p)} className="p-2.5 rounded-xl text-primary bg-white border border-primary/10 shadow-sm hover:scale-110 transition-all">
                          <PencilLine size={18} />
                        </button>
                        <button onClick={() => setPendingDelete(p)} className="p-2.5 rounded-xl text-red-500 bg-white border border-primary/5 shadow-sm hover:scale-110 transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer with Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-5 bg-neutral-soft/10 border-t border-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs font-bold text-text-muted">
                Página <span className="text-primary font-black">{currentPage}</span> de <span className="text-primary font-black">{totalPages}</span>
                <span className="ml-4 opacity-40 font-medium whitespace-nowrap">Total: {filteredProducts.length} productos</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex h-9 px-4 items-center justify-center rounded-xl border border-primary/10 bg-white text-xs font-black text-primary transition-all hover:bg-neutral-soft disabled:opacity-20 disabled:hover:bg-white"
                >
                  Anterior
                </button>
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white text-primary border border-primary/5 hover:bg-neutral-soft'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-9 px-4 items-center justify-center rounded-xl border border-primary/10 bg-white text-xs font-black text-primary transition-all hover:bg-neutral-soft disabled:opacity-20 disabled:hover:bg-white"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-text-h/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-primary/5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-text-h">
                    {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                  </h2>
                  <p className="text-xs text-text-muted font-medium mt-0.5">Completa los campos para actualizar el catálogo.</p>
                </div>
                <button onClick={closeModal} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-soft transition-colors">
                  <X size={20} className="text-text-muted" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 overflow-y-auto overflow-x-visible max-h-[75vh] space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="mb-2 flex items-center gap-2 text-xs font-bold text-text-main"><Type className="h-4 w-4 text-primary" />Nombre del producto</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Mug Cerámica Blanco"
                      className="w-full h-12 rounded-xl border border-primary/10 bg-neutral-soft/50 px-4 text-sm font-bold text-text-h outline-none focus:border-primary focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-1.5 relative">
                    <label className="mb-2 flex items-center gap-2 text-xs font-bold text-text-main"><Tag className="h-4 w-4 text-primary" />Categoría</label>
                    <button
                      ref={dropdownTriggerRef}
                      type="button"
                      onClick={() => {
                        if (dropdownTriggerRef.current) {
                          const rect = dropdownTriggerRef.current.getBoundingClientRect();
                          setDropdownRect(rect);
                          setIsModalCategoryOpen(!isModalCategoryOpen);
                        }
                      }}
                      className="flex w-full items-center justify-between rounded-xl border border-primary/10 bg-neutral-soft/50 px-4 py-3 text-sm font-bold text-text-h outline-none transition focus:border-primary focus:bg-white cursor-pointer h-12"
                    >
                      <span>{categories.find(c => c.id === formData.category)?.name || 'Seleccionar...'}</span>
                      <Filter className={`h-4 w-4 text-primary/40 transition-transform ${isModalCategoryOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isModalCategoryOpen && dropdownRect && (
                        <>
                          <div 
                            className="fixed inset-0 z-[110]" 
                            onClick={() => setIsModalCategoryOpen(false)} 
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="fixed z-[120] mt-2 max-h-60 overflow-y-auto rounded-2xl border border-primary/10 bg-white p-2 shadow-2xl custom-scrollbar"
                            style={{
                              top: dropdownRect.bottom,
                              left: dropdownRect.left,
                              width: dropdownRect.width
                            }}
                          >
                            {categories.map((category) => (
                              <button
                                key={category.id}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, category: category.id });
                                  setIsModalCategoryOpen(false);
                                }}
                                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition-all hover:bg-primary/5 ${
                                  formData.category === category.id ? 'bg-primary/10 text-primary' : 'text-text-h'
                                }`}
                              >
                                <div className={`h-2 w-2 rounded-full ${formData.category === category.id ? 'bg-primary' : 'bg-primary/20'}`} />
                                {category.name}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="mb-2 flex items-center gap-2 text-xs font-bold text-text-main\"><Ruler className="h-4 w-4 text-primary" />Especificaciones</label>
                    <input
                      type="text"
                      value={formData.spec}
                      onChange={e => setFormData({ ...formData, spec: e.target.value })}
                      placeholder="Ej: 9.5cm x 19cm"
                      className="w-full h-12 rounded-xl border border-primary/10 bg-neutral-soft/50 px-4 text-sm font-bold text-text-h outline-none focus:border-primary focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="mb-2 flex items-center gap-2 text-xs font-bold text-text-main\"><DollarSign className="h-4 w-4 text-primary" />Precio / Info</label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      className="w-full h-12 rounded-xl border border-primary/10 bg-neutral-soft/50 px-4 text-sm font-bold text-text-h outline-none focus:border-primary focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="mb-2 flex items-center gap-2 text-xs font-bold text-text-main\"><FileText className="h-4 w-4 text-primary" />Descripción</label>
                  <textarea
                    rows={3}
                    value={formData.detail}
                    onChange={e => setFormData({ ...formData, detail: e.target.value })}
                    placeholder="Describe las características principales..."
                    className="w-full rounded-xl border border-primary/10 bg-neutral-soft/50 p-4 text-sm font-bold text-text-h outline-none focus:border-primary focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="mb-2 flex items-center gap-2 text-xs font-bold text-text-main\"><Package className="h-4 w-4 text-primary" />Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: e.target.value === '' ? 0 : Number(e.target.value) })}
                      className="w-full h-12 rounded-xl border border-primary/10 bg-neutral-soft/50 px-4 text-base font-black text-text-h outline-none focus:border-primary focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="mb-2 flex items-center gap-2 text-xs font-bold text-text-main"><ImageUp className="h-4 w-4 text-primary" />Imagen del Producto</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
                    <motion.div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      animate={{
                        borderColor: isDragOver ? 'rgb(45, 90, 39)' : 'rgb(45, 90, 39, 0.2)',
                        backgroundColor: isDragOver ? 'rgb(45, 90, 39, 0.08)' : 'rgb(45, 90, 39, 0.03)'
                      }}
                      transition={{ duration: 0.2 }}
                      className="group w-full relative flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-primary/20 bg-neutral-soft/50 p-8 transition-all hover:border-primary/50 hover:bg-white cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <motion.div
                        animate={{
                          scale: isDragOver ? 1.15 : 1
                        }}
                        transition={{ duration: 0.2 }}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110"
                      >
                        <ImageUp size={24} />
                      </motion.div>
                      <div className="text-center">
                        <p className="text-sm font-black uppercase tracking-widest text-primary">
                          {uploadFile ? uploadFile.name : 'Seleccionar o arrastrar imagen'}
                        </p>
                        <p className="mt-1 text-[10px] font-bold text-text-muted opacity-60">
                          Solo puedes subir una imagen a la vez
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {imagePreview && (
                  <div className="rounded-2xl border border-primary/5 overflow-hidden h-40 bg-neutral-soft relative group">
                    <img src={imagePreview || ''} alt="Preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-[10px] font-black uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full">Vista Previa</p>
                    </div>
                  </div>
                )}

                {isSubmitting && (
                  <div className="space-y-2 py-2">
                    <div className="flex justify-between text-[10px] font-black text-primary uppercase tracking-widest">
                      <span>Procesando...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-soft rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="h-full bg-primary" />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 h-12 rounded-xl font-bold bg-neutral-soft text-text-muted hover:bg-neutral-soft/80 transition-all">Cancelar</button>
                  <button disabled={isSubmitting} type="submit" className="flex-[2] h-12 rounded-xl font-black bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                    {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {pendingDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPendingDelete(null)} className="absolute inset-0 bg-text-h/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-8 text-center shadow-2xl"
            >
              <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-5">
                <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-black text-text-h">¿Borrar producto?</h3>
              <p className="text-text-muted text-sm mt-3 mb-8 leading-relaxed">
                Esta acción eliminará a <strong>{pendingDelete?.name || 'este producto'}</strong> definitivamente y no se puede deshacer.
              </p>

              <div className="flex flex-col gap-3">
                <button onClick={handleDelete} disabled={isSubmitting} className="h-12 w-full rounded-xl font-black bg-red-500 text-white shadow-lg shadow-red-200">Confirmar Eliminación</button>
                <button onClick={() => setPendingDelete(null)} className="h-12 w-full rounded-xl font-bold text-text-muted hover:bg-neutral-soft">Regresar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
