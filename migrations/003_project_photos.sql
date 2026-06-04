-- Migration: Add project_photos table
-- Date: 2026-01-27
-- Description: Allows customers and business to upload photos to projects

CREATE TABLE IF NOT EXISTS project_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  photo_url TEXT NOT NULL,
  uploader_type TEXT CHECK(uploader_type IN ('customer', 'business')) NOT NULL,
  uploader_id INTEGER,
  caption TEXT,
  phase TEXT CHECK(phase IN ('before', 'progress', 'after')),
  uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_project_photos_project_id ON project_photos(project_id);
CREATE INDEX IF NOT EXISTS idx_project_photos_phase ON project_photos(phase);
