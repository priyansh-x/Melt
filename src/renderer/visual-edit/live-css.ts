export function getLiveCssScript(): string {
  return `(function() {
    var existing = document.getElementById('__melt-live-css');
    if (existing) { existing.remove(); return; }

    var panel = document.createElement('div');
    panel.id = '__melt-live-css';
    panel.style.cssText = 'position:fixed;bottom:12px;right:12px;z-index:2147483645;width:360px;background:#1a1a1a;border:1px solid #333;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.5);overflow:hidden;font:12px -apple-system,sans-serif;display:flex;flex-direction:column;';

    var header = document.createElement('div');
    header.style.cssText = 'padding:8px 12px;background:#222;border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center;cursor:move;';
    header.innerHTML = '<span style="color:#22c55e;font-weight:500;">Live CSS Editor</span><button id="__melt-live-css-close" style="background:none;border:none;color:#666;cursor:pointer;font-size:14px;">×</button>';
    panel.appendChild(header);

    var textarea = document.createElement('textarea');
    textarea.id = '__melt-live-css-input';
    textarea.style.cssText = 'width:100%;height:180px;background:#111;border:none;color:#e0e0e0;padding:10px;font:12px/1.5 monospace;resize:vertical;outline:none;box-sizing:border-box;';
    textarea.placeholder = '/* Type CSS here — applied live */\\nbody {\\n  background: #1a1a1a;\\n}';
    textarea.spellcheck = false;
    panel.appendChild(textarea);

    var style = document.createElement('style');
    style.id = '__melt-live-css-style';
    document.head.appendChild(style);

    textarea.addEventListener('input', function() {
      style.textContent = textarea.value;
    });

    document.body.appendChild(panel);

    // Dragging
    var isDragging = false, offsetX = 0, offsetY = 0;
    header.addEventListener('mousedown', function(e) {
      isDragging = true;
      offsetX = e.clientX - panel.getBoundingClientRect().left;
      offsetY = e.clientY - panel.getBoundingClientRect().top;
    });
    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      panel.style.left = (e.clientX - offsetX) + 'px';
      panel.style.top = (e.clientY - offsetY) + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    });
    document.addEventListener('mouseup', function() { isDragging = false; });

    document.getElementById('__melt-live-css-close').onclick = function() {
      panel.remove();
      style.remove();
    };

    textarea.focus();
  })()`
}
