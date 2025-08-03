# App Preview Issue Debug Report

## Problem

The app preview in the iframe is not displaying correctly. The user reports that the "app preview is broken".

## Potential Issues Identified

### 1. Blob URL Creation

- The `createBlobUrl` method creates a blob URL for the iframe
- May have issues with URL.createObjectURL() or blob creation
- Browser security restrictions on blob URLs

### 2. Angular Security

- Angular's `DomSanitizer` is used to sanitize the blob URL
- The `bypassSecurityTrustResourceUrl` method might not be working correctly
- Angular's security policies might block the iframe content

### 3. Iframe Sandbox Settings

- Current sandbox: `allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-presentation allow-downloads`
- May need different or additional sandbox permissions

### 4. OpenAI API Response

- The generated HTML from OpenAI might not be complete or valid
- Code extraction from OpenAI response might be failing
- API key might be invalid or expired

### 5. HTML Structure Issues

- Generated HTML might not have proper DOCTYPE
- Missing CSS or JavaScript in generated HTML
- Invalid HTML structure

## Debug Steps Added

1. **Added debug panel** to show:

   - Preview URL
   - Safe Preview URL
   - HTML length
   - Presence of DOCTYPE, script, and style tags
   - Project name and language

2. **Added test methods**:

   - `testStaticPreview()` - Uses hardcoded HTML calculator
   - `testBlobUrl()` - Opens blob URL in new window
   - Enhanced logging in `createBlobUrl()` and `getDataUrl()`

3. **Enhanced iframe event handlers**:

   - More detailed logging in `onIframeLoad()`
   - Better error reporting in `onIframeError()`

4. **Added fallback logic**:
   - When OpenAI fails, automatically show test preview
   - Test mode bypasses OpenAI for debugging

## Testing Strategy

1. **Test the "Test Preview" button** - This should show a working calculator in the iframe
2. **Test the "Test Blob URL" button** - This opens a blob URL in a new window
3. **Enter "test" as command** - This bypasses OpenAI and uses static HTML
4. **Check browser console** - Look for errors, blob URLs, and debug information
5. **Inspect the iframe element** - Check if src attribute is set correctly

## Next Steps

1. Start the Angular development server
2. Test the static preview functionality
3. Check browser console for errors
4. Verify iframe is loading content
5. If static preview works, test OpenAI integration
6. If OpenAI integration fails, check API key and network requests

## Files Modified

- `src/app/app.component.ts` - Added debug methods and enhanced logging
- `src/app/app.component.html` - Added debug panel and test buttons
- `simple-test.html` - Created standalone test file (verified working)

## Expected Behavior

The iframe should display:

- A fully functional calculator app
- Interactive buttons that work
- Proper styling and layout
- JavaScript functionality (alerts, calculations)

If the iframe shows a blank page or errors, the issue is likely with:

- Blob URL creation
- Angular security sanitization
- Iframe sandbox restrictions
- HTML content validity
