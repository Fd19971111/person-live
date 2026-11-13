-- 002_init_finance.sql
-- 记账域：分类与流水

CREATE TABLE IF NOT EXISTS `finance_category` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `name`       VARCHAR(32)     NOT NULL,
  `kind`       TINYINT         NOT NULL DEFAULT 2 COMMENT '1 收入 2 支出',
  `color`      CHAR(7)         NOT NULL DEFAULT '#B89CD5',
  `sort_order` INT             NOT NULL DEFAULT 0,
  `created_at` DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_user_kind` (`user_id`, `kind`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='记账分类';

CREATE TABLE IF NOT EXISTS `finance_transaction` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`      BIGINT UNSIGNED NOT NULL,
  `category_id`  BIGINT UNSIGNED NULL,
  `type`         TINYINT         NOT NULL COMMENT '1 收入 2 支出',
  `amount_cents` BIGINT          NOT NULL COMMENT '恒为正数，单位分',
  `title`        VARCHAR(64)     NOT NULL,
  `note`         VARCHAR(255)    NOT NULL DEFAULT '',
  `occurred_at`  DATETIME(3)     NOT NULL,
  `created_at`   DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `deleted_at`   DATETIME(3)     NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_time` (`user_id`, `occurred_at`),
  KEY `idx_user_cat_time` (`user_id`, `category_id`, `occurred_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='记账流水';
