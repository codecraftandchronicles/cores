# Security Policy

## HTML Content in Project Descriptions

### Approach: Trusted Data (Option B)

Project descriptions from `data/projects.json` are **rendered as HTML** to preserve formatting tags like `<strong>`, `<i>`, `<br>`, and `<p>`.

**Assumption:** The JSON data is **trusted**—only edited by repository owners, never from untrusted user input.

### Safe Tags Allowed

The following HTML tags are intentionally preserved in project descriptions:
- `<strong>` — Bold text
- `<em>` — Italic emphasis
- `<i>` — Italic styling
- `<br>` — Line breaks
- `<p>` — Paragraphs
- `<a href="https://...">` — Links (validated by `isValidUrl()`)

### Example Safe JSON Entry

```json
{
  "ProjectName": "Tower of Óbidos",
  "Description": "<strong>Reclaiming History – The Tower of Óbidos Diorama</strong>\nA historic miniature diorama build.",
  "ProjectImage": ["obidos_tower.png"]
}
```

### Validation

Before rendering, project data passes through:

1. **`isValidUrl()`** — External links validated (http/https only)
2. **`isValidImageFilename()`** — Image filenames validated (alphanumeric + dash/underscore/dot, no path traversal)
3. **Data source control** — Only repository maintainers edit `projects.json`

### If You Add User Input

**If in the future this SPA accepts user-submitted project data**, immediately switch to **Option C (DOMPurify)** or **Option A (whitelist sanitizer)**:

```javascript
// Option A: Whitelist-based sanitizer
function sanitizeProjectDescription(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Remove script tags
  tempDiv.querySelectorAll('script').forEach(el => el.remove());
  
  // Remove event handlers
  tempDiv.querySelectorAll('[onclick], [onerror], [onload]').forEach(el => {
    el.removeAttribute('onclick');
    el.removeAttribute('onerror');
    el.removeAttribute('onload');
  });
  
  return tempDiv.innerHTML;
}
```

Or use **Option C (DOMPurify):**

```html
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js"></script>
```

```javascript
// In createProjectCard():
<p class="project-desc">${DOMPurify.sanitize(item[FIELD_KEYS.DESCRIPTION])}</p>
```

### Current Code

Line 724 in `js/app.js`:

```javascript
<p class="project-desc">${item[FIELD_KEYS.DESCRIPTION] || ''}</p>
```

HTML is rendered as-is. This is **safe** because:
- ✅ JSON only edited by repo maintainers
- ✅ URL links validated via `isValidUrl()`
- ✅ Image filenames validated via `isValidImageFilename()`
- ✅ No user input accepted

### Threat Model

| Threat | Status |
|--------|--------|
| XSS from `projects.json` edit | ✅ Mitigated (repo access required) |
| Malicious project URLs | ✅ Mitigated (`isValidUrl()`) |
| Path traversal in images | ✅ Mitigated (`isValidImageFilename()`) |
| User-submitted projects | ⚠️ Future risk (not yet implemented) |

### References

- [OWASP: XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN: innerHTML vs textContent](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
