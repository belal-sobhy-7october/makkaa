import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { endpoints } from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import usePageTitle from '../hooks/usePageTitle';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Products() {
  const { t, locale } = useLanguage();
  usePageTitle(t('products.title'));
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '-createdAt');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const isAr = locale === 'ar';

  useEffect(() => {
    endpoints.categories.list({ limit: 100 })
      .then((res) => setCategories(res.data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12, sort };
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    endpoints.products.list(params)
      .then((res) => {
        setProducts(res.data.data || []);
        setPagination(res.data.paginationResult || null);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [page, keyword, category, sort]);

  useEffect(() => {
    const params = {};
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    if (sort && sort !== '-createdAt') params.sort = sort;
    setSearchParams(params, { replace: true });
  }, [keyword, category, sort, setSearchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setKeyword('');
    setCategory('');
    setSort('-createdAt');
    setPage(1);
  };

  const hasFilters = keyword || category;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-makka-cocoa">{t('products.title')}</h1>

        <form onSubmit={handleSearch} className="relative w-full md:w-72">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={t('products.searchPlaceholder')}
            className="w-full rounded-xl border border-makka-sand pl-10 pr-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-makka-gold/50 focus:border-makka-gold outline-none transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-makka-cocoa/50" />
        </form>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-makka-sand text-sm text-makka-cocoa hover:bg-makka-sand/30 transition-colors md:hidden"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t('products.category')}
          </button>

          <div className={`${showFilters ? 'flex' : 'hidden'} md:flex flex-wrap items-center gap-2`}>
            <button
              type="button"
              onClick={() => { setCategory(''); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${!category ? 'bg-makka-brown text-white' : 'bg-makka-sand/50 text-makka-cocoa hover:bg-makka-sand'}`}
            >
              {t('products.all')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => { setCategory(cat._id); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${category === cat._id ? 'bg-makka-brown text-white' : 'bg-makka-sand/50 text-makka-cocoa hover:bg-makka-sand'}`}
              >
                {isAr ? cat.nameAr || cat.name : cat.name}
              </button>
            ))}
          </div>
        </div>

        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="mr-auto px-3 py-2 rounded-xl border border-makka-sand text-sm bg-white text-makka-cocoa"
        >
          <option value="-createdAt">{t('products.sortNewest')}</option>
          <option value="price">{t('products.sortPriceAsc')}</option>
          <option value="-price">{t('products.sortPriceDesc')}</option>
          <option value="-sold">{t('products.sortBestSelling')}</option>
          <option value="-ratingsAverage">{t('products.sortRating')}</option>
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <X className="w-4 h-4" />
            مسح
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner className="min-h-[40vh]" />
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-makka-cocoa/70 text-lg">{t('products.noProducts')}</p>
        </div>
      ) : (
        <>
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
                  <p className="text-xs text-makka-cocoa/60 mb-1">{isAr ? p.category?.nameAr || p.category?.name : p.category?.name}</p>
                  <h3 className="font-medium text-makka-cocoa text-sm line-clamp-2 mb-1">{isAr ? p.titleAr || p.title : p.title}</h3>
                  <p className="text-makka-brown font-semibold">{p.priceAfterDiscount ?? p.price} {t('products.egp')}</p>
                </div>
              </Link>
            ))}
          </div>

          {pagination && pagination.numberOfPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-xl border border-makka-sand text-sm text-makka-cocoa hover:bg-makka-sand/30 disabled:opacity-40 transition-colors"
              >
                {t('products.prev')}
              </button>
              {Array.from({ length: pagination.numberOfPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${page === p ? 'bg-makka-brown text-white' : 'border border-makka-sand text-makka-cocoa hover:bg-makka-sand/30'}`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                disabled={page >= pagination.numberOfPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-xl border border-makka-sand text-sm text-makka-cocoa hover:bg-makka-sand/30 disabled:opacity-40 transition-colors"
              >
                {t('products.next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
