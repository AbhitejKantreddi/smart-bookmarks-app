# Smart Bookmark App

A modern bookmark manager built with Next.js, Supabase, and Tailwind CSS. Organize your favorite websites with style, featuring dark mode that persists across sessions.

## 🌟 Features

✅ **Google OAuth Authentication** - No email/password required, sign in with Google  
✅ **Private Bookmarks** - Each user can only see their own bookmarks  
✅ **Real-time Updates** - Bookmarks sync instantly across tabs without page refresh  
✅ **Delete Bookmarks** - Users can delete their own bookmarks  
✅ **Dark Mode** - Toggle between light and dark themes with persistence  
✅ **Responsive Design** - Works beautifully on desktop and mobile  

## 🚀 Live Demo

https://smart-bookmarks-app-lilac.vercel.app/

## 🛠️ Tech Stack

- **Next.js 13.5** (App Router)
- **Supabase** (Authentication, Database, Realtime)
- **Tailwind CSS** (Styling)
- **TypeScript** (Type safety)
- **Lucide React** (Icons)

## 📋 Requirements Met

1. ✅ **User can sign up and log in using Google** (no email/password — Google OAuth only)
2. ✅ **A logged-in user can add a bookmark** (URL + title)
3. ✅ **Bookmarks are private to each user** (User A cannot see User B's bookmarks)
4. ✅ **Bookmark list updates in real-time** without page refresh (if you open two tabs and add a bookmark in one, it should appear in the other)
5. ✅ **User can delete their own bookmarks**
6. ✅ **App is deployed on Vercel** with a working live URL

## 🎯 Problems Encountered & Solutions

### Problem 1: Dark Mode Not Persisting After Login
**Issue:** When users toggled to dark mode and then logged in via Google OAuth, the theme would reset to light mode.

**Root Cause:** The theme state was only stored in React state, not in localStorage. When the OAuth redirect happened, the page reloaded and lost all React state.

**Solution:** 
- Added localStorage persistence to `ThemeProvider.tsx`
- Theme preference is now saved to localStorage whenever it changes
- On app initialization, theme is read from localStorage
- Key changes in `components/ThemeProvider.tsx`:
  ```tsx
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      return savedTheme || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);
  ```

### Problem 2: "Unsupported Server Component type: undefined"
**Issue:** Error when trying to use `ThemeToggle` component in the page.

**Root Cause:** `ThemeToggle.tsx` was using `export default` but being imported as a named import in `page.tsx`.

**Solution:**
- Changed from `export default function ThemeToggle()` to `export function ThemeToggle()`
- This matches the named import syntax: `import { ThemeToggle } from '@/components/ThemeToggle'`

### Problem 3: "useTheme must be used within a ThemeProvider"
**Issue:** ThemeToggle component couldn't access the ThemeProvider context.

**Root Cause:** The original `page.tsx` was a Server Component (async function), and Server Components cannot access Client Context from ThemeProvider, even when wrapped in layout.tsx.

**Solution:**
- Converted `app/page.tsx` to a Client Component by adding `'use client'` directive
- Changed data fetching from server-side to client-side using `useEffect`
- Now the entire page is within the ThemeProvider's client boundary
- Key changes:
  ```tsx
  'use client';
  
  export default function Home() {
    const [user, setUser] = useState<User | null>(null);
    // Fetch data on client side instead of server
    useEffect(() => {
      // ... data fetching logic
    }, []);
  }
  ```

### Problem 4: "Cannot read properties of undefined (reading 'auth')"
**Issue:** `AuthButton` component was trying to use a `supabase` object that didn't exist.

**Root Cause:** The component wasn't creating or importing a Supabase client instance.

**Solution:**
- Added Supabase client creation inside the component
- Imported `createClient` from `@/lib/supabase-browser`
- Key changes in `components/AuthButton.tsx`:
  ```tsx
  'use client';
  
  import { createClient } from '@/lib/supabase-browser';
  
  export function AuthButton({ user }) {
    const supabase = createClient(); // Create client here
    
    const handleSignIn = async () => {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        // ...
      });
    };
  }
  ```

### Problem 5: OAuth Callback Handling
**Issue:** After Google OAuth login, users weren't being properly authenticated.

**Root Cause:** Missing OAuth callback route handler.

**Solution:**
- Created `app/auth/callback/route.ts` to handle the OAuth callback
- Exchanges the authorization code for a session
- Redirects user back to home page after authentication
- File structure:
  ```
  app/
  ├── auth/
  │   └── callback/
  │       └── route.ts
  ```

## 📁 Project Structure

```
├── app/
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts          # OAuth callback handler
│   ├── layout.tsx                # Root layout with ThemeProvider
│   ├── page.tsx                  # Main page (Client Component)
│   └── globals.css               # Global styles
├── components/
│   ├── AuthButton.tsx            # Google sign in/out button
│   ├── BookmarksClient.tsx       # Bookmark list with real-time updates
│   ├── ThemeProvider.tsx         # Theme context with localStorage
│   └── ThemeToggle.tsx           # Dark mode toggle button
├── lib/
│   ├── supabase-browser.ts       # Browser Supabase client
│   └── supabase-server.ts        # Server Supabase client
├── types/
│   └── database.ts               # TypeScript types for Supabase
└── .env.local                    # Environment variables
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+ installed
- A Supabase account and project
- A Google Cloud project with OAuth configured

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd smart-bookmarks-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase

#### Create Supabase Tables
Run this SQL in your Supabase SQL Editor:

```sql
-- Create bookmarks table
create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table bookmarks enable row level security;

-- Create policy: Users can only see their own bookmarks
create policy "Users can view their own bookmarks"
  on bookmarks for select
  using (auth.uid() = user_id);

-- Create policy: Users can insert their own bookmarks
create policy "Users can insert their own bookmarks"
  on bookmarks for insert
  with check (auth.uid() = user_id);

-- Create policy: Users can delete their own bookmarks
create policy "Users can delete their own bookmarks"
  on bookmarks for delete
  using (auth.uid() = user_id);

-- Enable realtime
alter publication supabase_realtime add table bookmarks;
```

#### Configure Google OAuth in Supabase
1. Go to your Supabase project → **Authentication** → **Providers**
2. Enable **Google** provider
3. Add your Google OAuth Client ID and Secret
4. In **URL Configuration**, add these redirect URLs:
   - `http://localhost:3000/auth/callback` (for local development)
   - `https://your-vercel-url.vercel.app/auth/callback` (for production)

### 4. Configure Environment Variables

Create `.env.local` in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important:** Find these values in your Supabase project settings → API

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚢 Deployment to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click "Deploy"

### 3. Update Supabase Redirect URLs
After deployment, add your Vercel URL to Supabase:
1. Go to Supabase → **Authentication** → **URL Configuration**
2. Add: `https://your-app.vercel.app/auth/callback`

## 🧪 Testing

### Test Checklist
- [ ] Sign in with Google works
- [ ] User can add bookmarks
- [ ] Bookmarks are saved to database
- [ ] User can only see their own bookmarks
- [ ] Real-time updates work (open two tabs, add bookmark in one, see it appear in the other)
- [ ] User can delete bookmarks
- [ ] Dark mode toggle works
- [ ] Dark mode persists after login
- [ ] Dark mode persists after page refresh
- [ ] Dark mode persists after closing/reopening browser

### Real-time Testing
1. Open the app in two different browser tabs
2. Login with the same account in both tabs
3. Add a bookmark in Tab 1
4. Verify it immediately appears in Tab 2 (without refreshing)
5. Delete a bookmark in Tab 2
6. Verify it immediately disappears from Tab 1

## 🎨 Features in Detail

### Authentication
- Uses Supabase Google OAuth
- No email/password required
- Session persists across page reloads
- Automatic redirect after login

### Bookmarks
- Add with title and URL
- Stored in Supabase database
- Private to each user (enforced by RLS policies)
- Real-time sync using Supabase Realtime
- Delete functionality with confirmation

### Dark Mode
- Toggle button in header
- Persists across sessions using localStorage
- Smooth transitions between themes
- Works across all pages and components

## 📱 Responsive Design

The app is fully responsive and works on:
- Desktop (1920px and above)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔒 Security

- **Row Level Security (RLS)** - Users can only access their own data
- **OAuth Authentication** - Secure Google sign-in
- **Environment Variables** - Sensitive data kept in env files
- **Client-side Auth** - No session tokens exposed in URLs

## 🐛 Known Issues

None currently! All major issues have been resolved:
- ✅ Dark mode persistence fixed
- ✅ Theme context access fixed
- ✅ OAuth callback handling fixed
- ✅ Supabase client initialization fixed

## 🤝 Contributing

This project was built as part of a coding assessment. For any issues or suggestions, please open an issue on GitHub.

## 📄 License

MIT License - feel free to use this project for learning purposes.

## 👨‍💻 Author

Built with ❤️ using Next.js, Supabase, and Tailwind CSS

---

## 🎓 What I Learned

Through building this project and solving various bugs, I learned:

1. **Next.js App Router Architecture** - Understanding Server vs Client Components and when to use each
2. **React Context with SSR** - How to properly use context in Next.js with the App Router
3. **localStorage Persistence** - Implementing theme persistence across sessions
4. **Supabase Real-time** - Setting up and using real-time database subscriptions
5. **OAuth Flow** - Implementing Google OAuth with proper callback handling
6. **Row Level Security** - Writing secure database policies in PostgreSQL
7. **Debugging Complex Errors** - Systematic approach to resolving "useX must be used within XProvider" errors
8. **Import/Export Patterns** - Understanding named vs default exports in React/Next.js

## 📞 Support

If you encounter any issues:
1. Check the "Problems Encountered & Solutions" section
2. Verify all environment variables are set correctly
3. Ensure Supabase tables and policies are created
4. Check OAuth redirect URLs are configured in Supabase
5. Open an issue on GitHub with detailed error messages

---

**Built for the Smart Bookmark App assessment - demonstrating full-stack development skills with modern web technologies.**
