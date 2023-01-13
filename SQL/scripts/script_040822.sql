DROP TABLE work_questionnaire
DROP TABLE card_order
ALTER TABLE `vmsback`.`work_question` ADD COLUMN `options` VARCHAR(200) NULL DEFAULT NULL AFTER `question_type`;
ALTER TABLE `vmsback`.`work` DROP COLUMN `sharing`, DROP COLUMN `work_status`;
ALTER TABLE `vmsback`.`work` ADD COLUMN `description` VARCHAR(200) NULL DEFAULT NULL AFTER `work_title`;