-- 020_music_demo.sql
-- 音乐演示数据：仅当演示账号（email = admin）尚无音乐记录时写入
-- 可重复执行：插入由 NOT EXISTS 保护

INSERT INTO `music_track` (`user_id`, `title`, `artist`, `album`, `playlist`, `rating`, `note`, `color`)
SELECT u.id, x.title, x.artist, x.album, x.playlist, x.rating, x.note, x.color
FROM `user` u
JOIN (
  SELECT 'Garden Song' AS title, 'Phoebe Bridgers' AS artist, 'Punisher' AS album,
         '深夜散步' AS playlist, 5 AS rating, '适合关灯之后单曲循环。' AS note, '#9B72D2' AS color
  UNION ALL SELECT 'Motion Sickness', 'Phoebe Bridgers', 'Stranger in the Alps', '通勤路上', 4,
    '鼓点一进来，地铁都轻快一点。', '#6389A8'
  UNION ALL SELECT 'Charm', 'Clairo', 'Charm', '周末厨房', 5,
    '做晚饭的背景音，松弛又温柔。', '#D4A63D'
  UNION ALL SELECT 'Pink + White', 'Frank Ocean', 'Blonde', '深夜散步', 5,
    '夏天、晚风与一段没说完的话。', '#B87758'
  UNION ALL SELECT 'Mystery of Love', 'Sufjan Stevens', 'Call Me by Your Name', '深夜散步', 5,
    '第一次听是在电影散场后。', '#4C8D78'
  UNION ALL SELECT '南方姑娘', '赵雷', '赵小雷', '通勤路上', 4,
    '前奏一响就想回家。', '#E56F4A'
  UNION ALL SELECT '一生所爱', '卢冠廷', '大话西游', '深夜散步', 5,
    '旧歌，但每次听都还是会停一下。', '#76559C'
  UNION ALL SELECT '霓虹深处', '陈鸿宇', '一如年少模样', '周末厨房', 4,
    '适合阴天下午。', '#5C927A'
) x
WHERE u.email = 'admin'
  AND NOT EXISTS (SELECT 1 FROM `music_track` m WHERE m.user_id = u.id);
