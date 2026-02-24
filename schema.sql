-- Betasso Trail Direction Tracker - Database Schema
-- Run this against your Vercel Postgres database

-- Connected Strava users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  strava_id BIGINT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Individual segment efforts detected from user activities
CREATE TABLE IF NOT EXISTS segment_efforts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  strava_activity_id BIGINT NOT NULL,
  segment_id BIGINT NOT NULL,
  loop TEXT NOT NULL,
  direction TEXT NOT NULL,
  started_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(strava_activity_id, segment_id)
);

-- Aggregate effort_count readings from cron job (backup method)
CREATE TABLE IF NOT EXISTS effort_count_readings (
  id SERIAL PRIMARY KEY,
  segment_id BIGINT NOT NULL,
  effort_count INTEGER NOT NULL,
  read_at TIMESTAMP DEFAULT NOW()
);

-- Direction change history
CREATE TABLE IF NOT EXISTS direction_changes (
  id SERIAL PRIMARY KEY,
  loop TEXT NOT NULL,
  direction TEXT NOT NULL,
  confidence TEXT NOT NULL,
  detected_at TIMESTAMP DEFAULT NOW(),
  source TEXT NOT NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_segment_efforts_loop_started ON segment_efforts(loop, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_direction_changes_loop_detected ON direction_changes(loop, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_effort_count_readings_segment_read ON effort_count_readings(segment_id, read_at DESC);
