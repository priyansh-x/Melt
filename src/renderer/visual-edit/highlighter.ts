export function getHighlighterScript(): string {
  return `(function() {
    if (window.__meltHighlighter) {
      window.__meltHighlighterCleanup?.();
      return;
    }
    window.__meltHighlighter = true;

    var colors = ['#fbbf24', '#f472b6', '#34d399', '#60a5fa', '#c084fc'];
    var colorIndex = 0;

    var toolbar = document.createElement('div');
    toolbar.id = '__melt-highlighter-bar';
    toolbar.style.cssText = 'position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:2147483645;background:#1a1a1a;border:1px solid #333;border-radius:24px;padding:6px 12px;display:flex;gap:6px;align-items:center;box-shadow:0 4px 16px rgba(0,0,0,0.4);font:11px -apple-system,sans-serif;';

    colors.forEach(function(c, i) {
      var btn = document.createElement('button');
      btn.style.cssText = 'width:20px;height:20px;border-radius:50%;border:2px solid ' + (i === 0 ? '#fff' : 'transparent') + ';background:' + c + ';cursor:pointer;';
      btn.onclick = function() {
        colorIndex = i;
        toolbar.querySelectorAll('button').forEach(function(b, j) {
          b.style.borderColor = j === i ? '#fff' : 'transparent';
        });
      };
      toolbar.appendChild(btn);
    });

    var info = document.createElement('span');
    info.style.cssText = 'color:#888;margin-left:8px;';
    info.textContent = 'Select text to highlight';
    toolbar.appendChild(info);

    var close = document.createElement('button');
    close.textContent = '×';
    close.style.cssText = 'background:none;border:none;color:#666;font-size:16px;cursor:pointer;margin-left:8px;';
    close.onclick = function() { window.__meltHighlighterCleanup?.(); };
    toolbar.appendChild(close);

    document.body.appendChild(toolbar);

    function handleMouseUp() {
      var sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;

      var range = sel.getRangeAt(0);
      var mark = document.createElement('mark');
      mark.style.cssText = 'background:' + colors[colorIndex] + '33;border-bottom:2px solid ' + colors[colorIndex] + ';cursor:pointer;';
      mark.dataset.meltHighlight = 'true';
      mark.onclick = function() {
        var parent = mark.parentNode;
        while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
        parent.removeChild(mark);
      };

      try { range.surroundContents(mark); } catch(e) {}
      sel.removeAllRanges();
    }

    document.addEventListener('mouseup', handleMouseUp);

    window.__meltHighlighterCleanup = function() {
      document.removeEventListener('mouseup', handleMouseUp);
      toolbar.remove();
      window.__meltHighlighter = false;
      delete window.__meltHighlighterCleanup;
    };
  })()`
}
