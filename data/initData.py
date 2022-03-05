import sys
sys.path.append("..")

import json
import connectDB

# 從檔案撈取資料
with open("taipei-attractions.json", mode="r") as file:
    attractions = json.load(file)["result"]["results"]

# 拆解資料
attraction_data = []
attraction_image = []
for index, attraction in enumerate(attractions):
    attraction_data.append({
        "name": attraction["stitle"],
        "category": attraction["CAT2"],
        "description": attraction["xbody"],
        "address": attraction["address"],
        "transport": attraction["info"],
        "mrt": attraction["MRT"],
        "latitude": attraction["latitude"],
        "longitude": attraction["longitude"],
        "memo_time": attraction["MEMO_TIME"],
    })
    # 將圖片網址資訊拆解，並保留格式為 jpg 和 png 的資料
    images = attraction["file"].split("https:")
    for image in images:
        if image.lower().endswith(".jpg") or image.lower().endswith(".png"):
            attraction_image.append({
                "name": attraction["stitle"],
                "image": "https:" + image
            })

# 連線到資料庫
conn_pool = connectDB.connect("../", "mypool", 1)
if not conn_pool:
    print("connect database error")
    exit()

# 移除 tables、新增 table `attraction`
create_command = """
DROP TABLE IF EXISTS attraction_image;
DROP TABLE IF EXISTS attraction;
CREATE TABLE attraction (
    id BIGINT AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,  # stitle
    category VARCHAR(255),       # CAT2
    description VARCHAR(2000),   # xbody
    address VARCHAR(255),        # address
    transport VARCHAR(500),      # info
    mrt VARCHAR(255),            # MRT
    latitude DOUBLE(10,6),       # latitude
    longitude DOUBLE(10,6),      # longitude
    memo_time VARCHAR(300),      # MEMO_TIME
    PRIMARY KEY (id)
);"""
result = connectDB.create(conn_pool, create_command, True)
if result["status"] == "err":
    print("create table error: attractions")
    exit()

# 新增 table `attraction_image`
create_command = """
CREATE TABLE attraction_image (
    id BIGINT AUTO_INCREMENT,
    attraction_id BIGINT NOT NULL,
    image VARCHAR(255) NOT NULL,  # file
    PRIMARY KEY(id),
	FOREIGN KEY (attraction_id) REFERENCES attraction(id) #ON DELETE CASCADE
);"""
result = connectDB.create(conn_pool, create_command)
if result["status"] == "err":
    print("create table error: attraction-images")
    exit()

# 資料寫入 table `attraction`
insert_command = "INSERT INTO attraction (" + ", ".join(attraction_data[0]) + ") VALUES (" + ", ".join(["%(" + k + ")s" for k in attraction_data[0].keys()]) + ")"
result = connectDB.insert(conn_pool, insert_command, attraction_data)
if result["status"] == "err":
    print("insert error: attraction")
    exit()

# 資料寫入 table `attraction_image`
insert_command = "INSERT INTO attraction_image (attraction_id, image) VALUES ((SELECT id FROM attraction WHERE name = %(name)s LIMIT 1), %(image)s)"
result = connectDB.insert(conn_pool, insert_command, attraction_image)
