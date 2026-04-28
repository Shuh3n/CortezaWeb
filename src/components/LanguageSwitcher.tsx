import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={() => changeLanguage('es')}
                className={`px-2 py-1 rounded cursor-pointer ${i18n.language.startsWith('es') ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
                ES
            </button>
            <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 rounded cursor-pointer ${i18n.language.startsWith('en') ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
                EN
            </button>
        </div>
    );
}