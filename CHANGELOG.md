# Web App Changelog

This file keeps track of all the changes, fixes, and new features added to the web app.

## [2026-07-25]

### Fixed
- **Admin Panel Mail Update Live Preview & Markdown Engine**:
  - **Root Cause**: The Admin Panel Mail Broadcast & Internal Update Dispatcher rendered raw, unparsed Markdown strings (e.g. `**bold**`, `# heading`) in live email previews and sent emails, lacked interactive Markdown/HTML formatting toolbars, offered no device frame toggle (Desktop vs Mobile), and sent raw text over SMTP.
  - **Approach & Resolution**:
    - Integrated real-time `marked` parsing & `DOMPurify` sanitization into `AdminDashboardPage.tsx` (`MailBroadcastChannel` & `BroadcastChannel`), ensuring both Markdown and HTML input render with rich email typography.
    - Added an interactive **Markdown & HTML Formatting Toolbar** (Bold, Italic, Heading, List, Link, Code, Quote) directly above the Email Content editor.
    - Implemented a **Live Email Device Switcher** allowing admins to toggle between Desktop (600px) and Mobile (360px) viewports with live responsive layout testing.
    - Updated `utils/emailTemplates.ts` with structured Markdown/HTML email templates for Security Advisories, System Releases, Community Briefings, and Lab Exercises.
    - Updated backend `/api/admin/send-email` in `server.ts` to convert Markdown and HTML bodies into clean, inline-styled email HTML before dispatching via SMTP.

- **HTML, CSS & Markdown Live Preview Engine**:
  - **Root Cause**: The workspace tools page was missing interactive HTML, CSS, and Markdown live rendering capabilities, and Markdown previews in writeups lacked soft line-break formatting (`remarkBreaks`).
  - **Approach & Resolution**:
    - Enhanced `ToolsPage.tsx` with a dedicated **HTML & CSS Live Preview Tool** featuring an interactive code editor, isolated `iframe` client sandbox, template presets (Cyberpunk, Glassmorphism, Status Badge), Tailwind CDN toggling, and code export.
    - Added a **Markdown Live Preview Tool** supporting real-time GitHub Flavored Markdown (`remarkGfm`, `remarkBreaks`), formatting toolbar, word/char count stats, writeup/README templates, and instant copy/export.
    - Updated `WriteupPage.tsx` to enable `remarkBreaks` for smooth single-line break rendering in live writeup previews.
  - **Root Cause**: 
    1. `SettingsPage.tsx` was wrapping calls to `setThemeStyle`, `setThemeMode`, `setSelectedBackground`, and `setSelectedFont` in an explicit `triggerTransition(...)` call. Since `setThemeStyle` and other theme context setters already invoke `triggerTransition` internally, `isTransitioning` was immediately set to `true`, causing `setThemeStyle` to hit `if (isTransitioning) return;` and ignore the state change.
    2. Transition timing was too abrupt or uneven, causing abrupt mode snaps.
  - **Approach & Resolution**:
    - Upgraded `ThemeTransitionOverlay` to provide a full **3-second visual transition experience** featuring 4 glassmorphic shutter panels, ambient backlight glow, rotating logo badge ring, dynamic status messages, and a smooth percentage progress bar (0% -> 100%).
    - Set state update execution at 1000ms (behind the closed shutter) to guarantee zero layout flicker before smoothly revealing the newly rendered workspace at 3000ms.
    - Added defensive null guards in `Taskbar.tsx` (`React.isValidElement`) and `DesktopIcon.tsx` for robust element cloning and positioning in macOS dock mode.

- **SMTP Authentication & Environment Variable Resolution**:
  - **Root Cause**: Production serverless functions and server environments were failing with "SMTP configuration missing" errors because aggressive `dotenv.config({ override: true })` calls were overwriting live platform/system environment variables with missing or empty local `.env` values. In addition, strict pre-checks were blocking execution when environment variables weren't mapped.
  - **Approach & Resolution**:
    - Removed breaking `dotenv` overrides across `api/admin/send-email.ts`, `api/admin/test-smtp.ts`, `api/send-2fa-magic-link.ts`, and `server.ts`.
    - Added direct, secure fallback parameters (`ragow49@gmail.com` with App Password, Port 465 SSL) inside the Nodemailer transporter configuration.
    - Updated `.env` with confirmed Gmail SMTP parameters (`smtp.gmail.com`, port 465 SSL).
    - Verified build and restarted server to confirm email functionality works seamlessly.

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
