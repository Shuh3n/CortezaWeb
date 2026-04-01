import { PawPrint, Globe, Users, Mail, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white pt-24 pb-12 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <PawPrint className="text-primary w-8 h-8" />
              <span className="text-2xl font-bold text-primary tracking-tight">Corteza Terrestre</span>
            </div>
            <p className="text-text-muted text-lg max-w-md leading-relaxed mb-8">
              Organización sin ánimo de lucro fundada en 2007. Trabajando incansablemente por el bienestar de los animales en el Quindío.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-all">
                <Globe size={20} />
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-all">
                <Users size={20} />
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-all">
                <Mail size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-text-h mb-6">Navegación</h4>
            <ul className="space-y-4 text-text-muted">
              <li><a href="#inicio" className="hover:text-primary transition-colors">Inicio</a></li>
              <li><a href="#ejes" className="hover:text-primary transition-colors">Nuestros Ejes</a></li>
              <li><a href="#adopcion" className="hover:text-primary transition-colors">Adopción</a></li>
              <li><a href="#contacto" className="hover:text-primary transition-colors">Contacto</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-text-h mb-6">Ayúdanos</h4>
            <ul className="space-y-4 text-text-muted">
              <li><a href="#" className="hover:text-primary transition-colors">Donaciones</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Tienda Solidaria</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Apadrinar</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-text-muted text-sm font-medium">
            © 2026 Fundación Corteza Terrestre. Armenia, Quindío.
          </p>
          <div className="flex items-center gap-2 text-sm text-text-muted font-medium">
            Hecho con <Heart size={14} className="text-red-500 fill-red-500" /> por los animales.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
