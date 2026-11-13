-- 007_plan_demo.sql
-- 计划演示数据：仅当演示账号（email = admin）尚无计划分类时写入
-- 可重复执行：所有插入均由 NOT EXISTS 保护

INSERT INTO `plan_category` (`user_id`, `name`, `color`, `sort_order`)
SELECT u.id, x.name, x.color, x.sort_order
FROM `user` u
JOIN (
  SELECT '生活' AS name, '#6C9E8D' AS color, 1 AS sort_order
  UNION ALL SELECT '个人', '#E56F4A', 2
  UNION ALL SELECT '阅读', '#D4A63D', 3
  UNION ALL SELECT '创作', '#9B72D2', 4
  UNION ALL SELECT '工作', '#6389A8', 5
) x
WHERE u.email = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM `plan_category` c WHERE c.user_id = u.id AND c.name = x.name
  );

INSERT INTO `plan_task` (`user_id`, `category_id`, `title`, `note`, `status`, `due_date`, `sort_order`)
SELECT u.id, c.id, t.title, t.note, t.status, t.due_date, t.sort_order
FROM (
  SELECT '整理年度照片' AS title, '' AS note, 1 AS status,
         DATE_ADD(CURDATE(), INTERVAL 2 DAY) AS due_date, 0 AS sort_order, '生活' AS category
  UNION ALL SELECT '梳理十一月预算', '', 1, DATE_ADD(CURDATE(), INTERVAL 4 DAY), 1, '个人'
  UNION ALL SELECT '读完《观看之道》', '', 1, DATE_ADD(CURDATE(), INTERVAL 6 DAY), 2, '阅读'
  UNION ALL SELECT '个人网站迭代', '', 2, CURDATE(), 0, '创作'
  UNION ALL SELECT '整理设计素材库', '', 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 1, '工作'
  UNION ALL SELECT '完成十月复盘', '', 3, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 0, '个人'
  UNION ALL SELECT '预约牙科检查', '', 3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, '生活'
  UNION ALL SELECT '更新阅读书单', '', 3, CURDATE(), 2, '阅读'
) t
JOIN `user` u ON u.email = 'admin'
LEFT JOIN `plan_category` c ON c.user_id = u.id AND c.name = t.category AND c.deleted_at IS NULL
WHERE NOT EXISTS (
  SELECT 1 FROM `plan_task` pt WHERE pt.user_id = u.id AND pt.title = t.title
);
