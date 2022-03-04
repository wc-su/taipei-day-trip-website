from mysql.connector import pooling
from dotenv import dotenv_values

# 資料庫參數設定
def config(path):
    config = dotenv_values(path + ".env")
    db_settings = {
        "host": config["DBHOST"],
        "port": config["DBPORT"],
        "user": config["DBUSER"],
        "password": config["DBPASSWORD"],
        "database": config["DBDATABASE"],
        "charset": "utf8"
    }
    return db_settings

def connect(env_path, pool_name, pool_size):
    db_settings = config(env_path)
    try:
        # 建立Connection物件
        conn_pool = pooling.MySQLConnectionPool(pool_name = pool_name,
                                            pool_size = pool_size,
                                            **db_settings)
        return conn_pool
    except Exception as ex:
        print("*** mysql connect error", ex)
        return None

def create(conn_pool, command, multi_command=False):
    reponse = { "status": "err" }
    try:
        conn_obj = conn_pool.get_connection()
        cursor = conn_obj.cursor()
        if multi_command:
            results = cursor.execute(command, multi=multi_command)
            for cur in results:
                pass
                # if cur.with_rows:
                #     print('result-1:', cur.fetchall())
                # else:
                #     # print('result-2:', cur.statement, cur.rowcount)
        else:
            results = cursor.execute(command)

        reponse["status"] = "ok"

        conn_obj.commit()
    except Exception as ex:
        print("*** mysql create error", ex)
    finally:
        if conn_obj.is_connected():
            cursor.close()
            conn_obj.close()

    return reponse

def insert(conn_pool, command, data):
    reponse = { "status": "err" }
    try:
        conn_obj = conn_pool.get_connection()
        cursor = conn_obj.cursor()
        for item in data:
            cursor.execute(command, item)

        reponse["status"] = "ok"

        conn_obj.commit()
    except Exception as ex:
        print("*** mysql create error", ex)
    finally:
        if conn_obj.is_connected():
            cursor.close()
            conn_obj.close()

    return reponse

def query(conn_pool, command, data, mode, size):
    reponse = { "status": "err", "count": 0, "data": None }

    try:
        conn_obj = conn_pool.get_connection()
        cursor = conn_obj.cursor()
        cursor.execute(command, data)

        if mode == "one":
            result = cursor.fetchone()
        elif mode == "many":
            result = cursor.fetchmany(size)
        else:
            result = cursor.fetchall()
        
        count = cursor.rowcount

        reponse["status"] = "ok"
        reponse["data"] = result
        reponse["count"] = count

        conn_obj.commit()
    except Exception as ex:
        print("*** mysql query error", ex)
    finally:
        if conn_obj.is_connected():
            cursor.close()
            conn_obj.close()

    return reponse

def update(conn_pool, command, data):
    reponse = { "status": "err", "count": 0 }

    try:
        conn_obj = conn_pool.get_connection()
        cursor = conn_obj.cursor()
        cursor.execute(command, data)

        reponse["status"] = "ok"
        reponse["count"] = cursor.rowcount

        conn_obj.commit()
    except Exception as ex:
        conn_obj.rollback()
        print("*** mysql update error", ex)
    finally:
        if conn_obj.is_connected():
            cursor.close()
            conn_obj.close()

    return reponse