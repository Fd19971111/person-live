-- 006_init_module.sql
-- 模块域：每个用户的模块可见性与排序（删除即隐藏，添加时恢复）

CREATE TABLE IF NOT EXISTS `user_module` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `module_key` VARCHAR(32)     NOT NULL COMMENT '模块标识，如 finance / plans',
  `name`       VARCHAR(32)     NOT NULL,
  `icon`       VARCHAR(32)     NOT NULL DEFAULT 'layout',
  `color`      CHAR(7)         NOT NULL DEFAULT '#6C9E8D',
  `template`   VARCHAR(32)     NOT NULL DEFAULT 'CardFlow',
  `sort_order` INT             NOT NULL DEFAULT 0,
  `hidden`     TINYINT         NOT NULL DEFAULT 0 COMMENT '1 已删除（隐藏），可重新加回',
  `created_at` DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_module` (`user_id`, `module_key`),
  KEY `idx_user_hidden_sort` (`user_id`, `hidden`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='用户模块可见性';
