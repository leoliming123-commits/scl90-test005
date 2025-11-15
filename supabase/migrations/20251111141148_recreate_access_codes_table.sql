/*
  # 重新创建访问码表

  1. 新表
    - `access_codes`
      - `id` (uuid, 主键)
      - `code` (text, 唯一访问码)
      - `is_active` (boolean, 是否已激活)
      - `activated_at` (timestamptz, 首次激活时间)
      - `created_at` (timestamptz, 创建时间)
      
  2. 安全性
    - 启用 RLS
    - 允许公开读取（用于验证访问码）
    - 允许公开更新（用于记录激活时间）
    
  3. 重要说明
    - 此表仅存储访问码和激活时间戳
    - 不存储任何测试答案或结果
    - 所有测试数据在浏览器本地处理
    - 访问码自首次访问起24小时内有效
*/

-- 删除旧表
DROP TABLE IF EXISTS test_sessions CASCADE;

-- 重新创建访问码表
DROP TABLE IF EXISTS access_codes CASCADE;

CREATE TABLE access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  is_active boolean DEFAULT false,
  activated_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 启用 RLS
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取访问码信息
CREATE POLICY "Anyone can read access codes"
  ON access_codes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 允许所有人更新访问码信息（用于首次激活）
CREATE POLICY "Anyone can update access codes"
  ON access_codes
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 创建索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON access_codes(code);
CREATE INDEX IF NOT EXISTS idx_access_codes_activated_at ON access_codes(activated_at);