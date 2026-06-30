export function getGridOverlayScript(): string {
  return `(function() {
    var existing = document.getElementById('__melt-grid');
    if (existing) { existing.remove(); return; }

    var overlay = document.createElement('div');
    overlay.id = '__melt-grid';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483640;pointer-events:none;';

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.cssText = 'position:absolute;inset:0;';

    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    var pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    pattern.setAttribute('id', '__melt-grid-pattern');
    pattern.setAttribute('width', '20');
    pattern.setAttribute('height', '20');
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');

    var line1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line1.setAttribute('d', 'M 20 0 L 0 0 0 20');
    line1.setAttribute('fill', 'none');
    line1.setAttribute('stroke', 'rgba(168,85,247,0.15)');
    line1.setAttribute('stroke-width', '0.5');
    pattern.appendChild(line1);
    defs.appendChild(pattern);
    svg.appendChild(defs);

    var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', 'url(#__melt-grid-pattern)');
    svg.appendChild(rect);

    // Center lines
    var vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    vLine.setAttribute('x1', '50%');
    vLine.setAttribute('y1', '0');
    vLine.setAttribute('x2', '50%');
    vLine.setAttribute('y2', '100%');
    vLine.setAttribute('stroke', 'rgba(239,68,68,0.3)');
    vLine.setAttribute('stroke-dasharray', '4');
    svg.appendChild(vLine);

    var hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hLine.setAttribute('x1', '0');
    hLine.setAttribute('y1', '50%');
    hLine.setAttribute('x2', '100%');
    hLine.setAttribute('y2', '50%');
    hLine.setAttribute('stroke', 'rgba(239,68,68,0.3)');
    hLine.setAttribute('stroke-dasharray', '4');
    svg.appendChild(hLine);

    overlay.appendChild(svg);
    document.body.appendChild(overlay);
  })()`
}
