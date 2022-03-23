import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from routes.config import Config
from models.connectDB import DBModel

# 連線到資料庫
config = Config()
config.get_env_config("../")
initDB_model = DBModel("mypool", 1, config.db_settings)
if not initDB_model.is_connected():
    print("connect database error")
    exit()

# 移除 tables、新增 table `user`
create_command = """
DROP TABLE IF EXISTS user;
CREATE TABLE user (
    id BIGINT AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);"""
result = initDB_model.create(create_command, True)
if result["status"] == "err":
    print("create table error: user")
    exit()

print("progress end")