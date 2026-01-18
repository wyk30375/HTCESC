-- 更新一级会员年费为680元
UPDATE membership_tiers
SET annual_fee = 680.00
WHERE tier_name = '一级会员' AND tier_level = 1;