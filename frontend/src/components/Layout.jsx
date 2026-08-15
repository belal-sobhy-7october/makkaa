import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Heart, LogOut, Menu, Globe, Cake } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

const linkBase = 'transition-colors duration-200 hover:text-makka-brown focus-visible:text-makka-brown py-2';
const btnHover = 'transition-all duration-200 hover:shadow-glow focus-visible:ring-2 focus-visible:ring-makka-brown focus-visible:ring-offset-2 rounded-full';

export default function Layout() {
  const { user, logout, isLoggedIn } = useAuth();
  const { cartCount } = useCart();
  const { t, locale, setLocale } = useLanguage();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-makka-cream">
      <header className="sticky top-0 z-50 bg-white border-b border-makka-sand/80 shadow-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
          <Link
            to="/"
            className={`flex items-center gap-2 font-display text-2xl font-semibold text-makka-cocoa ${btnHover} hover:text-makka-brown`}
            aria-label="Makka El Halawany - الرئيسية"
          >
            <Cake className="w-7 h-7 text-makka-gold" aria-hidden />
            <span>Makka El Halawany</span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-makka-cocoa/90 text-sm">
            <Link to="/" className={linkBase}>{t('nav.home')}</Link>
            <Link to="/categories" className={linkBase}>{t('nav.categories')}</Link>
            <Link to="/products" className={linkBase}>{t('nav.products')}</Link>
            <Link to="/contact" className={linkBase}>{t('nav.contact')}</Link>
            {isLoggedIn && (
              <>
                {(user?.role === 'admin' || user?.role === 'manager') && (
                  <Link to="/admin" className={`${linkBase} font-medium text-makka-brown`}>{t('nav.dashboard')}</Link>
                )}
                <Link to="/profile" className={linkBase}>{t('nav.profile')}</Link>
                <Link to="/orders" className={linkBase}>{t('nav.myOrders')}</Link>
                <Link to="/wishlist" className={`${linkBase} flex items-center gap-1`}>
                  <Heart className="w-4 h-4" /> {t('nav.wishlist')}
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language switcher */}
            <div className="flex rounded-full border border-makka-sand bg-makka-cream/80 p-0.5">
              <button
                type="button"
                onClick={() => setLocale('ar')}
                className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${locale === 'ar' ? 'bg-makka-brown text-white shadow-sm' : 'text-makka-cocoa hover:bg-makka-sand/50'}`}
                aria-label="العربية"
                aria-pressed={locale === 'ar'}
              >
                ع
              </button>
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${locale === 'en' ? 'bg-makka-brown text-white shadow-sm' : 'text-makka-cocoa hover:bg-makka-sand/50'}`}
                aria-label="English"
                aria-pressed={locale === 'en'}
              >
                En
              </button>
            </div>

            <Link
              to="/cart"
              className={`relative p-2 rounded-full hover:bg-makka-sand/50 transition-colors duration-200 text-makka-cocoa ${btnHover}`}
              aria-label={t('nav.cart')}
            >
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-makka-gold text-white text-xs flex items-center justify-center font-medium">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            <div className="relative">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className={`flex items-center gap-2 p-2 rounded-full hover:bg-makka-sand/50 transition-colors duration-200 text-makka-cocoa ${btnHover}`}
                    aria-expanded={menuOpen}
                    aria-haspopup="true"
                    aria-label={t('nav.myAccount')}
                  >
                    <User className="w-6 h-6" />
                    <span className="hidden sm:inline text-sm">{user?.name}</span>
                  </button>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden />
                      <div className="absolute left-0 top-full mt-1 w-48 py-2 bg-white rounded-xl shadow-card-hover border border-makka-sand z-50 animate-fade-in-up">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-makka-cream text-makka-cocoa transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          <User className="w-4 h-4" /> {t('auth.profileMenu')}
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-makka-cream text-makka-cocoa transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          {t('nav.myOrders')}
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-makka-cream text-red-600 transition-colors text-start"
                        >
                          <LogOut className="w-4 h-4" /> {t('nav.logout')}
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className={`flex items-center gap-2 px-4 py-2 rounded-full bg-makka-brown text-white hover:bg-makka-cocoa hover:shadow-glow transition-all duration-200 text-sm ${btnHover}`}
                >
                  <User className="w-4 h-4" /> {t('nav.login')}
                </Link>
              )}
            </div>

            <button
              className={`md:hidden p-2 rounded-lg hover:bg-makka-sand/50 text-makka-cocoa transition-colors ${btnHover}`}
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label={t('nav.menu')}
              aria-expanded={mobileNavOpen}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="md:hidden border-t border-makka-sand bg-white px-4 py-3 flex flex-col gap-1">
            <Link to="/" onClick={() => setMobileNavOpen(false)} className="py-2 text-makka-cocoa hover:text-makka-brown">{t('nav.home')}</Link>
            <Link to="/categories" onClick={() => setMobileNavOpen(false)} className="py-2 text-makka-cocoa hover:text-makka-brown">{t('nav.categories')}</Link>
            <Link to="/products" onClick={() => setMobileNavOpen(false)} className="py-2 text-makka-cocoa hover:text-makka-brown">{t('nav.products')}</Link>
            <Link to="/contact" onClick={() => setMobileNavOpen(false)} className="py-2 text-makka-cocoa hover:text-makka-brown">{t('nav.contact')}</Link>
            {isLoggedIn && (
              <>
                {(user?.role === 'admin' || user?.role === 'manager') && (
                  <Link to="/admin" onClick={() => setMobileNavOpen(false)} className="py-2 font-medium text-makka-brown">{t('nav.dashboard')}</Link>
                )}
                <Link to="/profile" onClick={() => setMobileNavOpen(false)} className="py-2 text-makka-cocoa hover:text-makka-brown">{t('nav.profile')}</Link>
                <Link to="/orders" onClick={() => setMobileNavOpen(false)} className="py-2 text-makka-cocoa hover:text-makka-brown">{t('nav.myOrders')}</Link>
                <Link to="/wishlist" onClick={() => setMobileNavOpen(false)} className="py-2 text-makka-cocoa hover:text-makka-brown">{t('nav.wishlist')}</Link>
              </>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 min-h-[60vh]">
        <Outlet />
      </main>

      <footer className="bg-makka-cocoa text-makka-cream mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-display text-xl font-semibold mb-3">Makka El Halawany</h3>
              <p className="text-makka-cream/90 text-sm">
                {t('footer.tagline')}
              </p>
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold mb-3">{t('nav.quickLinks')}</h3>
              <ul className="space-y-2 text-sm text-makka-cream/90">
                <li><Link to="/" className="hover:text-white transition-colors">{t('nav.home')}</Link></li>
                <li><Link to="/categories" className="hover:text-white transition-colors">{t('nav.categories')}</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">{t('nav.products')}</Link></li>
                <li><Link to="/cart" className="hover:text-white transition-colors">{t('nav.cart')}</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">{t('nav.contact')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold mb-3">{t('nav.contact')}</h3>
              <p className="text-sm text-makka-cream/90">
                {t('footer.contactDesc')}
              </p>
            </div>
          </div>
          <div className="border-t border-makka-cream/20 mt-8 pt-6 text-center text-sm text-makka-cream/80">
            © {new Date().getFullYear()} Makka El Halawany. {t('footer.rights')}
          </div>
        </div>
      </footer>
    </div>
  );
}
