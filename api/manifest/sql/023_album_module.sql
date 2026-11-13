-- 023_album_module.sql
-- 相册是本次新增的模块，给已有用户直接放进侧边栏（默认可见），不必手动添加

INSERT IGNORE INTO `user_module`
  (`user_id`, `module_key`, `name`, `icon`, `color`, `template`, `sort_order`, `hidden`)
SELECT `id`, 'album', '相册', 'image', '#5F8C93', 'CardFlow', 9, 0
FROM `user`
WHERE `status` = 1;
