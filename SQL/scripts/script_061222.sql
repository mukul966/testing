ALTER TABLE `vmsback`.`invoice` CHANGE COLUMN `project_id` `work_id` VARCHAR(200) NULL DEFAULT NULL ;
ALTER TABLE `vmsback`.`invoice` CHANGE COLUMN `invoice_type` `invoice_type` INT NULL DEFAULT NULL ;
