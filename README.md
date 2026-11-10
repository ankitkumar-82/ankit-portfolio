# ANKIT KUMAR — Premium Portfolio

A responsive portfolio with a Supabase-backed admin dashboard, hosted as a static site on Netlify.

## Included
- Public portfolio: About, Skills, Projects, Experience, Education and Contact
- Private admin login, restricted by an explicit admin UUID in the database
- Admin content editing and profile image upload
- Password recovery email, password update and email change confirmation
- Supabase Postgres + Auth + Storage with Row Level Security (RLS)

## Setup (one-time)

### 1. Create Supabase project
Create a free project at https://supabase.com. Open **Project Settings → API** and copy:
- Project URL
- Publishable key (or legacy anon key)

Do not use a `service_role` or secret key in browser code.

### 2. Create the admin account
In Supabase: **Authentication → Users → Add user**. Use your own email and a strong unique password. Confirm the email if your project settings require it. Copy the user's UUID.

### 3. Configure database and security
Open **SQL Editor**, open `supabase/setup.sql`, replace `YOUR_AUTH_USER_UUID` with the UUID from step 2, and run the script.

This script creates the portfolio tables, an admin allow-list, RLS policies and the public image bucket. Only the explicitly allow-listed Auth user can write portfolio content.

### 4. Connect the website
Open `assets/config.js` and replace:
- `YOUR_SUPABASE_PROJECT_URL`
- `YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY`

The publishable/anon key is intended for browser use. RLS is the security boundary. Never paste the service-role key here or commit it to GitHub.

### 5. Deploy to Netlify
1. Upload this project folder to a new GitHub repository (keep the folder structure).
2. In Netlify choose **Add new site → Import an existing project**.
3. Connect GitHub and select the repository.
4. Build command: leave blank. Publish directory: `.`.
5. Deploy. Your public URL will be a `*.netlify.app` address.

### 6. Open admin
Visit `https://YOUR-SITE.netlify.app/admin.html` and sign in with the Auth email/password created in step 2.

## Admin usage
- Profile: edit name, headline, intro, about, email, location and upload a JPG/PNG/WEBP photo (max 3 MB).
- Skills: add, edit or delete skills.
- Projects: add, edit or delete projects; tags are comma-separated.
- Experience and Education: add, edit or delete entries.
- Account: change password or request an email change confirmation.
- Forgot password: enter the registered email on the login page; Supabase sends a recovery email.

## Important notes
- The admin login is not a hardcoded browser password. Supabase Auth verifies credentials and database RLS checks the admin allow-list.
- Public visitors can read published portfolio data. Only the allow-listed admin can change it.
- Set your correct website URL under Supabase **Authentication → URL Configuration → Site URL / Redirect URLs** so password recovery redirects back to your deployed site. Add both your Netlify URL and any custom domain.
- Add social links by editing `profile.social_links` in Supabase Table Editor as JSON, e.g. `[{"label":"GitHub","url":"https://github.com/your-id"},{"label":"LinkedIn","url":"https://linkedin.com/in/your-id"}]`.
- Free service limits can change; review current Netlify and Supabase plan limits before relying on production usage.
- The supplied profile photo is a placeholder. Upload your own photo in Admin after setup.
