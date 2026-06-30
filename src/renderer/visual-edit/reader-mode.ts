export function getReaderModeScript(): string {
  return `(function() {
    if (window.__meltReaderActive) {
      window.__meltReaderCleanup?.();
      return;
    }
    window.__meltReaderActive = true;

    var article = document.querySelector('article') ||
      document.querySelector('[role="main"]') ||
      document.querySelector('main') ||
      document.querySelector('.post-content, .article-content, .entry-content, .content, #content');

    if (!article) {
      var candidates = Array.from(document.querySelectorAll('div, section'));
      var best = null, bestScore = 0;
      candidates.forEach(function(el) {
        var text = el.innerText || '';
        var pCount = el.querySelectorAll('p').length;
        var score = text.length * 0.001 + pCount * 10;
        if (el.querySelectorAll('nav, header, footer, aside').length > 0) score *= 0.3;
        if (score > bestScore && text.length > 200) { bestScore = score; best = el; }
      });
      article = best;
    }

    if (!article) { alert('Could not detect article content'); window.__meltReaderActive = false; return; }

    var title = document.querySelector('h1')?.innerText || document.title;
    var content = article.innerHTML;

    var overlay = document.createElement('div');
    overlay.id = '__melt-reader';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483640;background:#1a1a1a;overflow-y:auto;';
    overlay.innerHTML =
      '<div style="max-width:680px;margin:0 auto;padding:40px 20px;font-family:Georgia,serif;color:#e0e0e0;line-height:1.8;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">' +
          '<span style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px;">Reader Mode</span>' +
          '<button id="__melt-reader-close" style="background:none;border:1px solid #333;color:#999;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;">Exit</button>' +
        '</div>' +
        '<h1 style="font-size:28px;line-height:1.3;margin:0 0 24px;color:#fff;font-weight:400;">' + title.replace(/</g, '&lt;') + '</h1>' +
        '<div id="__melt-reader-content" style="font-size:18px;">' + content + '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    var style = document.createElement('style');
    style.id = '__melt-reader-style';
    style.textContent = '#__melt-reader-content img { max-width: 100%; height: auto; border-radius: 4px; margin: 16px 0; }' +
      '#__melt-reader-content a { color: #a78bfa; }' +
      '#__melt-reader-content pre, #__melt-reader-content code { background: #111; padding: 2px 6px; border-radius: 3px; font-size: 14px; }' +
      '#__melt-reader-content pre { padding: 12px; overflow-x: auto; }' +
      '#__melt-reader-content h2, #__melt-reader-content h3 { color: #fff; margin: 24px 0 12px; }' +
      '#__melt-reader-content p { margin: 0 0 16px; }' +
      '#__melt-reader-content blockquote { border-left: 3px solid #a78bfa; padding-left: 16px; margin: 16px 0; color: #999; }';
    document.head.appendChild(style);

    document.getElementById('__melt-reader-close').onclick = function() {
      window.__meltReaderCleanup?.();
    };

    window.__meltReaderCleanup = function() {
      overlay.remove();
      style.remove();
      window.__meltReaderActive = false;
      delete window.__meltReaderCleanup;
    };
  })()`
}
