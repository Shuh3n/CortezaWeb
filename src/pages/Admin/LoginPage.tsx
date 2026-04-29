import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, Mail, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'No se pudo iniciar sesión. Verifique sus credenciales.';
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user, isLoading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isLoading && user) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await signIn(email, password);

      const nextPath =
        typeof location.state === 'object' && location.state !== null && 'from' in location.state
          ? String(location.state.from)
          : '/admin/dashboard';

      navigate(nextPath, { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(45,90,39,0.18),_transparent_35%),_#fdfaf6] px-4 py-10">
      <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.22, 0.32, 0.22] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <motion.div animate={{ scale: [1.02, 1, 1.03], opacity: [0.18, 0.12, 0.18] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} className="pointer-events-none absolute -right-12 bottom-10 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: 'easeOut' }} className="relative grid w-full max-w-6xl overflow-hidden rounded-[40px] bg-white/95 shadow-2xl shadow-primary/10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden bg-[linear-gradient(145deg,_#2d5a27,_#1f3b1b)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-white/70">Panel administrativo</p>
            <h1 className="mt-6 text-5xl font-black leading-tight">Bienvenido al panel administrativo</h1>
            <p className="mt-6 max-w-xl text-lg text-white/80">Todo está listo para gestionar el contenido con una experiencia fluida, clara y adaptable.</p>
          </div>

          <div className="grid gap-4">
            {['Dashboard responsive', 'Galería canina centralizada', 'Categorías dinámicas', 'Instalación como app'].map((item, index) => (
              <motion.div key={item} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 * index + 0.2, duration: 0.4 }} className="flex items-center gap-3 rounded-[28px] bg-white/10 px-5 py-4 backdrop-blur">
                <Sparkles className="h-5 w-5 text-accent" />
                <span className="text-lg font-semibold">{item}</span>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="p-6 sm:p-10 lg:p-14">
          <div className="mx-auto w-full max-w-md">
            <Link to="/" className="inline-flex items-center gap-3 text-primary transition hover:opacity-80">
              <img src="/logo.png" alt="Fundación Corteza Terrestre" className="h-12 w-auto" />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary/70">Fundación</p>
                <p className="text-2xl font-black">Corteza Terrestre</p>
              </div>
            </Link>

            <div className="mt-10">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/60">Acceso</p>
              <h2 className="mt-3 text-4xl font-black text-text-h">Bienvenido al panel administrativo</h2>
              <p className="mt-3 text-base text-text-muted">Ingrese con su correo y su contraseña.</p>
            </div>

            <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-text-main">Email</span>
                <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 shadow-sm transition focus-within:-translate-y-0.5 focus-within:border-primary">
                  <Mail className="h-5 w-5 text-primary" />
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="admin@fundacion.com" className="w-full bg-transparent text-base outline-none" />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-text-main">Contraseña</span>
                <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 shadow-sm transition focus-within:-translate-y-0.5 focus-within:border-primary">
                  <LockKeyhole className="h-5 w-5 text-primary" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full bg-transparent text-base outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-primary/60 transition hover:text-primary cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>

              {errorMessage ? <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{errorMessage}</motion.div> : null}

              <motion.button whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }} type="submit" disabled={isSubmitting} className="w-full cursor-pointer rounded-2xl bg-primary px-6 py-4 text-lg font-bold text-white shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70">{isSubmitting ? 'Validando acceso...' : 'Entrar'}</motion.button>
            </form>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
