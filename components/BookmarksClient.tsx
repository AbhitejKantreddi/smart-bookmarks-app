'use client'

import { useState } from 'react'
import { BookmarkForm } from './BookmarkForm'
import { BookmarkList } from './BookmarkList'
import type { Database } from '@/types/database'

type Bookmark = Database['public']['Tables']['bookmarks']['Row']

export function BookmarksClient({
  user,
  initialBookmarks,
}: {
  user: any
  initialBookmarks: Bookmark[]
}) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)

  return (
    <div className="space-y-8">
      <BookmarkForm 
        userId={user.id} 
        onAdd={(bookmark) => setBookmarks([bookmark, ...bookmarks])} 
      />
      <BookmarkList 
        bookmarks={bookmarks} 
        setBookmarks={setBookmarks} 
      />
    </div>
  )
}