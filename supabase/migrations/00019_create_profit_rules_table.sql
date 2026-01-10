-- 创建提成规则表
CREATE TABLE IF NOT EXISTS profit_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rent_investor_rate DECIMAL(5,2) NOT NULL DEFAULT 18.00,
  bonus_pool_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  salesperson_rate DECIMAL(5,2) NOT NULL DEFAULT 36.00,
  investor_rate DECIMAL(5,2) NOT NULL DEFAULT 36.00,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加约束：总计必须为100
ALTER TABLE profit_rules ADD CONSTRAINT check_total_100 
CHECK (rent_investor_rate + bonus_pool_rate + salesperson_rate + investor_rate = 100);

-- 插入默认规则
INSERT INTO profit_rules (rent_investor_rate, bonus_pool_rate, salesperson_rate, investor_rate, is_active)
VALUES (18.00, 10.00, 36.00, 36.00, true);

-- 添加注释
COMMENT ON TABLE profit_rules IS '利润分配规则表';
COMMENT ON COLUMN profit_rules.rent_investor_rate IS '地租出资人分成比例(%)';
COMMENT ON COLUMN profit_rules.bonus_pool_rate IS '月奖金池分成比例(%)';
COMMENT ON COLUMN profit_rules.salesperson_rate IS '销售提成比例(%)';
COMMENT ON COLUMN profit_rules.investor_rate IS '押车出资人分成比例(%)';
COMMENT ON COLUMN profit_rules.is_active IS '是否当前生效的规则';

-- 启用 RLS
ALTER TABLE profit_rules ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看规则
CREATE POLICY "所有人可以查看提成规则" ON profit_rules
  FOR SELECT
  USING (true);

-- 只有管理员可以修改规则
CREATE POLICY "管理员可以修改提成规则" ON profit_rules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );