-- 创建反馈对话表
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id UUID NOT NULL REFERENCES dealerships(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('dealership', 'platform')),
  message_type TEXT NOT NULL CHECK (message_type IN ('feedback', 'reminder', 'reply')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES feedback(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_feedback_dealership ON feedback(dealership_id);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_parent ON feedback(parent_id);
CREATE INDEX idx_feedback_created ON feedback(created_at DESC);

-- 启用 RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 车行管理员可以查看和创建自己车行的反馈
CREATE POLICY "车行管理员可以查看自己车行的反馈"
  ON feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.dealership_id = feedback.dealership_id
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "车行管理员可以创建反馈"
  ON feedback FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.dealership_id = feedback.dealership_id
      AND profiles.role = 'admin'
    )
    AND sender_type = 'dealership'
  );

CREATE POLICY "车行管理员可以更新反馈状态"
  ON feedback FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.dealership_id = feedback.dealership_id
      AND profiles.role = 'admin'
    )
  );

-- 平台管理员可以查看所有反馈
CREATE POLICY "平台管理员可以查看所有反馈"
  ON feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- 平台管理员可以创建和更新反馈
CREATE POLICY "平台管理员可以创建反馈"
  ON feedback FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "平台管理员可以更新反馈"
  ON feedback FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();