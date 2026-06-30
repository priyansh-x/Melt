export function getLinkPreviewScript(): string {
  return `(function() {
    if (window.__meltLinkPreview) {
      window.__meltLinkPreviewCleanup?.();
      return;
    }
    window.__meltLinkPreview = true;

    var tooltip = document.createElement('div');
    tooltip.id = '__melt-link-preview';
    tooltip.style.cssText = 'position:fixed;z-index:2147483647;background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:8px 12px;font:11px/1.4 -apple-system,sans-serif;color:#ccc;pointer-events:none;display:none;max-width:400px;box-shadow:0 8px 24px rgba(0,0,0,0.4);';
    document.body.appendChild(tooltip);

    var current = null;

    function handleMove(e) {
      var link = e.target.closest('a[href]');
      if (!link || link === current) {
        if (!link) {
          tooltip.style.display = 'none';
          current = null;
        }
        return;
      }

      current = link;
      var href = link.href;
      var text = link.textContent.trim().substring(0, 80);

      var isExternal = false;
      try { isExternal = new URL(href).hostname !== location.hostname; } catch {}

      var protocol = '';
      try { protocol = new URL(href).protocol; } catch {}

      tooltip.style.display = 'block';
      tooltip.style.left = Math.min(e.clientX + 12, window.innerWidth - 420) + 'px';
      tooltip.style.top = (e.clientY + 16) + 'px';

      tooltip.innerHTML =
        '<div style="color:#a855f7;font-weight:500;margin-bottom:4px;word-break:break-all;">' + (text || 'Untitled') + '</div>' +
        '<div style="color:#666;font-size:10px;word-break:break-all;margin-bottom:4px;">' + href + '</div>' +
        '<div style="display:flex;gap:8px;font-size:10px;">' +
          (isExternal ? '<span style="color:#f59e0b;">External</span>' : '<span style="color:#22c55e;">Internal</span>') +
          '<span style="color:#888;">' + protocol + '</span>' +
          (link.target === '_blank' ? '<span style="color:#888;">New tab</span>' : '') +
          (link.rel?.includes('nofollow') ? '<span style="color:#888;">nofollow</span>' : '') +
        '</div>';
    }

    document.addEventListener('mousemove', handleMove, true);

    window.__meltLinkPreviewCleanup = function() {
      document.removeEventListener('mousemove', handleMove, true);
      tooltip.remove();
      window.__meltLinkPreview = false;
      delete window.__meltLinkPreviewCleanup;
    };
  })()`
}
