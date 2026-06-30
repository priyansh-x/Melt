import { RecipeCreate } from '../../shared/recipe'

export interface RecipeTemplate {
  id: string
  name: string
  description: string
  category: 'productivity' | 'privacy' | 'visual' | 'accessibility'
  recipe: RecipeCreate
}

export const RECIPE_TEMPLATES: RecipeTemplate[] = [
  {
    id: 'universal-dark',
    name: 'Universal Dark Mode',
    description: 'Force dark mode on any website',
    category: 'visual',
    recipe: {
      name: 'Universal Dark Mode',
      urlPattern: '*',
      css: `html { filter: invert(1) hue-rotate(180deg) !important; }
img, video, canvas, svg, [style*="background-image"] { filter: invert(1) hue-rotate(180deg) !important; }`,
      js: '',
      domActions: '[]',
      enabled: true,
    },
  },
  {
    id: 'hide-cookie-banners',
    name: 'Hide Cookie Banners',
    description: 'Remove cookie consent popups',
    category: 'privacy',
    recipe: {
      name: 'Hide Cookie Banners',
      urlPattern: '*',
      css: '',
      js: `(function() {
  const selectors = [
    '[class*="cookie"]', '[id*="cookie"]',
    '[class*="consent"]', '[id*="consent"]',
    '[class*="gdpr"]', '[id*="gdpr"]',
    '.cc-banner', '.cc-window',
    '#onetrust-banner-sdk',
    '.qc-cmp-showing',
  ];
  function removeBanners() {
    selectors.forEach(s => {
      document.querySelectorAll(s).forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.position === 'fixed' || style.position === 'sticky' || el.offsetHeight > 100) {
          el.style.display = 'none';
        }
      });
    });
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }
  removeBanners();
  new MutationObserver(removeBanners).observe(document.body, { childList: true, subtree: true });
})()`,
      domActions: '[]',
      enabled: true,
    },
  },
  {
    id: 'youtube-clean',
    name: 'YouTube Clean',
    description: 'Hide YouTube distractions — comments, sidebar, shorts',
    category: 'productivity',
    recipe: {
      name: 'YouTube Clean',
      urlPattern: '*youtube.com*',
      css: `#comments, #related, ytd-mini-guide-renderer,
ytd-rich-shelf-renderer[is-shorts], #shorts-container,
.ytp-ce-element, .ytp-cards-button,
ytd-merch-shelf-renderer, #masthead-ad { display: none !important; }
#primary { max-width: 900px; margin: 0 auto; }`,
      js: '',
      domActions: '[]',
      enabled: true,
    },
  },
  {
    id: 'twitter-clean',
    name: 'Twitter/X Clean',
    description: 'Hide trending, who to follow, premium upsells',
    category: 'productivity',
    recipe: {
      name: 'Twitter/X Clean',
      urlPattern: '*twitter.com*,*x.com*',
      css: `[data-testid="trend"], [data-testid="UserCell"],
a[href="/i/premium_sign_up"], a[href="/i/verified-choose"],
[aria-label="Timeline: Trending now"],
[aria-label="Who to follow"] { display: none !important; }`,
      js: '',
      domActions: '[]',
      enabled: true,
    },
  },
  {
    id: 'reddit-clean',
    name: 'Reddit Clean',
    description: 'Hide promoted posts and sidebar ads',
    category: 'productivity',
    recipe: {
      name: 'Reddit Clean',
      urlPattern: '*reddit.com*',
      css: `[data-testid="promoted"], .promotedlink,
shreddit-ad-post, [data-ad-variant],
.premium-banner-outer { display: none !important; }`,
      js: '',
      domActions: '[]',
      enabled: true,
    },
  },
  {
    id: 'reader-mode',
    name: 'Reader Mode',
    description: 'Simplify any page for focused reading',
    category: 'accessibility',
    recipe: {
      name: 'Reader Mode',
      urlPattern: '*',
      css: `body { max-width: 680px !important; margin: 40px auto !important; padding: 0 20px !important;
  font-family: Georgia, 'Times New Roman', serif !important; font-size: 18px !important;
  line-height: 1.7 !important; color: #333 !important; background: #fafafa !important; }
nav, header, footer, aside, [role="banner"], [role="navigation"],
[role="complementary"], .sidebar, #sidebar { display: none !important; }
img { max-width: 100% !important; height: auto !important; }`,
      js: '',
      domActions: '[]',
      enabled: true,
    },
  },
  {
    id: 'bigger-text',
    name: 'Bigger Text',
    description: 'Increase text size across all sites',
    category: 'accessibility',
    recipe: {
      name: 'Bigger Text',
      urlPattern: '*',
      css: `* { font-size: calc(1em * 1.15) !important; line-height: 1.6 !important; }`,
      js: '',
      domActions: '[]',
      enabled: true,
    },
  },
  {
    id: 'no-autoplay',
    name: 'Stop Autoplay',
    description: 'Prevent videos from auto-playing',
    category: 'privacy',
    recipe: {
      name: 'Stop Autoplay',
      urlPattern: '*',
      css: '',
      js: `(function() {
  document.querySelectorAll('video').forEach(v => { v.pause(); v.autoplay = false; });
  new MutationObserver(muts => {
    for (const mut of muts) {
      mut.addedNodes.forEach(n => {
        if (n.querySelectorAll) {
          n.querySelectorAll('video').forEach(v => { v.pause(); v.autoplay = false; });
        }
      });
    }
  }).observe(document.body, { childList: true, subtree: true });
})()`,
      domActions: '[]',
      enabled: true,
    },
  },
]
