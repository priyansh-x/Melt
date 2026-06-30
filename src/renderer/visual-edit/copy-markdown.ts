export function getCopyAsMarkdownScript(): string {
  return `(function() {
    function toMarkdown(el) {
      var result = '';
      el.childNodes.forEach(function(node) {
        if (node.nodeType === 3) {
          result += node.textContent;
          return;
        }
        if (node.nodeType !== 1) return;
        var tag = node.tagName.toLowerCase();
        var inner = toMarkdown(node);
        switch(tag) {
          case 'h1': result += '\\n# ' + inner.trim() + '\\n'; break;
          case 'h2': result += '\\n## ' + inner.trim() + '\\n'; break;
          case 'h3': result += '\\n### ' + inner.trim() + '\\n'; break;
          case 'h4': result += '\\n#### ' + inner.trim() + '\\n'; break;
          case 'p': result += '\\n' + inner.trim() + '\\n'; break;
          case 'br': result += '\\n'; break;
          case 'strong': case 'b': result += '**' + inner + '**'; break;
          case 'em': case 'i': result += '*' + inner + '*'; break;
          case 'a': result += '[' + inner + '](' + (node.href || '') + ')'; break;
          case 'code':
            if (node.parentElement && node.parentElement.tagName === 'PRE') result += inner;
            else result += '\\x60' + inner + '\\x60';
            break;
          case 'pre': result += '\\n\\x60\\x60\\x60\\n' + inner.trim() + '\\n\\x60\\x60\\x60\\n'; break;
          case 'li': result += '- ' + inner.trim() + '\\n'; break;
          case 'ul': case 'ol': result += '\\n' + inner; break;
          case 'blockquote': result += '\\n> ' + inner.trim().split('\\n').join('\\n> ') + '\\n'; break;
          case 'img': result += '![' + (node.alt || '') + '](' + (node.src || '') + ')'; break;
          case 'hr': result += '\\n---\\n'; break;
          default: result += inner;
        }
      });
      return result;
    }
    var article = document.querySelector('article') ||
      document.querySelector('[role="main"]') ||
      document.querySelector('main') ||
      document.body;
    var md = '# ' + document.title + '\\n\\nSource: ' + location.href + '\\n' + toMarkdown(article);
    md = md.replace(/\\n{3,}/g, '\\n\\n').trim();
    navigator.clipboard.writeText(md).then(function() {
      var toast = document.createElement('div');
      toast.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:2147483647;background:#22c55e;color:#fff;padding:10px 16px;border-radius:8px;font:13px -apple-system,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
      toast.textContent = 'Page copied as Markdown';
      document.body.appendChild(toast);
      setTimeout(function() { toast.remove(); }, 2000);
    });
  })()`
}
