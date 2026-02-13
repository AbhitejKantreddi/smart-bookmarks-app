import { createClient } from '@/lib/supabase-server'
import { AuthButton } from '@/components/AuthButton'
import { BookmarksClient } from '@/components/BookmarksClient'
import { Bookmark, Sparkles, Lock, Zap } from 'lucide-react'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let bookmarks = []

  if (user) {
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    bookmarks = data || []
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl blur-md opacity-70"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl">
                <Bookmark className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Smart Bookmarks
            </h1>
          </div>
          <AuthButton user={user} />
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 py-12">
        {user ? (
          <div className="animate-fadeIn">
            <BookmarksClient user={user} initialBookmarks={bookmarks} />
          </div>
        ) : (
          <div className="text-center py-20 animate-fadeIn">
            {/* Hero Section */}
            <div className="mb-12">
              {/* Floating icon */}
              <div className="relative inline-block mb-8 animate-float">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 rounded-3xl shadow-2xl">
                  <Bookmark className="w-16 h-16 text-white" strokeWidth={1.5} />
                </div>
              </div>

              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                Your Links,
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Beautifully Organized
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Save and organize your favorite websites with style.
                <br />
                Access them from anywhere, anytime.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Lightning Fast</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Real-time sync across all your devices. Changes appear instantly.
                </p>
              </div>

              <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ animationDelay: '100ms' }}>
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Private & Secure</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Your bookmarks are yours alone. Protected by Google OAuth.
                </p>
              </div>

              <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ animationDelay: '200ms' }}>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Simple & Clean</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Beautiful interface that stays out of your way. Just works.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="animate-fadeIn" style={{ animationDelay: '300ms' }}>
              <AuthButton user={user} />
              <p className="text-sm text-gray-500 mt-4">
                Sign in with Google to get started – it takes 2 seconds
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative text-center py-8 text-gray-500 text-sm">
        <p>Built with Next.js, Supabase, and Tailwind CSS</p>
      </footer>
    </div>
  )
}