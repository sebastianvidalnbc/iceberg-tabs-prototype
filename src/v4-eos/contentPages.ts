// Peacock Content Pages — one territory template (content-page-us), not a
// slug tree. ATOM supplies the title; this config is the shell around every
// watch URL. Field ids follow the production CMS form (cms-schema + passes).

export type PassType = "free" | "select" | "premium" | "starz";

export interface PassConfig {
  passType: PassType;
  enabled: boolean;
  title: string;
  ctaLabel: string;
  upcomingCtaLabel: string;
  ctaUrl: string;
  breadcrumbLabel: string;
  breadcrumbUrl: string;
  termsModule: string;
  filterRecommended: boolean;
  enableCustomFaq: boolean;
  customFaqTitle: string;
}

export interface ContentPageI18n {
  watch: string;
  details: string;
  aboutSeries: string;
  aboutMovie: string;
  faqTitle: string;
  showSubheading: string;
  movieSubheading: string;
}

export interface ContentPageConfig {
  enabled: boolean;
  legal: string;
  skipLinkMain: string;
  skipLinkFooter: string;
  faqSuccessRedirect: string;
  devicesHref: string;
  allMonthlyPlansHref: string;
  freeEpisodesHref: string;
  premiumEpisodesHref: string;
  mixedEpisodesHref: string;
  freeEpisodesText: string;
  premiumEpisodesText: string;
  allPlansBtnText: string;
  premiumBtnText: string;
  mixedBtnText: string;
  freeBtnText: string;
  emailPlaceholder: string;
  carouselTv: string;
  carouselMovies: string;
  carouselKids: string;
  carouselNews: string;
  videoEnd1: string;
  videoEnd2: string;
  videoPause1: string;
  videoPause2: string;
  videoPauseCta: string;
  videoPauseHref: string;
  whatIsWidget: string;
  extraWidget1: string;
  extraWidget2: string;
  extraWidget3: string;
  footerNavWidget: string;
  stickyBannerWidget: string;
  optimizely: boolean;
  i18n: ContentPageI18n;
  passes: PassConfig[];
}

export interface ContentPageHistory {
  editedBy: string;
  editDate: string;
}

export type AtomKind = "series" | "movie" | "episode";

export interface AtomTitle {
  id: string;
  slug: string;
  title: string;
  kind: AtomKind;
  genre: string;
  year: string;
  rating: string;
  seasons?: number;
  episodes?: number;
  runtime?: string;
  synopsis: string;
  tags: string[];
  poster: AtomPosterId;
}

export type AtomPosterId =
  | "scorpion-king"
  | "the-office"
  | "snapped"
  | "office-pilot";

export type ContentPageStatus = "Draft" | "Published";

export interface ContentPageRecord {
  id: string;
  slug: string;
  name: string;
  territory: string;
  locale: string;
  status: ContentPageStatus;
  created: string;
  modified: string;
  editedBy: string;
  config: ContentPageConfig;
}

export type OutlineGroupId =
  | "overview"
  | "memberships"
  | `pass-${PassType}`
  | "widgets"
  | "footer"
  | "sticky"
  | "legal"
  | "urls"
  | "episodes"
  | "carousels"
  | "video-end"
  | "video-pause"
  | "i18n"
  | "experiment";

export interface OutlineNode {
  id: OutlineGroupId;
  label: string;
  hint?: string;
  children?: OutlineNode[];
}

export const CONTENT_PAGE_HISTORY: ContentPageHistory = {
  editedBy: "Sebastian Vidal",
  editDate: "2026-10-06T14:22:00.000Z",
};

export const ATOM_TITLES: AtomTitle[] = [
  {
    id: "scorpion-king",
    slug: "watch-online/movies/action-and-adventure/the-scorpion-king/7603de33-38c0-3485-a3f2-af9f51365abf",
    title: "The Scorpion King",
    kind: "movie",
    genre: "Action",
    year: "2002",
    rating: "PG-13",
    runtime: "1h 32m",
    synopsis:
      "A desert warrior rises against an evil army and becomes a legend in this adventure set before the world of The Mummy.",
    tags: ["Action", "Adventure", "Fantasy"],
    poster: "scorpion-king",
  },
  {
    id: "the-office",
    slug: "watch-online/tv/comedy/the-office/office-us",
    title: "The Office",
    kind: "series",
    genre: "Comedy",
    year: "2005",
    rating: "TV-14",
    seasons: 9,
    episodes: 201,
    synopsis:
      "A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.",
    tags: ["Comedy", "Mockumentary"],
    poster: "the-office",
  },
  {
    id: "snapped",
    slug: "watch-online/tv/snapped/7569022312246115112",
    title: "Snapped",
    kind: "series",
    genre: "True Crime",
    year: "2004",
    rating: "TV-14",
    seasons: 32,
    episodes: 480,
    synopsis:
      "Profiles of women accused of murder, reconstructed from interviews, archives, and case files.",
    tags: ["True Crime", "Documentary"],
    poster: "snapped",
  },
  {
    id: "office-s1e1",
    slug: "watch-online/tv/comedy/the-office/s1/pilot",
    title: "The Office · Pilot",
    kind: "episode",
    genre: "Comedy",
    year: "2005",
    rating: "TV-14",
    runtime: "22m",
    synopsis:
      "A documentary crew arrives at the Scranton branch as a new downsizing consultant unsettles the staff.",
    tags: ["Comedy", "Episode"],
    poster: "office-pilot",
  },
];

export const DEFAULT_ATOM_ID = "scorpion-king";

const pass = (
  passType: PassType,
  title: string,
  ctaLabel: string,
  ctaUrl: string,
): PassConfig => ({
  passType,
  enabled: true,
  title,
  ctaLabel,
  upcomingCtaLabel: "Coming soon",
  ctaUrl,
  breadcrumbLabel: "Plans",
  breadcrumbUrl: "/plans",
  termsModule: "content-page-terms",
  filterRecommended: false,
  enableCustomFaq: false,
  customFaqTitle: "",
});

export const DEFAULT_CONTENT_PAGE: ContentPageConfig = {
  enabled: true,
  legal: "Cancel anytime. Restrictions apply. See terms for details.",
  skipLinkMain: "Skip to main content",
  skipLinkFooter: "Skip to footer",
  faqSuccessRedirect: "/plans",
  devicesHref: "/devices",
  allMonthlyPlansHref: "/plans/all-monthly",
  freeEpisodesHref: "/free",
  premiumEpisodesHref: "/plans/premium",
  mixedEpisodesHref: "/plans",
  freeEpisodesText: "Free episodes available",
  premiumEpisodesText: "Premium episodes",
  allPlansBtnText: "See all plans",
  premiumBtnText: "Go Premium",
  mixedBtnText: "See plans",
  freeBtnText: "Watch free",
  emailPlaceholder: "Email address",
  carouselTv: "atom/recs/tv-fallback",
  carouselMovies: "atom/recs/movies-fallback",
  carouselKids: "atom/recs/kids-fallback",
  carouselNews: "atom/recs/news-fallback",
  videoEnd1: "Ready to keep watching?",
  videoEnd2: "Pick a plan to unlock this title.",
  videoPause1: "Paused",
  videoPause2: "Continue with a Peacock plan.",
  videoPauseCta: "See plans",
  videoPauseHref: "/plans",
  whatIsWidget: "what-is-peacock",
  extraWidget1: "",
  extraWidget2: "",
  extraWidget3: "",
  footerNavWidget: "footer-nav",
  stickyBannerWidget: "",
  optimizely: false,
  i18n: {
    watch: "Watch",
    details: "Details",
    aboutSeries: "About this Series",
    aboutMovie: "About this Movie",
    faqTitle: "Frequently asked questions",
    showSubheading: "Watch full episodes of {{title}}",
    movieSubheading: "Watch {{title}}",
  },
  passes: [
    pass("select", "Select", "Start Select", "/checkout/select"),
    pass("premium", "Premium / Premium Plus", "Go Premium", "/checkout/premium"),
    pass("starz", "STARZ", "Add STARZ", "/checkout/starz"),
    pass("free", "Free", "Watch free", "/free"),
  ],
};

export const CONTENT_PAGE_OUTLINE: OutlineNode[] = [
  { id: "overview", label: "Overview" },
  {
    id: "memberships",
    label: "Content Page Memberships",
    children: [
      { id: "pass-select", label: "Select" },
      { id: "pass-premium", label: "Premium / Premium Plus" },
      { id: "pass-starz", label: "STARZ" },
      { id: "pass-free", label: "Free" },
    ],
  },
  { id: "widgets", label: "Territory-Specific Widget" },
  { id: "footer", label: "Footer Navigation Widget" },
  { id: "sticky", label: "Sticky Banner Widget" },
  { id: "legal", label: "Legal" },
  { id: "urls", label: "PDP URL" },
  { id: "episodes", label: "Episode Text" },
  { id: "carousels", label: "Fallback Carousels" },
  { id: "video-end", label: "Video End Message" },
  { id: "video-pause", label: "Video Pause Message" },
  { id: "i18n", label: "Common words" },
  { id: "experiment", label: "Optimizely" },
];

export function atomById(id: string): AtomTitle {
  return ATOM_TITLES.find((t) => t.id === id) ?? ATOM_TITLES[0];
}

export function passByType(
  config: ContentPageConfig,
  type: PassType,
): PassConfig {
  return config.passes.find((p) => p.passType === type) ?? config.passes[0];
}

export function outlineLabel(id: OutlineGroupId): string {
  const walk = (nodes: OutlineNode[]): string | null => {
    for (const n of nodes) {
      if (n.id === id) return n.label;
      if (n.children) {
        const hit = walk(n.children);
        if (hit) return hit;
      }
    }
    return null;
  };
  return walk(CONTENT_PAGE_OUTLINE) ?? "Overview";
}

export function formatEditDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

export function interpolate(template: string, title: string): string {
  return template.replace(/\{\{title\}\}/g, title);
}

function cloneConfig(base: ContentPageConfig = DEFAULT_CONTENT_PAGE): ContentPageConfig {
  return structuredClone(base);
}

function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "template";
}

const SEED_CONTENT_PAGES: ContentPageRecord[] = [
  {
    id: "content-page-us",
    slug: "content-page-us",
    name: "US template",
    territory: "United States",
    locale: "en-US",
    status: "Published",
    created: "Apr 10 26",
    modified: "3 hours ago",
    editedBy: "Vidal, Sebastian",
    config: cloneConfig(),
  },
  {
    id: "content-page-uk",
    slug: "content-page-uk",
    name: "UK template",
    territory: "United Kingdom",
    locale: "en-GB",
    status: "Draft",
    created: "Sep 22 26",
    modified: "12 days ago",
    editedBy: "Bueno, Fernanda",
    config: cloneConfig(),
  },
];

type Listener = () => void;
let records: ContentPageRecord[] = SEED_CONTENT_PAGES;
const listeners = new Set<Listener>();

export function subscribeContentPages(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function listContentPages(): ContentPageRecord[] {
  return records;
}

export function getContentPage(id: string): ContentPageRecord | undefined {
  return records.find((page) => page.id === id);
}

export function createContentPage(input: {
  name: string;
  territory: string;
  locale: string;
}): ContentPageRecord {
  const base = `content-page-${slugify(input.territory)}`;
  let slug = base;
  let n = 2;
  while (records.some((page) => page.slug === slug)) {
    slug = `${base}-${n++}`;
  }
  const page: ContentPageRecord = {
    id: slug,
    slug,
    name: input.name.trim(),
    territory: input.territory.trim(),
    locale: input.locale.trim() || "en-US",
    status: "Draft",
    created: "Just now",
    modified: "Just now",
    editedBy: "Vidal, Sebastian",
    config: cloneConfig(),
  };
  records = [page, ...records];
  listeners.forEach((fn) => fn());
  return page;
}

