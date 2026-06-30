export function getOutlineViewScript(): string {
  return `(function() {
    if (document.getElementById('__melt-outline')) {
      document.getElementById('__melt-outline').remove();
      return;
    }

    var headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    if (!headings.length) {
      alert('No headings found on this page');
      return;
    }

    var panel = document.createElement('div');
    panel.id = '__melt-outline';
    panel.style.cssText = 'position:fixed;top:12px;left:12px;z-index:2147483645;width:280px;max-height:500px;background:#1a1a1a;border:1px solid #333;border-radius:8px;font:12px/1.5 -apple-system,sans-serif;color:#ccc;box-shadow:0 8px 32px rgba(0,0,0,0.5);overflow:hidden;display:flex;flex-direction:column;';

    var header = document.createElement('div');
    header.style.cssText = 'padding:8px 12px;background:#222;border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;';
    header.innerHTML = '<span style="color:#3b82f6;font-weight:500;">Page Outline</span><span style="font-size:10px;color:#666;">' + headings.length + ' headings</span>';
    panel.appendChild(header);

    var list = document.createElement('div');
    list.style.cssText = 'overflow-y:auto;flex:1;padding:6px 0;';

    headings.forEach(function(h) {
      var level = parseInt(h.tagName[1]);
      var item = document.createElement('div');
      item.style.cssText = 'padding:4px 12px 4px ' + (12 + (level - 1) * 16) + 'px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
      item.style.color = level <= 2 ? '#e0e0e0' : '#888';
      item.style.fontSize = level <= 2 ? '12px' : '11px';
      item.textContent = h.textContent.trim();
      item.onmouseenter = function() { item.style.background = 'rgba(59,130,246,0.1)'; };
      item.onmouseleave = function() { item.style.background = ''; };
      item.onclick = function() {
        h.scrollIntoView({ behavior: 'smooth', block: 'center' });
        h.style.outline = '2px solid #3b82f6';
        h.style.outlineOffset = '4px';
        setTimeout(function() { h.style.outline = ''; h.style.outlineOffset = ''; }, 2000);
      };
      list.appendChild(item);
    });

    panel.appendChild(list);

    var close = document.createElement('button');
    close.textContent = '×';
    close.style.cssText = 'position:absolute;top:6px;right:8px;background:none;border:none;color:#666;font-size:16px;cursor:pointer;';
    close.onclick = function() { panel.remove(); };
    panel.appendChild(close);

    document.body.appendChild(panel);
  })()`
}
