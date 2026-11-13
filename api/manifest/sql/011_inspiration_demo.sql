-- 011_inspiration_demo.sql
-- 灵感演示数据：仅当演示账号（email = admin）尚无灵感时写入
-- 可重复执行：插入由 NOT EXISTS 保护

INSERT INTO `inspiration_item` (`user_id`, `title`, `content`, `tag`, `source`, `color`, `pinned`, `created_at`)
SELECT u.id, x.title, x.content, x.tag, x.source, x.color, x.pinned,
       DATE_SUB(NOW(3), INTERVAL x.day_offset DAY)
FROM `user` u
JOIN (
  SELECT '一致性不是让一切看起来相同' AS title,
         '一致性不是让一切看起来相同，而是让不同事物拥有清晰的关系。' AS content,
         '设计' AS tag, '《设计系统实践》' AS source, '#9B72D2' AS color, 1 AS pinned, 1 AS day_offset
  UNION ALL SELECT '形式追随功能', '真正的现代主义不是一种风格，而是一种持续追问的方式。',
    '艺术史', '包豪斯宣言', '#B87758', 1, 4
  UNION ALL SELECT '把书读成自己的经验', '我们以为自己在读一本书，其实是在重新认识经验。',
    '阅读', '《如何阅读一本书》', '#4C8D78', 0, 7
  UNION ALL SELECT '慢一点，把留白还给自己', '不是所有时间都要被填满，留白本身就是一种设计。',
    '生活', '', '#6389A8', 0, 12
  UNION ALL SELECT '先做出来，再做好', '完成比完美更重要，第一版只需要证明方向可行。',
    '工作', '', '#D4A63D', 0, 18
) x
WHERE u.email = 'admin'
  AND NOT EXISTS (SELECT 1 FROM `inspiration_item` i WHERE i.user_id = u.id);
