'use client'

import { supabase } from '@/lib/supabase-browser'
import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'

export function BookmarkForm({
  userId,
  onAdd,
}: {
  userId: string
  onAdd: (bookmark: any) => void
}) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !url.trim()) return

    setLoading(true)

    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        title: title.trim(),
        url: url.trim(),
        user_id: userId,
      })
      .select()
      .single()

    if (!error && data) {
      onAdd(data)
      setTitle('')
      setUrl('')
    } else {
      console.error(error)
    }

    setLoading(false)
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
          <Plus className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Add Bookmark
        </h2>
      </div>

      <div className="space-y-4">
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Awesome Website"
            required
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 placeholder:text-gray-400"
          />
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            required
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 placeholder:text-gray-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Add Bookmark</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}