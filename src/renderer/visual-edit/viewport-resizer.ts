export function getViewportResizerScript(): string {
  return `(function() {
    var existing = document.getElementById('__melt-viewport-resizer');
    if (existing) { existing.remove(); return; }

    var devices = [
      { name: 'iPhone SE', w: 375, h: 667 },
      { name: 'iPhone 14', w: 390, h: 844 },
      { name: 'iPhone 14 Pro Max', w: 430, h: 932 },
      { name: 'iPad Mini', w: 768, h: 1024 },
      { name: 'iPad Pro 11"', w: 834, h: 1194 },
      { name: 'iPad Pro 12.9"', w: 1024, h: 1366 },
      { name: 'Laptop', w: 1366, h: 768 },
      { name: 'Desktop', w: 1920, h: 1080 }
    ];

    var bar = document.createElement('div');
    bar.id = '__melt-viewport-resizer';
    bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2147483645;background:#1a1a1a;border-bottom:1px solid #333;display:flex;align-items:center;gap:4px;padding:4px 12px;font:11px -apple-system,sans-serif;';

    devices.forEach(function(d) {
      var btn = document.createElement('button');
      btn.textContent = d.name;
      btn.title = d.w + ' × ' + d.h;
      btn.style.cssText = 'background:#222;border:1px solid #444;border-radius:4px;color:#ccc;padding:3px 8px;cursor:pointer;font:11px -apple-system,sans-serif;white-space:nowrap;';
      btn.onmouseover = function() { btn.style.borderColor = '#a855f7'; };
      btn.onmouseout = function() { btn.style.borderColor = '#444'; };
      btn.onclick = function() {
        document.documentElement.style.maxWidth = d.w + 'px';
        document.documentElement.style.margin = '40px auto 0';
        document.documentElement.style.boxShadow = '0 0 0 1px #333, 0 8px 32px rgba(0,0,0,0.5)';
        document.documentElement.style.minHeight = d.h + 'px';
        document.body.style.background = '#0a0a0a';
        label.textContent = d.name + ' (' + d.w + ' × ' + d.h + ')';
        bar.querySelectorAll('button').forEach(function(b) { b.style.background = '#222'; });
        btn.style.background = '#333';
      };
      bar.appendChild(btn);
    });

    var label = document.createElement('span');
    label.style.cssText = 'color:#a855f7;margin-left:auto;font-weight:500;';
    label.textContent = 'Full width';
    bar.appendChild(label);

    var reset = document.createElement('button');
    reset.textContent = 'Reset';
    reset.style.cssText = 'background:#333;border:1px solid #555;border-radius:4px;color:#fff;padding:3px 8px;cursor:pointer;font:11px -apple-system,sans-serif;margin-left:4px;';
    reset.onclick = function() {
      document.documentElement.style.maxWidth = '';
      document.documentElement.style.margin = '';
      document.documentElement.style.boxShadow = '';
      document.documentElement.style.minHeight = '';
      document.body.style.background = '';
      label.textContent = 'Full width';
      bar.querySelectorAll('button').forEach(function(b) { b.style.background = '#222'; });
    };
    bar.appendChild(reset);

    var close = document.createElement('button');
    close.textContent = '×';
    close.style.cssText = 'background:none;border:none;color:#666;cursor:pointer;font-size:14px;margin-left:4px;';
    close.onclick = function() {
      reset.click();
      bar.remove();
    };
    bar.appendChild(close);

    document.body.appendChild(bar);
  })()`
}
