/*
  # 为 access_codes 表添加 INSERT 权限
  
  1. 安全性变更
    - 添加 INSERT 策略允许创建新激活码
    - 允许匿名和已认证用户插入新记录
  
  2. 说明
    - 这允许管理后台创建新的访问码
    - 保持原有的 SELECT 和 UPDATE 策略不变
*/

-- 允许所有人插入新的访问码（用于管理后台创建）
CREATE POLICY "Anyone can insert access codes"
  ON access_codes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
