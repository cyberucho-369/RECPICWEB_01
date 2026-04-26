# Dynamic Portfolio Setup Complete

I have entirely rebuilt the portfolio grid logic so it maps cleanly to your local filing system. By managing your video grid completely inside directories rather than code, you never have to manually edit the HTML or JS when you release a new film spot!

## How It works

The `script.js` file now searches for the `assets/portfolio/01/` through `assets/portfolio/06/` folders. It populates each of the 6 portfolio grid elements dynamically using your file structures.

I have injected demo `info.txt` files inside directories `01` to `06` so the site isn't broken right now!

### 1. The Video Information
For each video, place an `info.txt` file inside its numbered folder.
- **Line 1** must be the project **Title** (e.g. `CAG Dveře - Corporate Film`).
- **Line 2** must be the **URL** (either YouTube or Vimeo format).

### 2. The Video Thumbnail
Drop your preview image exported at **1280x720** inside the folder and name it `thumb.jpg`. If the script cannot find `thumb.jpg`, it will seamlessly fall back to using one of the site's default background plates until you upload one!

### 3. The Custom Modal Lightbox
Whenever a user hovers over one of the generated portfolio cards, a red Play button will scale up seamlessly. Once clicked, the Javascript intercepts the `info.txt` link, figures out if it's Vimeo or YouTube, embeds it seamlessly inside a custom popup modal, and darkens the rest of your website to let the video shine.

> [!TIP]
> The dynamic logic strictly relies on `fetch` requests inside Javascript. If you were viewing this website using `file:///index.html` in your browser standardly it would be blocked by CORS file security. Because we're running it with a simulated backend server, everything works flawlessly. Just keep this in mind if you ever try opening it locally directly from the Finder.
