export function getZIndexVizScript(): string {
  return `(function() {
    var existing = document.getElementById('__melt-zindex');
    if (existing) { existing.remove(); return; }

    var elements = [];
    document.querySelectorAll('*').forEach(function(el) {
      var style = window.getComputedStyle(el);
      var z = style.zIndex;
      var pos = style.position;
      if (z !== 'auto' && pos !== 'static') {
        var rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          elements.push({ el: el, z: parseInt(z) || 0, rect: rect, pos: pos, tag: el.tagName.toLowerCase(), id: el.id, cls: (typeof el.className === 'string' ? el.className : '').split(' ')[0] });
        }
      }
    });

    elements.sort(function(a, b) { return b.z - a.z; });

    var panel = document.createElement('div');
    panel.id = '__melt-zindex';
    panel.style.cssText = 'position:fixed;top:12px;left:12px;z-index:2147483645;width:320px;max-height:70vh;background:#1a1a1a;border:1px solid #333;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.5);overflow:hidden;font:12px -apple-system,sans-serif;display:flex;flex-direction:column;';

    var header = document.createElement('div');
    header.style.cssText = 'padding:10px 14px;background:#222;border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center;';
    header.innerHTML = '<span style="color:#22c55e;font-weight:600;">Z-Index Map</span><span style="display:flex;gap:8px;align-items:center;"><span style="color:#888;font-size:11px;">' + elements.length + ' layers</span><button id="__melt-zindex-close" style="background:none;border:none;color:#666;cursor:pointer;font-size:14px;">×</button></span>';
    panel.appendChild(header);

    var list = document.createElement('div');
    list.style.cssText = 'overflow-y:auto;flex:1;';

    elements.forEach(function(item) {
      var row = document.createElement('div');
      row.style.cssText = 'padding:8px 14px;border-bottom:1px solid #222;cursor:pointer;display:flex;gap:10px;align-items:center;';
      row.onmouseover = function() {
        row.style.background = '#222';
        item.el.style.outline = '2px solid #a855f7';
      };
      row.onmouseout = function() {
        row.style.background = '';
        item.el.style.outline = '';
      };
      row.onclick = function() {
        item.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      };

      var color = item.z > 1000 ? '#ef4444' : item.z > 100 ? '#f59e0b' : item.z > 0 ? '#22c55e' : '#888';

      row.innerHTML =
        '<span style="color:' + color + ';font-family:monospace;font-weight:600;min-width:50px;text-align:right;">' + item.z + '</span>' +
        '<div><span style="color:#60a5fa;">&lt;' + item.tag + '&gt;</span>' +
        (item.id ? '<span style="color:#f59e0b;"> #' + item.id + '</span>' : '') +
        (item.cls ? '<span style="color:#22c55e;"> .' + item.cls + '</span>' : '') +
        '<div style="color:#555;font-size:10px;margin-top:2px;">' + item.pos + ' · ' + Math.round(item.rect.width) + '×' + Math.round(item.rect.height) + '</div></div>';
      list.appendChild(row);
    });

    if (elements.length === 0) {
      list.innerHTML = '<div style="padding:20px;color:#888;text-align:center;">No positioned elements with z-index found</div>';
    }

    panel.appendChild(list);
    document.body.appendChild(panel);

    document.getElementById('__melt-zindex-close').onclick = function() { panel.remove(); };
  })()`
}
