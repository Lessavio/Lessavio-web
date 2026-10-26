# Lessavio Web

Responsive presentation site for Lessavio, using the desktop app’s forest green and sage palette. Built with HTML, CSS and JavaScript; no runtime dependencies or external fonts.

## Local development

Run `npm run dev` and open http://127.0.0.1:4173.

Run `npm run build` to generate `dist/`. Deploy its contents with any static host. All pages use relative links and work under a subdirectory.

## Contents

- Single-page product presentation, CSS product illustrations with fictional demo data, desktop downloads, available web app and native mobile roadmap.
- Separate `privacy.html` and `terms.html` pages.
- Smooth anchor scrolling, progressive scroll reveals, keyboard focus and reduced-motion support.

## Website analytics

The Firebase implementation follows the desktop consent model: SDK loads after opt-in, ads are disabled, download clicks use an allowlisted platform parameter. Consent is independent of the desktop app. All pages offer Analytics settings. No SDK loads on localhost, or in Vercel preview builds.

Set the public `WEB_FIREBASE_*` variables from `.env.example` in Vercel Production and redeploy. Never use Admin SDK keys. Missing configuration disables collection; partial configuration fails the build. Use a dedicated Firebase Web app and measurement ID. For fully separate reports, use a separate Firebase project linked to its own GA4 property. A different stream in the existing property still shares combined property reports.

In the web stream, disable Enhanced Measurement to keep collection limited to the explicit page and download events; disable Google signals and choose the desired event retention in GA4 Admin. Verify consent and events in GA4 Realtime on production after configuration. Source implementation alone cannot verify ingestion.

Legal pages describe Vercel hosting, optional website and desktop analytics, local records, user choices and the project contact. Update them when actual product practices change.

Download links use the desktop v0.5.2 release URLs documented in the desktop repository. Update them when shipping a new version. Product visuals are illustrative HTML/CSS, not literal application screenshots.

## Available applications

- Web app: https://lessavio-web-app.vercel.app/ (hero, download section and platforms block).
- Desktop: published 0.5.2 installers for universal macOS and Windows x64.
- Native mobile: still in development; mobile browsers can use the web app.
- Teaching data remains local to each browser/app; there is no cloud synchronization.

## Icons

The workspace illustration and platform list use the same Lucide v0.468.0 outline icons as the application, bundled locally in `assets/icons/lucide.svg`. ISC attribution is retained in `assets/icons/LICENSE`. No icon font, CDN or client-side icon runtime is required.
