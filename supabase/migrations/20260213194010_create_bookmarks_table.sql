/*
  # Create bookmarks table

  1. New Tables
    - `bookmarks`
      - `id` (uuid, primary key) - Unique identifier for each bookmark
      - `user_id` (uuid, foreign key to auth.users) - Owner of the bookmark
      - `title` (text, not null) - Display title of the bookmark
      - `url` (text, not null) - The bookmarked URL
      - `created_at` (timestamptz) - When the bookmark was created
  
  2. Security
    - Enable RLS on `bookmarks` table
    - Add policy for authenticated users to read their own bookmarks
    - Add policy for authenticated users to insert their own bookmarks
    - Add policy for authenticated users to delete their own bookmarks

  3. Important Notes
    - All bookmarks are private to the user who created them
    - RLS ensures users can only access their own data
    - Real-time subscriptions are filtered by user_id for security
*/

CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bookmarks"
  ON bookmarks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS bookmarks_created_at_idx ON bookmarks(created_at DESC);