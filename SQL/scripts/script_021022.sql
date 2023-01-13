ALTER TABLE `vmsback`.`work` DROP COLUMN `sharing_status`;
ALTER TABLE `vmsback`.`work` CHANGE COLUMN `start_date` `start_date` DATE NULL DEFAULT NULL , CHANGE COLUMN `end_date` `end_date` DATE NULL DEFAULT NULL ;
ALTER TABLE `vmsback`.`work_questionnaire` DROP COLUMN `option_4`, DROP COLUMN `option_3`, DROP COLUMN `option_2`, DROP COLUMN `option_1`, ADD COLUMN `options` VARCHAR(500) NULL DEFAULT NULL AFTER `type`;
ALTER TABLE `vmsback`.`work_questionnaire` DROP COLUMN `answer`;
ALTER TABLE `vmsback`.`work` CHANGE COLUMN `work_details` `description` TEXT NULL DEFAULT NULL ;

CREATE TABLE work_questionnaire(
	questionnaire_id VARCHAR(200),
    work_id VARCHAR(200),
    question VARCHAR(500),
    type VARCHAR(200),
    options VARCHAR(500),
	PRIMARY KEY (questionnaire_id)
)