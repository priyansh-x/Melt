export function getMetaViewerScript(): string {
  return `(function() {
    var existing = document.getElementById('__melt-meta');
    if (existing) { existing.remove(); return; }

    var panel = document.createElement('div');
    panel.id = '__melt-meta';
    panel.style.cssText = 'position:fixed;top:12px;right:12px;z-index:2147483645;width:400px;max-height:75vh;background:#1a1a1a;border:1px solid #333;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.5);overflow:hidden;font:12px -apple-system,sans-serif;display:flex;flex-direction:column;';

    var header = document.createElement('div');
    header.style.cssText = 'padding:10px 14px;background:#222;border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center;';
    header.innerHTML = '<span style="color:#22c55e;font-weight:600;">Meta & SEO</span><button id="__melt-meta-close" style="background:none;border:none;color:#666;cursor:pointer;font-size:14px;">×</button>';
    panel.appendChild(header);

    var body = document.createElement('div');
    body.style.cssText = 'overflow-y:auto;flex:1;padding:10px 14px;';

    function section(title) { return '<div style="color:#a855f7;font-weight:500;margin:12px 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">' + title + '</div>'; }
    function row(k, v) {
      if (!v) return '';
      var escaped = String(v).replace(/</g, '&lt;').substring(0, 200);
      return '<div style="display:flex;gap:8px;padding:3px 0;font-size:11px;"><span style="color:#888;min-width:100px;flex-shrink:0;">' + k + '</span><span style="color:#e0e0e0;word-break:break-all;">' + escaped + '</span></div>';
    }

    var html = section('Page');
    html += row('Title', document.title);
    html += row('URL', location.href);
    html += row('Charset', document.characterSet);
    html += row('Lang', document.documentElement.lang);

    var desc = document.querySelector('meta[name="description"]');
    html += row('Description', desc?.content);

    var keywords = document.querySelector('meta[name="keywords"]');
    html += row('Keywords', keywords?.content);

    var canonical = document.querySelector('link[rel="canonical"]');
    html += row('Canonical', canonical?.href);

    // Open Graph
    var ogTags = document.querySelectorAll('meta[property^="og:"]');
    if (ogTags.length > 0) {
      html += section('Open Graph');
      ogTags.forEach(function(t) {
        html += row(t.getAttribute('property'), t.content);
      });
    }

    // Twitter Card
    var twTags = document.querySelectorAll('meta[name^="twitter:"]');
    if (twTags.length > 0) {
      html += section('Twitter Card');
      twTags.forEach(function(t) {
        html += row(t.getAttribute('name'), t.content);
      });
    }

    // Robots
    var robots = document.querySelector('meta[name="robots"]');
    if (robots) {
      html += section('Robots');
      html += row('Directives', robots.content);
    }

    // Viewport
    var viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      html += section('Viewport');
      html += row('Content', viewport.content);
    }

    // Favicons & Icons
    var icons = document.querySelectorAll('link[rel*="icon"]');
    if (icons.length > 0) {
      html += section('Icons');
      icons.forEach(function(i) {
        html += row(i.getAttribute('rel'), (i.getAttribute('sizes') || '') + ' ' + i.href);
      });
    }

    // Other meta
    var otherMetas = document.querySelectorAll('meta[name]');
    var shown = new Set(['description','keywords','robots','viewport','twitter:card','twitter:site','twitter:title','twitter:description','twitter:image']);
    var others = [];
    otherMetas.forEach(function(m) {
      var name = m.getAttribute('name');
      if (!shown.has(name) && !name.startsWith('twitter:')) {
        others.push(m);
      }
    });
    if (others.length > 0) {
      html += section('Other Meta');
      others.forEach(function(m) {
        html += row(m.getAttribute('name'), m.content);
      });
    }

    body.innerHTML = html;
    panel.appendChild(body);
    document.body.appendChild(panel);

    document.getElementById('__melt-meta-close').onclick = function() { panel.remove(); };
  })()`
}
