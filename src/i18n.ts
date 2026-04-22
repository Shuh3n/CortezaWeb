import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar los archivos JSON
import translationES from './locales/es.json';
import translationEN from './locales/en.json';

// Configurar los recursos de traducción
const resources = {
    es: {
        translation: translationES
    },
    en: {
        translation: translationEN
    }
};

i18n
    // Detecta el idioma del navegador del usuario
    .use(LanguageDetector)
    // Pasa la instancia de i18n a react-i18next
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'es', // Idioma por defecto si no se detecta o no hay traducción
        debug: true, // Puedes ponerlo en false para producción

        interpolation: {
            escapeValue: false, // React ya se encarga de proteger contra XSS
        }
    });

export default i18n;