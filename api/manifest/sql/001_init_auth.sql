-- 001_init_auth.sql
-- 身份域基础表：用户、会话、一次性令牌

CREATE TABLE IF NOT EXISTS `user` (
  `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uid`               CHAR(26)        NOT NULL COMMENT '对外唯一标识（ULID）',
  `email`             VARCHAR(190)    NOT NULL,
  `password_hash`     VARCHAR(100)    NOT NULL,
  `nickname`          VARCHAR(32)     NOT NULL DEFAULT '',
  `avatar_url`        VARCHAR(255)    NOT NULL DEFAULT '',
  `timezone`          VARCHAR(48)     NOT NULL DEFAULT 'Asia/Shanghai',
  `email_verified_at` DATETIME(3)     NULL,
  `last_login_at`     DATETIME(3)     NULL,
  `last_login_ip`     VARCHAR(45)     NOT NULL DEFAULT '',
  `status`            TINYINT         NOT NULL DEFAULT 1 COMMENT '1 正常 2 禁用',
  `created_at`        DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`        DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_uid` (`uid`),
  UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='用户';

CREATE TABLE IF NOT EXISTS `user_session` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`      BIGINT UNSIGNED NOT NULL,
  `token_hash`   CHAR(64)        NOT NULL COMMENT 'refresh token 的 SHA-256',
  `family_uid`   CHAR(26)        NOT NULL COMMENT '令牌家族，用于复用检测',
  `device`       VARCHAR(64)     NOT NULL DEFAULT '',
  `ip`           VARCHAR(45)     NOT NULL DEFAULT '',
  `user_agent`   VARCHAR(255)    NOT NULL DEFAULT '',
  `expires_at`   DATETIME(3)     NOT NULL,
  `revoked_at`   DATETIME(3)     NULL,
  `last_used_at` DATETIME(3)     NULL,
  `created_at`   DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_token_hash` (`token_hash`),
  KEY `idx_user_expire` (`user_id`, `expires_at`),
  KEY `idx_family` (`family_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='登录会话';

CREATE TABLE IF NOT EXISTS `auth_token` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `purpose`    TINYINT         NOT NULL COMMENT '1 邮箱验证 2 重置密码',
  `token_hash` CHAR(64)        NOT NULL,
  `expires_at` DATETIME(3)     NOT NULL,
  `used_at`    DATETIME(3)     NULL,
  `created_at` DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_token_hash` (`token_hash`),
  KEY `idx_user_purpose` (`user_id`, `purpose`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='一次性令牌';
