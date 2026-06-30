export function getSpacingVizScript(): string {
  return `(function() {
    if (window.__meltSpacingViz) {
      window.__meltSpacingVizCleanup?.();
      return;
    }
    window.__meltSpacingViz = true;

    var overlay = document.createElement('div');
    overlay.id = '__melt-spacing-viz';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483643;pointer-events:none;';
    document.body.appendChild(overlay);

    var canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = 'width:100%;height:100%;';
    overlay.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    var label = document.createElement('div');
    label.style.cssText = 'position:fixed;z-index:2147483645;background:#1a1a1a;border:1px solid #333;border-radius:6px;padding:6px 10px;font:10px/1.4 -apple-system,monospace;color:#ccc;display:none;pointer-events:none;max-width:220px;';
    document.body.appendChild(label);

    var info = document.createElement('div');
    info.style.cssText = 'position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:2147483645;background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:6px 16px;font:11px -apple-system,sans-serif;color:#888;pointer-events:auto;';
    info.innerHTML = 'Hover to see spacing · <button id="__melt-spacing-close" style="background:none;border:none;color:#666;cursor:pointer;font-size:12px;">Close</button>';
    document.body.appendChild(info);

    function handleMove(e) {
      var el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || el === overlay || el === label || el === info || el.closest('#__melt-spacing-viz')) return;

      var rect = el.getBoundingClientRect();
      var style = window.getComputedStyle(el);
      var mt = parseFloat(style.marginTop) || 0;
      var mr = parseFloat(style.marginRight) || 0;
      var mb = parseFloat(style.marginBottom) || 0;
      var ml = parseFloat(style.marginLeft) || 0;
      var pt = parseFloat(style.paddingTop) || 0;
      var pr = parseFloat(style.paddingRight) || 0;
      var pb = parseFloat(style.paddingBottom) || 0;
      var pl = parseFloat(style.paddingLeft) || 0;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Margin (orange)
      ctx.fillStyle = 'rgba(249,115,22,0.15)';
      if (mt > 0) ctx.fillRect(rect.left - ml, rect.top - mt, rect.width + ml + mr, mt);
      if (mb > 0) ctx.fillRect(rect.left - ml, rect.bottom, rect.width + ml + mr, mb);
      if (ml > 0) ctx.fillRect(rect.left - ml, rect.top, ml, rect.height);
      if (mr > 0) ctx.fillRect(rect.right, rect.top, mr, rect.height);

      // Padding (green)
      ctx.fillStyle = 'rgba(34,197,94,0.15)';
      if (pt > 0) ctx.fillRect(rect.left, rect.top, rect.width, pt);
      if (pb > 0) ctx.fillRect(rect.left, rect.bottom - pb, rect.width, pb);
      if (pl > 0) ctx.fillRect(rect.left, rect.top + pt, pl, rect.height - pt - pb);
      if (pr > 0) ctx.fillRect(rect.right - pr, rect.top + pt, pr, rect.height - pt - pb);

      // Content (blue)
      ctx.fillStyle = 'rgba(96,165,250,0.1)';
      ctx.fillRect(rect.left + pl, rect.top + pt, rect.width - pl - pr, rect.height - pt - pb);

      // Border
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 1;
      ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);

      label.style.display = 'block';
      label.style.left = Math.min(e.clientX + 14, window.innerWidth - 240) + 'px';
      label.style.top = (e.clientY + 18) + 'px';
      label.innerHTML =
        '<span style="color:#60a5fa;">&lt;' + el.tagName.toLowerCase() + '&gt;</span> ' +
        '<span style="color:#888;">' + Math.round(rect.width) + '×' + Math.round(rect.height) + '</span><br>' +
        '<span style="color:#f97316;">margin:</span> ' + mt + ' ' + mr + ' ' + mb + ' ' + ml + '<br>' +
        '<span style="color:#22c55e;">padding:</span> ' + pt + ' ' + pr + ' ' + pb + ' ' + pl;
    }

    document.addEventListener('mousemove', handleMove, true);

    document.getElementById('__melt-spacing-close').onclick = function() {
      window.__meltSpacingVizCleanup?.();
    };

    window.__meltSpacingVizCleanup = function() {
      document.removeEventListener('mousemove', handleMove, true);
      overlay.remove();
      label.remove();
      info.remove();
      window.__meltSpacingViz = false;
      delete window.__meltSpacingVizCleanup;
    };
  })()`
}
