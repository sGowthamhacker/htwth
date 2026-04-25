# Web App Changelog

This file keeps track of all the changes, fixes, and new features added to the web app.

## [2026-04-20]

### Added
- **Production Deployment Configuration**: Added `start` script to `package.json` to enable full-stack deployment on the production server.
- **Project Documentation**: Created `WORKFLOW.md` to document the full-stack architecture, deployment process, and service integrations.

### Fixed
- **Production Runtime Stability**:
    - Converted static `vite` imports in `server.ts` to dynamic imports. This prevents server crashes in production where `vite` (a devDependency) is not available.
    - Standardized Express wildcard routing (`*`) to ensure consistent SPA fallback behavior.
- **Type Safety and Build Reliability**:
    - Fixed a critical TypeScript error in `App.tsx` by updating the `authInitialMode` state definition to allow the `'signup'` literal. This was previously causing the `lint` step to fail, preventing successful sharing.
- **Sharing Workflow**: Resolved the "issue while sharing your applet" error by ensuring the app is compatible with the production container configuration.

## [2026-03-09]

### Added
- Created `CHANGELOG.md` to track all project modifications and provide a recap of actions taken.
- Created `/pages/SitemapPage.tsx` as a basic placeholder component.
- Created `/pages/ResumeAIPage.tsx` as a basic placeholder component.

### Added
- **10 Professional Fonts**: Added a curated list of 10 high-quality, professional Google Fonts to the Document Settings dropdown (including Inter, Roboto, Lato, Montserrat, Open Sans, Source Sans 3, Merriweather, Playfair Display, Lora, and PT Serif).
- **Premium "Canva-like" Resume Designs**: Completely overhauled the resume templates to feature premium, high-quality designs.
  - Added SVG icons for contact information (email, phone, location).
  - Added SVG icons to section headers (Profile, Experience, Education, Skills).
  - Added a dynamic "Profile Picture" circle (using initials) to many templates.
  - Upgraded the CSS for the first 20 templates (Creative and Two-Column) to feature complex layouts like colored sidebars, distinct header blocks, gradients, drop shadows, and modern typography treatments.
- **50 Unique Resume Templates**: Replaced the 5 generic template styles with 50 completely distinct CSS designs. There are now 10 unique designs for each of the 5 categories (Creative, Simple, Modern, ATS Optimized, and Two Column), giving users a much wider variety of professional layouts to choose from.

### Fixed
- Resolved Vite build errors (`Failed to resolve import`) by adding the missing `SitemapPage` and `ResumeAIPage` files that were being imported in `App.tsx` and `DashboardPage.tsx`.
- **Resume Builder UI**: Fixed the horizontal scrollbar issue on the right-side preview pane. The resume now scales perfectly to fit the container width without overflowing, improving the user experience on both desktop and mobile devices.
- **Mobile Topbar**: Fixed the topbar on mobile devices where the "Preview" and "Export PDF" buttons were completely hidden. They now display as icon-only buttons to save space.
- **Mobile Preview**: Added a large "Preview Resume" button at the bottom of the builder form on mobile devices for better accessibility.
