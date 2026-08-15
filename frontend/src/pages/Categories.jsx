import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { endpoints } from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import usePageTitle from '../hooks/usePageTitle';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Categories() {
  const { t, locale } = useLanguage();
  usePageTitle(t('categories.title'));
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAr = locale === 'ar';

  useEffect(() => {
    endpoints.categories.list({ limit: 100 })
      .then((res) => setCategories(res.data.data || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner className="min-h-[50vh]" />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-makka-cocoa mb-2">{t('categories.title')}</h1>
        <p className="text-makka-cocoa/70">{t('categories.subtitle')}</p>
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
                <span className="text-6xl opacity-30">🍰</span>
              )}
            </div>
            <div className="p-4 text-center">
              <h2 className="font-display text-lg font-semibold text-makka-cocoa group-hover:text-makka-brown transition-colors">
                {isAr ? cat.nameAr || cat.name : cat.name}
              </h2>
            </div>
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16">
          <p className="text-makka-cocoa/70">{t('categories.notFound')}</p>
        </div>
      )}
    </div>
  );
}
