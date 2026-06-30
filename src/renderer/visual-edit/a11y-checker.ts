export function getA11yCheckerScript(): string {
  return `(function() {
    var existing = document.getElementById('__melt-a11y');
    if (existing) { existing.remove(); return; }

    var issues = [];

    // Check images without alt
    document.querySelectorAll('img').forEach(function(img) {
      if (!img.alt && !img.getAttribute('role')) {
        issues.push({ el: img, type: 'error', msg: 'Image missing alt text', tag: 'img' });
      }
    });

    // Check form inputs without labels
    document.querySelectorAll('input,select,textarea').forEach(function(inp) {
      var id = inp.id;
      var hasLabel = id && document.querySelector('label[for="' + id + '"]');
      var hasAria = inp.getAttribute('aria-label') || inp.getAttribute('aria-labelledby');
      var wrapped = inp.closest('label');
      if (!hasLabel && !hasAria && !wrapped && inp.type !== 'hidden') {
        issues.push({ el: inp, type: 'error', msg: 'Form input missing label', tag: inp.tagName.toLowerCase() + '[' + (inp.type || 'text') + ']' });
      }
    });

    // Check buttons without accessible names
    document.querySelectorAll('button,[role="button"]').forEach(function(btn) {
      var text = btn.textContent?.trim();
      var aria = btn.getAttribute('aria-label');
      if (!text && !aria && !btn.querySelector('img[alt]')) {
        issues.push({ el: btn, type: 'warning', msg: 'Button has no accessible name', tag: 'button' });
      }
    });

    // Check heading hierarchy
    var lastLevel = 0;
    document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(function(h) {
      var level = parseInt(h.tagName[1]);
      if (level - lastLevel > 1 && lastLevel > 0) {
        issues.push({ el: h, type: 'warning', msg: 'Skipped heading level (h' + lastLevel + ' → h' + level + ')', tag: h.tagName.toLowerCase() });
      }
      lastLevel = level;
    });

    // Check links without href
    document.querySelectorAll('a:not([href])').forEach(function(a) {
      if (!a.getAttribute('role')) {
        issues.push({ el: a, type: 'warning', msg: 'Link without href', tag: 'a' });
      }
    });

    // Check low contrast (sample)
    document.querySelectorAll('p,span,li,td,th,a,label,h1,h2,h3').forEach(function(el) {
      var style = window.getComputedStyle(el);
      var color = style.color;
      var bg = style.backgroundColor;
      if (color === bg && color !== 'rgba(0, 0, 0, 0)') {
        issues.push({ el: el, type: 'warning', msg: 'Text color same as background', tag: el.tagName.toLowerCase() });
      }
    });

    // Check missing lang
    if (!document.documentElement.lang) {
      issues.push({ el: document.documentElement, type: 'warning', msg: 'Missing lang attribute on <html>', tag: 'html' });
    }

    // Build panel
    var panel = document.createElement('div');
    panel.id = '__melt-a11y';
    panel.style.cssText = 'position:fixed;top:12px;right:12px;z-index:2147483645;width:380px;max-height:70vh;background:#1a1a1a;border:1px solid #333;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.5);overflow:hidden;font:12px -apple-system,sans-serif;display:flex;flex-direction:column;';

    var errors = issues.filter(function(i) { return i.type === 'error'; }).length;
    var warnings = issues.filter(function(i) { return i.type === 'warning'; }).length;

    var header = document.createElement('div');
    header.style.cssText = 'padding:10px 14px;background:#222;border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center;';
    header.innerHTML = '<span style="color:#22c55e;font-weight:600;">A11y Check</span>' +
      '<span style="display:flex;gap:8px;align-items:center;">' +
      (errors > 0 ? '<span style="color:#ef4444;font-size:11px;">' + errors + ' errors</span>' : '') +
      (warnings > 0 ? '<span style="color:#f59e0b;font-size:11px;">' + warnings + ' warnings</span>' : '') +
      (issues.length === 0 ? '<span style="color:#22c55e;font-size:11px;">All clear!</span>' : '') +
      '<button id="__melt-a11y-close" style="background:none;border:none;color:#666;cursor:pointer;font-size:14px;">×</button></span>';
    panel.appendChild(header);

    var list = document.createElement('div');
    list.style.cssText = 'overflow-y:auto;flex:1;';

    issues.forEach(function(issue) {
      var row = document.createElement('div');
      row.style.cssText = 'padding:8px 14px;border-bottom:1px solid #222;cursor:pointer;display:flex;gap:8px;align-items:flex-start;';
      row.onmouseover = function() { row.style.background = '#222'; };
      row.onmouseout = function() { row.style.background = ''; };

      var dot = issue.type === 'error' ? '🔴' : '🟡';
      row.innerHTML = '<span style="flex-shrink:0;">' + dot + '</span>' +
        '<div><div style="color:#e0e0e0;">' + issue.msg + '</div>' +
        '<div style="color:#666;font-size:10px;margin-top:2px;">&lt;' + issue.tag + '&gt;</div></div>';

      row.onclick = function() {
        issue.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        issue.el.style.outline = '2px solid ' + (issue.type === 'error' ? '#ef4444' : '#f59e0b');
        setTimeout(function() { issue.el.style.outline = ''; }, 2000);
      };
      list.appendChild(row);
    });

    panel.appendChild(list);
    document.body.appendChild(panel);

    document.getElementById('__melt-a11y-close').onclick = function() { panel.remove(); };
  })()`
}
