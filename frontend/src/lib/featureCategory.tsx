import type { ReactNode } from 'react';

export type FeatureCategoryKey =
  | 'safety'
  | 'lighting'
  | 'infotainment'
  | 'assistance'
  | 'comfort'
  | 'exterior'
  | 'convenience'
  | 'performance'
  | 'other';

interface CategoryMeta {
  key: FeatureCategoryKey;
  label: string;
  chip: string;
  dot: string;
  order: number;
  icon: ReactNode;
}

const svg = (d: string, extra?: ReactNode) => (
  <svg
    className="w-3.5 h-3.5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
    {extra}
  </svg>
);

export const CATEGORIES: Record<FeatureCategoryKey, CategoryMeta> = {
  safety: {
    key: 'safety',
    label: 'Safety',
    chip: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    dot: 'bg-rose-500',
    order: 1,
    icon: svg('M12 2l9 4-1 11a9 9 0 0 1-16 0L3 6l9-4z'),
  },
  lighting: {
    key: 'lighting',
    label: 'Lighting',
    chip: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    dot: 'bg-amber-500',
    order: 2,
    icon: svg('M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z'),
  },
  assistance: {
    key: 'assistance',
    label: 'Driver Assistance',
    chip: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
    dot: 'bg-indigo-500',
    order: 3,
    icon: svg(
      'M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83',
      <circle cx="12" cy="12" r="3" />,
    ),
  },
  infotainment: {
    key: 'infotainment',
    label: 'Infotainment',
    chip: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    dot: 'bg-sky-500',
    order: 4,
    icon: svg('M3 5h18v12H3zM8 21h8M12 17v4', <rect x="3" y="5" width="18" height="12" rx="2" />),
  },
  comfort: {
    key: 'comfort',
    label: 'Comfort',
    chip: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
    dot: 'bg-violet-500',
    order: 5,
    icon: svg('M5 21V10a2 2 0 0 1 2-2h3v13H5zM14 21V8a2 2 0 0 1 2-2h3v15h-5z'),
  },
  convenience: {
    key: 'convenience',
    label: 'Convenience',
    chip: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    dot: 'bg-emerald-500',
    order: 6,
    icon: svg('M12 22s8-7 8-13a8 8 0 0 0-16 0c0 6 8 13 8 13z', <circle cx="12" cy="9" r="3" />),
  },
  exterior: {
    key: 'exterior',
    label: 'Exterior & Style',
    chip: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
    dot: 'bg-teal-500',
    order: 7,
    icon: svg('', <circle cx="12" cy="12" r="9" />),
  },
  performance: {
    key: 'performance',
    label: 'Performance',
    chip: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
    dot: 'bg-orange-500',
    order: 8,
    icon: svg('M13 2L3 14h7l-1 8 10-12h-7l1-8z'),
  },
  other: {
    key: 'other',
    label: 'Other',
    chip: 'bg-warmgray/10 text-charcoal/70 ring-1 ring-warmgray-border',
    dot: 'bg-warmgray',
    order: 9,
    icon: svg('', <circle cx="12" cy="12" r="4" />),
  },
};

const RULES: Array<[RegExp, FeatureCategoryKey]> = [
  [/(abs|airbag|isofix|alarme|anti[- ]?(démarrage|patinage|intrusion)|contrôle de pression|appuis?[- ]?tête|stabilité|esp)/i, 'safety'],
  [/(phares?|feux|led|xénon|xenon|antibrouillard|allumage|lave phares)/i, 'lighting'],
  [/(radar|caméra|camera|parkassist|park assist|régulateur|detecteur|détecteur|conduite (semi-?)?autonome|affichage tête haute|tête haute|360|pression des pneus)/i, 'assistance'],
  [/(autoradio|radio|bluetooth|navigation|gps|android auto|apple carplay|carplay|connectivité|chargeur cd|mp3|aux|usb|ipod|instrumentation numérique|écran|ecran)/i, 'infotainment'],
  [/(climatisation|sièges?|siege|accoudoir|toit (ouvrant|panoramique)|panoramique|coffre électrique|volant chauffant|volant multi|volant réglable|volant\/levier|boîte à gants|massant|chauffant|ventilé|ventile|cuir)/i, 'comfort'],
  [/(start & stop|start&stop|accès sans clé|demarrage sans clé|démarrage sans clé|direction assistée|fermeture centralisée|ordinateur de bord|palettes|vitres électriques|rétroviseurs|anti-démarrage)/i, 'convenience'],
  [/(jantes?|peinture|vitres teintées|tinted|alliage|chrome|aérodynamique|spoiler)/i, 'exterior'],
  [/(suspension|runflat|pneumatique|tropicalisé|turbo|sport|performance|freinage|frein)/i, 'performance'],
];

export function categorizeFeature(feature: string): FeatureCategoryKey {
  for (const [regex, category] of RULES) {
    if (regex.test(feature)) return category;
  }
  return 'other';
}

export function groupFeatures(features: string[]): Array<{
  category: CategoryMeta;
  items: string[];
}> {
  const buckets = new Map<FeatureCategoryKey, string[]>();
  for (const f of features) {
    const key = categorizeFeature(f);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(f);
  }
  return Array.from(buckets.entries())
    .map(([key, items]) => ({
      category: CATEGORIES[key],
      items: items.sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.category.order - b.category.order);
}
