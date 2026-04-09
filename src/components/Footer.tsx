import { Globe, MessageCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white pt-24 pb-12 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity mb-6">
              <img src="/logo.png" alt="Corteza Terrestre Logo" className="h-10 w-auto" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-primary tracking-tight leading-none">Fundación</span>
                <span className="text-xl font-black text-primary tracking-tighter leading-none">Corteza Terrestre</span>
              </div>
            </Link>
            <p className="text-text-muted text-lg max-w-md leading-relaxed mb-8">
              Organización sin ánimo de lucro fundada en 2007. Trabajando incansablemente por el bienestar de los animales en el Quindío.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/corteza_terrestre/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-all group"
              >
                <Globe size={22} className="group-hover:scale-110 transition-transform" />
              </a>
              <a 
                href="https://www.facebook.com/cortezaterrestre/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-all group"
              >
                <MessageCircle size={22} className="group-hover:scale-110 transition-transform" />
              </a>
              <a 
                href="mailto:fundacioncortezaterrestre@gmail.com" 
                className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-all group"
              >
                <Mail size={22} className="group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-text-h mb-6 uppercase text-sm tracking-widest">Navegación</h4>
            <ul className="space-y-4 text-text-muted font-medium">
              <li><Link to="/" className="hover:text-primary transition-colors">Inicio</Link></li>
              <li><Link to="/#adopcion" className="hover:text-primary transition-colors">Adopción</Link></li>
              <li><Link to="/tienda" className="hover:text-primary transition-colors">Tienda Salvatore</Link></li>
              <li><Link to="/nosotros" className="hover:text-primary transition-colors">Nosotros</Link></li>
              <li><Link to="/contacto" className="hover:text-primary transition-colors">Contacto</Link></li>
              <li><Link to="/dian" className="hover:text-primary transition-colors">Permanencia DIAN</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-text-h mb-6 uppercase text-sm tracking-widest">Involúcrate</h4>
            <ul className="space-y-4 text-text-muted font-medium">
              <li><Link to="/salvaton" className="hover:text-primary transition-colors">Salvatón Animal</Link></li>
              <li><Link to="/voluntario" className="hover:text-primary transition-colors">Ser Voluntario</Link></li>
              <li><Link to="/contacto" className="hover:text-primary transition-colors">Apadrinar</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-text-muted text-sm font-medium">
            © 2026 Fundación Corteza Terrestre. Armenia, Quindío.
          </p>
          <div className="text-sm text-text-muted font-medium">
            Hecho por los estudiantes de Ingeniería de sistemas y computación de la Uniquindio
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

