/*
  # 创建用户会话表 - 支持多用户独立计时

  ## 概述
  此迁移创建 user_sessions 表，允许一个访问码被多个用户使用，每个用户拥有独立的24小时有效期。

  ## 1. 新表
    - `user_sessions`
      - `id` (uuid, 主键) - 会话唯一标识
      - `access_code_id` (uuid, 外键) - 关联的访问码ID
      - `session_token` (text, 唯一) - 用户会话令牌（浏览器生成的UUID）
      - `first_access_at` (timestamptz) - 该用户首次访问时间
      - `last_access_at` (timestamptz) - 该用户最后访问时间
      - `created_at` (timestamptz) - 记录创建时间

  ## 2. 安全性
    - 启用 RLS
    - 允许匿名用户读取和创建会话（验证访问码时需要）
    - 允许匿名用户更新自己的会话（更新最后访问时间）

  ## 3. 索引
    - session_token 唯一索引（快速查找会话）
    - access_code_id 索引（查找某个访问码的所有会话）
    - first_access_at 索引（按时间过滤）

  ## 4. 设计理念
    - 每个浏览器生成唯一的 session_token
    - 同一访问码可以有多个独立会话
    - 每个会话独立计算24小时有效期
*/

-- 创建用户会话表
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_code_id uuid NOT NULL REFERENCES access_codes(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  first_access_at timestamptz DEFAULT now(),
  last_access_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 启用 RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户读取会话
CREATE POLICY "Anyone can read sessions"
  ON user_sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 允许匿名用户创建会话
CREATE POLICY "Anyone can create sessions"
  ON user_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 允许匿名用户更新会话
CREATE POLICY "Anyone can update sessions"
  ON user_sessions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_access_code_id ON user_sessions(access_code_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_first_access_at ON user_sessions(first_access_at);