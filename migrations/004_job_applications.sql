-- Job Applications Table
-- Stores job application submissions from the careers page

CREATE TABLE IF NOT EXISTS job_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city_state TEXT NOT NULL,
  position TEXT NOT NULL,
  willing_to_travel INTEGER NOT NULL DEFAULT 0, -- 0 = No, 1 = Yes
  has_license INTEGER NOT NULL DEFAULT 0, -- 0 = No, 1 = Yes
  years_experience INTEGER,
  equipment_skills TEXT, -- JSON array of selected skills
  resume_url TEXT,
  cover_letter TEXT,
  availability_date TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewing', 'interviewed', 'accepted', 'rejected', 'withdrawn')),
  submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Index for querying by status
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);

-- Index for querying by position
CREATE INDEX IF NOT EXISTS idx_job_applications_position ON job_applications(position);

-- Index for querying by submission date
CREATE INDEX IF NOT EXISTS idx_job_applications_submitted_at ON job_applications(submitted_at DESC);
