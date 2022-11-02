import json
from flask import Flask, jsonify, request,Blueprint
import sys
import os
from src.database import dbModule

sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))

bp = Blueprint('muscle', __name__, url_prefix='/muscle')


@bp.route('/get',methods=['POST'])
#SELECT muscle 함수 
def getAll():
    db_class = dbModule.Database()
    data = json.loads(request.get_data().decode('utf-8'))
    sql      = """SELECT * FROM mydb.muscle Where muscleposition_id='%s' and user_id='%s'""" %(data["muscleposition_id"],data["user_id"])
    row      = db_class.executeAll(sql)
    
    return jsonify({'position': row, 'result':'success'})

@bp.route('/create',methods=['POST'])
def create():
    try:
        data = json.loads(request.get_data().decode('utf-8'))
        db_class = dbModule.Database()
        sql      = "INSERT INTO mydb.muscle(power,time,muscleposition_id,user_id) \
                VALUES('%s','%s','%s','%s')" % (data["power"],data["time"],data["muscleposition_id"],data["user_id"])
        db_class.execute(sql)
        db_class.commit()
        return jsonify({'position': getAll(),'result': 'success'})
    except ValueError:
        return jsonify({'position': getAll(),'result': ValueError})

@bp.route('/delete/<string:musclePositionId>',methods=['DELETE'])
def deleteAll(musclePositionId):
    try:
        db_class = dbModule.Database()
        sql = "DELETE FROM mydb.muscle WHERE muscleposition_id = ('%s')" %(musclePositionId)
        db_class.execute(sql)
        db_class.commit()
        return jsonify({'position': getAll(),'result': 'success'})
    except ValueError:
        return jsonify({'position': getAll(),'result': ValueError})
