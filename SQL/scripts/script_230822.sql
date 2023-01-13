ALTER TABLE `vmsback`.`squad` ADD UNIQUE (`squad_name`);
ALTER TABLE `vmsback`.`squad` RENAME COLUMN `behance` TO `stack_overflow`;
ALTER TABLE `vmsback`.`squad` RENAME COLUMN `pinterest` TO `discord`;
ALTER TABLE `vmsback`.`user_experience` CHANGE COLUMN `description` `description` TEXT NULL DEFAULT NULL ;
ALTER TABLE `vmsback`.`user_education` CHANGE COLUMN `description` `description` TEXT NULL DEFAULT NULL ;
ALTER TABLE `vmsback`.`user_license` CHANGE COLUMN `description` `description` TEXT NULL DEFAULT NULL ;


CREATE TABLE squad_client_image(
    imgid VARCHAR(200),
    client_id VARCHAR(200),
    imgname VARCHAR(200),
    imgurl  VARCHAR(200),
    imgrotation FLOAT,
    imgposition1 FLOAT,
    imgposition2 FLOAT,
    imgscale FLOAT,
    imgrotationfocuspoint1 FLOAT,
    imgrotationfocuspoint2 FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (imgid)
)