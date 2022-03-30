import sys
sys.path.append("../")

from routes.config import Config
from models.connectDB import DBModel

# 連線到資料庫
config = Config()
config.get_env_config("../")
initDB_model = DBModel("mypool", 1, config.db_settings)
if not initDB_model.is_connected():
    print("connect database error")
    exit()

# 移除 tables、新增 table `booking`
create_command = """
DROP TABLE IF EXISTS booking;
CREATE TABLE booking (
    id BIGINT AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    attraction_id BIGINT NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(255) NOT NULL,
    price INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (attraction_id) REFERENCES attraction(id) ON DELETE CASCADE
);"""
result = initDB_model.create(create_command, True)
if result["status"] == "err":
    print("create table error: booking")
    exit()

print("progress end")