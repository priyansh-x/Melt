export function getConsoleCaptureScript(): string {
  return `(function() {
    var existing = document.getElementById('__melt-console');
    if (existing) { existing.remove(); return; }

    var panel = document.createElement('div');
    panel.id = '__melt-console';
    panel.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:2147483645;height:220px;background:#0d0d0d;border-top:2px solid #333;font:11px/1.4 -apple-system,monospace;display:flex;flex-direction:column;';

    var header = document.createElement('div');
    header.style.cssText = 'padding:6px 12px;background:#1a1a1a;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;font-family:-apple-system,sans-serif;flex-shrink:0;';
    header.innerHTML = '<div style="display:flex;gap:8px;align-items:center;"><span style="color:#22c55e;font-weight:600;font-size:12px;">Console</span><span id="__melt-console-count" style="color:#888;font-size:10px;">0 entries</span></div><div style="display:flex;gap:4px;"><button id="__melt-console-clear" style="background:#222;border:1px solid #333;border-radius:4px;color:#888;padding:2px 8px;cursor:pointer;font-size:10px;">Clear</button><button id="__melt-console-close" style="background:none;border:none;color:#666;cursor:pointer;font-size:14px;">×</button></div>';
    panel.appendChild(header);

    var logs = document.createElement('div');
    logs.style.cssText = 'overflow-y:auto;flex:1;';
    panel.appendChild(logs);

    var count = 0;
    var colors = { log: '#e0e0e0', warn: '#f59e0b', error: '#ef4444', info: '#60a5fa', debug: '#888' };

    function addEntry(type, args) {
      count++;
      var row = document.createElement('div');
      row.style.cssText = 'padding:3px 12px;border-bottom:1px solid #111;color:' + (colors[type] || '#e0e0e0') + ';display:flex;gap:8px;';
      if (type === 'error') row.style.background = 'rgba(239,68,68,0.05)';
      if (type === 'warn') row.style.background = 'rgba(245,158,11,0.05)';

      var time = new Date();
      var ts = time.getHours().toString().padStart(2, '0') + ':' + time.getMinutes().toString().padStart(2, '0') + ':' + time.getSeconds().toString().padStart(2, '0');

      var text = Array.from(args).map(function(a) {
        if (typeof a === 'object') { try { return JSON.stringify(a, null, 1); } catch { return String(a); } }
        return String(a);
      }).join(' ');

      row.innerHTML = '<span style="color:#555;flex-shrink:0;">' + ts + '</span><span style="color:#a855f7;flex-shrink:0;width:36px;">' + type + '</span><span style="word-break:break-all;">' + text.replace(/</g, '&lt;').substring(0, 500) + '</span>';
      logs.appendChild(row);
      logs.scrollTop = logs.scrollHeight;
      document.getElementById('__melt-console-count').textContent = count + ' entries';
    }

    var origLog = console.log;
    var origWarn = console.warn;
    var origError = console.error;
    var origInfo = console.info;
    var origDebug = console.debug;

    console.log = function() { origLog.apply(console, arguments); addEntry('log', arguments); };
    console.warn = function() { origWarn.apply(console, arguments); addEntry('warn', arguments); };
    console.error = function() { origError.apply(console, arguments); addEntry('error', arguments); };
    console.info = function() { origInfo.apply(console, arguments); addEntry('info', arguments); };
    console.debug = function() { origDebug.apply(console, arguments); addEntry('debug', arguments); };

    // Capture uncaught errors
    var errorHandler = function(e) {
      addEntry('error', [e.message + ' at ' + (e.filename || '') + ':' + (e.lineno || '')]);
    };
    window.addEventListener('error', errorHandler);

    var rejectionHandler = function(e) {
      addEntry('error', ['Unhandled rejection: ' + (e.reason?.message || e.reason || 'unknown')]);
    };
    window.addEventListener('unhandledrejection', rejectionHandler);

    document.body.appendChild(panel);

    document.getElementById('__melt-console-clear').onclick = function() {
      logs.innerHTML = '';
      count = 0;
      document.getElementById('__melt-console-count').textContent = '0 entries';
    };

    document.getElementById('__melt-console-close').onclick = function() {
      console.log = origLog;
      console.warn = origWarn;
      console.error = origError;
      console.info = origInfo;
      console.debug = origDebug;
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
      panel.remove();
    };
  })()`
}
