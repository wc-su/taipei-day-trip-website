from mysql.connector import pooling
from dotenv import dotenv_values

class DBModel:
    def __init__(self, env_path, pool_name, pool_size):
        self.conn_pool = self.connect(env_path, pool_name, pool_size)
        self.response = { "status": "err", "count": 0, "data": None }

    # 資料庫參數設定
    def config(self, path):
        config = dotenv_values(path + ".env")
        try:
            db_settings = {
                "pool_reset_session": True,
                "host": config["DBHOST"],
                "port": config["DBPORT"],
                "user": config["DBUSER"],
                "password": config["DBPASSWORD"],
                "database": config["DBDATABASE"],
                "charset": "utf8"
            }
            return db_settings
        except Exception as e:
            return None

    def connect(self, env_path, pool_name, pool_size):
        db_settings = self.config(env_path)
        try:
            # 建立Connection物件
            return pooling.MySQLConnectionPool(pool_name = pool_name,
                                                pool_size = pool_size,
                                                **db_settings)
        except Exception as ex:
            print("*** mysql connect error", ex)
            return None

    def is_connected(self):
        return self.conn_pool

    def create(self, command, multi_command=False):
        try:
            conn_obj = self.conn_pool.get_connection()
            cursor = conn_obj.cursor()
            if multi_command:
                results = cursor.execute(command, multi=multi_command)
                for cur in results:
                    pass
            else:
                results = cursor.execute(command)

            self.response["status"] = "ok"

            conn_obj.commit()
        except Exception as ex:
            print("*** mysql create error", ex)
        finally:
            if conn_obj.is_connected():
                cursor.close()
                conn_obj.close()

        return self.response

    def insert(self, command, data):
        try:
            conn_obj = self.conn_pool.get_connection()
            cursor = conn_obj.cursor()
            for item in data:
                cursor.execute(command, item)

            self.response["status"] = "ok"

            conn_obj.commit()
        except Exception as ex:
            print("*** mysql create error", ex)
        finally:
            if conn_obj.is_connected():
                cursor.close()
                conn_obj.close()

        return self.response

    def query(self, command, data, mode, multi_command=False):
        try:
            conn_obj = self.conn_pool.get_connection()
            cursor = conn_obj.cursor()
            results = cursor.execute(command, data, multi=multi_command)
            
            for cur in results:
                if cur.with_rows:
                    if mode == "one":
                        result = cur.fetchone()
                    else:
                        result = cur.fetchall()
                    count = cur.rowcount
                else:
                    pass

            self.response["status"] = "ok"
            self.response["data"] = result
            self.response["count"] = count

            conn_obj.commit()
        except Exception as ex:
            print("*** mysql query error", ex)
        finally:
            if conn_obj.is_connected():
                cursor.close()
                conn_obj.close()

        return self.response

    def update(self, command, data):
        try:
            conn_obj = self.conn_pool.get_connection()
            cursor = conn_obj.cursor()
            cursor.execute(command, data)

            self.response["status"] = "ok"
            self.response["count"] = cursor.rowcount

            conn_obj.commit()
        except Exception as ex:
            conn_obj.rollback()
            print("*** mysql update error", ex)
        finally:
            if conn_obj.is_connected():
                cursor.close()
                conn_obj.close()

        return self.response