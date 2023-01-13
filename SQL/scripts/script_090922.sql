DROP TABLE `vmsback`.`squad_member_request_ext`
DROP TABLE `vmsback`.`userprof_abme`
DROP TABLE `vmsback`.`user_proj_list`
DROP TABLE `vmsback`.`user_prof_info`;
ALTER TABLE `vmsback`.`squad_client` CHANGE COLUMN `imgurl` `imgid` VARCHAR(200) NULL DEFAULT NULL ;
ALTER TABLE `vmsback`.`squad` ADD COLUMN `squad_completion` VARCHAR(200) NULL DEFAULT NULL AFTER `website`;

-- CREATE TABLE: squad_temp_image
CREATE TABLE squad_temp_image(
    temp_id VARCHAR(200),
    user_id VARCHAR(200),
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
    PRIMARY KEY (temp_id)
)