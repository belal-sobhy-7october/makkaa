import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { endpoints } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import usePageTitle from '../hooks/usePageTitle';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProductDetail() {
  const { id } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { addToCart, fetchCart } = useCart();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // فورم التقييم
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewError, setReviewError] = useState(false);

  const loadProduct = async () => {
    try {
      const [prodRes, revRes] = await Promise.all([
        endpoints.products.get(id),
        endpoints.products.reviews(id),
      ]);
      setProduct(prodRes.data.data);
      setReviews(revRes.data.data || []);
      const sizes = prodRes.data.data?.sizes;
      if (Array.isArray(sizes) && sizes.length > 0) setSelectedSize(sizes[0]);
    } catch (err) {
      setError(err.response?.data?.message || t('productDetail.productNotFound'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  usePageTitle(product?.titleAr || product?.title || t('products.title'));

  useEffect(() => {
    if (isLoggedIn) {
      endpoints.wishlist.list().then((res) => {
        const ids = new Set((res.data.data || []).map((p) => p._id));
        setWishlistIds(ids);
      });
    }
  }, [isLoggedIn, id]);

  const displayPrice = () => {
    if (selectedSize) return selectedSize.price;
    return product.priceAfterDiscount ?? product.price;
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    setAdding(true);
    try {
      const variantLabel = selectedSize?.label || '';
      const variantPrice = selectedSize?.price;
      for (let i = 0; i < quantity; i++) await addToCart(product._id, variantLabel, variantPrice);
      fetchCart();
      toast.show(t('common.addToCartSuccess'));
      navigate('/cart');
    } catch (err) {
      toast.show(err.response?.data?.message || t('common.addToCartError'), 'error');
    } finally {
      setAdding(false);
    }
  };

  const toggleWishlist = async () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    const inList = wishlistIds.has(product._id);
    try {
      if (inList) {
        await endpoints.wishlist.remove(product._id);
        setWishlistIds((s) => {
          const n = new Set(s);
          n.delete(product._id);
          return n;
        });
      } else {
        await endpoints.wishlist.add(product._id);
        setWishlistIds((s) => new Set([...s, product._id]));
      }
    } catch (_) {}
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewMessage('');
    setReviewError(false);
    if (!isLoggedIn) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    setReviewSubmitting(true);
    try {
      await endpoints.products.addReview(id, { rating: reviewRating, comment: reviewComment.trim() });
      setReviewComment('');
      setReviewRating(5);
      setReviewMessage('شكراً لتقييمك!');
      const revRes = await endpoints.products.reviews(id);
      setReviews(revRes.data.data || []);
      const prodRes = await endpoints.products.get(id);
      setProduct(prodRes.data.data);
    } catch (err) {
      setReviewError(true);
      const msg = err?.message || '';
      setReviewMessage(
        msg.includes('duplicate') || msg.includes('unique')
          ? 'أنت قيّمت هذا المنتج من قبل.'
          : 'حصل خطأ أثناء إرسال التقييم.'
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner className="min-h-[50vh]" />;
  if (error || !product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600">{error || t('productDetail.productNotFound')}</p>
        <Link to="/products" className="text-makka-brown mt-4 inline-block hover:underline focus-visible:ring-2 focus-visible:ring-makka-brown focus-visible:ring-offset-2 rounded">
          ← {t('productDetail.backToProducts')}
        </Link>
      </div>
    );
  }

  const images = [
    ...(product.imageCover ? [product.imageCover] : []),
    ...(product.images || []),
  ];
  const mainImage = images[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <nav className="text-sm text-makka-cocoa/70 mb-6" aria-label="Breadcrumb">
        <Link to="/" className="hover:underline">{t('productDetail.home')}</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:underline">{t('productDetail.backToProducts')}</Link>
        <span className="mx-2">/</span>
        <span className="text-makka-cocoa line-clamp-1">{product.titleAr || product.title}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-2xl overflow-hidden bg-makka-sand/20 border border-makka-sand flex items-center justify-center aspect-square min-h-[280px] shadow-card">
          {mainImage ? (
            <img src={mainImage} alt={product.titleAr || product.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-6xl text-makka-cocoa/40" aria-hidden>🍰</span>
          )}
        </div>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-makka-cocoa mb-2">
            {product.titleAr || product.title}
          </h1>

          {product.requiresPreorder && (
            <span className="inline-block mb-3 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
              يحتاج حجز مسبق
            </span>
          )}

          {product.ratingsQuantity > 0 && (
            <div className="flex items-center gap-1 text-makka-gold mb-3">
              <Star className="w-5 h-5 fill-current" aria-hidden />
              <span>{Number(product.ratingsAverage || 0).toFixed(1)}</span>
              <span className="text-makka-cocoa/70 text-sm">({product.ratingsQuantity} {t('productDetail.ratingCount')})</span>
            </div>
          )}

          <p className="text-makka-cocoa/90 mb-4 leading-relaxed">{product.description}</p>

          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-2xl font-semibold text-makka-brown">
              {displayPrice()} {t('products.egp')}
            </span>
            {!selectedSize && product.priceAfterDiscount && (
              <span className="text-makka-cocoa/60 line-through">{product.price} {t('products.egp')}</span>
            )}
          </div>

          {Array.isArray(product.sizes) && product.sizes.length > 0 && (
            <div className="mb-4">
              <p className="font-medium text-makka-cocoa text-sm mb-2">الحجم</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 rounded-xl border-2 text-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-makka-brown focus-visible:ring-offset-2 ${
                      selectedSize?.label === s.label
                        ? 'border-makka-brown bg-makka-brown/10 text-makka-brown font-medium'
                        : 'border-makka-sand text-makka-cocoa hover:border-makka-gold'
                    }`}
                    aria-pressed={selectedSize?.label === s.label}
                  >
                    {s.label} — {s.price} {t('products.egp')}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            <label htmlFor="qty" className="text-makka-cocoa text-sm">{t('productDetail.quantity')}</label>
            <input
              id="qty"
              type="number"
              min={1}
              max={product.quantity || 99}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value) || 1)}
              className="w-20 rounded-xl border border-makka-sand px-2 py-2 text-center focus:ring-2 focus:ring-makka-gold/50"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={adding || product.quantity < 1}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-makka-brown text-white font-medium hover:bg-makka-cocoa hover:shadow-glow disabled:opacity-50 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-makka-brown focus-visible:ring-offset-2"
            >
              <ShoppingBag className="w-5 h-5" />
              {adding ? t('productDetail.adding') : t('productDetail.addToCart')}
            </button>
            <button
              type="button"
              onClick={toggleWishlist}
              className={`p-3 rounded-xl border-2 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-makka-brown focus-visible:ring-offset-2 ${
                wishlistIds.has(product._id)
                  ? 'border-red-400 bg-red-50 text-red-600'
                  : 'border-makka-sand text-makka-cocoa hover:border-makka-gold hover:shadow-glow'
              }`}
              aria-label={t('nav.wishlist')}
              aria-pressed={wishlistIds.has(product._id)}
            >
              <Heart className={`w-5 h-5 ${wishlistIds.has(product._id) ? 'fill-current' : ''}`} />
            </button>
          </div>
          {product.quantity < 10 && product.quantity > 0 && (
            <p className="text-amber-600 text-sm mt-3">{t('productDetail.lowStock')} ({product.quantity})</p>
          )}
          {product.quantity === 0 && !product.requiresPreorder && (
            <p className="text-red-600 text-sm mt-3">{t('productDetail.outOfStock')}</p>
          )}
        </div>
      </div>

      <section className="mt-12 pt-8 border-t border-makka-sand">
        <h2 className="font-display text-xl font-semibold text-makka-cocoa mb-4">{t('productDetail.reviews')}</h2>

        {reviews.length > 0 ? (
          <ul className="space-y-4 mb-8">
            {reviews.map((r) => (
              <li key={r._id} className="p-4 rounded-2xl bg-makka-sand/20">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex text-makka-gold" aria-hidden>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className={`w-4 h-4 ${i <= r.rating ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                  <span className="text-sm text-makka-cocoa/70">{r.user?.name}</span>
                </div>
                {r.comment && <p className="text-makka-cocoa/90 text-sm">{r.comment}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-makka-cocoa/70 mb-8">لا توجد تقييمات بعد. كوني أول من يقيّم هذا المنتج!</p>
        )}

        {isLoggedIn ? (
          <form onSubmit={handleSubmitReview} className="p-5 rounded-2xl bg-white border border-makka-sand shadow-card max-w-lg">
            <p className="font-medium text-makka-cocoa mb-3">أضف تقييمك</p>
            <div className="flex gap-1 mb-3" role="radiogroup" aria-label="التقييم">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setReviewRating(i)}
                  className="p-1"
                  aria-pressed={reviewRating === i}
                  aria-label={`${i} نجوم`}
                >
                  <Star className={`w-6 h-6 text-makka-gold ${i <= reviewRating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="اكتب رأيك في المنتج (اختياري)"
              rows={3}
              className="w-full rounded-xl border border-makka-sand px-3 py-2 mb-3 focus:ring-2 focus:ring-makka-gold/50"
            />
            {reviewMessage && (
              <p className={`text-sm mb-3 ${reviewError ? 'text-red-600' : 'text-green-600'}`}>{reviewMessage}</p>
            )}
            <button
              type="submit"
              disabled={reviewSubmitting}
              className="px-5 py-2.5 rounded-xl bg-makka-brown text-white text-sm font-medium hover:bg-makka-cocoa disabled:opacity-50"
            >
              {reviewSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
            </button>
          </form>
        ) : (
          <p className="text-makka-cocoa/70">
            <Link to="/login" className="text-makka-brown hover:underline">سجّلي الدخول</Link> عشان تقدري تقيّمي المنتج.
          </p>
        )}
      </section>
    </div>
  );
}
