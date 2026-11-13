-- 015_travel_demo.sql
-- 旅行演示数据：仅当演示账号（email = admin）尚无足迹时写入
-- 可重复执行：插入由 NOT EXISTS 保护

INSERT INTO `travel_trip` (`user_id`, `title`, `region`, `visited_on`, `days`, `rating`, `note`, `color`)
SELECT u.id, x.title, x.region, x.visited_on, x.days, x.rating, x.note, x.color
FROM `user` u
JOIN (
  SELECT '京都' AS title, '日本' AS region, '2026-04-05' AS visited_on, 5 AS days, 5 AS rating,
         '清晨的鸭川，比照片更安静。' AS note, '#B87758' AS color
  UNION ALL SELECT '大理', '云南', '2026-02-11', 4, 4, '在洱海边骑了一整天车。', '#4C8D78'
  UNION ALL SELECT '泉州', '福建', '2025-11-20', 3, 4, '巷子里的南音与面线糊。', '#D4A63D'
  UNION ALL SELECT '阿那亚', '河北', '2025-08-02', 2, 3, '看了一场海边日出。', '#6389A8'
  UNION ALL SELECT '清迈', '泰国', '2025-01-15', 6, 5, '慢下来的一周，什么也没做。', '#9B72D2'
) x
WHERE u.email = 'admin'
  AND NOT EXISTS (SELECT 1 FROM `travel_trip` t WHERE t.user_id = u.id);
