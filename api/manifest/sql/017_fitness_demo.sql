-- 017_fitness_demo.sql
-- 运动演示数据：仅当演示账号（email = admin）尚无运动记录时写入
-- 可重复执行：插入由 NOT EXISTS 保护

INSERT INTO `fitness_record` (`user_id`, `activity`, `minutes`, `distance_km`, `calories`, `performed_on`, `note`, `color`)
SELECT u.id, x.activity, x.minutes, x.distance_km, x.calories,
       DATE_SUB(CURDATE(), INTERVAL x.day_offset DAY), x.note, x.color
FROM `user` u
JOIN (
  SELECT '跑步' AS activity, 45 AS minutes, 6.20 AS distance_km, 420 AS calories,
         0 AS day_offset, '沿河慢跑，配速 7′15″。' AS note, '#5C927A' AS color
  UNION ALL SELECT '力量训练', 50, 0, 300, 1, '推日：卧推 + 肩推。', '#6389A8'
  UNION ALL SELECT '骑行', 70, 24.50, 560, 3, '环湖一圈，风有点大。', '#D4A63D'
  UNION ALL SELECT '瑜伽', 30, 0, 120, 4, '拉伸肩颈，久坐救星。', '#9B72D2'
  UNION ALL SELECT '跑步', 38, 5.10, 360, 6, '节奏跑，最后两公里有点顶。', '#5C927A'
  UNION ALL SELECT '游泳', 40, 1.20, 380, 8, '自由泳 800 米。', '#4C8D78'
  UNION ALL SELECT '力量训练', 45, 0, 280, 10, '拉日：硬拉 + 划船。', '#6389A8'
  UNION ALL SELECT '跑步', 52, 7.40, 480, 13, '长距离慢跑。', '#5C927A'
  UNION ALL SELECT '骑行', 95, 32.00, 720, 16, '周末拉练。', '#D4A63D'
  UNION ALL SELECT '瑜伽', 25, 0, 100, 19, '睡前放松。', '#9B72D2'
  UNION ALL SELECT '跑步', 42, 5.80, 390, 22, '轻松跑。', '#5C927A'
  UNION ALL SELECT '游泳', 35, 1.00, 330, 26, '蛙泳为主。', '#4C8D78'
) x
WHERE u.email = 'admin'
  AND NOT EXISTS (SELECT 1 FROM `fitness_record` f WHERE f.user_id = u.id);
