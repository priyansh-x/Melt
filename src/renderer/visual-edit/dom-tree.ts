export function getDomTreeScript(): string {
  return `(function() {
    var existing = document.getElementById('__melt-dom-tree');
    if (existing) { existing.remove(); return; }

    var panel = document.createElement('div');
    panel.id = '__melt-dom-tree';
    panel.style.cssText = 'position:fixed;top:12px;left:12px;z-index:2147483645;width:360px;max-height:80vh;background:#1a1a1a;border:1px solid #333;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.5);overflow:hidden;font:11px -apple-system,monospace;display:flex;flex-direction:column;';

    var header = document.createElement('div');
    header.style.cssText = 'padding:8px 12px;background:#222;border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center;font-family:-apple-system,sans-serif;';
    header.innerHTML = '<span style="color:#22c55e;font-weight:600;">DOM Tree</span><button id="__melt-dom-tree-close" style="background:none;border:none;color:#666;cursor:pointer;font-size:14px;">×</button>';
    panel.appendChild(header);

    var tree = document.createElement('div');
    tree.style.cssText = 'overflow:auto;flex:1;padding:8px;';

    function buildNode(el, depth) {
      if (depth > 6 || el.id === '__melt-dom-tree') return '';
      var tag = el.tagName?.toLowerCase();
      if (!tag) return '';

      var id = el.id ? ' <span style="color:#f59e0b;">#' + el.id + '</span>' : '';
      var cls = el.className && typeof el.className === 'string' ? ' <span style="color:#22c55e;">.' + el.className.split(' ').slice(0, 2).join('.') + '</span>' : '';
      var childCount = el.children.length;

      var html = '<div style="padding-left:' + (depth * 16) + 'px;">';
      html += '<span class="__melt-dt-toggle" data-depth="' + depth + '" style="cursor:pointer;color:#a855f7;display:inline-block;width:12px;">' + (childCount > 0 ? '▶' : ' ') + '</span>';
      html += '<span style="color:#60a5fa;">&lt;' + tag + '</span>' + id + cls + '<span style="color:#60a5fa;">&gt;</span>';
      if (childCount > 0) html += ' <span style="color:#555;">(' + childCount + ')</span>';
      html += '</div>';

      if (childCount > 0 && depth < 3) {
        html += '<div class="__melt-dt-children">';
        for (var i = 0; i < Math.min(el.children.length, 50); i++) {
          html += buildNode(el.children[i], depth + 1);
        }
        if (el.children.length > 50) html += '<div style="padding-left:' + ((depth + 1) * 16) + 'px;color:#555;">... ' + (el.children.length - 50) + ' more</div>';
        html += '</div>';
      } else if (childCount > 0) {
        html += '<div class="__melt-dt-children" style="display:none;">';
        for (var i = 0; i < Math.min(el.children.length, 50); i++) {
          html += buildNode(el.children[i], depth + 1);
        }
        html += '</div>';
      }

      return html;
    }

    tree.innerHTML = buildNode(document.documentElement, 0);

    tree.addEventListener('click', function(e) {
      var toggle = e.target.closest('.__melt-dt-toggle');
      if (!toggle) return;
      var children = toggle.parentElement.nextElementSibling;
      if (!children || !children.classList.contains('__melt-dt-children')) return;
      if (children.style.display === 'none') {
        children.style.display = '';
        toggle.textContent = '▼';
      } else {
        children.style.display = 'none';
        toggle.textContent = '▶';
      }
    });

    panel.appendChild(tree);
    document.body.appendChild(panel);

    document.getElementById('__melt-dom-tree-close').onclick = function() { panel.remove(); };
  })()`
}
