// 创建数据表
module.exports.CREATE_Test = () => `CREATE TABLE IF NOT EXISTS dob_.Test (
id int(15) NOT NULL AUTO_INCREMENT COMMENT 'id',

update_time varchar(50) DEFAULT NULL COMMENT '更新时间',
create_time varchar(50) DEFAULT NULL COMMENT '创建时间',
PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=1000000000 DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ROW_FORMAT=DYNAMIC COMMENT='' CHECKSUM=0 DELAY_KEY_WRITE=0;`.replace(/[\r\n]/g, '')
