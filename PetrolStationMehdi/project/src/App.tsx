import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Fuel, Phone, Clock, MapPin, Star, ShoppingCart, Plus, Minus, Trash2,
  X, Package, ClipboardList, LayoutGrid, Store, Send, CheckCircle2,
  TrendingUp, PhoneCall, ShieldCheck, Zap, Bell, Search, ImageOff,
  Tag, MessageCircle, Truck, PackageCheck, Gauge, Droplet, AlertTriangle,
  Sun, Moon, Copy, Check, Sparkles, Repeat, Download, Heart, Eye, Info,
} from 'lucide-react';
import {
  CATEGORIES, STORE_PHONE, STORE_PHONE_DISPLAY, STORE_WHATSAPP,
  type Product, type Order, type OrderItem, type FuelPrice,
} from '@/lib/supabase';
import { MOCK_PRODUCTS, MOCK_FUEL_PRICES, migrateProductDescriptions, buildProductStory, localizedStory, refreshProductStory } from '@/lib/mockData';
import { CartProvider, useCart } from '@/lib/useCart';
import { I18nProvider, useI18n } from '@/lib/i18n';
import { AuthProvider, useAuth } from '@/lib/auth';

type Route = 'store' | 'track' | 'manage';

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function loadProductsFromStorage(): Product[] {
  try {
    const stored = localStorage.getItem('local_products');
    if (stored) {
      const data: Product[] = JSON.parse(stored);
      return migrateProductDescriptions(data);
    }
  } catch { /* ignore */ }
  const fresh = migrateProductDescriptions([...MOCK_PRODUCTS]);
  localStorage.setItem('local_products', JSON.stringify(fresh));
  return fresh;
}

const FUEL_SEED_VERSION = '2';

function loadFuelPricesFromStorage(): FuelPrice[] {
  try {
    const version = localStorage.getItem('local_fuel_prices_v');
    const stored = localStorage.getItem('local_fuel_prices');
    if (version === FUEL_SEED_VERSION && stored) {
      const data: FuelPrice[] = JSON.parse(stored);
      if (Array.isArray(data)) return data;
    }
  } catch { /* ignore */ }
  localStorage.setItem('local_fuel_prices', JSON.stringify(MOCK_FUEL_PRICES));
  try {
    localStorage.setItem('local_fuel_prices_v', FUEL_SEED_VERSION);
  } catch { /* ignore */ }
  return MOCK_FUEL_PRICES;
}

function loadOrdersFromStorage(): (Order & { order_items: OrderItem[] })[] {
  try {
    const stored = localStorage.getItem('local_orders');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

function saveOrdersToStorage(orders: (Order & { order_items: OrderItem[] })[]) {
  try { localStorage.setItem('local_orders', JSON.stringify(orders)); } catch { /* ignore */ }
}

function saveProductsToStorage(products: Product[]) {
  try { localStorage.setItem('local_products', JSON.stringify(products)); } catch { /* ignore */ }
}

function saveFuelPricesToStorage(prices: FuelPrice[]) {
  try { localStorage.setItem('local_fuel_prices', JSON.stringify(prices)); } catch { /* ignore */ }
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => {
    const hash = window.location.hash.replace('#/', '');
    if (hash === 'manage' || hash === 'admin') return 'manage';
    if (hash === 'track') return 'track';
    return 'store';
  });
  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem('ms_dark');
      if (stored === '1') return true;
      if (stored === '0') return false;
      return true;
    } catch {
      return true;
    }
  });
  const [routeKey, setRouteKey] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      if (hash === 'manage' || hash === 'admin') setRoute('manage');
      else if (hash === 'track') setRoute('track');
      else setRoute('store');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem('ms_dark', dark ? '1' : '0');
    } catch { /* ignore */ }
  }, [dark]);

  const navigate = (r: Route) => {
    window.location.hash = r === 'manage' ? '#/manage' : r === 'track' ? '#/track' : '#/';
    setRoute(r);
    setRouteKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthProvider>
      <CartProvider>
        <I18nProvider>
        <div className={`min-h-screen transition-colors duration-300 ${dark ? 'dark bg-[#0d0d0d] text-white' : 'bg-amber-50/50 text-stone-900'}`}>
          <Header route={route} navigate={navigate} dark={dark} setDark={setDark} onOpenCart={() => setCartOpen(true)} />
          <div key={routeKey} className="animate-route">
            {route === 'store' ? <Storefront cartOpen={cartOpen} setCartOpen={setCartOpen} /> : route === 'track' ? <OrderTracking /> : <AdminGate />}
          </div>
          <WhatsAppBubble />
          <Footer />
          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />
          <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
        </div>
      </I18nProvider>
      </CartProvider>
    </AuthProvider>
  );
}

/* ---------------- Header ---------------- */

function Header({ route, navigate, dark, setDark, onOpenCart }: { route: Route; navigate: (r: Route) => void; dark: boolean; setDark: (d: boolean) => void; onOpenCart: () => void }) {
  const { count, total } = useCart();
  const { t, language, setLanguage } = useI18n();
  const { isAdmin, signOut } = useAuth();
  const goCart = () => {
    if (route !== 'store') {
      navigate('store');
    }
    onOpenCart();
  };
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white text-stone-900 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('store')} className="group flex items-center gap-3">
              <img src="/3274ee7e2aaf050903e4bca064c1182e~tplv-tiktokx-cropcenter_1080_1080.jpeg" alt="Mehdi Petrol Stations logo" className="h-9 w-9 rounded-full object-cover ring-2 ring-stone-200 transition-transform group-hover:scale-105 dark:ring-amber-500/50" />
              <div className="text-left leading-tight">
                <p className="text-sm font-bold tracking-tight sm:text-base">Mehdi Petrol Stations</p>
                <p className="text-[10px] uppercase tracking-widest text-stone-900 dark:text-amber-400">محطة وقود</p>
              </div>
            </button>
            <div className="flex items-center gap-1">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'fr' | 'ar')}
                title={t('nav_language')}
                className="rounded-lg border border-stone-300 bg-stone-50 px-1.5 py-1 text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-900/30 dark:border-neutral-700 dark:bg-neutral-950 dark:text-stone-200 dark:focus:ring-amber-500/40"
              >
                <option value="en">EN</option>
                <option value="fr">FR</option>
                <option value="ar">عربي</option>
              </select>
              <button onClick={() => setDark(!dark)} className="flex items-center justify-center rounded-lg bg-stone-100 p-1.5 text-stone-600 transition hover:bg-stone-200 active:scale-90 dark:bg-neutral-950 dark:text-stone-300 dark:hover:bg-neutral-800" title={dark ? t('nav_light') : t('nav_dark')}>
                {dark ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {route === 'store' && (
              <button onClick={goCart} title={t('common_cart_title')} aria-label={t('common_cart_title')} className="flex items-center gap-2 rounded-full bg-amber-500 py-1.5 pl-2.5 pr-3 text-xs font-bold text-stone-900 shadow-md shadow-amber-500/30 transition hover:-translate-y-0.5 hover:bg-amber-400 active:scale-95">
                <span className="relative">
                  <ShoppingCart className="h-4 w-4" />
                  {count > 0 && <span key={count} className="animate-badge absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-stone-900 px-1 text-[10px] font-extrabold text-white">{count}</span>}
                </span>
                {count > 0 && <span className="tabular-nums">{formatPrice(total)}</span>}
              </button>
            )}
          </div>
          <nav className="order-last flex w-full items-center justify-center gap-1 pt-1.5 sm:order-none sm:ml-auto sm:w-auto sm:justify-end sm:pt-0">
            <button onClick={() => navigate('store')} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all hover:-translate-y-0.5 active:scale-95 sm:flex-none ${route === 'store' ? 'animate-pop bg-amber-500 text-stone-900 shadow-md shadow-amber-500/25' : 'text-stone-500 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-neutral-800'}`}>
              <Store className="h-4 w-4" /><span>{t('nav_store')}</span>
            </button>
            <button onClick={() => navigate('track')} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all hover:-translate-y-0.5 active:scale-95 sm:flex-none ${route === 'track' ? 'animate-pop bg-amber-500 text-stone-900 shadow-md shadow-amber-500/25' : 'text-stone-500 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-neutral-800'}`}>
              <Truck className="h-4 w-4" /><span>{t('nav_track')}</span>
            </button>
{isAdmin && (
              <button onClick={() => navigate('manage')} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all hover:-translate-y-0.5 active:scale-95 sm:flex-none ${route === 'manage' ? 'animate-pop bg-amber-500 text-stone-900 shadow-md shadow-amber-500/25' : 'text-stone-500 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-neutral-800'}`}>
                <LayoutGrid className="h-4 w-4" /><span>{t('nav_manage')}</span>
              </button>
            )}
            {isAdmin ? (
              <button onClick={() => signOut()} className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-stone-500 transition hover:bg-stone-100 hover:text-red-500 dark:text-stone-300 dark:hover:bg-neutral-800 sm:flex-none" title={t('auth_signout')}>
                <ShieldCheck className="h-4 w-4" /><span className="hidden sm:inline">{t('auth_signout')}</span>
              </button>
            ) : (
              <button onClick={() => navigate('manage')} className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-stone-500 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-neutral-800 sm:flex-none" title={t('auth_admin_login')}>
                <ShieldCheck className="h-4 w-4" /><span className="hidden sm:inline">{t('auth_admin_login')}</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

function WhatsAppBubble() {
  const { t } = useI18n();
  return (
    <a href={`https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(t('wa_intro'))}`} target="_blank" rel="noopener noreferrer" title={t('wa_intro')} className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg shadow-green-600/30 transition hover:bg-green-500 hover:scale-110 active:scale-95">
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}

/* ---------------- Storefront ---------------- */

function Storefront({ cartOpen, setCartOpen }: { cartOpen: boolean; setCartOpen: (v: boolean) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [fuelPrices, setFuelPrices] = useState<FuelPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<string>('featured');
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ name: string; id: number } | null>(null);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('mehdi_wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const { addToCart, count, total: cartTotal } = useCart();
  const { t } = useI18n();

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem('mehdi_wishlist', JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  const addWithFeedback = useCallback((p: Product) => {
    addToCart(p);
    setToast({ name: p.name, id: Date.now() });
  }, [addToCart]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast((cur) => (cur?.id === toast.id ? null : cur)), 1900);
    return () => clearTimeout(id);
  }, [toast]);

  const loadProducts = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      const data = loadProductsFromStorage();
      setProducts(data);
    } catch (e) {
      setError(String(e));
    }
    setLoading(false);
  }, []);

  const loadFuelPrices = useCallback(() => {
    try {
      const data = loadFuelPricesFromStorage();
      setFuelPrices(data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    loadProducts();
    loadFuelPrices();
  }, [loadProducts, loadFuelPrices]);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const matchCat = activeCategory === 'all' ? true : activeCategory === 'saved' ? wishlist.includes(p.id) : p.category === activeCategory;
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.description ?? '').toLowerCase().includes(search.toLowerCase()) || [p.descriptions?.en, p.descriptions?.fr, p.descriptions?.ar].some((d) => d && d.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
    if (sort === 'price_asc') result = [...result].sort((a, b) => effectivePrice(a) - effectivePrice(b));
    else if (sort === 'price_desc') result = [...result].sort((a, b) => effectivePrice(b) - effectivePrice(a));
    else if (sort === 'name') result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    else result = [...result].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return result;
  }, [products, activeCategory, search, sort, wishlist]);

  const featured = products.filter((p) => p.featured).slice(0, 3);
  const onSale = products.filter((p) => p.on_sale && p.sale_price !== null);

  const sortOptions = [
    { key: 'featured', label: t('sort_featured') },
    { key: 'price_asc', label: t('sort_price_asc') },
    { key: 'price_desc', label: t('sort_price_desc') },
    { key: 'name', label: t('sort_name') },
  ];

  return (
    <main>
      <Hero />
      <FuelPriceBoard prices={fuelPrices} />
      {onSale.length > 0 && <OffersBanner products={onSale} onAdd={addWithFeedback} onQuick={(p) => setQuickView(p)} />}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <h2 className="mb-5 border-l-4 border-amber-500 pl-3 text-2xl font-bold text-stone-900 dark:text-white">{t('popular_title')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <FeaturedCard key={p.id} product={p} onAdd={() => addWithFeedback(p)} onQuick={() => setQuickView(p)} />
            ))}
          </div>
        </section>
      )}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6" data-products>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="border-l-4 border-amber-500 pl-3 text-2xl font-bold text-stone-900 dark:text-white">{t('all_products_title')}</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input type="text" placeholder={t('search_placeholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/20 dark:focus:border-amber-500 dark:focus:ring-amber-500/20 dark:border-neutral-700 dark:bg-black dark:text-white" />
            </div>
<label className="flex items-center gap-2 text-sm text-stone-500 dark:text-neutral-400">
              <span>{t('sort_label')}:</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/20 dark:focus:border-amber-500 dark:focus:ring-amber-500/20 dark:border-neutral-700 dark:bg-black dark:text-white">
                {sortOptions.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c.key} onClick={() => setActiveCategory(c.key)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all hover:-translate-y-0.5 active:scale-95 ${activeCategory === c.key ? 'animate-pop bg-amber-500 text-stone-900 shadow-md shadow-amber-500/25 dark:bg-amber-500 dark:text-stone-900' : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400 dark:bg-black dark:text-neutral-300 dark:border-neutral-700'}`}>
              {categoryLabel(t, c.key)}
            </button>
          ))}
          {wishlist.length > 0 && (
            <button onClick={() => setActiveCategory(activeCategory === 'saved' ? 'all' : 'saved')} className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all hover:-translate-y-0.5 active:scale-95 ${activeCategory === 'saved' ? 'animate-pop bg-amber-500 text-stone-900 shadow-md shadow-amber-500/25 dark:bg-amber-500 dark:text-stone-900' : 'bg-white text-stone-600 border border-stone-200 hover:border-amber-400 dark:bg-black dark:text-neutral-300 dark:border-neutral-700'}`}>
              <Heart className={`h-3.5 w-3.5 ${activeCategory === 'saved' ? 'fill-stone-900' : ''}`} /> {t('common_saved')} ({wishlist.length})
            </button>
          )}
        </div>
        {loading ? <ProductGridSkeleton /> : error ? <ErrorState message={error} onRetry={loadProducts} /> : filtered.length === 0 ? <EmptyState /> : (
          <div key={activeCategory + sort} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p, i) => (
              <div key={p.id} style={{ animationDelay: `${Math.min(i, 11) * 40}ms` }} className="animate-fade-up">
                <ProductCard product={p} onAdd={() => addWithFeedback(p)} onQuick={() => setQuickView(p)} wished={wishlist.includes(p.id)} onToggleWish={() => toggleWishlist(p.id)} />
              </div>
            ))}
          </div>
        )}
      </section>
      {!cartOpen && count > 0 && (
        <button onClick={() => setCartOpen(true)} className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-amber-500 pl-4 pr-3 py-3 font-bold text-stone-900 shadow-xl shadow-amber-500/30 transition hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-2xl hover:shadow-amber-500/40 active:scale-95">
          <span className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span key={count} className="animate-badge absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-stone-900 px-1 text-[10px] font-extrabold text-white">{count}</span>
          </span>
          <span className="tabular-nums text-base leading-none">{formatPrice(cartTotal)}</span>
        </button>
      )}
      {toast && (
        <div key={toast.id} className="animate-toast fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-900 shadow-xl dark:border-green-800 dark:bg-black dark:text-white">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-white"><Check className="h-3 w-3" /></span>
          <span><span className="text-stone-900 dark:text-green-400">{toast.name}</span> {t('common_added_to_cart')}</span>
        </div>
      )}
      <QuickViewModal
        product={quickView}
        onClose={() => setQuickView(null)}
        wished={quickView ? wishlist.includes(quickView.id) : false}
        onToggleWish={quickView ? () => toggleWishlist(quickView.id) : undefined}
        onAdd={(p, qty) => { for (let i = 0; i < qty; i++) addToCart(p); }}
      />
    </main>
  );
}

function Hero() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-100 via-amber-50/60 to-white text-stone-900 transition-colors duration-300 dark:from-black dark:via-neutral-950 dark:to-black dark:text-white">
      <div className="absolute inset-0 opacity-40">
        <div className="animate-blob absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-300/70 blur-3xl dark:bg-amber-500" style={{ animationDelay: '0s' }} />
        <div className="animate-blob absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-orange-200/80 blur-3xl dark:bg-amber-600" style={{ animationDelay: '-4.5s' }} />
      </div>
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span className="animate-particle absolute left-[8%] top-[18%] h-2 w-2 rounded-full bg-amber-400/70 dark:bg-amber-500/60" style={{ animationDelay: '0s', animationDuration: '7s' }} />
        <span className="animate-particle absolute left-[85%] top-[24%] h-3 w-3 rounded-full bg-amber-500/60 dark:bg-amber-400/50" style={{ animationDelay: '-1.4s', animationDuration: '8s' }} />
        <span className="animate-particle absolute left-[20%] top-[72%] h-1.5 w-1.5 rounded-full bg-orange-400/60 dark:bg-amber-500/50" style={{ animationDelay: '-2.8s', animationDuration: '6.5s' }} />
        <span className="animate-particle absolute left-[60%] top-[15%] h-2.5 w-2.5 rounded-full bg-amber-400/70 dark:bg-amber-500/60" style={{ animationDelay: '-4.2s', animationDuration: '8.5s' }} />
        <span className="animate-particle absolute left-[72%] top-[68%] h-2 w-2 rounded-full bg-amber-500/50 dark:bg-amber-400/50" style={{ animationDelay: '-5.6s', animationDuration: '7.5s' }} />
        <span className="animate-particle absolute left-[40%] top-[85%] h-1.5 w-1.5 rounded-full bg-orange-400/60 dark:bg-amber-500/50" style={{ animationDelay: '-3.5s', animationDuration: '6s' }} />
        <span className="animate-particle absolute left-[94%] top-[55%] h-2 w-2 rounded-full bg-amber-400/60 dark:bg-amber-500/50" style={{ animationDelay: '-0.9s', animationDuration: '8s' }} />
        <span className="animate-particle absolute left-[5%] top-[45%] h-1.5 w-1.5 rounded-full bg-amber-500/60 dark:bg-amber-400/50" style={{ animationDelay: '-6.3s', animationDuration: '7s' }} />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-stone-900 shadow-md shadow-amber-500/30 ring-1 ring-amber-400 transition-colors">
            <Sparkles className="h-3.5 w-3.5" /> {t('info_open')}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {t('hero_title')}
          </h1>
          <span className="mt-4 block h-1.5 w-24 rounded-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500" />
          <p className="mt-5 text-lg text-stone-600 dark:text-stone-300">{t('hero_sub')}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#products" onClick={(e) => { e.preventDefault(); document.querySelector('[data-products]')?.scrollIntoView({ behavior: 'smooth' }); }} className="animate-sheen inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-3 font-bold text-stone-900 shadow-lg shadow-amber-500/30 transition hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-xl hover:shadow-amber-500/40 active:scale-95">
              <ShoppingCart className="h-5 w-5" /> {t('hero_shop_now')}
            </a>
            <a href={`tel:${STORE_PHONE}`} className="inline-flex items-center gap-2 rounded-lg border border-stone-400 bg-white/70 px-5 py-3 font-semibold text-stone-800 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:scale-95 dark:border-stone-600 dark:bg-black/40 dark:text-white dark:hover:bg-neutral-800" title={t('hero_call')}>
              <Phone className="h-5 w-5" /> {t('hero_call')}: <span dir="ltr" className="tabular-nums" style={{ unicodeBidi: 'isolate' }}>{STORE_PHONE_DISPLAY}</span>
            </a>
            <button onClick={() => { navigator.clipboard.writeText(STORE_PHONE); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className={`flex h-[46px] w-[46px] items-center justify-center rounded-lg border transition active:scale-90 ${copied ? 'border-green-500 bg-green-600 text-white' : 'border-stone-400 bg-white/70 text-stone-600 hover:bg-white dark:border-stone-600 dark:bg-black/40 dark:text-stone-300 dark:hover:bg-neutral-800'}`} title={copied ? t('common_phone_copied') : t('common_copy_phone')} aria-label={t('common_copy_phone')}>
              {copied ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Fuel Price Board ---------------- */

function FuelPriceBoard({ prices }: { prices: FuelPrice[] }) {
  const { t } = useI18n();
  if (prices.length === 0) return null;
  return (
    <section className="bg-gradient-to-r from-white to-amber-50/60 text-stone-900 transition-colors duration-300 dark:from-black dark:to-neutral-950 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="mb-5 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"><Gauge className="h-5 w-5" /></span>
          <h2 className="border-l-4 border-amber-500 pl-3 text-lg font-bold">{t('fuel_board_title')}</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {prices.map((fp) => (
            <div key={fp.id} className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400/70 hover:shadow-lg hover:shadow-amber-500/10 dark:border-neutral-800 dark:bg-black dark:hover:border-amber-500/40">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 transition-colors dark:bg-amber-500/15 dark:text-amber-400">
                  <Droplet className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold">{fp.fuel_type}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{t('fuel_per')} {fp.unit}</p>
                </div>
              </div>
              <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">
                {fp.price} DA
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Special Offers Banner ---------------- */

function OffersBanner({ products, onAdd, onQuick }: { products: Product[]; onAdd: (p: Product) => void; onQuick: (p: Product) => void }) {
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="mb-5 flex items-center gap-2">
        <Tag className="h-5 w-5 text-red-500" />
        <h2 className="border-l-4 border-amber-500 pl-3 text-2xl font-bold text-stone-900 dark:text-white">{t('offers_title')}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <OfferProductCard key={p.id} product={p} onAdd={onAdd} onQuick={() => onQuick(p)} />
        ))}
      </div>
    </section>
  );
}

function OfferProductCard({ product, onAdd, onQuick }: { product: Product; onAdd: (p: Product) => void; onQuick: () => void }) {
  const { language, t } = useI18n();
  const [added, setAdded] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const handleAdd = () => {
    onAdd(product);
    setAdded(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1000);
  };

  return (
    <div onClick={onQuick} className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-red-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-red-300 dark:border-red-900 dark:bg-neutral-900 dark:hover:border-red-700">
      <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
        <Tag className="h-3 w-3" /> {t('common_sale')}
      </div>
      <div className="relative">
        <ProductImage product={product} className="h-52 bg-gradient-to-br from-white to-stone-100 dark:from-neutral-900 dark:to-black" iconClass="h-14 w-14 text-stone-500 dark:text-red-400" />
        {onQuick && (
          <button onClick={(e) => { e.stopPropagation(); onQuick(); }} className="absolute inset-x-0 bottom-3 z-10 mx-auto flex w-max items-center gap-1.5 rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold text-stone-900 shadow-md backdrop-blur transition hover:scale-105 hover:bg-white active:scale-95 dark:bg-black/80 dark:text-white sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 sm:focus-visible:opacity-100">
            <Eye className="h-3.5 w-3.5" /> {t('common_quick_view')}
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-stone-900 dark:text-white">{product.name}</h3>
        <p className="mt-0.5 line-clamp-2 text-sm text-stone-500 dark:text-neutral-400">{localizedDescription(product, language)}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-red-600">{formatPrice(product.sale_price!)}</span>
            <span className="text-sm text-stone-400 line-through">{formatPrice(product.price)}</span>
          </div>
          <div className="relative">
            {added && <span className="animate-float pointer-events-none absolute -top-9 right-1 z-10 text-sm font-extrabold text-green-600 dark:text-green-400">+1</span>}
            <button onClick={(e) => { e.stopPropagation(); handleAdd(); }} className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition active:scale-95 ${added ? 'bg-green-600 text-white' : 'bg-red-500 text-white hover:bg-red-400'}`}>
              {added ? <><Check className="animate-pop h-4 w-4" /><span className="sr-only">✓</span></> : <><Plus className="h-4 w-4" /> {t('offers_add')}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Product Image ---------------- */

function ProductImage({ product, className, iconClass, fill }: { product: Product; className?: string; iconClass?: string; fill?: boolean }) {
  const [imgError, setImgError] = useState(false);
  const shape = fill ? '' : 'aspect-square';
  if (product.image_url && !imgError) {
    return (
      <div className={`relative ${shape} overflow-hidden bg-gradient-to-br from-white via-stone-50 to-stone-100 dark:from-neutral-900 dark:via-black dark:to-neutral-950 ${className ?? ''}`}>
        <img src={product.image_url} alt={product.name} loading="lazy" onError={() => setImgError(true)} className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-105" />
      </div>
    );
  }
  return (
    <div className={`flex ${shape} items-center justify-center bg-gradient-to-br from-white via-stone-50 to-stone-100 dark:from-neutral-900 dark:via-black dark:to-neutral-950 ${className ?? ''}`}>
      {imgError && product.image_url ? (
        <ImageOff className={`h-8 w-8 text-stone-400 ${iconClass ?? ''}`} />
      ) : (
        <ProductIcon category={product.category} className={iconClass ?? 'h-12 w-12 text-stone-700'} />
      )}
    </div>
  );
}

/* ---------------- Product Cards ---------------- */

function isOutOfStock(p: Product): boolean {
  return p.stock !== null && p.stock <= 0;
}

function effectivePrice(p: Product): number {
  return p.on_sale && p.sale_price !== null ? p.sale_price : p.price;
}

function FeaturedCard({ 
  product, 
  onAdd, 
  onQuick, 
}: { 
  product: Product; 
  onAdd: () => void; 
  onQuick?: () => void; 
}) {
  const { language, t } = useI18n();
  const oos = isOutOfStock(product);
  const [added, setAdded] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const handleAdd = () => {
    if (oos) return;
    if (timer.current) window.clearTimeout(timer.current);
    onAdd();
    setAdded(true);
    timer.current = window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div onClick={onQuick} className={`group relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white transition-all duration-300 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900 ${onQuick ? 'cursor-pointer' : ''}`}>
      <ProductImage product={product} className="h-44 bg-gradient-to-br from-amber-50 to-stone-100 dark:from-neutral-900 dark:to-black" iconClass="h-12 w-12 text-stone-400" />
      <div className="p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">{categoryLabel(t, product.category)}</span>
        <h3 className="mt-1 font-bold text-stone-900 dark:text-white">{product.name}</h3>
        <p className="mt-0.5 line-clamp-2 text-sm text-stone-500 dark:text-neutral-400">{localizedDescription(product, language)}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-stone-900 dark:text-white">
              {formatPrice(effectivePrice(product))}
            </span>
            {product.on_sale && product.sale_price !== null && (
              <span className="text-sm text-stone-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
            <span className="ml-0.5 text-xs text-stone-400">/ {product.unit}</span>
          </div>
          <div className="relative">
            {added && !oos && (
              <span className="animate-float pointer-events-none absolute -top-9 right-1 z-10 text-sm font-extrabold text-green-600 dark:text-green-400">+1</span>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); handleAdd(); }} 
              disabled={oos} 
              className={`flex h-9 w-9 items-center justify-center rounded-lg shadow-md shadow-amber-500/25 transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 ${added ? 'bg-green-600 text-white' : 'bg-amber-500 text-stone-900 hover:bg-amber-400 dark:bg-amber-500'}`}
            >
              {added ? <Check className="animate-pop h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function ProductCard({ product, onAdd, onQuick, wished, onToggleWish }: { product: Product; onAdd: () => void; onQuick?: () => void; wished?: boolean; onToggleWish?: () => void }) {
  const { language, t } = useI18n();
  const oos = isOutOfStock(product);
  const lowStock = product.stock !== null && product.stock > 0 && product.stock <= 3;
  const [added, setAdded] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const handleAdd = () => {
    if (oos) return;
    onAdd();
    setAdded(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1000);
  };

  return (
    <div onClick={onQuick} className={`group relative flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-400/60 hover:shadow-xl hover:shadow-amber-500/10 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-amber-500/40 dark:hover:shadow-amber-500/10 ${onQuick ? 'cursor-pointer' : ''}`}>
      {onToggleWish && (
        <button onClick={(e) => { e.stopPropagation(); onToggleWish(); }} aria-label={t('common_saved')} title={t('common_saved')} className="absolute left-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-stone-400 shadow-sm transition hover:scale-110 hover:text-amber-500 active:scale-90 dark:bg-black/70 dark:text-stone-400">
          <Heart className={`h-4 w-4 ${wished ? 'fill-amber-500 text-amber-500' : ''}`} />
        </button>
      )}
      <div className="relative">
        <ProductImage product={product} className="transition duration-500" iconClass="h-14 w-14 text-stone-500 transition-colors duration-300 group-hover:text-stone-900 dark:text-stone-400 dark:group-hover:text-amber-400" />
        <div className="absolute bottom-3 left-3 z-10 flex items-baseline gap-1 rounded-md bg-white/90 px-2 py-1 text-sm font-extrabold text-stone-900 shadow-sm backdrop-blur dark:bg-black/80 dark:text-white">
          {formatPrice(effectivePrice(product))}
        </div>
        {onQuick && (
          <button onClick={(e) => { e.stopPropagation(); onQuick(); }} className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-stone-900 shadow-md backdrop-blur transition hover:scale-105 hover:bg-white active:scale-95 dark:bg-black/80 dark:text-white sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 sm:focus-visible:opacity-100">
            <Eye className="h-3.5 w-3.5" /> {t('common_quick_view')}
          </button>
        )}
        <div className={`absolute top-3 right-3 z-10 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm backdrop-blur ${oos ? 'bg-red-100 text-red-600 dark:bg-red-950/80 dark:text-red-400' : lowStock ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-950/80 dark:text-green-400'}`}>
          {oos ? t('common_oos') : lowStock ? t('common_low_stock_left').replace('{n}', String(product.stock)) : t('admin_prod_available')}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">{categoryLabel(t, product.category)}</span>
        <h3 className="mt-1 font-bold text-stone-900 dark:text-white">{product.name}</h3>
        <p className="mt-0.5 line-clamp-2 flex-1 text-sm text-stone-500 dark:text-neutral-400">{localizedDescription(product, language)}</p>
        {lowStock && <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-stone-800 dark:text-amber-400"><AlertTriangle className="h-3 w-3" /> {t('common_low_stock_left').replace('{n}', String(product.stock))}</p>}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-lg font-extrabold tabular-nums text-stone-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white">{formatPrice(effectivePrice(product))}</span>
            {product.on_sale && product.sale_price !== null && <span className="text-xs text-stone-400 line-through">{formatPrice(product.price)}</span>}
            <span className="ml-0.5 text-xs text-stone-400">/ {product.unit}</span>
          </div>
          <div className="relative">
            {added && !oos && <span className="animate-float pointer-events-none absolute -top-9 right-1 z-10 text-sm font-extrabold text-green-600 dark:text-green-400">+1</span>}
            <button onClick={(e) => { e.stopPropagation(); handleAdd(); }} disabled={oos} className={`flex h-9 w-9 items-center justify-center rounded-lg shadow-md shadow-amber-500/25 transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 ${added ? 'bg-green-600 text-white' : 'bg-amber-500 text-stone-900 hover:bg-amber-400 dark:bg-amber-500 dark:hover:bg-amber-400'}`} aria-label={`${t('common_add')} ${product.name}`}>
              {added ? <Check className="animate-pop h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-black">
          <div className="mb-4 h-52 rounded-lg bg-stone-100 dark:bg-neutral-800" />
          <div className="mb-2 h-3 w-20 rounded bg-stone-100 dark:bg-neutral-800" />
          <div className="mb-2 h-4 w-32 rounded bg-stone-100 dark:bg-neutral-800" />
          <div className="h-3 w-48 rounded bg-stone-100 dark:bg-neutral-800" />
          <div className="mt-4 flex justify-between">
            <div className="h-6 w-16 rounded bg-stone-100 dark:bg-neutral-800" />
            <div className="h-9 w-9 rounded bg-stone-100 dark:bg-neutral-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-10 text-center dark:border-red-900 dark:bg-red-950/40">
      <p className="font-semibold text-red-700 dark:text-red-400">{t('common_load_error')}</p>
      <p className="mt-1 text-sm text-red-500 dark:text-red-400/70">{message}</p>
      <button onClick={onRetry} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500">{t('common_try_again')}</button>
    </div>
  );
}

function EmptyState() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-stone-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-black">
      <Package className="h-12 w-12 text-stone-300 dark:text-neutral-700" />
      <p className="mt-3 font-semibold text-stone-700 dark:text-white">{t('common_no_products')}</p>
      <p className="text-sm text-stone-500 dark:text-neutral-400">{t('common_no_products_sub')}</p>
    </div>
  );
}

/* ---------------- Quick View Modal ---------------- */

function QuickViewModal({ product, onClose, onAdd, wished, onToggleWish }: {
  product: Product | null;
  onClose: () => void;
  onAdd: (p: Product, qty: number) => void;
  wished?: boolean;
  onToggleWish?: () => void;
}) {
  const { language, t } = useI18n();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (product) setAdded(false);
  }, [product]);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  useEffect(() => {
    if (!product) return;
    setQty(1);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [product, onClose]);

  if (!product) return null;

  const oos = product.stock !== null && product.stock <= 0;
  const lowStock = product.stock !== null && product.stock > 0 && product.stock <= 3;
  const price = effectivePrice(product);
  const maxQty = product.stock !== null ? Math.min(30, product.stock) : 30;
  const discount = product.on_sale && product.sale_price !== null && product.sale_price < product.price
    ? Math.round((1 - product.sale_price / product.price) * 100) : 0;
  const story = localizedStory(product, language);

  const handleAdd = () => {
    if (oos) return;
    onAdd(product, qty);
    setAdded(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex min-h-full items-center justify-center p-3 sm:p-6">
        <div className="relative flex max-h-[calc(100dvh-3rem)] w-full max-w-6xl animate-pop flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-950 lg:flex-row">
          <button onClick={onClose} className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-600 shadow-md transition hover:bg-white hover:text-stone-900 active:scale-90 dark:bg-black/80 dark:text-stone-300 dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
          <div className="relative flex h-80 shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-white to-stone-100 dark:from-neutral-900 dark:via-black dark:to-neutral-950 sm:h-[26rem] lg:min-h-full lg:w-1/2">
            <ProductImage product={product} className="h-full w-full" iconClass="h-28 w-28 text-stone-300 dark:text-neutral-700" fill />
            {discount > 0 && (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-extrabold text-white shadow-md">-{discount}%</span>
            )}
          </div>
          <div className="flex flex-1 flex-col overflow-hidden p-6 sm:p-8">
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">{categoryLabel(t, product.category)}</span>
                  <h2 className="mt-1 text-2xl font-extrabold leading-tight text-stone-900 dark:text-white sm:text-3xl">{product.name}</h2>
                </div>
                {onToggleWish && (
                  <button onClick={onToggleWish} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 text-stone-400 transition hover:scale-110 hover:text-amber-500 active:scale-90 dark:border-neutral-700" aria-label={t('common_saved')}>
                    <Heart className={`h-5 w-5 ${wished ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-stone-900 dark:text-white">{formatPrice(price)}</span>
                  {product.on_sale && product.sale_price !== null && (
                    <span className="text-lg text-stone-400 line-through">{formatPrice(product.price)}</span>
                  )}
                  <span className="text-sm font-medium text-stone-400">/ {product.unit}</span>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${oos ? 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400' : lowStock ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'}`}>
                  {oos ? t('common_oos') : lowStock ? t('common_low_stock_left').replace('{n}', String(product.stock)) : t('admin_prod_available')}
                </span>
              </div>
              <div className="mt-6 space-y-6 border-t border-stone-100 pt-5 dark:border-neutral-800">
                <div className="group">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    <Info className="h-4 w-4" /> {t('qv_what')}
                  </h3>
                  <p className="mt-2 whitespace-pre-line text-[15px] leading-7 text-stone-600 dark:text-neutral-300">
                    {story.whatItDoes || t('common_no_desc')}
                  </p>
                </div>
                {story.features.length > 0 && (
                  <div className="group">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                      <Package className="h-4 w-4" /> {t('qv_features')}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {story.features.map((f) => (
                        <span key={f} className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">{f}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="group">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" /> {t('qv_problem')}
                  </h3>
                  <p className="mt-2 text-[15px] leading-7 text-stone-600 dark:text-neutral-300">{story.problemSolves}</p>
                </div>
                <div className="group">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    <CheckCircle2 className="h-4 w-4" /> {t('qv_best')}
                  </h3>
                  <p className="mt-2 text-[15px] leading-7 text-stone-600 dark:text-neutral-300">{story.bestFor}</p>
                </div>
              </div>
            </div>
            <div className="mt-auto flex flex-wrap items-center gap-3 pt-6 border-t border-stone-100 dark:border-neutral-800">
              <div className="flex items-center rounded-xl border border-stone-200 dark:border-neutral-700">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={oos} className="flex h-11 w-11 items-center justify-center text-stone-600 transition hover:bg-stone-100 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 dark:text-neutral-300 dark:hover:bg-neutral-800" aria-label="-">
                  <Minus className="h-5 w-5" />
                </button>
                <span className="flex h-11 w-14 items-center justify-center border-x border-stone-200 text-base font-bold text-stone-900 dark:border-neutral-700 dark:text-white">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={oos} className="flex h-11 w-11 items-center justify-center text-stone-600 transition hover:bg-stone-100 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 dark:text-neutral-300 dark:hover:bg-neutral-800" aria-label="+">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <button onClick={handleAdd} disabled={oos} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold shadow-lg transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 ${added ? 'bg-green-600 text-white' : 'bg-amber-500 text-stone-900 shadow-amber-500/25 hover:-translate-y-0.5 hover:bg-amber-400 dark:bg-amber-500'}`}>
                {oos ? t('common_oos') : added ? <><Check className="h-5 w-5" /> {t('common_added_to_cart')}</> : <><Plus className="h-5 w-5" /> {t('common_add')}</>}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ---------------- Cart Drawer ---------------- */

function CartDrawer({ open, onClose, onCheckout }: { open: boolean; onClose: () => void; onCheckout: () => void }) {
  const { cart, updateQuantity, removeFromCart, total, count } = useCart();
  const { t } = useI18n();
  return (
    <>
      <div className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={onClose} />
      <aside className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-neutral-950 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-4 dark:border-neutral-800 dark:bg-neutral-950">
          <h2 className="flex items-center gap-2 text-lg font-bold dark:text-white"><ShoppingCart className="h-5 w-5" /> {t('common_cart_title')} {count > 0 && <span className="text-sm font-normal text-stone-500 dark:text-neutral-400">({count})</span>}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-neutral-800"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingCart className="h-12 w-12 text-stone-300 dark:text-neutral-700" />
              <p className="mt-3 font-semibold text-stone-700 dark:text-white">{t('common_cart_empty')}</p>
              <p className="text-sm text-stone-500 dark:text-neutral-400">{t('common_cart_empty_sub')}</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {cart.map((item, i) => (
                <li key={item.product.id} style={{ animationDelay: `${i * 45}ms` }} className="animate-fade-up flex gap-3 rounded-xl border border-stone-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
                  <ProductImage product={item.product} className="h-16 w-16 shrink-0 rounded-lg bg-stone-100 dark:bg-black" iconClass="h-7 w-7 text-stone-600" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-stone-900 dark:text-white">{item.product.name}</p>
                      <button onClick={() => removeFromCart(item.product.id)} className="text-stone-400 hover:text-red-500 transition-colors" aria-label={t('admin_prod_delete')}><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-neutral-400">{formatPrice(effectivePrice(item.product))} / {item.product.unit}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-lg border border-stone-200 dark:border-neutral-700">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center text-stone-600 hover:bg-stone-100 dark:text-neutral-300 dark:hover:bg-neutral-800"><Minus className="h-4 w-4" /></button>
                        <input type="text" inputMode="numeric" pattern="[0-9]*" value={item.quantity} onChange={(e) => updateQuantity(item.product.id, Math.max(0, Number(cleanNumeric(e.target.value, false))))} className="h-8 w-12 border-x border-stone-200 bg-white text-center text-sm font-bold focus:outline-none dark:border-neutral-700 dark:bg-black dark:text-white" />
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center text-stone-600 hover:bg-stone-100 dark:text-neutral-300 dark:hover:bg-neutral-800"><Plus className="h-4 w-4" /></button>
                      </div>
                      <span className="font-extrabold text-stone-900 dark:text-white">{formatPrice(effectivePrice(item.product) * item.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {cart.length > 0 && (
          <div className="border-t border-stone-200 bg-white px-5 py-6 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500 dark:text-neutral-400">{t('cart_subtotal')}</span>
                <span className="font-semibold text-stone-900 dark:text-white">{formatPrice(total)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500 dark:text-neutral-400">{t('cart_shipping_pickup')}</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{formatPrice(0)}</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-stone-400 dark:text-neutral-500">{t('cart_shipping_note')}</p>
            <div className="mt-4 flex items-center justify-between border-t border-dashed border-stone-200 pt-4 dark:border-neutral-700">
              <span className="text-sm font-medium text-stone-500 dark:text-neutral-400">{t('checkout_total')}</span>
              <span className="text-3xl font-extrabold text-stone-900 dark:text-white">{formatPrice(total)}</span>
            </div>
            <button onClick={onCheckout} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-4 text-base font-bold text-stone-900 shadow-lg shadow-amber-500/30 transition hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-xl active:scale-[0.99]">
              <Send className="h-5 w-5" /> {t('checkout_title')}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

/* ---------------- Checkout Modal ---------------- */

function CheckoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, total, clearCart } = useCart();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [lastOrder, setLastOrder] = useState<{ items: { name: string; qty: number; price: number }[]; total: number; name: string; phone: string; address: string; notes: string } | null>(null);

  useEffect(() => {
    if (open) { setSuccess(false); setOrderId(null); setLastOrder(null); }
  }, [open]);

  if (!open) return null;

  const buildWhatsAppMessage = (id: string, order: NonNullable<typeof lastOrder>): string => {
    const lines = order.items.map((i) => `• ${i.name} x${i.qty} — ${formatPrice(i.price * i.qty)}`);
    return encodeURIComponent(
      `${t('wa_intro')}\n\n${t('wa_order').replace('{id}', '#' + id.slice(0, 8))}:\n${lines.join('\n')}\n\n${t('wa_total')}: ${formatPrice(order.total)}\n\n${t('wa_name')}: ${order.name}\n${t('wa_phone')}: ${order.phone}\n${order.address ? `${t('wa_address')}: ${order.address}\n` : ''}${order.notes ? `${t('wa_notes')}: ${order.notes}\n` : ''}${t('wa_confirm')}`,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setSubmitting(true);
    const id = uid();
    const items = cart.map((i) => ({ id: uid(), order_id: id, product_id: i.product.id, product_name: i.product.name, price: effectivePrice(i.product), quantity: i.quantity, created_at: new Date().toISOString() }));
    const newOrder: Order = { id, customer_name: name, customer_phone: phone, customer_address: address || null, notes: notes || null, total, status: 'pending', created_at: new Date().toISOString() };
    const snapshot = { items: items.map((it) => ({ name: it.product_name, qty: it.quantity, price: it.price })), total, name, phone, address, notes };
    try {
      const orders = loadOrdersFromStorage();
      orders.unshift({ ...newOrder, order_items: items });
      saveOrdersToStorage(orders);
      setOrderId(id);
      setLastOrder(snapshot);
      setSuccess(true);
      clearCart();
      setName(''); setPhone(''); setAddress(''); setNotes('');
    } catch (e2) {
      setSuccess(false);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg animate-pop overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-black">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-neutral-800">
          <h2 className="text-lg font-bold dark:text-white">{t('checkout_title')}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-neutral-800"><X className="h-5 w-5" /></button>
        </div>
        {success && orderId ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40"><CheckCircle2 className="h-9 w-9 text-green-600" /></div>
            <h3 className="mt-4 text-xl font-bold text-stone-900 dark:text-white">{t('checkout_success_title')}</h3>
            <p className="mt-2 text-stone-500 dark:text-neutral-400">{t('checkout_success_msg').replace('#.', '#' + orderId.slice(0, 8) + '.')}</p>
            <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
              <a href={`https://wa.me/${STORE_WHATSAPP}?text=${buildWhatsAppMessage(orderId, lastOrder!)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-500">
                <MessageCircle className="h-5 w-5" /> {t('checkout_whatsapp')}
              </a>
              <button onClick={onClose} className="rounded-lg px-6 py-2.5 font-semibold text-stone-600 hover:bg-stone-100 dark:text-neutral-300 dark:hover:bg-neutral-800">{t('checkout_done')}</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <div className="mb-4 rounded-lg border border-stone-200 bg-white p-3 text-sm text-stone-600 dark:border-neutral-800 dark:bg-black dark:text-neutral-300">
              <p className="font-semibold text-stone-800 dark:text-white">{t('checkout_summary')} ({cart.length} {t('cart_items')})</p>
              <p className="mt-1">{t('checkout_total')}: {formatPrice(total)}</p>
            </div>
            <div className="space-y-4">
              <Field label={t('checkout_name')} required><input required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder={t('checkout_name_placeholder')} /></Field>
              <Field label={t('checkout_phone')} required><input required type="tel" inputMode="tel" dir="ltr" value={phone} onChange={(e) => setPhone(cleanPhone(e.target.value))} className="input" placeholder={t('checkout_phone_placeholder')} /></Field>
              <Field label={t('checkout_address')}><input value={address} onChange={(e) => setAddress(e.target.value)} className="input" placeholder={t('checkout_address_placeholder')} /></Field>
              <Field label={t('checkout_notes')}><textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input min-h-[80px] resize-y" placeholder={t('checkout_notes_placeholder')} /></Field>
            </div>
            <button type="submit" disabled={submitting || cart.length === 0} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 py-3.5 font-bold text-stone-900 shadow-lg shadow-amber-500/25 transition hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-xl active:scale-[0.99] disabled:opacity-50">
              {submitting ? t('common_placing_order') : `${t('checkout_submit')} — ${formatPrice(total)}`}
            </button>
          </form>
        )}
        </div>
      </div>
    );
  }

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-stone-700 dark:text-neutral-300">{label} {required && <span className="text-red-500">*</span>}</span>
      {children}
    </label>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-neutral-500">
        <span className="h-px flex-1 bg-stone-200 dark:bg-neutral-800" />
        {title}
        <span className="h-px flex-1 bg-stone-200 dark:bg-neutral-800" />
      </h3>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label, accent }: { checked: boolean; onChange: (v: boolean) => void; label: string; accent?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`flex w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2.5 text-sm font-medium text-stone-700 transition hover:border-stone-400 active:scale-[0.99] dark:bg-black dark:text-neutral-200 ${checked ? (accent ? 'border-amber-500/60 dark:border-amber-500/60' : 'border-stone-400 dark:border-stone-600') : 'border-stone-200 dark:border-neutral-700'}`}>
      <span className="flex items-center gap-2">{label}</span>
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? (accent ? 'bg-amber-500' : 'bg-stone-900 dark:bg-amber-500') : 'bg-stone-300 dark:bg-neutral-700'}`}>
        <span className={`absolute top-0.5 inline-block h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? 'start-[calc(100%-1.25rem)]' : 'start-0.5'}`} />
      </span>
    </button>
  );
}

/* ---------------- Order Tracking ---------------- */

function OrderTracking() {
  const { t } = useI18n();
  const { addToCart } = useCart();
  const [phone, setPhone] = useState('');
  const [searched, setSearched] = useState(false);
  const [orders, setOrders] = useState<(Order & { order_items: OrderItem[] })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reordered, setReordered] = useState<Record<string, boolean>>({});

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const allOrders = loadOrdersFromStorage();
      const found = allOrders.filter((o) => o.customer_phone === phone.trim()).sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''));
      setOrders(found);
    } catch (e2) {
      setError(String(e2));
    }
    setLoading(false);
  };

  const statusColors: Record<string, string> = { pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400', confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400', completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400', cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' };

  const handleReorder = (o: Order & { order_items: OrderItem[] }) => {
    const products = loadProductsFromStorage();
    o.order_items.forEach((it) => {
      const p = products.find((x) => x.id === it.product_id && x.available);
      if (p) addToCart(p, Math.max(1, it.quantity));
    });
    setReordered((prev) => ({ ...prev, [o.id]: true }));
    window.setTimeout(() => setReordered((prev) => ({ ...prev, [o.id]: false })), 2000);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-900 dark:bg-amber-900/40 dark:text-amber-400"><Truck className="h-7 w-7" /></div>
        <h1 className="inline-block border-l-4 border-amber-500 pl-3 text-2xl font-bold text-stone-900 dark:text-white">{t('track_title')}</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-neutral-400">{t('track_sub')}</p>
      </div>
      <form onSubmit={handleSearch} className="mx-auto mb-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
        <input type="tel" inputMode="tel" dir="ltr" required value={phone} onChange={(e) => setPhone(cleanPhone(e.target.value))} placeholder={t('track_placeholder')} className="flex-1 rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/20 dark:focus:border-amber-500 dark:focus:ring-amber-500/20 dark:border-neutral-700 dark:bg-black dark:text-white" />
        <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 font-bold text-stone-900 shadow-lg shadow-amber-500/25 transition hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-xl active:scale-[0.98] disabled:opacity-50">
          <Search className="h-5 w-5" /> {loading ? t('common_searching') : t('track_search')}
        </button>
      </form>
      {error && <p className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-950/40 dark:text-red-400">{error}</p>}
      {searched && !loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center rounded-xl border border-stone-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-black">
          <PackageCheck className="h-12 w-12 text-stone-300 dark:text-neutral-700" />
          <p className="mt-3 font-semibold text-stone-700 dark:text-white">{t('track_no_orders')}</p>
          <p className="text-sm text-stone-500 dark:text-neutral-400">{t('track_no_orders_sub')}</p>
        </div>
      )}
      {orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-black">
              <div className="flex items-center justify-between">
                <div><p className="font-bold text-stone-900 dark:text-white">{t('common_order')} #{o.id.slice(0, 8)}</p><p className="text-sm text-stone-500 dark:text-neutral-400">{new Date(o.created_at).toLocaleString()}</p></div>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${statusColors[o.status] ?? 'bg-stone-100 text-stone-600'}`}>{t('admin_orders_status_' + o.status)}</span>
              </div>
              <div className="mt-4 divide-y divide-stone-100 dark:divide-neutral-800">
                {o.order_items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between py-2 text-sm"><span className="text-stone-700 dark:text-neutral-300">{it.product_name} x{it.quantity}</span><span className="font-semibold text-stone-900 dark:text-white">{formatPrice(it.price * it.quantity)}</span></div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3 dark:border-neutral-800">
                <span className="text-sm text-stone-500 dark:text-neutral-400">{t('checkout_total')}</span>
                <span className="text-xl font-extrabold text-stone-900 dark:text-white">{formatPrice(o.total)}</span>
              </div>
              <button onClick={() => handleReorder(o)} className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition active:scale-[0.98] ${reordered[o.id] ? 'bg-green-600 text-white' : 'bg-amber-500 text-stone-900 shadow-md shadow-amber-500/25 hover:-translate-y-0.5 hover:bg-amber-400 dark:bg-amber-500 dark:hover:bg-amber-400'}`}>
                {reordered[o.id] ? <><CheckCircle2 className="h-4 w-4 animate-pop" /> {t('track_reordered')}</> : <><Repeat className="h-4 w-4" /> {t('track_reorder')}</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

/* ---------------- Admin Auth Gate ---------------- */

function AdminGate() {
  const { t } = useI18n();
  const { user, isAdmin, loading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-stone-400">{t('common_loading')}</p>
      </main>
    );
  }

  if (isAdmin) return <AdminPanel />;

  if (user && !isAdmin) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-amber-500" />
        <h1 className="text-xl font-bold text-stone-900 dark:text-white">{t('auth_not_admin_title')}</h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-neutral-400">{t('auth_not_admin_msg')}</p>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (result.error) {
      setError(t('auth_invalid_credentials'));
    }
  };

  return (
    <main className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="mb-6 text-center">
        <img src="/3274ee7e2aaf050903e4bca064c1182e~tplv-tiktokx-cropcenter_1080_1080.jpeg" alt="Mehdi Petrol Stations" className="mx-auto mb-3 h-16 w-16 rounded-full object-cover ring-2 ring-amber-500/50" />
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{t('auth_admin_login')}</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-neutral-400">{t('auth_login_sub')}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-neutral-300">{t('auth_email')}</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input w-full" placeholder="admin@example.com" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-neutral-300">{t('auth_password')}</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input w-full" placeholder="********" />
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">{error}</p>}
        <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 py-3 font-bold text-stone-900 shadow-lg shadow-amber-500/25 transition hover:-translate-y-0.5 hover:bg-amber-400 active:scale-[0.99] disabled:opacity-50">
          {submitting ? t('common_loading') : t('auth_signin')}
        </button>
      </form>
    </main>
  );
}

/* ---------------- Admin Panel ---------------- */

function AdminPanel() {
  const { t } = useI18n();
  const [tab, setTab] = useState<'products' | 'orders' | 'fuel'>('products');
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="border-l-4 border-amber-500 pl-3 text-2xl font-bold text-stone-900 dark:text-white">{t('admin_title')}</h1><p className="text-sm text-stone-500 dark:text-neutral-400">{t('admin_sub')}</p></div>
        <div className="flex flex-wrap rounded-lg border border-stone-200 bg-white p-1 dark:border-neutral-800 dark:bg-black">
          <button key={tab === 'products' ? 'p-on' : 'p-off'} onClick={() => setTab('products')} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 active:scale-95 ${tab === 'products' ? 'animate-pop bg-amber-500 text-stone-900 shadow-md shadow-amber-500/25 dark:bg-amber-500 dark:text-stone-900' : 'text-stone-600 hover:bg-stone-100 dark:text-neutral-300 dark:hover:bg-neutral-800'}`}><Package className="h-4 w-4" /> {t('admin_tab_products')}</button>
          <button key={tab === 'orders' ? 'o-on' : 'o-off'} onClick={() => setTab('orders')} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 active:scale-95 ${tab === 'orders' ? 'animate-pop bg-amber-500 text-stone-900 shadow-md shadow-amber-500/25 dark:bg-amber-500 dark:text-stone-900' : 'text-stone-600 hover:bg-stone-100 dark:text-neutral-300 dark:hover:bg-neutral-800'}`}><ClipboardList className="h-4 w-4" /> {t('admin_tab_orders')}</button>
          <button key={tab === 'fuel' ? 'f-on' : 'f-off'} onClick={() => setTab('fuel')} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 active:scale-95 ${tab === 'fuel' ? 'animate-pop bg-amber-500 text-stone-900 shadow-md shadow-amber-500/25 dark:bg-amber-500 dark:text-stone-900' : 'text-stone-600 hover:bg-stone-100 dark:text-neutral-300 dark:hover:bg-neutral-800'}`}><Droplet className="h-4 w-4" /> {t('admin_tab_fuel')}</button>
        </div>
      </div>
      <div className="animate-route" key={tab}>
        {tab === 'products' ? <ProductsAdmin /> : tab === 'orders' ? <OrdersAdmin /> : <FuelAdmin />}
      </div>
    </main>
  );
}

/* ---------------- Products Admin ---------------- */

function ProductAdminCard({ product, onEdit, onDelete, onToggle, onRefreshStory }: { product: Product; onEdit: (p: Product) => void; onDelete: (id: string) => void; onToggle: (p: Product) => void; onRefreshStory: (p: Product) => void }) {
  const { t } = useI18n();
  const stockStatus = product.stock === null ? 'none' : product.stock <= 0 ? 'out' : product.stock <= 3 ? 'low' : 'ok';

  return (
    <div className="group relative flex flex-col rounded-2xl border border-stone-200 bg-white p-4 transition-all hover:border-amber-500/50 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-amber-500/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ProductImage product={product} className="h-12 w-12 shrink-0 rounded-lg bg-stone-100 dark:bg-neutral-900" iconClass="h-6 w-6 text-stone-500 dark:text-stone-400" />
          <div className="min-w-0">
            <p className="truncate font-bold text-stone-900 dark:text-white" title={product.name}>{product.name}</p>
            <p className="text-xs text-stone-400">{categoryLabel(t, product.category)}</p>
          </div>
          {product.featured && <span className="shrink-0 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-stone-900">{t('common_featured')}</span>}
        </div>
        <button onClick={() => onToggle(product)} className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition ${product.available ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-stone-100 text-stone-500 dark:bg-neutral-800 dark:text-neutral-400'}`}>
          {product.available ? t('admin_prod_available') : t('admin_prod_hidden')}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-stone-100 pt-4 dark:border-neutral-800">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-neutral-500">{t('admin_prod_col_price')}</p>
          <div className="flex items-baseline gap-1.5">
            {product.on_sale && product.sale_price !== null ? (
              <>
                <span className="font-extrabold text-amber-600 dark:text-amber-400">{formatPrice(product.sale_price)}</span>
                <span className="text-xs text-stone-400 line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="font-extrabold text-stone-900 dark:text-white">{formatPrice(product.price)}</span>
            )}
            <span className="text-[10px] text-stone-400 dark:text-neutral-500">/ {product.unit}</span>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-neutral-500">{t('admin_prod_col_stock')}</p>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${stockStatus === 'out' ? 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400' : stockStatus === 'low' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-stone-100 text-stone-600 dark:bg-neutral-800 dark:text-neutral-300'}`}>
            {product.stock === null ? '—' : product.stock}
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={() => onRefreshStory(product)} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-amber-200 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 active:scale-95 dark:border-amber-900 dark:text-amber-400 dark:hover:bg-amber-950/40">
          <Sparkles className="h-3 w-3" /> {t('desc_auto_btn')}
        </button>
        <button onClick={() => onEdit(product)} className="flex-1 rounded-lg border border-stone-200 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-100 active:scale-95 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
          {t('admin_prod_edit')}
        </button>
        <button onClick={() => onDelete(product.id)} className="rounded-lg border border-red-200 p-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 active:scale-95 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function FuelAdminCard({ fuelPrice, onEdit, onDelete }: { fuelPrice: FuelPrice; onEdit: (fp: FuelPrice) => void; onDelete: (id: string) => void }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col rounded-2xl border border-stone-200 bg-white p-4 transition-all hover:border-amber-500/50 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-amber-500/40">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
            <Droplet className="h-5 w-5" />
          </div>
          <p className="font-bold text-stone-900 dark:text-white">{fuelPrice.fuel_type}</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(fuelPrice)} className="rounded-lg border border-stone-200 p-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-100 active:scale-95 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
            {t('admin_prod_edit')}
          </button>
          <button onClick={() => onDelete(fuelPrice.id)} className="rounded-lg border border-red-200 p-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 active:scale-95 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 border-t border-stone-100 pt-4 dark:border-neutral-800">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-neutral-500">{t('admin_fuel_col_price')}</p>
          <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{formatPrice(fuelPrice.price)}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-neutral-500">{t('admin_fuel_col_unit')}</p>
          <p className="text-sm font-medium text-stone-600 dark:text-neutral-300">{fuelPrice.unit}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-[10px] text-stone-400 dark:text-neutral-500">
        <span>{t('admin_fuel_col_updated')}</span>
        <span className="font-medium">{new Date(fuelPrice.updated_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

function ProductsAdmin() {

  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    try {
      const data = loadProductsFromStorage();
      setProducts(data);
    } catch (e) { setError(String(e)); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (id: string) => {
    if (!confirm(t('admin_confirm_delete'))) return;
    const next = products.filter((p) => p.id !== id);
    setProducts(next);
    saveProductsToStorage(next);
  };

  const handleDeleteAll = () => {
    if (products.length === 0) return;
    if (!confirm(t('admin_confirm_delete_all'))) return;
    setProducts([]);
    saveProductsToStorage([]);
  };

  const handleToggle = (p: Product) => {
    const next = products.map((x) => (x.id === p.id ? { ...x, available: !x.available } : x));
    setProducts(next);
    saveProductsToStorage(next);
  };

  const lowStockCount = products.filter((p) => p.stock !== null && p.stock <= 3).length;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-stone-500 dark:text-neutral-400">{products.length} {t('admin_prod_count')}</p>
          {lowStockCount > 0 && <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"><AlertTriangle className="h-3 w-3" /> {lowStockCount} {t('admin_low_stock')}</span>}
        </div>
        <div className="flex items-center gap-2">
          {products.length > 0 && (
            <button onClick={handleDeleteAll} className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 active:scale-95 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"><Trash2 className="h-4 w-4" /> {t('admin_delete_all')}</button>
          )}
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-stone-900 shadow-md shadow-amber-500/25 transition hover:-translate-y-0.5 hover:bg-amber-400 active:scale-95"><Plus className="h-4 w-4" /> {t('admin_add_prod')}</button>
        </div>
      </div>
      {loading ? <p className="py-10 text-center text-stone-400">{t('common_loading')}</p> : error ? <p className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-950/40 dark:text-red-400">{error}</p> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductAdminCard
              key={p.id}
              product={p}
              onEdit={(prod) => { setEditing(prod); setShowForm(true); }}
              onDelete={handleDelete}
              onToggle={handleToggle}
              onRefreshStory={(prod) => {
                const next = products.map((x) => x.id === prod.id ? refreshProductStory(x) : x);
                setProducts(next);
                saveProductsToStorage(next);
              }}
            />
          ))}
        </div>
      )}
      {showForm && <ProductForm product={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

/* ---------------- Live Product Preview ---------------- */

function LivePreview({ name, category, price, salePrice, onSale, unit, image_url }: { name: string; category: string; price: string; salePrice: string; onSale: boolean; unit: string; image_url: string }) {
  const { t } = useI18n();
  const priceNum = Number(price) || 0;
  const saleNum = Number(salePrice) || 0;
  const showSale = onSale && saleNum > 0 && saleNum < priceNum;
  const hasName = name.trim().length > 0;
  const label = category === '' || category === 'all' ? '' : categoryLabel(t, category);
  const discount = showSale ? Math.round((1 - saleNum / priceNum) * 100) : 0;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-neutral-500">
        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        <span>{t('admin_prod_form_preview')}</span>
      </div>
      <div className="mt-2 overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-50 to-stone-100 shadow-sm dark:border-neutral-800 dark:from-neutral-900 dark:to-black">
        <div className="flex h-28 items-center justify-center overflow-hidden bg-stone-200/50 dark:bg-neutral-800/50">
          {image_url ? (
            <img src={image_url} alt={hasName ? name : 'Preview'} className="h-full w-full object-contain p-1" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2">
              <Package className="h-8 w-8 text-stone-300 dark:text-neutral-700" />
              <span className="px-4 text-center text-xs font-medium text-stone-400 dark:text-neutral-600">{label || t('admin_prod_form_img')}</span>
            </div>
          )}
        </div>
        <div className="space-y-2 border-t border-dashed border-stone-200 p-3 text-center dark:border-neutral-800">
          <div className="flex items-center justify-between gap-3">
            <p className={`truncate text-sm font-bold ${hasName ? 'text-stone-800 dark:text-white' : 'text-stone-300 dark:text-neutral-600'}`}>{hasName ? name : t('admin_prod_form_name')}</p>
            {showSale && <span className="animate-pop whitespace-nowrap rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-stone-900 shadow-sm shadow-amber-500/30">-{discount}%</span>}
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 text-left">
              {label && <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">{label}</p>}
              <div className="flex items-baseline gap-2">
                {showSale ? (
                  <>
                    <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">{formatPrice(saleNum)}</span>
                    <span className="text-xs text-stone-400 line-through">{formatPrice(priceNum)}</span>
                  </>
                ) : (
                  <span className="text-base font-extrabold text-stone-800 dark:text-white">{formatPrice(priceNum)}</span>
                )}
                {unit.trim() !== '' && <span className="whitespace-nowrap text-[11px] text-stone-400 dark:text-neutral-500">/ {unit}</span>}
              </div>
            </div>
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-stone-900 shadow-md shadow-amber-500/25">
              <Plus className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Product Form ---------------- */

function ProductForm({ product, onClose, onSaved }: { product: Product | null; onClose: () => void; onSaved: () => void }) {
  const { t } = useI18n();
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.descriptions?.en || (product?.description ?? ''));
  const [descFr, setDescFr] = useState(product?.descriptions?.fr ?? '');
  const [descAr, setDescAr] = useState(product?.descriptions?.ar ?? '');
  const [price, setPrice] = useState(product?.price.toString() ?? '');
  const [category, setCategory] = useState(product?.category ?? 'convenience');
  const [unit, setUnit] = useState(product?.unit ?? 'item');
  const [image_url, setImageUrl] = useState(product?.image_url ?? '');
  const [available, setAvailable] = useState(product?.available ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [stock, setStock] = useState(product?.stock?.toString() ?? '');
  const [onSale, setOnSale] = useState(product?.on_sale ?? false);
  const [salePrice, setSalePrice] = useState(product?.sale_price?.toString() ?? '');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const scroll = document.getElementById('product-form-scroll');
      if (scroll) scroll.scrollTop = 0;
      const el = nameRef.current;
      if (el) el.focus({ preventScroll: true });
    }, 100);
    return () => window.clearTimeout(id);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim()) {
      setError(t('admin_prod_form_required_fields'));
      return;
    }
    setSaving(true);
    setError(null);
    const payload = { name, description: description || null, descriptions: { en: description || undefined, fr: descFr || undefined, ar: descAr || undefined }, story: buildProductStory(name || 'Item', category, { en: description || undefined, fr: descFr || undefined, ar: descAr || undefined }), price: Number(price) || 0, category, unit, image_url: image_url || null, available, featured, stock: stock.trim() === '' ? null : Math.max(0, Number(stock)), on_sale: onSale, sale_price: onSale && salePrice ? Number(salePrice) : null };
    const products = loadProductsFromStorage();
    if (product) {
      const next = products.map((p) => p.id === product.id ? { ...p, ...payload } : p);
      saveProductsToStorage(next);
    } else {
      const newProduct: Product = { ...payload, id: uid(), created_at: new Date().toISOString() };
      products.push(newProduct);
      saveProductsToStorage(products);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 flex max-h-[calc(100dvh-2rem)] w-full max-w-5xl animate-pop flex-col overflow-hidden rounded-2xl bg-white shadow-2xl box-border dark:bg-neutral-900 lg:w-[90vw] text-stone-900 dark:text-white">
        <div className="flex flex-shrink-0 items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-neutral-800">
          <h2 className="text-lg font-bold dark:text-white">{product ? (t('admin_prod_form_title_edit') || 'Edit Product') : (t('admin_prod_form_title_add') || 'Add Product')}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-neutral-800"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div id="product-form-scroll" className="flex-1 overflow-y-auto">
          <div className="px-6 py-5">
            <div className="grid items-start gap-x-6 gap-y-8 sm:grid-cols-2">
              <div className="min-w-0 space-y-8">
                <FormSection title={t('admin_prod_form_section_basic')}>
                  <Field label={t('admin_prod_form_name')} required>
                    <input
                      ref={nameRef}
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input w-full py-3 text-base font-medium text-stone-900 dark:text-white bg-white dark:bg-neutral-800 border-stone-300 dark:border-neutral-700 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="e.g. Total Quartz 10W40"
                    />
                  </Field>
                  <div className="space-y-3">
                    <Field label={t('admin_prod_form_desc_en') || 'Description (English)'}>
                      <div className="flex flex-col gap-2">
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input w-full min-h-[80px] resize-y flex-1 focus:ring-amber-500 focus:border-amber-500" />
                        <button type="button" disabled={generating} onClick={() => { if (generating) return; setGenerating(true); window.setTimeout(() => { const story = buildProductStory(name || 'Item', category); setDescription(story.en.whatItDoes); setDescFr(story.fr.whatItDoes); setDescAr(story.ar.whatItDoes); setGenerating(false); }, 350); }} className="flex items-center justify-center gap-1.5 self-start rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-stone-900 shadow-md shadow-amber-500/25 transition hover:-translate-y-0.5 hover:bg-amber-400 active:scale-95 disabled:cursor-wait disabled:opacity-60" title={t('desc_auto_btn') || 'Suggest description'}><Sparkles className={`h-3.5 w-3.5 ${generating ? 'animate-spin' : ''}`} /> {generating ? (t('desc_auto_loading') || 'Generating...') : (t('desc_auto_btn') || 'Suggest description')}</button>
                      </div>
                    </Field>
                    <Field label={t('admin_prod_form_desc_fr') || 'Description (Français)'}><textarea value={descFr} onChange={(e) => setDescFr(e.target.value)} className="input w-full min-h-[80px] resize-y flex-1 focus:ring-amber-500 focus:border-amber-500" placeholder="French" /></Field>
                    <Field label={t('admin_prod_form_desc_ar') || 'الوصف (العربية)'}><textarea value={descAr} onChange={(e) => setDescAr(e.target.value)} className="input w-full min-h-[80px] resize-y flex-1 focus:ring-amber-500 focus:border-amber-500" dir="rtl" placeholder="العربية" /></Field>
                  </div>
                  <Field label={t('admin_prod_form_cat') || 'Category'}><select value={category} onChange={(e) => setCategory(e.target.value)} className="input w-full">
                    {CATEGORIES.filter((c) => c.key !== 'all').map((c) => <option key={c.key} value={c.key}>{categoryLabel(t, c.key)}</option>)}
                  </select></Field>
                </FormSection>

                <FormSection title={t('admin_prod_form_section_pricing') || 'Pricing'}>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label={t('admin_prod_form_price') || 'Price (DA)'} required><input required type="text" inputMode="decimal" value={price} onChange={(e) => setPrice(cleanNumeric(e.target.value, true))} className="input w-full" placeholder="0.00" /></Field>
                    <Field label={t('admin_prod_form_unit') || 'Unit'}><input value={unit} onChange={(e) => setUnit(e.target.value)} className="input w-full" placeholder={t('admin_prod_placeholder_unit') || 'unit'} /></Field>
                  </div>
                  <Toggle checked={onSale} onChange={setOnSale} label={t('admin_prod_form_sale') || 'Put on sale'} accent />
                  {onSale && <div className="animate-fade-in"><Field label={t('admin_prod_form_sale_price') || 'Sale Price (DA)'} required><input type="text" inputMode="decimal" value={salePrice} onChange={(e) => setSalePrice(cleanNumeric(e.target.value, true))} className="input w-full" placeholder={t('admin_prod_placeholder_sale') || 'sale price'} /></Field></div>}
                </FormSection>
              </div>

              <div className="min-w-0 space-y-8">
                <FormSection title={t('admin_prod_form_section_stock') || 'Inventory'}>
                  <div className="space-y-3">
                    <Field label={t('admin_prod_form_stock') || 'Stock quantity'}><input type="text" inputMode="numeric" value={stock} onChange={(e) => setStock(cleanNumeric(e.target.value, false))} className="input w-full" placeholder={t('admin_prod_placeholder_stock') || 'unlimited'} /></Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Toggle checked={available} onChange={setAvailable} label={t('admin_prod_form_avail') || 'Available'} />
                      <Toggle checked={featured} onChange={setFeatured} label={t('admin_prod_form_feat') || 'Featured'} />
                    </div>
                  </div>
                </FormSection>

                <FormSection title={t('admin_prod_form_section_photo') || 'Photo'}>
                  <Field label={t('admin_prod_form_img') || 'Image URL'}>
                    <input value={image_url} onChange={(e) => setImageUrl(e.target.value)} className="input w-full" placeholder="https://..." dir="ltr" />
                    <p className="mt-1 text-xs text-stone-400 dark:text-neutral-500">{t('admin_prod_form_img_upload') || 'Upload photo'}</p>
                  </Field>
                </FormSection>

                <LivePreview name={name} category={category} price={price} salePrice={salePrice} onSale={onSale} unit={unit} image_url={image_url} />
              </div>
            </div>
          </div>
          </div>
          {error && <p className="mx-6 mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">{error}</p>}
          <div className="flex flex-shrink-0 gap-3 border-t border-stone-200 bg-stone-50 px-6 py-4 dark:border-neutral-800 dark:bg-black">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-stone-300 px-4 py-3 font-semibold text-stone-600 transition hover:bg-stone-100 active:scale-[0.99] dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">{t('common_cancel') || 'Cancel'}</button>
            <button type="submit" disabled={saving} className="animate-sheen flex-[2] rounded-lg bg-amber-500 py-3 font-bold text-stone-900 shadow-md shadow-amber-500/25 transition hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-lg active:scale-[0.99] disabled:opacity-50">{saving ? (t('common_saving') || 'Saving...') : product ? (t('admin_prod_save') || 'Save Changes') : (t('admin_add_prod') || 'Add Product')}</button>
          </div>
        </form>
        </div>
      </div>
    );
  }

/* ---------------- Orders Admin ---------------- */

function OrdersAdmin() {
  const { t } = useI18n();
  const [orders, setOrders] = useState<(Order & { order_items: OrderItem[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const load = useCallback(() => {
    setLoading(true);
    try {
      setOrders(loadOrdersFromStorage());
    } catch (e) { setError(String(e)); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = (id: string, status: string) => {
    const next = orders.map((o) => o.id === id ? { ...o, status } : o);
    setOrders(next);
    saveOrdersToStorage(next);
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);
  const stats = { total: orders.length, pending: orders.filter((o) => o.status === 'pending').length, revenue: orders.filter((o) => o.status === 'completed').reduce((s, o) => s + Number(o.total), 0) };

  const exportOrders = () => {
    const head = [t('admin_orders_status_label'), t('admin_orders_date'), 'ID', t('checkout_name'), t('checkout_phone'), t('checkout_address'), t('checkout_notes'), t('admin_orders_col_item'), t('admin_orders_col_qty'), t('admin_orders_col_price'), t('admin_orders_col_subtotal')];
    const rows = orders.flatMap((o) => o.order_items.map((it, idx) => [
      t('admin_orders_status_' + o.status),
      new Date(o.created_at).toLocaleString(),
      o.id.slice(0, 8) + (o.order_items.length > 1 ? `-${idx + 1}` : ''),
      o.customer_name,
      o.customer_phone,
      o.customer_address ?? '',
      o.notes ?? '',
      it.product_name,
      String(it.quantity),
      String(it.price),
      String(it.price * it.quantity),
    ]));
    const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mehdi-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-4">
        <StatCard icon={ClipboardList} label={t('admin_orders_total')} value={stats.total.toString()} />
        <StatCard icon={Bell} label={t('admin_orders_pending')} value={stats.pending.toString()} highlight={stats.pending > 0} />
        <StatCard icon={TrendingUp} label={t('admin_orders_revenue')} value={formatPrice(stats.revenue)} />
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${filter === s ? 'bg-amber-500 text-stone-900 shadow-md shadow-amber-500/25 dark:bg-amber-500 dark:text-stone-900' : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400 dark:bg-black dark:text-neutral-300 dark:border-neutral-700'}`}>{s === 'all' ? t('common_all') : t('admin_orders_status_' + s)}</button>
          ))}
        </div>
        <button onClick={exportOrders} disabled={orders.length === 0} className="flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-1.5 text-sm font-semibold text-stone-700 transition hover:border-amber-500 hover:text-amber-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-amber-400"><Download className="h-4 w-4" /> {t('admin_orders_export')}</button>
      </div>
      {loading ? <p className="py-10 text-center text-stone-400">{t('common_loading')}</p> : error ? <p className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-950/40 dark:text-red-400">{error}</p> : filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-stone-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-black"><ClipboardList className="h-12 w-12 text-stone-300 dark:text-neutral-700" /><p className="mt-3 font-semibold text-stone-700 dark:text-white">{t('admin_orders_no_orders')}</p><p className="text-sm text-stone-500 dark:text-neutral-400">{t('admin_orders_no_orders_sub')}</p></div>
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => (
            <OrderCard key={o.id} order={o} onStatusChange={updateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, highlight }: { icon: typeof Package; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${highlight ? 'border-amber-500/60 bg-amber-50 shadow-sm shadow-amber-500/10 dark:border-amber-500/40 dark:bg-amber-900/20' : 'border-stone-200 bg-white dark:border-neutral-800 dark:bg-black'}`}>
      <div className="flex items-center gap-2 text-stone-500 dark:text-neutral-400"><Icon className={`h-4 w-4 ${highlight ? 'text-amber-600 dark:text-amber-400' : ''}`} /><span className="text-xs font-medium uppercase tracking-wide">{label}</span></div>
      <p className="mt-2 text-2xl font-extrabold text-stone-900 dark:text-white">{value}</p>
    </div>
  );
}

function OrderCard({ order, onStatusChange }: { order: Order & { order_items: OrderItem[] }; onStatusChange: (id: string, status: string) => void }) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const statusColors: Record<string, string> = { pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400', confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400', completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400', cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' };
  return (
    <div className="rounded-xl border border-stone-200 bg-white dark:border-neutral-800 dark:bg-black">
      <button onClick={() => setExpanded((e) => !e)} className="flex w-full items-center justify-between px-5 py-4 text-left">
        <div className="flex items-center gap-4"><div><p className="font-bold text-stone-900 dark:text-white">{order.customer_name}</p><p className="text-sm text-stone-500 dark:text-neutral-400">{order.customer_phone}</p></div></div>
        <div className="flex items-center gap-4"><span className="hidden text-sm text-stone-400 sm:block dark:text-neutral-500">{new Date(order.created_at).toLocaleString()}</span><span className="font-extrabold text-stone-900 dark:text-white">{formatPrice(order.total)}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusColors[order.status]}`}>{t('admin_orders_status_' + order.status)}</span></div>
      </button>
      {expanded && (
        <div className="border-t border-stone-100 px-5 py-4 dark:border-neutral-800">
          {order.customer_address && <p className="mb-2 text-sm text-stone-600 dark:text-neutral-300"><MapPin className="mr-1 inline h-4 w-4 text-stone-400" />{order.customer_address}</p>}
          {order.notes && <p className="mb-3 text-sm text-stone-600 dark:text-neutral-300"><span className="font-medium">{t('admin_orders_notes')}</span> {order.notes}</p>}
          <div className="mb-4 overflow-hidden rounded-lg border border-stone-100 dark:border-neutral-800"><table className="w-full text-sm"><thead className="bg-white text-xs uppercase text-stone-500 dark:bg-black dark:text-neutral-400"><tr><th className="px-3 py-2 text-left font-semibold">{t('admin_orders_col_item')}</th><th className="px-3 py-2 text-right font-semibold">{t('admin_orders_col_qty')}</th><th className="px-3 py-2 text-right font-semibold">{t('admin_orders_col_price')}</th><th className="px-3 py-2 text-right font-semibold">{t('admin_orders_col_subtotal')}</th></tr></thead><tbody className="divide-y divide-stone-100 dark:divide-neutral-800">{order.order_items.map((it) => (<tr key={it.id}><td className="px-3 py-2 text-stone-800 dark:text-neutral-200">{it.product_name}</td><td className="px-3 py-2 text-right text-stone-600 dark:text-neutral-400">{it.quantity}</td><td className="px-3 py-2 text-right text-stone-600 dark:text-neutral-400">{formatPrice(it.price)}</td><td className="px-3 py-2 text-right font-semibold text-stone-900 dark:text-white">{formatPrice(it.price * it.quantity)}</td></tr>))}</tbody></table></div>
          <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-medium text-stone-600 dark:text-neutral-300">{t('admin_orders_update_status')}</span>{['pending', 'confirmed', 'completed', 'cancelled'].map((s) => (<button key={s} onClick={() => onStatusChange(order.id, s)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${order.status === s ? 'bg-amber-500 text-stone-900 shadow-md shadow-amber-500/25 dark:bg-amber-500 dark:text-stone-900' : 'border border-stone-200 text-stone-600 hover:bg-stone-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800'}`}>{t('admin_orders_status_' + s)}</button>))}<a href={`tel:${order.customer_phone}`} className="ml-auto flex items-center gap-1.5 rounded-lg border border-stone-900 bg-white px-3 py-1.5 text-xs font-semibold text-stone-900 hover:bg-stone-100 dark:border-transparent dark:bg-green-600 dark:text-white dark:hover:bg-green-500"><PhoneCall className="h-3.5 w-3.5" /> {t('admin_orders_call_customer')}</a></div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Fuel Price Admin ---------------- */

function FuelAdmin() {
  const { t } = useI18n();
  const [prices, setPrices] = useState<FuelPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<FuelPrice | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    try {
      const data = loadFuelPricesFromStorage();
      setPrices(data);
    } catch (e) { setError(String(e)); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (id: string) => {
    if (!confirm(t('admin_confirm_delete_fuel'))) return;
    const next = prices.filter((p) => p.id !== id);
    setPrices(next);
    saveFuelPricesToStorage(next);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-stone-500 dark:text-neutral-400">{prices.length} {t('admin_fuel_count')}</p>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-stone-900 shadow-md shadow-amber-500/25 transition hover:-translate-y-0.5 hover:bg-amber-400 active:scale-95"><Plus className="h-4 w-4" /> {t('admin_fuel_add')}</button>
      </div>
      {loading ? <p className="py-10 text-center text-stone-400">{t('common_loading')}</p> : error ? <p className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-950/40 dark:text-red-400">{error}</p> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prices.map((fp) => (
            <FuelAdminCard
              key={fp.id}
              fuelPrice={fp}
              onEdit={(prod) => { setEditing(prod); setShowForm(true); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
      {showForm && <FuelForm fuelPrice={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function FuelForm({ fuelPrice, onClose, onSaved }: { fuelPrice: FuelPrice | null; onClose: () => void; onSaved: () => void }) {
  const { t } = useI18n();
  const [fuelType, setFuelType] = useState(fuelPrice?.fuel_type ?? '');
  const [price, setPrice] = useState(fuelPrice?.price.toString() ?? '');
  const [unit, setUnit] = useState(fuelPrice?.unit ?? 'liter');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = { fuel_type: fuelType, price: Number(price) || 0, unit, updated_at: new Date().toISOString() };
    const prices = loadFuelPricesFromStorage();
    if (fuelPrice) {
      const next = prices.map((p) => p.id === fuelPrice.id ? { ...p, ...payload } : p);
      saveFuelPricesToStorage(next);
    } else {
      prices.push({ ...payload, id: uid() });
      saveFuelPricesToStorage(prices);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md animate-pop overflow-hidden rounded-2xl bg-white shadow-2xl box-border dark:bg-black">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-neutral-800">
          <h2 className="text-lg font-bold dark:text-white">{fuelPrice ? (t('admin_fuel_form_title_edit') || 'Edit Fuel Price') : (t('admin_fuel_form_title_add') || 'Add Fuel Type')}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-neutral-800"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5">
          <FormSection title={t('admin_fuel_form_section_basic') || 'Basic Info'}>
            <div className="space-y-4">
              <Field label={t('admin_fuel_form_type') || 'Fuel Type'} required><input required value={fuelType} onChange={(e) => setFuelType(e.target.value)} className="input w-full" placeholder={t('admin_fuel_placeholder_type') || 'Diesel, Petrol...'} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label={t('admin_fuel_form_price') || 'Price (DA)'} required><input required type="text" inputMode="decimal" value={price} onChange={(e) => setPrice(cleanNumeric(e.target.value, true))} className="input w-full" /></Field>
                <Field label={t('admin_fuel_form_unit') || 'Unit'}><input value={unit} onChange={(e) => setUnit(e.target.value)} className="input w-full" placeholder={t('admin_fuel_placeholder_unit') || 'liter'} /></Field>
              </div>
            </div>
          </FormSection>
          {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">{error}</p>}
          <button type="submit" disabled={saving} className="mt-6 w-full rounded-lg bg-amber-500 py-3 font-bold text-stone-900 shadow-lg shadow-amber-500/25 transition hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-xl active:scale-[0.98] disabled:opacity-50">{saving ? (t('common_saving') || 'Saving...') : fuelPrice ? (t('admin_fuel_save') || 'Save Changes') : (t('admin_fuel_add') || 'Add Fuel')}</button>
        </form>
        </div>
      </div>
    );
  }

/* ---------------- Footer ---------------- */

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-20 border-t border-stone-200 bg-white text-stone-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <img src="/3274ee7e2aaf050903e4bca064c1182e~tplv-tiktokx-cropcenter_1080_1080.jpeg" alt="Mehdi Petrol Stations logo" className="h-10 w-10 rounded-full object-cover ring-2 ring-amber-500/50" />
              <div>
                <p className="font-bold text-stone-900 dark:text-white">Mehdi Petrol Stations</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">{t('footer_arabic_name')}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-stone-500 dark:text-neutral-500">{t('footer_tagline')}</p>
          </div>

          {/* Visit us */}
          <div>
            <p className="mb-3 text-sm font-semibold text-stone-900 dark:text-white">{t('footer_visit_us')}</p>
            <p className="flex items-start gap-2 text-sm"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />W463+JX3, Ain Kermes, Tiaret, Algeria</p>
            <p className="mt-2 flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-amber-500" />{t('footer_open_24h')}</p>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-3 text-sm font-semibold text-stone-900 dark:text-white">{t('footer_contact')}</p>
            <a href={`tel:${STORE_PHONE}`} className="flex items-center gap-2 text-sm transition hover:text-amber-600 dark:hover:text-amber-400" dir="ltr" style={{ unicodeBidi: 'isolate' }}><Phone className="h-4 w-4 text-amber-500" />{STORE_PHONE_DISPLAY}</a>
            <a href={`https://wa.me/${STORE_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-2 text-sm transition hover:text-green-600 dark:hover:text-green-400"><MessageCircle className="h-4 w-4 text-green-500" />WhatsApp</a>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm dark:bg-amber-900/30">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="font-semibold text-stone-900 dark:text-white">4.0</span>
                <span className="text-stone-500 dark:text-neutral-500">· {t('footer_reviews')}</span>
              </div>
            </div>
          </div>

          {/* Map */}
          <div>
            <p className="mb-3 text-sm font-semibold text-stone-900 dark:text-white">{t('footer_find_map')}</p>
            <div className="overflow-hidden rounded-lg border border-stone-200 dark:border-neutral-800">
              <iframe
                src="https://www.google.com/maps?q=W463%2BJX3%20Ain%20Kermes%20Tiaret%20Algeria&output=embed"
                width="100%"
                height="140"
                style={{ border: 0, filter: 'invert(0.9) hue-rotate(180deg)' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mehdi Petrol Stations location"
              />
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-stone-200 pt-6 text-center text-xs text-stone-500 dark:border-neutral-800 dark:text-neutral-500">
          {t('footer_rights').replace('{year}', String(new Date().getFullYear()))}
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Helpers ---------------- */

function ProductIcon({ category, className }: { category: string; className?: string }) {
  const map: Record<string, typeof Fuel> = {
    fuel: Fuel,
    gas: Zap,
    service: ShieldCheck,
    convenience: Package,
  };
  const Icon = map[category] || Package;
  return <Icon className={className} />;
}

function categoryLabel(t: (k: string) => string, category: string): string {
  const map: Record<string, string> = {
    all: 'cat_all',
    fuel: 'cat_fuel',
    gas: 'cat_gas',
    service: 'cat_service',
    convenience: 'cat_convenience',
  };
  const key = map[category];
  return key ? t(key) : category;
}

function localizedDescription(p: Product, lang: string): string {
  const d = p.descriptions;
  if (d) {
    if (lang === 'ar' && d.ar) return d.ar;
    if (lang === 'fr' && d.fr) return d.fr;
    if (d.en) return d.en;
  }
  return p.description || '';
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(price) + ' DA';
}

function cleanNumeric(s: string, allowDecimal: boolean): string {
  let v = allowDecimal ? s.replace(/[^\d.]/g, '') : s.replace(/[^\d]/g, '');
  if (allowDecimal) {
    const dot = v.indexOf('.');
    if (dot !== -1) v = v.slice(0, dot + 1) + v.slice(dot + 1).replace(/\./g, '');
    v = v.replace(/(\.\d{0,2}).*/, '$1');
  }
  return v;
}

function cleanPhone(s: string): string {
  return s.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - (d.charCodeAt(0) < 0x06F0 ? 0x0660 : 0x06F0))).replace(/[^\d]/g, '');
}
