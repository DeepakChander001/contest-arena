# Spline Animation Setup Instructions

## Current Status
✅ Spline React package installed (`@splinetool/react-spline`)
✅ Spline component created and integrated into landing page
✅ File copied to public folder

## ⚠️ IMPORTANT: Export Your Spline File

The `.spline` file is a **source file** from the Spline editor. To use it in React, you need to **export it first**.

### Steps to Export:

1. **Open Spline Editor**
   - Go to https://spline.design/
   - Open your `reactive_background.spline` file

2. **Export the Scene**
   - Click **File** → **Export** → **Export as .splinecode**
   - Save the exported file

3. **Place in Public Folder**
   - Copy the exported `.splinecode` file to: `public/reactive_background.splinecode`
   - Replace or rename the existing `.spline` file if needed

4. **Verify**
   - The file should be at: `public/reactive_background.splinecode`
   - The component will automatically load it

## Alternative: Publish to Spline

If you prefer to publish your scene to Spline:

1. In Spline editor, click **Share** → **Publish**
2. Copy the published URL
3. Update `src/components/SplineBackground.tsx`:
   ```tsx
   <Spline scene="https://prod.spline.design/YOUR_SCENE_URL" />
   ```

## Current Implementation

The Spline animation is integrated into the **Hero Section** of the landing page with:
- 40% opacity (can be adjusted)
- Positioned behind all content (z-index: 0)
- Pointer events disabled (won't interfere with interactions)
- Fallback gradient backgrounds if Spline fails to load

## Testing

After exporting the file, check the browser console:
- ✅ "Spline scene loaded successfully" = Working!
- ❌ Error message = Need to export the file

