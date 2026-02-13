'use client'

import { supabase } from '@/lib/supabase-browser'
import { Trash2, ExternalLink, Globe } from 'lucide-react'
import type { Database } from '@/types/database'
import { useState } from 'react'
import Image from 'next/image'

type Bookmark = Database['public']['Tables']['bookmarks']['Row']

export function BookmarkList({
  bookmarks,
  setBookmarks,
}: {
  bookmarks: Bookmark[]
  setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    
    // Optimistic delete with animation
    setTimeout(() => {
      setBookmarks((prev) => prev.filter((b) => b.id !== id))
    }, 200)

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(error)
      // Optionally: revert on error
    }
    
    setDeletingId(null)
  }

  // Extract domain from URL for favicon
  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    } catch {
      return null
    }
  }

  // Extract domain name for display
  const getDomainName = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return domain.replace('www.', '')
    } catch {
      return url
    }
  }

  if (bookmarks.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm p-12 rounded-2xl border border-gray-200/50 text-center shadow-lg">
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Globe className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No bookmarks yet</h3>
        <p className="text-gray-500">
          Add your first bookmark above to get started!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          My Bookmarks
        </h2>
        <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-bold">
            {bookmarks.length}
          </span>
          {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'} saved
        </p>
      </div>

      {/* Bookmark List */}
      <div className="divide-y divide-gray-200/50">
        {bookmarks.map((bookmark, index) => {
          const faviconUrl = getFaviconUrl(bookmark.url)
          const domainName = getDomainName(bookmark.url)
          const isDeleting = deletingId === bookmark.id

          return (
            <div
              key={bookmark.id}
              className={`group p-5 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 flex items-center gap-4 ${
                isDeleting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
              style={{
                animation: `slideIn 0.4s ease-out ${index * 0.05}s backwards`,
              }}
            >
              {/* Favicon */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm group-hover:shadow-md transition-shadow">
                  {faviconUrl ? (
                    <Image
                      src={faviconUrl}
                      alt={`${bookmark.title} favicon`}
                      width={32}
                      height={32}
                      className="w-8 h-8 object-contain"
                      unoptimized
                    />
                  ) : (
                    <Globe className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate text-lg group-hover:text-blue-600 transition-colors">
                  {bookmark.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-blue-600 truncate flex items-center gap-1 group/link transition-colors"
                  >
                    <span className="truncate">{domainName}</span>
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  </a>
                  <span className="text-gray-300">•</span>
                  <time className="text-xs text-gray-400">
                    {new Date(bookmark.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </time>
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(bookmark.id)}
                disabled={isDeleting}
                className="flex-shrink-0 p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                aria-label="Delete bookmark"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )
        })}
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}