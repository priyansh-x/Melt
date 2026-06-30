// This script is serialized and injected into webviews during Visual Edit Mode.
// It must be self-contained — no imports.

export function getVisualEditScript(): string {
  return `(function() {
    if (window.__meltVisualEdit) return;
    window.__meltVisualEdit = true;

    const ACCENT = '#a855f7';
    const OVERLAY_Z = 2147483640;

    // ─── Highlight overlay ───
    const highlight = document.createElement('div');
    highlight.id = '__melt-highlight';
    Object.assign(highlight.style, {
      position: 'fixed', pointerEvents: 'none', zIndex: OVERLAY_Z,
      border: '2px solid ' + ACCENT, borderRadius: '3px',
      background: 'rgba(168,85,247,0.08)', transition: 'all 80ms ease',
      display: 'none',
    });
    document.body.appendChild(highlight);

    // ─── Selected element outline ───
    const selected = document.createElement('div');
    selected.id = '__melt-selected';
    Object.assign(selected.style, {
      position: 'fixed', pointerEvents: 'none', zIndex: OVERLAY_Z,
      border: '2px solid #22c55e', borderRadius: '3px',
      background: 'rgba(34,197,94,0.06)', display: 'none',
    });
    document.body.appendChild(selected);

    // ─── Toolbar ───
    const toolbar = document.createElement('div');
    toolbar.id = '__melt-toolbar';
    toolbar.innerHTML = \`
      <style>
        #__melt-toolbar {
          position: fixed; z-index: \${OVERLAY_Z + 1};
          display: none; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 4px; gap: 2px;
          font-family: -apple-system, Inter, sans-serif; font-size: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5); align-items: center;
        }
        #__melt-toolbar button {
          background: transparent; border: none; color: #ccc; padding: 6px 10px;
          border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 500;
          white-space: nowrap; display: flex; align-items: center; gap: 5px;
        }
        #__melt-toolbar button:hover { background: rgba(255,255,255,0.08); color: #fff; }
        #__melt-toolbar button.danger:hover { background: rgba(239,68,68,0.15); color: #ef4444; }
        #__melt-toolbar .sep { width: 1px; height: 20px; background: rgba(255,255,255,0.08); margin: 0 2px; }
        #__melt-toolbar .selector-label {
          padding: 4px 8px; color: #666; font-size: 10px; font-family: monospace;
          max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
      </style>
      <span class="selector-label" id="__melt-selector-label"></span>
      <div class="sep"></div>
      <button id="__melt-btn-hide" title="Hide element">👁 Hide</button>
      <button id="__melt-btn-remove" class="danger" title="Remove element">✕ Remove</button>
      <div class="sep"></div>
      <button id="__melt-btn-style" title="Change styles">🎨 Style</button>
      <button id="__melt-btn-text" title="Edit text">✏️ Text</button>
      <div class="sep"></div>
      <button id="__melt-btn-extract" title="Copy selector">📋 Copy Selector</button>
      <button id="__melt-btn-inspect" title="View element info">🔍 Inspect</button>
      <div class="sep"></div>
      <button id="__melt-btn-cancel" title="Deselect">Cancel</button>
    \`;
    document.body.appendChild(toolbar);

    // ─── Style editor popup ───
    const styleEditor = document.createElement('div');
    styleEditor.id = '__melt-style-editor';
    styleEditor.innerHTML = \`
      <style>
        #__melt-style-editor {
          position: fixed; z-index: \${OVERLAY_Z + 2};
          display: none; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 16px; width: 300px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.6);
          font-family: -apple-system, Inter, sans-serif;
        }
        #__melt-style-editor h3 { color: #eee; font-size: 13px; margin: 0 0 12px; font-weight: 500; }
        #__melt-style-editor .row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
        #__melt-style-editor label { color: #888; font-size: 11px; width: 80px; flex-shrink: 0; }
        #__melt-style-editor input, #__melt-style-editor select {
          background: #111; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px;
          padding: 4px 8px; color: #eee; font-size: 12px; flex: 1; outline: none;
        }
        #__melt-style-editor input[type="color"] { width: 32px; height: 24px; padding: 0; cursor: pointer; flex: 0; }
        #__melt-style-editor .actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; }
        #__melt-style-editor .actions button {
          padding: 5px 14px; border-radius: 5px; font-size: 11px; font-weight: 500;
          cursor: pointer; border: none;
        }
        #__melt-style-editor .btn-apply { background: \${ACCENT}; color: #fff; }
        #__melt-style-editor .btn-cancel { background: #333; color: #aaa; }
      </style>
      <h3>Style Element</h3>
      <div class="row"><label>Background</label><input type="color" id="__melt-se-bg" value="#ffffff"><input type="text" id="__melt-se-bg-text" placeholder="transparent"></div>
      <div class="row"><label>Text Color</label><input type="color" id="__melt-se-color" value="#000000"><input type="text" id="__melt-se-color-text" placeholder="#000"></div>
      <div class="row"><label>Font Size</label><input type="text" id="__melt-se-fontsize" placeholder="16px"></div>
      <div class="row"><label>Padding</label><input type="text" id="__melt-se-padding" placeholder="8px"></div>
      <div class="row"><label>Margin</label><input type="text" id="__melt-se-margin" placeholder="0"></div>
      <div class="row"><label>Border Radius</label><input type="text" id="__melt-se-radius" placeholder="0"></div>
      <div class="row"><label>Opacity</label><input type="range" id="__melt-se-opacity" min="0" max="100" value="100"><span id="__melt-se-opacity-val" style="color:#888;font-size:11px;width:30px">100%</span></div>
      <div class="row"><label>Custom CSS</label><input type="text" id="__melt-se-custom" placeholder="border: 1px solid red"></div>
      <div class="actions">
        <button class="btn-cancel" id="__melt-se-cancel">Cancel</button>
        <button class="btn-apply" id="__melt-se-apply">Apply & Save</button>
      </div>
    \`;
    document.body.appendChild(styleEditor);

    // ─── State ───
    let currentEl = null;
    let selectedEl = null;
    let isActive = true;

    function getSelector(el) {
      if (el.id) return '#' + CSS.escape(el.id);
      const path = [];
      let node = el;
      while (node && node !== document.body && node !== document.documentElement) {
        let seg = node.tagName.toLowerCase();
        if (node.className && typeof node.className === 'string') {
          const cls = node.className.trim().split(/\\s+/).filter(c => !c.startsWith('__melt')).slice(0, 2);
          if (cls.length) seg += '.' + cls.map(c => CSS.escape(c)).join('.');
        }
        const parent = node.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children).filter(c => c.tagName === node.tagName);
          if (siblings.length > 1) {
            seg += ':nth-of-type(' + (siblings.indexOf(node) + 1) + ')';
          }
        }
        path.unshift(seg);
        node = node.parentElement;
      }
      return path.join(' > ');
    }

    function positionRect(overlay, el) {
      const r = el.getBoundingClientRect();
      Object.assign(overlay.style, {
        left: r.left + 'px', top: r.top + 'px',
        width: r.width + 'px', height: r.height + 'px', display: 'block',
      });
    }

    function positionToolbar(el) {
      const r = el.getBoundingClientRect();
      toolbar.style.display = 'flex';
      const tw = toolbar.offsetWidth;
      let left = r.left;
      let top = r.top - toolbar.offsetHeight - 8;
      if (top < 4) top = r.bottom + 8;
      if (left + tw > window.innerWidth) left = window.innerWidth - tw - 8;
      if (left < 4) left = 4;
      toolbar.style.left = left + 'px';
      toolbar.style.top = top + 'px';
    }

    function isMeltElement(el) {
      return el && (el.id?.startsWith('__melt') || el.closest?.('[id^="__melt"]'));
    }

    // ─── Mouse events ───
    document.addEventListener('mousemove', (e) => {
      if (!isActive || isMeltElement(e.target)) {
        highlight.style.display = 'none';
        return;
      }
      currentEl = e.target;
      positionRect(highlight, e.target);
    }, true);

    document.addEventListener('click', (e) => {
      if (!isActive || isMeltElement(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      selectedEl = e.target;
      positionRect(selected, selectedEl);
      highlight.style.display = 'none';
      positionToolbar(selectedEl);
      document.getElementById('__melt-selector-label').textContent = getSelector(selectedEl);
    }, true);

    // ─── Toolbar actions ───
    document.getElementById('__melt-btn-cancel').onclick = () => {
      selectedEl = null;
      selected.style.display = 'none';
      toolbar.style.display = 'none';
      styleEditor.style.display = 'none';
    };

    document.getElementById('__melt-btn-hide').onclick = () => {
      if (!selectedEl) return;
      const sel = getSelector(selectedEl);
      window.__meltBridge?.({
        action: 'domAction',
        data: { type: 'hide', selector: sel, name: 'Hide ' + sel.slice(0, 30) }
      });
      selectedEl.style.display = 'none';
      toolbar.style.display = 'none';
      selected.style.display = 'none';
      selectedEl = null;
    };

    document.getElementById('__melt-btn-remove').onclick = () => {
      if (!selectedEl) return;
      const sel = getSelector(selectedEl);
      window.__meltBridge?.({
        action: 'domAction',
        data: { type: 'remove', selector: sel, name: 'Remove ' + sel.slice(0, 30) }
      });
      selectedEl.remove();
      toolbar.style.display = 'none';
      selected.style.display = 'none';
      selectedEl = null;
    };

    document.getElementById('__melt-btn-text').onclick = () => {
      if (!selectedEl) return;
      const current = selectedEl.textContent || '';
      const newText = prompt('Edit text:', current);
      if (newText !== null && newText !== current) {
        const sel = getSelector(selectedEl);
        window.__meltBridge?.({
          action: 'domAction',
          data: { type: 'replaceText', selector: sel, newText, name: 'Edit text: ' + sel.slice(0, 20) }
        });
        selectedEl.textContent = newText;
      }
    };

    document.getElementById('__melt-btn-extract').onclick = () => {
      if (!selectedEl) return;
      const sel = getSelector(selectedEl);
      navigator.clipboard?.writeText(sel);
      const btn = document.getElementById('__melt-btn-extract');
      btn.textContent = '✓ Copied';
      setTimeout(() => { btn.innerHTML = '📋 Copy Selector'; }, 1500);
    };

    document.getElementById('__melt-btn-inspect').onclick = () => {
      if (!selectedEl) return;
      const computed = window.getComputedStyle(selectedEl);
      const info = {
        tag: selectedEl.tagName.toLowerCase(),
        id: selectedEl.id || '(none)',
        classes: selectedEl.className || '(none)',
        dimensions: selectedEl.offsetWidth + 'x' + selectedEl.offsetHeight,
        font: computed.fontFamily.slice(0, 40),
        fontSize: computed.fontSize,
        color: computed.color,
        background: computed.backgroundColor,
        display: computed.display,
        position: computed.position,
      };
      window.__meltBridge?.({ action: 'inspect', data: info });
    };

    // ─── Style editor ───
    document.getElementById('__melt-btn-style').onclick = () => {
      if (!selectedEl) return;
      const computed = window.getComputedStyle(selectedEl);
      const r = selectedEl.getBoundingClientRect();

      // Pre-fill with current values
      document.getElementById('__melt-se-fontsize').value = computed.fontSize;
      document.getElementById('__melt-se-padding').value = computed.padding;
      document.getElementById('__melt-se-margin').value = computed.margin;
      document.getElementById('__melt-se-radius').value = computed.borderRadius;
      document.getElementById('__melt-se-custom').value = '';

      const opacity = Math.round(parseFloat(computed.opacity) * 100);
      document.getElementById('__melt-se-opacity').value = opacity;
      document.getElementById('__melt-se-opacity-val').textContent = opacity + '%';

      styleEditor.style.display = 'block';
      let left = r.right + 12;
      if (left + 320 > window.innerWidth) left = r.left - 320;
      if (left < 8) left = 8;
      styleEditor.style.left = left + 'px';
      styleEditor.style.top = Math.max(8, r.top) + 'px';
    };

    document.getElementById('__melt-se-opacity').oninput = (e) => {
      document.getElementById('__melt-se-opacity-val').textContent = e.target.value + '%';
    };

    document.getElementById('__melt-se-cancel').onclick = () => {
      styleEditor.style.display = 'none';
    };

    document.getElementById('__melt-se-apply').onclick = () => {
      if (!selectedEl) return;
      const sel = getSelector(selectedEl);
      const styles = [];

      const bg = document.getElementById('__melt-se-bg-text').value;
      if (bg) styles.push('background: ' + bg);

      const color = document.getElementById('__melt-se-color-text').value;
      if (color) styles.push('color: ' + color);

      const fs = document.getElementById('__melt-se-fontsize').value;
      if (fs) styles.push('font-size: ' + fs);

      const pad = document.getElementById('__melt-se-padding').value;
      if (pad) styles.push('padding: ' + pad);

      const margin = document.getElementById('__melt-se-margin').value;
      if (margin) styles.push('margin: ' + margin);

      const radius = document.getElementById('__melt-se-radius').value;
      if (radius) styles.push('border-radius: ' + radius);

      const opacity = document.getElementById('__melt-se-opacity').value;
      if (opacity !== '100') styles.push('opacity: ' + (opacity / 100));

      const custom = document.getElementById('__melt-se-custom').value;
      if (custom) styles.push(custom);

      if (styles.length) {
        const cssRule = sel + ' { ' + styles.map(s => s + ' !important').join('; ') + ' }';
        window.__meltBridge?.({
          action: 'styleRule',
          data: { selector: sel, css: cssRule, name: 'Style ' + sel.slice(0, 25) }
        });

        // Apply immediately
        styles.forEach(s => {
          const [prop, ...vals] = s.split(':');
          selectedEl.style.setProperty(prop.trim(), vals.join(':').trim(), 'important');
        });
      }

      styleEditor.style.display = 'none';
    };

    // ─── Cleanup function ───
    window.__meltVisualEditCleanup = () => {
      highlight.remove();
      selected.remove();
      toolbar.remove();
      styleEditor.remove();
      isActive = false;
      window.__meltVisualEdit = false;
      delete window.__meltVisualEditCleanup;
    };
  })()`;
}

export function getDomActionsScript(domActionsJson: string): string {
  return `(function() {
    try {
      const actions = ${domActionsJson};
      const observer = new MutationObserver(() => applyActions());

      function applyActions() {
        for (const action of actions) {
          const els = document.querySelectorAll(action.selector);
          els.forEach(el => {
            if (el.__meltApplied === action.type + action.selector) return;
            switch (action.type) {
              case 'hide':
                el.style.setProperty('display', 'none', 'important');
                break;
              case 'remove':
                el.remove();
                return;
              case 'replaceText':
                el.textContent = action.newText;
                break;
              case 'setAttribute':
                el.setAttribute(action.attr, action.value);
                break;
            }
            el.__meltApplied = action.type + action.selector;
          });
        }
      }

      applyActions();
      observer.observe(document.body, { childList: true, subtree: true });
    } catch(e) { console.warn('[Melt] DOM actions error:', e); }
  })()`;
}
