-- 019_init_music.sql
-- 音乐域：只记录喜欢的歌曲与歌单，不存储音频、不提供播放

CREATE TABLE IF NOT EXISTS `music_track` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `title`      VARCHAR(128)    NOT NULL COMMENT '歌曲名',
  `artist`     VARCHAR(64)     NOT NULL DEFAULT '' COMMENT '演唱者',
  `album`      VARCHAR(128)    NOT NULL DEFAULT '' COMMENT '专辑或来源',
  `playlist`   VARCHAR(32)     NOT NULL DEFAULT '' COMMENT '所属歌单 / 场景',
  `rating`     TINYINT         NOT NULL DEFAULT 0 COMMENT '1-5 星，0 表示未评分',
  `note`       VARCHAR(500)    NOT NULL DEFAULT '',
  `color`      CHAR(7)         NOT NULL DEFAULT '#9B72D2',
  `created_at` DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3)     NULL COMMENT '软删除，界面上视为隐藏',
  PRIMARY KEY (`id`),
  KEY `idx_user_alive_created` (`user_id`, `deleted_at`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='音乐记录';
