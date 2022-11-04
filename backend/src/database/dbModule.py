import pymysql

class Database():
    def __init__(self):
        self.db = pymysql.connect(host='terraform-20221103031822744200000001.cj4hsozsjwj8.ap-northeast-2.rds.amazonaws.com',
                                  user='admin',
                                  password='password',
                                  db='mydb',
                                  port = 3306,
                                  charset='utf8')
        self.cursor = self.db.cursor(pymysql.cursors.DictCursor)

    def execute(self, query, args={}):
        self.cursor.execute(query, args)  
 
    def executeOne(self, query, args={}):
        self.cursor.execute(query, args)
        row = self.cursor.fetchone()
        return row
 
    def executeAll(self, query, args={}):
        self.cursor.execute(query, args)
        row = self.cursor.fetchall()
        return row
 
    def commit(self):
        self.db.commit()

    def createTable(self):
        try:
            with self.cursor as cursor:
                print("init muscle_position table")
                sql = """
                    CREATE TABLE IF NOT EXISTS muscle_position(
                        id  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        positionName VARCHAR(256) NOT NULL,
                        created DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP)
                    );
                """
                cursor.execute(sql)
                self.db.commit()
                sql = """
                    CREATE TABLE IF NOT EXISTS muscle(
                        id  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        musclePositionId BIGINT UNSIGNED NOT NULL,
                        power INTEGER NOT NULL,
                        created DATETIME(6) NOT NULL,
                        FOREIGN KEY(musclePositionId) REFERENCES muscle_position(id)
                    );
                """
                cursor.execute(sql)
                self.db.commit() 

                sql = """
                    CREATE TABLE IF NOT EXISTS fft(
                        id  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        musclePositionId BIGINT UNSIGNED NOT NULL,
                        power FLOAT NOT NULL,
                        created DATETIME(6) NOT NULL,
                        arrIndex INT NOT NULL,
                        arrInsideIndex INT NOT NULL,
                        isFrequency INT NOT NULL,
                        FOREIGN KEY(musclePositionId) REFERENCES muscle_position(id)
                    );
                """
                cursor.execute(sql)
                self.db.commit()      
        finally:
            self.db.close()
