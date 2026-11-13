-- 009_study_demo.sql
-- 学习演示数据：仅当演示账号（email = admin）尚无课程 / 记录 / 笔记时写入
-- 可重复执行：所有插入均由 NOT EXISTS 保护

INSERT INTO `study_course` (`user_id`, `title`, `unit_label`, `total_units`, `done_units`, `color`, `sort_order`)
SELECT u.id, x.title, x.unit_label, x.total_units, x.done_units, x.color, x.sort_order
FROM `user` u
JOIN (
  SELECT '界面设计系统' AS title, '章' AS unit_label, 12 AS total_units, 8 AS done_units, '#5F6E9C' AS color, 0 AS sort_order
  UNION ALL SELECT '日语 · N3 语法', '节', 40, 21, '#9B72D2', 1
  UNION ALL SELECT '现代艺术史', '章', 16, 5, '#4C8D78', 2
) x
WHERE u.email = 'admin'
  AND NOT EXISTS (SELECT 1 FROM `study_course` c WHERE c.user_id = u.id);

INSERT INTO `study_session` (`user_id`, `course_id`, `minutes`, `studied_on`, `note`)
SELECT u.id, c.id, t.minutes, DATE_SUB(CURDATE(), INTERVAL t.day_offset DAY), ''
FROM (
  SELECT 0 AS day_offset, 45 AS minutes, '界面设计系统' AS course
  UNION ALL SELECT 1, 60, '日语 · N3 语法'
  UNION ALL SELECT 2, 30, '现代艺术史'
  UNION ALL SELECT 3, 75, '界面设计系统'
  UNION ALL SELECT 5, 50, '日语 · N3 语法'
  UNION ALL SELECT 6, 90, '界面设计系统'
  UNION ALL SELECT 8, 40, '现代艺术史'
  UNION ALL SELECT 9, 25, '日语 · N3 语法'
  UNION ALL SELECT 10, 60, '界面设计系统'
  UNION ALL SELECT 12, 80, '日语 · N3 语法'
  UNION ALL SELECT 13, 35, '现代艺术史'
  UNION ALL SELECT 15, 55, '界面设计系统'
  UNION ALL SELECT 16, 70, '日语 · N3 语法'
  UNION ALL SELECT 18, 30, '现代艺术史'
  UNION ALL SELECT 19, 65, '界面设计系统'
  UNION ALL SELECT 20, 45, '日语 · N3 语法'
  UNION ALL SELECT 22, 90, '界面设计系统'
  UNION ALL SELECT 23, 50, '现代艺术史'
  UNION ALL SELECT 25, 40, '日语 · N3 语法'
  UNION ALL SELECT 26, 60, '界面设计系统'
  UNION ALL SELECT 28, 35, '现代艺术史'
  UNION ALL SELECT 30, 85, '日语 · N3 语法'
  UNION ALL SELECT 33, 45, '界面设计系统'
  UNION ALL SELECT 35, 55, '现代艺术史'
  UNION ALL SELECT 38, 70, '日语 · N3 语法'
  UNION ALL SELECT 40, 30, '界面设计系统'
  UNION ALL SELECT 45, 60, '现代艺术史'
  UNION ALL SELECT 50, 45, '日语 · N3 语法'
  UNION ALL SELECT 55, 80, '界面设计系统'
) t
JOIN `user` u ON u.email = 'admin'
LEFT JOIN `study_course` c ON c.user_id = u.id AND c.title = t.course AND c.deleted_at IS NULL
WHERE NOT EXISTS (SELECT 1 FROM `study_session` s WHERE s.user_id = u.id);

INSERT INTO `study_note` (`user_id`, `title`, `tag`, `content`)
SELECT u.id, x.title, x.tag, x.content
FROM `user` u
JOIN (
  SELECT '设计系统不是组件库' AS title, '设计' AS tag,
         '一致性不是让一切看起来相同，而是让不同事物拥有清晰的关系。' AS content
  UNION ALL SELECT '包豪斯：形式追随功能', '艺术史',
    '真正的现代主义不是一种风格，而是一种持续追问的方式。'
  UNION ALL SELECT '今日阅读摘录', '阅读',
    '我们以为自己在读一本书，其实是在重新认识经验。'
) x
WHERE u.email = 'admin'
  AND NOT EXISTS (SELECT 1 FROM `study_note` n WHERE n.user_id = u.id);

INSERT INTO `study_setting` (`user_id`, `weekly_goal_minutes`)
SELECT u.id, 360 FROM `user` u
WHERE u.email = 'admin'
  AND NOT EXISTS (SELECT 1 FROM `study_setting` s WHERE s.user_id = u.id);
