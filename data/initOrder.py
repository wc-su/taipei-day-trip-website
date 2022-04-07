import sys
sys.path.append("../")

from routes.config import Config
from models.connectDB import DBModel

# 連線到資料庫
config = Config(12)
config.get_env_config("../")
initDB_model = DBModel("mypool", 1, config.db_settings)
if not initDB_model.is_connected():
    print("connect database error")
    exit()

# 移除 tables、新增 table `order`、order_status
create_command = """
DROP TABLE IF EXISTS `order_status`;
DROP TABLE IF EXISTS `order`;
CREATE TABLE `order` (
    number VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL,
    price INT NOT NULL,
    attraction_id BIGINT,
    attraction_name VARCHAR(255) NOT NULL,
    attraction_address VARCHAR(255) NOT NULL,
    attraction_image VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(255) NOT NULL,
    PRIMARY KEY (number),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (attraction_id) REFERENCES attraction(id) ON DELETE SET NULL
);
CREATE TABLE `order_status` (
    number VARCHAR(255) NOT NULL,
    status INT NOT NULL DEFAULT 1,
    PRIMARY KEY (number),
    FOREIGN KEY (number) REFERENCES `order`(number) ON DELETE CASCADE
);"""
result = initDB_model.create(create_command, True)
if result["status"] == "err":
    print("create table error: order")
    exit()

print("progress end")