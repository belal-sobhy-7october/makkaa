import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, ShoppingBag, Phone } from 'lucide-react';
import { endpoints } from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import usePageTitle from '../hooks/usePageTitle';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const { t, locale } = useLanguage();
  usePageTitle(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      endpoints.categories.list({ limit: 20 }),
      endpoints.products.list({ limit: 8 }),
    ])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data.data || []);
        setProducts(prodRes.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isAr = locale === 'ar';

  if (loading) return <LoadingSpinner className="min-h-[60vh]" />;

  return (
    <div>
      <section className="relative bg-gradient-to-br from-makka-brown via-makka-cocoa to-makka-brown text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #D4AF37 0%, transparent 50%), radial-gradient(circle at 75% 30%, #D4AF37 0%, transparent 40%)' }} />
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            {t('home.welcome')}
          </h1>
          <p className="text-lg md:text-xl text-makka-cream/90 max-w-3xl mx-auto mb-8 leading-relaxed">
            {t('home.tagline')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-makka-gold text-makka-cocoa font-semibold text-lg hover:bg-white hover:shadow-glow transition-all duration-300"
            >
              <ShoppingBag className="w-5 h-5" />
              {t('home.browseProducts')}
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-makka-cream/40 text-makka-cream font-semibold text-lg hover:bg-white/10 hover:border-makka-gold transition-all duration-300"
            >
              <Phone className="w-5 h-5" />
              {t('home.contactUs')}
            </Link>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-14">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-makka-cocoa">{t('home.categories')}</h2>
            <Link to="/categories" className="inline-flex items-center gap-1 text-makka-brown hover:text-makka-gold transition-colors text-sm font-medium">
              {t('home.viewAllCategories')}
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat._id}`}
                className="group relative rounded-2xl overflow-hidden bg-white border border-makka-sand shadow-soft hover:shadow-card-hover transition-all duration-300"
              >
                <div className="aspect-[4/3] bg-makka-sand/30 flex items-center justify-center overflow-hidden">
                  {cat.image ? (
                    <img src={cat.image} alt={isAr ? cat.nameAr : cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-5xl opacity-40">🍰</span>
                  )}
                </div>
                <div className="p-3 text-center">
                  <h3 className="font-display text-base font-semibold text-makka-cocoa group-hover:text-makka-brown transition-colors">
                    {isAr ? cat.nameAr || cat.name : cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="bg-makka-sand/30 py-14">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-makka-cocoa">{t('home.latestProducts')}</h2>
              <Link to="/products" className="inline-flex items-center gap-1 text-makka-brown hover:text-makka-gold transition-colors text-sm font-medium">
                {t('home.viewAllProducts')}
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((p) => (
                <Link
                  key={p._id}
                  to={`/products/${p._id}`}
                  className="group bg-white rounded-2xl border border-makka-sand shadow-soft hover:shadow-card-hover overflow-hidden transition-all duration-300"
                >
                  <div className="aspect-square bg-makka-sand/20 flex items-center justify-center overflow-hidden">
                    {p.imageCover ? (
                      <img src={p.imageCover} alt={isAr ? p.titleAr : p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <span className="text-5xl opacity-30">🧁</span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-makka-cocoa text-sm line-clamp-2 mb-1">{isAr ? p.titleAr || p.title : p.title}</h3>
                    <p className="text-makka-brown font-semibold">{p.priceAfterDiscount ?? p.price} {t('products.egp')}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 py-14 text-center">
        <div className="rounded-3xl bg-gradient-to-br from-makka-brown to-makka-cocoa p-10 md:p-14 text-white">
          <h2 className="font-display text-2xl md:text-3xl font-semibold mb-4">{t('home.ctaQuestion')}</h2>
          <p className="text-makka-cream/80 mb-8 max-w-lg mx-auto">{t('home.tagline')}</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-makka-gold text-makka-cocoa font-semibold hover:bg-white hover:shadow-glow transition-all duration-300"
          >
            <Phone className="w-5 h-5" />
            {t('home.contactUs')}
          </Link>
        </div>
      </section>
    </div>
  );
}
