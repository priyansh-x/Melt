export function getPerfMonitorScript(): string {
  return `(function() {
    var existing = document.getElementById('__melt-perf');
    if (existing) { existing.remove(); return; }

    var panel = document.createElement('div');
    panel.id = '__melt-perf';
    panel.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:2147483645;width:280px;background:#1a1a1a;border:1px solid #333;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.5);overflow:hidden;font:11px -apple-system,sans-serif;';

    var header = document.createElement('div');
    header.style.cssText = 'padding:8px 12px;background:#222;border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center;';
    header.innerHTML = '<span style="color:#22c55e;font-weight:600;">Perf Monitor</span><button id="__melt-perf-close" style="background:none;border:none;color:#666;cursor:pointer;font-size:14px;">×</button>';
    panel.appendChild(header);

    var body = document.createElement('div');
    body.style.cssText = 'padding:10px 12px;';

    function row(label, value, color) {
      return '<div style="display:flex;justify-content:space-between;padding:3px 0;"><span style="color:#888;">' + label + '</span><span style="color:' + (color || '#e0e0e0') + ';font-family:monospace;">' + value + '</span></div>';
    }

    var perf = performance;
    var timing = perf.getEntriesByType('navigation')[0] || {};
    var paint = perf.getEntriesByType('paint');
    var fcp = paint.find(function(p) { return p.name === 'first-contentful-paint'; });
    var fp = paint.find(function(p) { return p.name === 'first-paint'; });

    var domNodes = document.querySelectorAll('*').length;
    var scripts = document.querySelectorAll('script').length;
    var stylesheets = document.querySelectorAll('link[rel="stylesheet"],style').length;
    var images = document.querySelectorAll('img').length;

    var resources = perf.getEntriesByType('resource');
    var totalTransfer = resources.reduce(function(s, r) { return s + (r.transferSize || 0); }, 0);

    var html = '<div style="margin-bottom:8px;color:#a855f7;font-weight:500;">Timing</div>';
    if (timing.domContentLoadedEventEnd) html += row('DOM Ready', Math.round(timing.domContentLoadedEventEnd) + 'ms');
    if (timing.loadEventEnd) html += row('Load', Math.round(timing.loadEventEnd) + 'ms');
    if (fp) html += row('First Paint', Math.round(fp.startTime) + 'ms');
    if (fcp) html += row('FCP', Math.round(fcp.startTime) + 'ms', fcp.startTime < 1800 ? '#22c55e' : fcp.startTime < 3000 ? '#f59e0b' : '#ef4444');
    if (timing.responseEnd && timing.requestStart) html += row('TTFB', Math.round(timing.responseEnd - timing.requestStart) + 'ms');

    html += '<div style="margin:8px 0;border-top:1px solid #222;"></div>';
    html += '<div style="margin-bottom:8px;color:#a855f7;font-weight:500;">Page</div>';
    html += row('DOM Nodes', domNodes.toLocaleString(), domNodes > 1500 ? '#f59e0b' : '#22c55e');
    html += row('Scripts', scripts);
    html += row('Stylesheets', stylesheets);
    html += row('Images', images);
    html += row('Resources', resources.length);
    html += row('Transfer', (totalTransfer / 1024).toFixed(1) + ' KB');

    if (performance.memory) {
      html += '<div style="margin:8px 0;border-top:1px solid #222;"></div>';
      html += '<div style="margin-bottom:8px;color:#a855f7;font-weight:500;">Memory</div>';
      html += row('Used', (performance.memory.usedJSHeapSize / 1048576).toFixed(1) + ' MB');
      html += row('Total', (performance.memory.totalJSHeapSize / 1048576).toFixed(1) + ' MB');
    }

    body.innerHTML = html;
    panel.appendChild(body);
    document.body.appendChild(panel);

    document.getElementById('__melt-perf-close').onclick = function() { panel.remove(); };
  })()`
}
