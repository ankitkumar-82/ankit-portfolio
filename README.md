# ANKIT KUMAR — Premium Portfolio CMS

A responsive dark portfolio with a Supabase-powered admin dashboard, Netlify hosting and GitHub auto-deploy.

## Features
- 10 dark themes with matching accent palettes and 6 font choices
- 6 layout styles (Showcase, Editorial, Minimal, Grid Focus, Developer Terminal, Magazine)
- Editable welcome intro, profile details and profile photo presentation
- Skills, projects, experience, education, certificates and achievements management
- Public contact form and private admin message inbox
- Supabase Auth admin allow-list and Row Level Security
- Mobile navigation, reduced-motion support, SEO metadata and responsive layout

## Existing project upgrade (important)
This version is designed as an additive upgrade. It keeps the existing tables (`profile`, `skills`, `projects`, `experiences`, `education`, `admins`) and does not ask you to delete your current Supabase project or data.

1. Replace the files in your existing GitHub repository with these files and commit the changes.
2. In Supabase, open SQL Editor and run `supabase/upgrade.sql` once. Do not rerun the old setup script unless you are creating a brand-new database.
3. Confirm `assets/config.js` still contains your own existing Supabase Project URL and publishable/anon key. Do not replace these with placeholders.
4. Wait for Netlify deployment to finish, then open `/admin.html` and sign in with your existing admin account.
5. In Admin → Design & Intro, choose a theme/layout/font and save. Add certificates and achievements under their tab. Visitor contact form messages appear in Admin → Messages.

## Supabase configuration
`assets/config.js` uses the browser-safe publishable/anon key only. Never put a `service_role` or secret key in frontend files or GitHub.

## Contact form
The form inserts visitor messages into `contact_messages`. Only the allow-listed admin can read/delete those messages. Automatic email notification is not enabled by this static frontend; enable a Supabase Edge Function or trusted email service separately if email alerts are required.

## Deployment
Netlify should remain connected to the existing GitHub repository. Every commit to the production branch triggers a new deploy. Database content remains in Supabase and is not overwritten by a frontend deployment.
