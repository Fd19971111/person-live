-- 018_module_icons.sql
-- 每个模块使用独立图标，并同步已存在的用户模块记录
-- 可重复执行：仅按 module_key 覆盖 icon 字段

UPDATE `user_module` SET `icon` = 'wallet'   WHERE `module_key` = 'finance';
UPDATE `user_module` SET `icon` = 'music'    WHERE `module_key` = 'music';
UPDATE `user_module` SET `icon` = 'check'    WHERE `module_key` = 'plans';
UPDATE `user_module` SET `icon` = 'book'     WHERE `module_key` = 'learning';
UPDATE `user_module` SET `icon` = 'film'     WHERE `module_key` = 'movies';
UPDATE `user_module` SET `icon` = 'map'      WHERE `module_key` = 'travel';
UPDATE `user_module` SET `icon` = 'activity' WHERE `module_key` = 'fitness';
UPDATE `user_module` SET `icon` = 'bulb'     WHERE `module_key` = 'inspiration';
