export function getFontInspectorScript(): string {
  return `(function() {
    var existing = document.getElementById('__melt-fonts');
    if (existing) { existing.remove(); return; }

    var fonts = {};
    document.querySelectorAll('*').forEach(function(el) {
      var style = window.getComputedStyle(el);
      var family = style.fontFamily;
      var size = style.fontSize;
      var weight = style.fontWeight;
      var key = family;
      if (!fonts[key]) {
        fonts[key] = { family: family, sizes: new Set(), weights: new Set(), count: 0 };
      }
      fonts[key].sizes.add(size);
      fonts[key].weights.add(weight);
      fonts[key].count++;
    });

    var sorted = Object.values(fonts).sort(function(a, b) { return b.count - a.count; });

    var panel = document.createElement('div');
    panel.id = '__melt-fonts';
    panel.style.cssText = 'position:fixed;top:12px;right:12px;z-index:2147483645;width:360px;max-height:70vh;background:#1a1a1a;border:1px solid #333;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.5);overflow:hidden;font:12px -apple-system,sans-serif;display:flex;flex-direction:column;';

    var header = document.createElement('div');
    header.style.cssText = 'padding:10px 14px;background:#222;border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center;';
    header.innerHTML = '<span style="color:#22c55e;font-weight:600;">Font Inspector</span><span style="display:flex;gap:8px;align-items:center;"><span style="color:#888;font-size:11px;">' + sorted.length + ' font families</span><button id="__melt-fonts-close" style="background:none;border:none;color:#666;cursor:pointer;font-size:14px;">×</button></span>';
    panel.appendChild(header);

    var list = document.createElement('div');
    list.style.cssText = 'overflow-y:auto;flex:1;';

    sorted.forEach(function(f) {
      var row = document.createElement('div');
      row.style.cssText = 'padding:10px 14px;border-bottom:1px solid #222;';

      var sizes = Array.from(f.sizes).sort(function(a, b) { return parseFloat(a) - parseFloat(b); });
      var weights = Array.from(f.weights).sort();

      row.innerHTML =
        '<div style="font-family:' + f.family + ';font-size:16px;color:#e0e0e0;margin-bottom:6px;">The quick brown fox</div>' +
        '<div style="color:#a855f7;font-size:11px;margin-bottom:4px;word-break:break-all;">' + f.family + '</div>' +
        '<div style="display:flex;gap:12px;font-size:10px;color:#888;">' +
          '<span>Used ' + f.count + '×</span>' +
          '<span>Sizes: ' + sizes.slice(0, 5).join(', ') + (sizes.length > 5 ? '...' : '') + '</span>' +
          '<span>Weights: ' + weights.join(', ') + '</span>' +
        '</div>';
      list.appendChild(row);
    });

    panel.appendChild(list);
    document.body.appendChild(panel);

    document.getElementById('__melt-fonts-close').onclick = function() { panel.remove(); };
  })()`
}
