/*
  # 创建访问码管理表

  1. 新表
    - `access_codes`
      - `id` (uuid, 主键)
      - `code` (text, 唯一访问码)
      - `activated_at` (timestamptz, 首次激活时间)
      - `created_at` (timestamptz, 创建时间)
      - `is_active` (boolean, 是否已激活)
      
  2. 安全性
    - 启用 RLS
    - 添加公共读取策略（仅用于验证访问码）
    
  3. 重要说明
    - 此表仅存储访问码信息
    - 不存储任何用户测试答案或结果
    - 保护用户隐私，所有测试数据在浏览器本地处理
*/

-- 删除旧表（如果存在）
DROP TABLE IF EXISTS test_records;

-- 创建访问码表
CREATE TABLE IF NOT EXISTS access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  activated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT false
);

-- 启用 RLS
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取访问码信息（用于验证）
CREATE POLICY "Anyone can read access codes"
  ON access_codes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 允许所有人更新访问码状态（激活时间）
CREATE POLICY "Anyone can update access codes"
  ON access_codes
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON access_codes(code);
CREATE INDEX IF NOT EXISTS idx_access_codes_activated_at ON access_codes(activated_at);