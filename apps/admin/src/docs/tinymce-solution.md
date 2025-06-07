# TinyMCE Integration Solution Documentation

## Problem Overview

The TinyMCE editor in our Next.js application was experiencing a persistent "read-only" issue where the editor interface appeared but didn't allow user input. This problem persisted despite multiple attempted fixes, including:

1. Setting explicit `disabled={false}` property
2. Adding `mode: 'design'` in the init options
3. Using `onInit` callback to force the editor into design mode
4. Adding `setTimeout` to ensure the editor is editable after initialization

## Root Causes

After extensive research and testing, we identified several potential causes:

1. **React Hydration Issues**: Next.js has unique client/server rendering behaviors that can cause inconsistencies with the TinyMCE initialization.

2. **Race Conditions**: The editor may be attempting to initialize before the DOM is fully ready, causing it to fall back to read-only mode.

3. **DOM Accessibility**: TinyMCE may be unable to correctly set the `contenteditable` attribute due to React's virtualized DOM.

4. **Plugin Conflicts**: Certain plugins or configurations may be incompatible with the React wrapper for TinyMCE.

5. **Cache Issues**: TinyMCE might be caching previous configurations that included read-only settings.

## Solution: Enhanced TinyMCE Component

We've created a specialized `EnhancedTinyMCE` component that addresses these issues through multiple mechanisms:

### Key Solution Elements

1. **Force Re-render via Key**: Using a React key that changes after component mount ensures proper initialization.

2. **Multiple Initialization Attempts**: The component applies fixes both on initial render and after a short delay.

3. **Direct DOM Manipulation**: Directly sets the `contenteditable` attribute on the editor body.

4. **Mode Enforcement**: Explicitly sets `design` mode in multiple places during the initialization lifecycle.

5. **Event Listeners**: Adds a NodeChange listener to continuously check and fix the contenteditable state.

6. **Template Caching Disabled**: Prevents potential issues from cached configurations.

7. **Simplified Plugin Configuration**: Uses a more stable set of plugins to avoid potential conflicts.

### Implementation Details

```typescript
// Key features of the implementation:
// 1. Force re-render after mount
useEffect(() => {
  const timer = setTimeout(() => {
    setEditorKey((prev) => prev + 1);
  }, 100);
  return () => clearTimeout(timer);
}, []);

// 2. Apply fixes after initialization
useEffect(() => {
  if (initialized && editorRef.current) {
    const fixEditor = () => {
      const editor = editorRef.current;
      editor.mode.set('design');
      editor.getBody().setAttribute('contenteditable', 'true');
      editor.setContent(editor.getContent());
      editor.focus();
    };
    const fixTimer = setTimeout(fixEditor, 200);
    return () => clearTimeout(fixTimer);
  }
}, [initialized]);

// 3. Setup event listeners in the init configuration
setup: function(editor) {
  editor.on('init', function() {
    editor.mode.set('design');
    editor.getBody().setAttribute('contenteditable', 'true');
  });
  editor.on('NodeChange', function() {
    const body = editor.getBody();
    if (body && body.getAttribute('contenteditable') !== 'true') {
      body.setAttribute('contenteditable', 'true');
    }
  });
}
```

### Usage

Replace the standard TinyMCE Editor component:

```tsx
// Before
<Editor
  value={content}
  onEditorChange={(newContent) => setContent(newContent)}
  // complex configuration...
/>

// After
<EnhancedTinyMCE
  value={content}
  onEditorChange={(newContent) => setContent(newContent)}
  height={400}
  disabled={false}
/>
```

## Testing

A test page is available at `/tinymce-test` to verify the solution's effectiveness. The test page allows you to:

1. Confirm the editor is properly editable
2. Test formatting functions via the toolbar
3. View the HTML output in real-time
4. See a live preview of the content

## Production Considerations

1. **Image Handling**: Currently using base64 encoding for images. Consider implementing server-side storage for production.

2. **Version Compatibility**: This solution is tested with TinyMCE React wrapper version 6.1.0 and may need adjustments for other versions.

3. **Monitoring**: Keep an eye on editor performance, as the multiple initialization approaches could potentially impact loading time.

4. **Accessibility**: This implementation maintains standard TinyMCE accessibility features.
