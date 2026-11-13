-- 013_movies_demo.sql
-- 电影演示数据：仅当演示账号（email = admin）尚无片单时写入
-- 可重复执行：插入由 NOT EXISTS 保护

INSERT INTO `movie_item` (`user_id`, `title`, `year`, `genre`, `director`, `rating`, `status`, `note`, `color`)
SELECT u.id, x.title, x.year, x.genre, x.director, x.rating, x.status, x.note, x.color
FROM `user` u
JOIN (
  SELECT '海上钢琴师' AS title, 1998 AS year, '剧情 / 音乐' AS genre, '朱塞佩·托纳多雷' AS director,
         9.3 AS rating, 3 AS status, '把孤独弹成了一整条船。' AS note, '#6389A8' AS color
  UNION ALL SELECT '布达佩斯大饭店', 2014, '喜剧 / 冒险', '韦斯·安德森', 8.9, 3,
    '构图与配色本身就是故事。', '#B87758'
  UNION ALL SELECT '燃烧', 2018, '悬疑 / 剧情', '李沧东', 8.6, 3,
    '留白比答案更锋利。', '#9B72D2'
  UNION ALL SELECT '驾驶我的车', 2021, '剧情', '滨口龙介', 8.5, 2,
    '看了一半，台词像在读小说。', '#4C8D78'
  UNION ALL SELECT '奥本海默', 2023, '传记 / 历史', '克里斯托弗·诺兰', 0, 1,
    '留到周末一口气看完。', '#D4A63D'
) x
WHERE u.email = 'admin'
  AND NOT EXISTS (SELECT 1 FROM `movie_item` m WHERE m.user_id = u.id);
