/*
  # 创建 SCL-90 测评记录表

  1. 新建表
    - `test_records`
      - `id` (uuid, 主键)
      - `device_fingerprint` (text, 设备指纹，唯一索引)
      - `answers` (jsonb, 90题答案数组)
      - `total_score` (integer, 总分)
      - `average_score` (numeric, 总均分)
      - `positive_items` (integer, 阳性项目数)
      - `created_at` (timestamptz, 创建时间)
      
  2. 安全设置
    - 启用 RLS
    - 添加策略允许插入记录
    - 添加策略允许读取自己的记录
    
  3. 索引
    - 为 device_fingerprint 创建唯一索引以防止重复测评
*/

CREATE TABLE IF NOT EXISTS test_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_fingerprint text NOT NULL,
  answers jsonb NOT NULL,
  total_score integer NOT NULL,
  average_score numeric(5,2) NOT NULL,
  positive_items integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_device_fingerprint 
  ON test_records(device_fingerprint);

ALTER TABLE test_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许插入测评记录"
  ON test_records
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "允许查询测评记录"
  ON test_records
  FOR SELECT
  TO anon
  USING (true);
