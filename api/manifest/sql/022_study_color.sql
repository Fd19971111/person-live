-- 022_study_color.sql
-- 学习模块的默认金色饱和度偏高，统一替换为更柔和的靛蓝 #5F6E9C

UPDATE `study_course` SET `color` = '#5F6E9C'
WHERE `color` IN ('#D4A63D', '#d4a63d');

UPDATE `user_module` SET `color` = '#5F6E9C'
WHERE `module_key` = 'learning' AND `color` IN ('#D4A63D', '#d4a63d');
