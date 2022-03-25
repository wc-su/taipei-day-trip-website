from models.connectDB import DB_model

class AttractionMouel:
    def __init__(self, DB_model):
        self.DB_model = DB_model

    # 取得多筆景點資訊
    def get_attractions(self, page, keyword, dataCount):
        # 計算起始索引
        startIndex = int(page) * dataCount
        # sql 語法
        query_command_list = []
        query_command_list.append("""
            SELECT
                attraction.id AS id, name, category, description, address, transport, mrt, latitude, longitude,
                GROUP_CONCAT(attraction_image.image) AS images
            FROM attraction
            LEFT JOIN attraction_image ON attraction_image.attraction_id = attraction.id
        """)
        if keyword:
            query_command_list.append("WHERE attraction.name REGEXP %(keyword)s")
        query_command_list.append("GROUP BY attraction.id")
        # 多取 1 筆，判斷是否有下一頁
        query_command_list.append("LIMIT %(index)s, %(dataCount)s;")
        return self.DB_model.query(
            " ".join(query_command_list),
            { "keyword": keyword, "index": startIndex, "dataCount": dataCount + 1 },
            "all", True
        )

    # 取得特定 id 景點資訊
    def get_attraction(self, id):
        query_command = """
            SET SESSION GROUP_CONCAT_MAX_LEN = 2500;
            SELECT 
                attraction.id AS id, name, category, description, address, transport, mrt, latitude, longitude, 
                GROUP_CONCAT(attraction_image.image) AS images 
            FROM attraction 
            LEFT JOIN attraction_image ON attraction_image.attraction_id = attraction.id 
            WHERE attraction.id = %(id)s 
            GROUP BY attraction.id;
        """
        return self.DB_model.query(
            query_command,
            { "id":id },
            "one", True
        )

attraction_model = AttractionMouel(DB_model)