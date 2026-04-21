import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
      <footer className="bg-white pt-24 pb-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity mb-6">
                <img src="/logo.png" alt="Corteza Terrestre Logo" className="h-10 w-auto" />
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-primary tracking-tight leading-none">{t('footer.fundacion')}</span>
                  <span className="text-xl font-black text-primary tracking-tighter leading-none">Corteza Terrestre</span>
                </div>
              </Link>
              <p className="text-text-muted text-lg max-w-md leading-relaxed mb-8">
                {t('footer.descripcion')}
              </p>
              <div className="flex gap-4">
                <a
                    href="https://www.instagram.com/corteza_terrestre/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-all group"
                >
                  <img
                      src="/icons/instagram.svg"
                      alt="Instagram"
                      className="w-5 h-5 group-hover:brightness-0 group-hover:invert transition-all"
                  />
                </a>
                <a
                    href="https://www.facebook.com/cortezaterrestre/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-all group"
                >
                  <img
                      src="/icons/facebook.svg"
                      alt="Facebook"
                      className="w-5 h-5 group-hover:brightness-0 group-hover:invert transition-all"
                  />
                </a>
                <a
                    href="mailto:fundacioncortezaterrestre@gmail.com"
                    className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-all group"
                >
                  <img
                      src="/icons/mail.svg"
                      alt="Mail"
                      className="w-5 h-5 group-hover:brightness-0 group-hover:invert transition-all"
                  />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-text-h mb-6 uppercase text-sm tracking-widest">{t('footer.navegacion.titulo')}</h4>
              <ul className="space-y-4 text-text-muted font-medium">
                <li><Link to="/" className="hover:text-primary transition-colors">{t('footer.navegacion.inicio')}</Link></li>
                <li><Link to="/#adopcion" className="hover:text-primary transition-colors">{t('footer.navegacion.adopcion')}</Link></li>
                <li><Link to="/tienda" className="hover:text-primary transition-colors">{t('footer.navegacion.tienda')}</Link></li>
                <li><Link to="/nosotros" className="hover:text-primary transition-colors">{t('footer.navegacion.nosotros')}</Link></li>
                <li><Link to="/contacto" className="hover:text-primary transition-colors">{t('footer.navegacion.contacto')}</Link></li>
                <li><Link to="/dian" className="hover:text-primary transition-colors">{t('footer.navegacion.dian')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-text-h mb-6 uppercase text-sm tracking-widest">{t('footer.involucrate.titulo')}</h4>
              <ul className="space-y-4 text-text-muted font-medium">
                <li><Link to="/salvaton" className="hover:text-primary transition-colors">{t('footer.involucrate.salvaton')}</Link></li>
                <li><Link to="/voluntario" className="hover:text-primary transition-colors">{t('footer.involucrate.voluntario')}</Link></li>
                <li><Link to="/adoptar" className="hover:text-primary transition-colors">{t('footer.involucrate.apadrinar')}</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <p className="text-text-muted text-sm font-medium">
                {t('footer.copyright')}
              </p>
              <Link to="/politica-privacidad" className="text-sm text-text-muted hover:text-primary transition-colors">
                {t('footer.privacidad')}
              </Link>
            </div>
            <div className="text-sm text-text-muted font-medium flex flex-col items-center md:items-end gap-1">
              <span>{t('footer.creditos')}</span>
              <a
                  href="https://github.com/Shuh3n/CortezaWeb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-primary transition-colors"
              >
                <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    aria-hidden="true"
                    focusable="false"
                >
                  <path
                      fill="currentColor"
                      d="M12 2C6.48 2 2 6.58 2 12.24c0 4.53 2.87 8.37 6.85 9.73.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.88-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.58 2.36 1.12 2.94.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.28 9.28 0 0 1 12 6.84c.85 0 1.71.12 2.5.36 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.64 1.03 2.76 0 3.95-2.34 4.81-4.57 5.07.36.32.68.95.68 1.92 0 1.39-.01 2.5-.01 2.84 0 .27.18.59.69.49A10.13 10.13 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z"
                  />
                </svg>
                {t('footer.github')}
              </a>
            </div>
          </div>
        </div>
      </footer>
  );
};

export default Footer;