ALTER TABLE `vmsback`.`work_question` CHANGE COLUMN `question` `question` TEXT NULL DEFAULT NULL ;
ALTER TABLE `vmsback`.`work_questionnaire` CHANGE COLUMN `question` `question` TEXT NULL DEFAULT NULL ;
ALTER TABLE `vmsback`.`work_application` DROP COLUMN `counter`;
