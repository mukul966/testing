ALTER TABLE `vmsback`.`squad_client` CHANGE COLUMN `image_id` `imgurl` VARCHAR(200) NULL DEFAULT NULL ;
ALTER TABLE `vmsback`.`squad_request_external` ADD COLUMN `request_status` VARCHAR(200) NULL DEFAULT NULL AFTER `isValid`;
