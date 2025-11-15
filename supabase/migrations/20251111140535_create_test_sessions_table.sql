/*
  # 创建测试会话表

  1. 新表
    - `test_sessions`
      - `id` (uuid, 主键)
      - `session_id` (text, 唯一会话标识)
      - `first_access_at` (timestamptz, 首次访问时间)
      - `created_at` (timestamptz, 创建时间)
      
  2. 安全性
    - 启用 RLS
    - 允许公开读取（用于验证会话有效性）
    - 允许公开更新（用于记录首次访问时间）
    
  3. 重要说明
    - 此表仅存储会话信息和时间戳
    - 不存储任何测试答案或结果
    - 所有测试数据在浏览器本地处理
*/

-- 删除旧表
DROP TABLE IF EXISTS access_codes;

-- 创建测试会话表
CREATE TABLE IF NOT EXISTS test_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  first_access_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 启用 RLS
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取会话信息
CREATE POLICY "Anyone can read test sessions"
  ON test_sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 允许所有人更新会话信息
CREATE POLICY "Anyone can update test sessions"
  ON test_sessions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_test_sessions_session_id ON test_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_test_sessions_first_access_at ON test_sessions(first_access_at);