import { Phone, MessageCircle, Facebook, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import usePageTitle from '../hooks/usePageTitle';

export default function Contact() {
  const { t } = useLanguage();
  usePageTitle(t('contact.title'));

  const phone = '+201234567890';
  const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}`;
  const facebookUrl = 'https://www.facebook.com/makkasweets';
  const mapUrl = 'https://maps.google.com/?q=Makka+Sweets';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-makka-cocoa mb-3">{t('contact.title')}</h1>
        <p className="text-makka-cocoa/70 max-w-lg mx-auto">{t('contact.intro')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-makka-sand shadow-soft hover:shadow-card-hover hover:border-green-300 transition-all group"
        >
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
            <MessageCircle className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-makka-cocoa">{t('contact.whatsapp')}</p>
            <p className="text-sm text-makka-cocoa/60">{phone}</p>
          </div>
        </a>

        <a
          href={`tel:${phone}`}
          className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-makka-sand shadow-soft hover:shadow-card-hover hover:border-makka-gold/50 transition-all group"
        >
          <div className="w-14 h-14 rounded-full bg-makka-brown/10 flex items-center justify-center group-hover:bg-makka-brown/20 transition-colors">
            <Phone className="w-7 h-7 text-makka-brown" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-makka-cocoa">{t('contact.call')}</p>
            <p className="text-sm text-makka-cocoa/60">{t('contact.phoneLabel')}</p>
          </div>
        </a>

        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-makka-sand shadow-soft hover:shadow-card-hover hover:border-blue-300 transition-all group"
        >
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <Facebook className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-makka-cocoa">{t('contact.facebookGroup')}</p>
            <p className="text-sm text-makka-cocoa/60">@makkasweets</p>
          </div>
        </a>

        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-makka-sand shadow-soft hover:shadow-card-hover hover:border-red-300 transition-all group"
        >
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
            <MapPin className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-makka-cocoa">{t('contact.mapTitle')}</p>
            <p className="text-sm text-makka-cocoa/60">{t('contact.openMap')}</p>
          </div>
        </a>
      </div>

      <div className="text-center bg-gradient-to-br from-makka-sand/50 to-makka-cream rounded-3xl p-8 border border-makka-sand">
        <p className="text-makka-cocoa/80 leading-relaxed">{t('contact.thanks')}</p>
      </div>
    </div>
  );
}
