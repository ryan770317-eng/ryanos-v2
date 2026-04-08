-- RYANOS v2 Supabase Schema
-- Run this in your Supabase SQL Editor to set up the database.

-- Quick Note 資料
CREATE TABLE IF NOT EXISTS quick_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  analysis JSONB,            -- { summary, todos, mood }
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 使用者設定（API Key、工具排序、外連 URL）
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,         -- e.g. 'CLAUDE_API_KEY'
  encrypted_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 工具執行紀錄 & 報錯
CREATE TABLE IF NOT EXISTS tool_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'info',  -- 'info' | 'warn' | 'error'
  message TEXT NOT NULL,
  detail JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tool_logs_tool_time ON tool_logs (tool_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_logs_level ON tool_logs (level) WHERE level = 'error';
CREATE INDEX IF NOT EXISTS idx_quick_notes_created ON quick_notes (created_at DESC);

-- RLS: 單人使用，暫不需要 user_id，開啟 RLS 但允許所有操作
ALTER TABLE quick_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_quick_notes" ON quick_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_user_settings" ON user_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_tool_logs" ON tool_logs FOR ALL USING (true) WITH CHECK (true);
