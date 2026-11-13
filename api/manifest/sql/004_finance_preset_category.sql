-- 004_finance_preset_category.sql
-- 记账预设分类：吃喝玩乐（支出），归属演示账号 admin（user_id = 3）
-- 可重复执行：INSERT IGNORE 按主键去重；迁移到其它环境时请按需调整 user_id。

INSERT IGNORE INTO `finance_category`
  (`id`,`user_id`,`name`,`kind`,`color`,`sort_order`,`created_at`)
VALUES
  (11,3,'吃喝玩乐',2,'#E88D67',5,NOW(3));
