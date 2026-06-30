export function getCssInspectorScript(): string {
  return `(function() {
    if (window.__meltInspector) {
      window.__meltInspectorCleanup?.();
      return;
    }
    window.__meltInspector = true;

    var panel = document.createElement('div');
    panel.id = '__melt-inspector';
    panel.style.cssText = 'position:fixed;bottom:12px;right:12px;z-index:2147483645;width:320px;max-height:400px;background:#1a1a1a;border:1px solid #333;border-radius:8px;font:11px/1.4 -apple-system,monospace;color:#ccc;overflow:hidden;pointer-events:auto;box-shadow:0 8px 32px rgba(0,0,0,0.5);';

    var header = document.createElement('div');
    header.style.cssText = 'padding:8px 12px;background:#222;border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center;';
    header.innerHTML = '<span style="color:#a855f7;font-weight:500;">CSS Inspector</span><button id="__melt-inspector-close" style="background:none;border:none;color:#666;cursor:pointer;font-size:14px;">×</button>';
    panel.appendChild(header);

    var content = document.createElement('div');
    content.id = '__melt-inspector-content';
    content.style.cssText = 'padding:8px 12px;overflow-y:auto;max-height:350px;';
    content.innerHTML = '<div style="color:#666;">Hover over any element...</div>';
    panel.appendChild(content);

    document.body.appendChild(panel);

    var highlight = document.createElement('div');
    highlight.id = '__melt-inspector-highlight';
    highlight.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483644;border:2px solid #a855f7;background:rgba(168,85,247,0.08);transition:all 0.1s;display:none;';
    document.body.appendChild(highlight);

    function handleMove(e) {
      var el = e.target;
      if (el.closest('#__melt-inspector')) return;

      var rect = el.getBoundingClientRect();
      highlight.style.display = 'block';
      highlight.style.left = rect.left + 'px';
      highlight.style.top = rect.top + 'px';
      highlight.style.width = rect.width + 'px';
      highlight.style.height = rect.height + 'px';

      var cs = getComputedStyle(el);
      var tag = el.tagName.toLowerCase();
      var cls = el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).join('.') : '';
      var id = el.id ? '#' + el.id : '';

      var props = [
        ['display', cs.display],
        ['position', cs.position],
        ['width', cs.width],
        ['height', cs.height],
        ['margin', cs.margin],
        ['padding', cs.padding],
        ['color', cs.color],
        ['background', cs.backgroundColor],
        ['font-size', cs.fontSize],
        ['font-weight', cs.fontWeight],
        ['border', cs.border],
        ['border-radius', cs.borderRadius],
        ['z-index', cs.zIndex],
        ['opacity', cs.opacity],
        ['overflow', cs.overflow],
      ].filter(function(p) { return p[1] && p[1] !== 'none' && p[1] !== 'normal' && p[1] !== 'auto' && p[1] !== '0px' && p[1] !== '1' && p[1] !== 'visible'; });

      content.innerHTML =
        '<div style="color:#a855f7;margin-bottom:6px;font-weight:500;word-break:break-all;">' + tag + id + cls.substring(0, 60) + '</div>' +
        '<div style="color:#666;font-size:10px;margin-bottom:6px;">' + Math.round(rect.width) + ' × ' + Math.round(rect.height) + 'px</div>' +
        props.map(function(p) {
          return '<div style="display:flex;justify-content:space-between;padding:1px 0;"><span style="color:#888;">' + p[0] + '</span><span style="color:#e0e0e0;">' + p[1] + '</span></div>';
        }).join('');
    }

    document.addEventListener('mousemove', handleMove, true);
    document.getElementById('__melt-inspector-close').onclick = function() {
      window.__meltInspectorCleanup?.();
    };

    window.__meltInspectorCleanup = function() {
      document.removeEventListener('mousemove', handleMove, true);
      panel.remove();
      highlight.remove();
      window.__meltInspector = false;
      delete window.__meltInspectorCleanup;
    };
  })()`
}
