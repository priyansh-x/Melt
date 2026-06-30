export function getPageStatsScript(): string {
  return `(function() {
    if (document.getElementById('__melt-page-stats')) {
      document.getElementById('__melt-page-stats').remove();
      return;
    }

    var perf = performance.getEntriesByType('navigation')[0] || {};
    var resources = performance.getEntriesByType('resource');

    var scripts = document.querySelectorAll('script[src]').length;
    var styles = document.querySelectorAll('link[rel="stylesheet"]').length;
    var images = document.querySelectorAll('img').length;
    var iframes = document.querySelectorAll('iframe').length;
    var forms = document.querySelectorAll('form').length;
    var links = document.querySelectorAll('a[href]').length;
    var totalElements = document.querySelectorAll('*').length;
    var textLength = document.body.innerText.length;

    var loadTime = perf.loadEventEnd ? Math.round(perf.loadEventEnd - perf.startTime) : 'N/A';
    var domReady = perf.domContentLoadedEventEnd ? Math.round(perf.domContentLoadedEventEnd - perf.startTime) : 'N/A';
    var ttfb = perf.responseStart ? Math.round(perf.responseStart - perf.requestStart) : 'N/A';

    var totalSize = resources.reduce(function(sum, r) { return sum + (r.transferSize || 0); }, 0);
    var sizeStr = totalSize > 1048576 ? (totalSize / 1048576).toFixed(1) + ' MB' : Math.round(totalSize / 1024) + ' KB';

    var panel = document.createElement('div');
    panel.id = '__melt-page-stats';
    panel.style.cssText = 'position:fixed;top:12px;right:12px;z-index:2147483645;width:280px;background:#1a1a1a;border:1px solid #333;border-radius:8px;font:11px/1.6 -apple-system,sans-serif;color:#ccc;box-shadow:0 8px 32px rgba(0,0,0,0.5);overflow:hidden;';

    panel.innerHTML =
      '<div style="padding:8px 12px;background:#222;border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center;">' +
        '<span style="color:#22c55e;font-weight:500;">Page Stats</span>' +
        '<button onclick="this.closest(\\'#__melt-page-stats\\').remove()" style="background:none;border:none;color:#666;cursor:pointer;font-size:14px;">×</button>' +
      '</div>' +
      '<div style="padding:10px 12px;">' +
        '<div style="color:#888;text-transform:uppercase;font-size:9px;letter-spacing:1px;margin-bottom:6px;">Performance</div>' +
        row('TTFB', ttfb + 'ms') +
        row('DOM Ready', domReady + 'ms') +
        row('Load Time', loadTime + 'ms') +
        row('Resources', resources.length + ' (' + sizeStr + ')') +
        '<div style="color:#888;text-transform:uppercase;font-size:9px;letter-spacing:1px;margin:10px 0 6px;">Content</div>' +
        row('Elements', totalElements.toLocaleString()) +
        row('Text', Math.round(textLength / 1000) + 'K chars') +
        row('Images', images) +
        row('Scripts', scripts) +
        row('Stylesheets', styles) +
        row('Links', links) +
        row('Iframes', iframes) +
        row('Forms', forms) +
      '</div>';

    document.body.appendChild(panel);

    function row(label, value) {
      return '<div style="display:flex;justify-content:space-between;"><span style="color:#888;">' + label + '</span><span style="color:#e0e0e0;">' + value + '</span></div>';
    }
  })()`
}
