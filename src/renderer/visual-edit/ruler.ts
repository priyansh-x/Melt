export function getRulerScript(): string {
  return `(function() {
    if (window.__meltRuler) {
      window.__meltRulerCleanup?.();
      return;
    }
    window.__meltRuler = true;

    var canvas = document.createElement('canvas');
    canvas.id = '__melt-ruler-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = 'position:fixed;inset:0;z-index:2147483644;cursor:crosshair;';
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var startX = 0, startY = 0;
    var drawing = false;

    var label = document.createElement('div');
    label.id = '__melt-ruler-label';
    label.style.cssText = 'position:fixed;z-index:2147483645;background:#1a1a1a;border:1px solid #333;border-radius:4px;padding:4px 8px;font:11px -apple-system,monospace;color:#a855f7;display:none;pointer-events:none;';
    document.body.appendChild(label);

    var info = document.createElement('div');
    info.style.cssText = 'position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:2147483645;background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:6px 16px;font:11px -apple-system,sans-serif;color:#888;';
    info.innerHTML = 'Click and drag to measure · <button id="__melt-ruler-close" style="background:none;border:none;color:#666;cursor:pointer;font-size:12px;margin-left:8px;">Close</button>';
    document.body.appendChild(info);

    function handleDown(e) {
      startX = e.clientX;
      startY = e.clientY;
      drawing = true;
    }

    function handleMove(e) {
      if (!drawing) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(e.clientX, e.clientY);
      ctx.stroke();

      // Show horizontal and vertical guides
      ctx.strokeStyle = 'rgba(168,85,247,0.3)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(startX, e.clientY);
      ctx.lineTo(e.clientX, e.clientY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(e.clientX, startY);
      ctx.lineTo(e.clientX, e.clientY);
      ctx.stroke();

      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      var dist = Math.round(Math.sqrt(dx*dx + dy*dy));

      label.style.display = 'block';
      label.style.left = (e.clientX + 12) + 'px';
      label.style.top = (e.clientY - 30) + 'px';
      label.textContent = dist + 'px (' + Math.abs(dx) + ' × ' + Math.abs(dy) + ')';
    }

    function handleUp() {
      drawing = false;
    }

    canvas.addEventListener('mousedown', handleDown);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleUp);

    document.getElementById('__melt-ruler-close').onclick = function() {
      window.__meltRulerCleanup?.();
    };

    window.__meltRulerCleanup = function() {
      canvas.remove();
      label.remove();
      info.remove();
      window.__meltRuler = false;
      delete window.__meltRulerCleanup;
    };
  })()`
}
