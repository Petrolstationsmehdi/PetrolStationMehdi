import type { Product, FuelPrice } from '@/lib/supabase';

export type ProductStory = {
  whatItDoes: string;
  features: string[];
  problemSolves: string;
  bestFor: string;
};

export type LocalizedText = {
  en?: string;
  fr?: string;
  ar?: string;
};

const STORY_BANK: Record<string, { en: ProductStory; fr: ProductStory; ar: ProductStory }> = {
  oil: {
    en: { whatItDoes: 'Premium engine oil that lubricates, cools, and protects your engine for smoother performance and longer life.', features: ['10W40 viscosity', 'Synthetic blend', '5L jug', 'API SN certified'], problemSolves: 'Engine wear from old or low-quality oil causes friction, overheating, and costly repairs.', bestFor: 'Routine oil changes every 5,000–10,000 km on petrol and diesel engines.' },
    fr: { whatItDoes: 'Huile moteur premium qui lubrifie, refroidit et protège votre moteur pour une performance plus fluide et une durée de vie plus longue.', features: ['Viscosité 10W40', 'Synthétique mixte', 'Bidon 5L', 'Certifié API SN'], problemSolves: "L'usure du moteur due à une huile ancienne ou de mauvaise qualité cause friction, surchauffe et réparations coûteuses.", bestFor: 'Vidanges tous les 5 000–10 000 km sur moteurs essence et diesel.' },
    ar: { whatItDoes: 'زيت محرك ممتاز يزلق ويبرد ويحمي محركك لأداء أنعم وعمر أطول.', features: ['لزوجة 10W40', 'خلط صناعي', 'عبوة 5 لتر', 'معتمد API SN'], problemSolves: 'تآكل المحرك بسبب الزيت القديم أو منخفض الجودة يسبب احتكاكاً وسخونة وإصلاحات مكلفة.', bestFor: 'تغيير الزيت كل 5000–10000 كم لمحركات البنزين والديزل.' },
  },
  gas: {
    en: { whatItDoes: 'Butane gas bottle for cooking and heating. Clean-burning, reliable, and easy to connect.', features: ['13 kg bottle', 'Butane', 'Refillable', 'Safety valve'], problemSolves: 'Running out of cooking gas mid-meal or during cold weather.', bestFor: 'Households and small businesses needing reliable cooking fuel.' },
    fr: { whatItDoes: 'Bouteille de gaz butane pour la cuisson et le chauffage. Combustion propre, fiable et facile à connecter.', features: ['Bouteille 13 kg', 'Butane', 'Rechargeable', 'Vanne de sécurité'], problemSolves: 'Panne de gaz en cours de cuisson ou par temps froid.', bestFor: 'Foyers et petits commerces needing reliable cooking fuel.' },
    ar: { whatItDoes: 'قارورة غاز بيوتان للطبخ والتدفئة. احتراق نظيف وموثوق وسهل التوصيل.', features: ['قارورة 13 كجم', 'بيوتان', 'قابلة لإعادة التعبئة', 'صمام أمان'], problemSolves: 'نفاد غاز الطبخ أثناء الوجبة أو في الطقس البارد.', bestFor: 'الأسر والشركات الصغيرة التي تحتاج وقود طبخ موثوق.' },
  },
  filter: {
    en: { whatItDoes: 'High-flow oil filter that traps contaminants and keeps your engine oil clean between changes.', features: ['High-flow design', 'Anti-drainback valve', 'Universal fit', 'OEM quality'], problemSolves: 'Dirty oil bypassing a clogged filter damages bearings and reduces engine life.', bestFor: 'Pair with every oil change for maximum engine protection.' },
    fr: { whatItDoes: "Filtre à huile à haut débit qui piège les contaminants et garde votre huile moteur propre entre les vidanges.", features: ['Design haut débit', "Valve anti-retour", 'Montage universel', 'Qualité OEM'], problemSolves: "L'huile sale qui contourne un filtre bouché endommage les coussinets et réduit la durée de vie du moteur.", bestFor: "À associer à chaque vidange pour une protection maximale du moteur." },
    ar: { whatItDoes: 'فلتر زيت عالي التدفق يحبس الشوائب ويحافظ على نظافة زيت محركك بين التغييرات.', features: ['تصميم عالي التدفق', 'صمام مضاد للارتداد', 'ملاءمة عامة', 'جودة OEM'], problemSolves: 'الزيت المتسخ الذي يتجاوز فلتراً مسدوداً يضر بالمحامل ويقلل عمر المحرك.', bestFor: 'يُ paired مع كل تغيير زيت لأقصى حماية للمحرك.' },
  },
  wiper: {
    en: { whatItDoes: 'All-weather windshield wiper blades for clear visibility in rain, dust, and snow.', features: ['Universal adapter', 'UV-resistant rubber', 'Aerodynamic frame', '26 inch'], problemSolves: 'Streaky, cracked, or squeaky wipers that reduce visibility in bad weather.', bestFor: 'Annual replacement before rainy season.' },
    fr: { whatItDoes: "Balais d'essuie-glace toutes saisons pour une visibilité claire sous la pluie, la poussière et la neige.", features: ['Adaptateur universel', 'Caoutchouc anti-UV', 'Cadre aérodynamique', '26 pouces'], problemSolves: "Balais rayés, craquelés ou bruyants qui réduisent la visibilité par mauvais temps.", bestFor: 'Remplacement annuel avant la saison des pluies.' },
    ar: { whatItDoes: 'ممسحات زجاج أمامي لكل الأجواء لرؤية واضحة في المطر والغبار والثلج.', features: ['محول عام', 'مطاط مقاوم للأشعة فوق البنفسجية', 'إطار ديناميكي هوائي', '26 بوصة'], problemSolves: 'ممسحات مخططة أو متشققة أو صريرة تقلل الرؤية في الطقس السيء.', bestFor: 'استبدال سنوي قبل موسم الأمطار.' },
  },
  default: {
    en: { whatItDoes: 'Quality product from Mehdi Petrol Stations, available for online order with pickup or delivery.', features: ['Quality guaranteed', 'Available in store', 'Order online'], problemSolves: 'Need a reliable product without driving around to find it.', bestFor: 'Everyday use and quick top-ups.' },
    fr: { whatItDoes: 'Produit de qualité de Mehdi Petrol Stations, disponible en commande en ligne avec retrait ou livraison.', features: ['Qualité garantie', 'En magasin', 'Commande en ligne'], problemSolves: "Besoin d'un produit fiable sans rouler partout pour le trouver.", bestFor: 'Usage quotidien et petits achats.' },
    ar: { whatItDoes: 'منتج جيد من محطة مهدي للوقود، متاح للطلب عبر الإنترنت مع الاستلام أو التوصيل.', features: ['جودة مضمونة', 'متاح في المحطة', 'طلب عبر الإنترنت'], problemSolves: 'الحاجة لمنتج موثوق دون القيادة للبحث عنه.', bestFor: 'الاستخدام اليومي والتسوق السريع.' },
  },
};

function pickStoryKey(name: string, category: string): string {
  const n = name.toLowerCase();
  if (n.includes('oil') || n.includes('huile') || n.includes('زيت')) return 'oil';
  if (n.includes('gas') || n.includes('gaz') || n.includes('غاز') || n.includes('bottle') || n.includes('bouteille')) return 'gas';
  if (n.includes('filter') || n.includes('filtre') || n.includes('فلتر')) return 'filter';
  if (n.includes('wiper') || n.includes('essuie') || n.includes('ممسحة')) return 'wiper';
  if (category === 'gas') return 'gas';
  if (category === 'fuel') return 'oil';
  return 'default';
}

export function buildProductStory(
  name: string,
  category: string,
  customDesc?: LocalizedText,
): { en: ProductStory; fr: ProductStory; ar: ProductStory } {
  const key = pickStoryKey(name, category);
  const base = STORY_BANK[key] ?? STORY_BANK.default;
  return {
    en: { ...base.en, whatItDoes: customDesc?.en || base.en.whatItDoes },
    fr: { ...base.fr, whatItDoes: customDesc?.fr || base.fr.whatItDoes },
    ar: { ...base.ar, whatItDoes: customDesc?.ar || base.ar.whatItDoes },
  };
}

export function localizedStory(
  product: Product,
  lang: 'en' | 'fr' | 'ar',
): ProductStory {
  if (product.story) return product.story[lang] ?? product.story.en;
  return buildProductStory(product.name, product.category)[lang];
}

export function refreshProductStory(product: Product): Product {
  const story = buildProductStory(product.name, product.category, product.descriptions ?? undefined);
  return { ...product, story };
}

export function migrateProductDescriptions(products: Product[]): Product[] {
  return products.map((p) => {
    if (p.descriptions && p.story) return p;
    const descriptions: LocalizedText = {
      en: p.descriptions?.en ?? p.description ?? undefined,
      fr: p.descriptions?.fr ?? undefined,
      ar: p.descriptions?.ar ?? undefined,
    };
    const story = buildProductStory(p.name, p.category, descriptions);
    return { ...p, descriptions, story };
  });
}

export const MOCK_FUEL_PRICES: FuelPrice[] = [
  { id: 'f1', fuel_type: 'Diesel', price: 29.10, unit: 'liter', updated_at: new Date().toISOString() },
  { id: 'f2', fuel_type: 'Petrol (Sans Plomb)', price: 42.80, unit: 'liter', updated_at: new Date().toISOString() },
  { id: 'f3', fuel_type: 'GPL', price: 18.50, unit: 'liter', updated_at: new Date().toISOString() },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1', name: 'Total Quartz 10W40 Engine Oil', description: 'Premium 5L synthetic blend engine oil for petrol and diesel engines.',
    descriptions: { en: 'Premium 5L synthetic blend engine oil for petrol and diesel engines.', fr: "Huile moteur synthétique 5L pour moteurs essence et diesel.", ar: 'زيت محرك صناعي 5 لتر لمحركات البنزين والديزل.' },
    price: 4500, sale_price: null, on_sale: false, category: 'convenience',
    image_url: 'https://images.unsplash.com/photo-1632823469850-2f77dd9c7f93?w=600&q=80',
    unit: '5L', available: true, featured: true, stock: 12, created_at: new Date().toISOString(),
  },
  {
    id: 'p2', name: 'Butane Gas Bottle 13kg', description: 'Refillable butane gas bottle for cooking and heating.',
    descriptions: { en: 'Refillable butane gas bottle for cooking and heating.', fr: 'Bouteille de gaz butane rechargeable pour cuisson et chauffage.', ar: 'قارورة غاز بيوتان قابلة لإعادة التعبئة للطبخ والتدفئة.' },
    price: 1200, sale_price: null, on_sale: false, category: 'gas',
    image_url: 'https://images.unsplash.com/photo-1604708173730-c86f9d7d0a4f?w=600&q=80',
    unit: 'bottle', available: true, featured: true, stock: 20, created_at: new Date().toISOString(),
  },
  {
    id: 'p3', name: 'Oil Filter (Universal)', description: 'High-flow oil filter with anti-drainback valve.',
    descriptions: { en: 'High-flow oil filter with anti-drainback valve.', fr: "Filtre à huile à haut débit avec valve anti-retour.", ar: 'فلتر زيت عالي التدفق مع صمام مضاد للارتداد.' },
    price: 800, sale_price: 600, on_sale: true, category: 'convenience',
    image_url: 'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?w=600&q=80',
    unit: 'piece', available: true, featured: false, stock: 30, created_at: new Date().toISOString(),
  },
  {
    id: 'p4', name: 'Windshield Wiper Blades 26"', description: 'All-weather wiper blades with UV-resistant rubber.',
    descriptions: { en: 'All-weather wiper blades with UV-resistant rubber.', fr: "Balais d'essuie-glace toutes saisons avec caoutchouc anti-UV.", ar: 'ممسحات زجاج لكل الأجواء بمطاط مقاوم للأشعة فوق البنفسجية.' },
    price: 1500, sale_price: null, on_sale: false, category: 'convenience',
    image_url: 'https://images.unsplash.com/photo-1601362840469-51c4f72e6450?w=600&q=80',
    unit: 'pair', available: true, featured: false, stock: 8, created_at: new Date().toISOString(),
  },
  {
    id: 'p5', name: 'Tire Repair Service', description: 'Professional tire puncture repair and pressure check.',
    descriptions: { en: 'Professional tire puncture repair and pressure check.', fr: 'Réparation professionnelle de crevaison et vérification de pression.', ar: 'إصلاح احترافي لثقب الإطارات وفحص الضغط.' },
    price: 500, sale_price: null, on_sale: false, category: 'service',
    image_url: '', unit: 'service', available: true, featured: true, stock: null, created_at: new Date().toISOString(),
  },
  {
    id: 'p6', name: 'Engine Coolant 1L', description: 'Ready-to-use engine coolant for all seasons.',
    descriptions: { en: 'Ready-to-use engine coolant for all seasons.', fr: 'Liquide de refroidissement prêt à lemploi pour toutes saisons.', ar: 'سائل تبريد محرك جاهز للاستخدام لكل الفصول.' },
    price: 700, sale_price: 550, on_sale: true, category: 'convenience',
    image_url: 'https://images.unsplash.com/photo-1635776062043-22d3ad7f6455?w=600&q=80',
    unit: 'liter', available: true, featured: false, stock: 15, created_at: new Date().toISOString(),
  },
  {
    id: 'p7', name: 'Car Air Freshener', description: 'Long-lasting fresh scent for your car interior.',
    descriptions: { en: 'Long-lasting fresh scent for your car interior.', fr: 'Parfum longue durée pour votre intérieur de voiture.', ar: 'معطر طويل الأمد لداخل سيارتك.' },
    price: 300, sale_price: null, on_sale: false, category: 'convenience',
    image_url: 'https://images.unsplash.com/photo-1607861716497-e65ab29fc4f5?w=600&q=80',
    unit: 'piece', available: true, featured: false, stock: 50, created_at: new Date().toISOString(),
  },
  {
    id: 'p8', name: 'Propane Gas Bottle 35kg', description: 'Large propane bottle for commercial and industrial use.',
    descriptions: { en: 'Large propane bottle for commercial and industrial use.', fr: 'Grande bouteille de propane pour usage commercial et industriel.', ar: 'قارورة بروبان كبيرة للاستخدام التجاري والصناعي.' },
    price: 2800, sale_price: null, on_sale: false, category: 'gas',
    image_url: '', unit: 'bottle', available: true, featured: false, stock: 6, created_at: new Date().toISOString(),
  },
  {
    id: 'p9', name: 'Brake Fluid DOT4 500ml', description: 'High-performance brake fluid for safe braking.',
    descriptions: { en: 'High-performance brake fluid for safe braking.', fr: 'Liquide de frein haute performance pour un freinage sûr.', ar: 'سائل فرامل عالي الأداء لفرملة آمنة.' },
    price: 900, sale_price: null, on_sale: false, category: 'convenience',
    image_url: 'https://images.unsplash.com/photo-1635776062764-e0255a5f9f7f?w=600&q=80',
    unit: '500ml', available: true, featured: false, stock: 0, created_at: new Date().toISOString(),
  },
  {
    id: 'p10', name: 'Spark Plugs (Set of 4)', description: 'Iridium spark plugs for smoother starts and better fuel economy.',
    descriptions: { en: 'Iridium spark plugs for smoother starts and better fuel economy.', fr: "Bougies d'allumage iridium pour démarrages plus doux et meilleure économie de carburant.", ar: 'بوجيهات إيريديوم لبدء تشغيل أنعم واقتصاد وقود أفضل.' },
    price: 2200, sale_price: 1800, on_sale: true, category: 'convenience',
    image_url: 'https://images.unsplash.com/photo-1635776062840-e0f8f3f2e8f3?w=600&q=80',
    unit: 'set', available: true, featured: false, stock: 4, created_at: new Date().toISOString(),
  },
  {
    id: 'p11', name: 'Bottle Water 1.5L', description: 'Still mineral water, cold and refreshing.',
    descriptions: { en: 'Still mineral water, cold and refreshing.', fr: "Eau minérale plate, fraîche et rafraîchissante.", ar: 'مياه معدنية Still، باردة ومنعشة.' },
    price: 100, sale_price: null, on_sale: false, category: 'convenience',
    image_url: 'https://images.unsplash.com/photo-1560887963-c9d9273d8d77?w=600&q=80',
    unit: 'bottle', available: true, featured: false, stock: 100, created_at: new Date().toISOString(),
  },
  {
    id: 'p12', name: 'Phone Car Mount', description: 'Universal phone holder for dashboard or windshield.',
    descriptions: { en: 'Universal phone holder for dashboard or windshield.', fr: 'Support téléphone universel pour tableau de bord ou pare-brise.', ar: 'حامل هاتف عام للوحة القيادة أو الزجاج الأمامي.' },
    price: 600, sale_price: null, on_sale: false, category: 'convenience',
    image_url: 'https://images.unsplash.com/photo-1587573571441-c5e9e9c8b1e3?w=600&q=80',
    unit: 'piece', available: true, featured: false, stock: 25, created_at: new Date().toISOString(),
  },
];
