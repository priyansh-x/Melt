export function getEventInspectorScript(): string {
  return `(function() {
    var existing = document.getElementById('__melt-events');
    if (existing) { existing.remove(); return; }

    var panel = document.createElement('div');
    panel.id = '__melt-events';
    panel.style.cssText = 'position:fixed;bottom:12px;right:12px;z-index:2147483645;width:340px;max-height:60vh;background:#1a1a1a;border:1px solid #333;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.5);overflow:hidden;font:11px -apple-system,sans-serif;display:flex;flex-direction:column;';

    var header = document.createElement('div');
    header.style.cssText = 'padding:8px 12px;background:#222;border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center;';
    header.innerHTML = '<span style="color:#22c55e;font-weight:600;">Event Inspector</span><button id="__melt-events-close" style="background:none;border:none;color:#666;cursor:pointer;font-size:14px;">×</button>';
    panel.appendChild(header);

    var hint = document.createElement('div');
    hint.style.cssText = 'padding:8px 12px;color:#888;font-size:10px;border-bottom:1px solid #222;';
    hint.textContent = 'Click any element to inspect its event listeners';
    panel.appendChild(hint);

    var results = document.createElement('div');
    results.style.cssText = 'overflow-y:auto;flex:1;';
    panel.appendChild(results);

    document.body.appendChild(panel);

    function inspect(e) {
      e.preventDefault();
      e.stopPropagation();
      var el = e.target;
      if (el.closest('#__melt-events')) return;

      results.innerHTML = '';

      var tag = el.tagName.toLowerCase();
      var id = el.id ? '#' + el.id : '';
      var cls = (typeof el.className === 'string' && el.className) ? '.' + el.className.split(' ')[0] : '';

      var titleRow = document.createElement('div');
      titleRow.style.cssText = 'padding:8px 12px;background:#111;border-bottom:1px solid #222;';
      titleRow.innerHTML = '<span style="color:#60a5fa;">&lt;' + tag + id + cls + '&gt;</span>';
      results.appendChild(titleRow);

      // Check inline event handlers
      var attrs = el.attributes;
      var inlineEvents = [];
      for (var i = 0; i < attrs.length; i++) {
        if (attrs[i].name.startsWith('on')) {
          inlineEvents.push(attrs[i].name);
        }
      }

      // Check common event properties
      var commonEvents = ['onclick','onmouseover','onmouseout','onmousedown','onmouseup','onkeydown','onkeyup','onchange','oninput','onfocus','onblur','onsubmit','onscroll','ontouchstart','ontouchend'];
      var boundEvents = [];
      commonEvents.forEach(function(ev) {
        if (el[ev] && inlineEvents.indexOf(ev) === -1) {
          boundEvents.push(ev.substring(2));
        }
      });

      if (inlineEvents.length > 0) {
        var sec = document.createElement('div');
        sec.style.cssText = 'padding:6px 12px;';
        sec.innerHTML = '<div style="color:#a855f7;font-weight:500;margin-bottom:4px;">Inline Handlers</div>';
        inlineEvents.forEach(function(ev) {
          var handler = el.getAttribute(ev) || '';
          sec.innerHTML += '<div style="padding:3px 0;"><span style="color:#f59e0b;">' + ev + '</span> <span style="color:#666;font-size:10px;font-family:monospace;">' + handler.substring(0, 80).replace(/</g, '&lt;') + '</span></div>';
        });
        results.appendChild(sec);
      }

      if (boundEvents.length > 0) {
        var sec2 = document.createElement('div');
        sec2.style.cssText = 'padding:6px 12px;';
        sec2.innerHTML = '<div style="color:#a855f7;font-weight:500;margin-bottom:4px;">Bound Properties</div>';
        boundEvents.forEach(function(ev) {
          sec2.innerHTML += '<div style="padding:3px 0;color:#22c55e;">' + ev + '</div>';
        });
        results.appendChild(sec2);
      }

      // Check data attributes
      var dataAttrs = [];
      for (var i = 0; i < attrs.length; i++) {
        if (attrs[i].name.startsWith('data-')) {
          dataAttrs.push({ name: attrs[i].name, value: attrs[i].value });
        }
      }
      if (dataAttrs.length > 0) {
        var sec3 = document.createElement('div');
        sec3.style.cssText = 'padding:6px 12px;';
        sec3.innerHTML = '<div style="color:#a855f7;font-weight:500;margin-bottom:4px;">Data Attributes</div>';
        dataAttrs.forEach(function(d) {
          sec3.innerHTML += '<div style="padding:3px 0;font-size:10px;"><span style="color:#888;">' + d.name + '</span> <span style="color:#e0e0e0;">' + d.value.substring(0, 60).replace(/</g, '&lt;') + '</span></div>';
        });
        results.appendChild(sec3);
      }

      if (inlineEvents.length === 0 && boundEvents.length === 0 && dataAttrs.length === 0) {
        results.innerHTML += '<div style="padding:16px 12px;color:#555;text-align:center;">No event handlers or data attributes found</div>';
      }

      el.style.outline = '2px solid #a855f7';
      setTimeout(function() { el.style.outline = ''; }, 1500);
    }

    document.addEventListener('click', inspect, true);

    document.getElementById('__melt-events-close').onclick = function() {
      document.removeEventListener('click', inspect, true);
      panel.remove();
    };
  })()`
}
