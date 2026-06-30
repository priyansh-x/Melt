export function getColorPickerScript(): string {
  return `(function() {
    if (window.__meltColorPicker) {
      window.__meltColorPickerCleanup?.();
      return;
    }
    window.__meltColorPicker = true;

    var tooltip = document.createElement('div');
    tooltip.id = '__melt-color-tooltip';
    tooltip.style.cssText = 'position:fixed;z-index:2147483647;background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:8px 12px;font:11px -apple-system,monospace;color:#ccc;pointer-events:none;display:none;box-shadow:0 4px 12px rgba(0,0,0,0.4);';
    document.body.appendChild(tooltip);

    var canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    var ctx = canvas.getContext('2d');

    function handleMove(e) {
      var el = e.target;
      if (el.id === '__melt-color-tooltip') return;

      var cs = getComputedStyle(el);
      var bgColor = cs.backgroundColor;
      var textColor = cs.color;

      tooltip.style.display = 'block';
      tooltip.style.left = (e.clientX + 16) + 'px';
      tooltip.style.top = (e.clientY + 16) + 'px';

      function rgbToHex(rgb) {
        var m = rgb.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
        if (!m) return rgb;
        return '#' + [m[1], m[2], m[3]].map(function(x) { return parseInt(x).toString(16).padStart(2, '0'); }).join('');
      }

      tooltip.innerHTML =
        '<div style="display:flex;gap:8px;align-items:center;margin-bottom:4px;">' +
          '<div style="width:16px;height:16px;border-radius:3px;border:1px solid #444;background:' + bgColor + '"></div>' +
          '<span>bg: ' + rgbToHex(bgColor) + '</span>' +
        '</div>' +
        '<div style="display:flex;gap:8px;align-items:center;">' +
          '<div style="width:16px;height:16px;border-radius:3px;border:1px solid #444;background:' + textColor + '"></div>' +
          '<span>text: ' + rgbToHex(textColor) + '</span>' +
        '</div>' +
        '<div style="color:#666;font-size:9px;margin-top:4px;">Click to copy hex</div>';
    }

    function handleClick(e) {
      var el = e.target;
      if (el.id === '__melt-color-tooltip') return;
      e.preventDefault();
      e.stopPropagation();

      var cs = getComputedStyle(el);
      var bgColor = cs.backgroundColor;
      var m = bgColor.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
      var hex = m ? '#' + [m[1], m[2], m[3]].map(function(x) { return parseInt(x).toString(16).padStart(2, '0'); }).join('') : bgColor;

      navigator.clipboard.writeText(hex);
      tooltip.innerHTML = '<span style="color:#22c55e;">Copied: ' + hex + '</span>';
      setTimeout(function() { tooltip.style.display = 'none'; }, 1000);
    }

    document.addEventListener('mousemove', handleMove, true);
    document.addEventListener('click', handleClick, true);

    window.__meltColorPickerCleanup = function() {
      document.removeEventListener('mousemove', handleMove, true);
      document.removeEventListener('click', handleClick, true);
      tooltip.remove();
      window.__meltColorPicker = false;
      delete window.__meltColorPickerCleanup;
    };

    // Auto-cleanup on Escape
    document.addEventListener('keydown', function onEsc(e) {
      if (e.key === 'Escape') {
        window.__meltColorPickerCleanup?.();
        document.removeEventListener('keydown', onEsc);
      }
    });
  })()`
}
