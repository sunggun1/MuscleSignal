import json
from flask import Flask, jsonify, request,Blueprint
import sys
import os
import jwt
from src.database import dbModule
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))

bp = Blueprint('musclePosition', __name__, url_prefix='/musclePosition')

@bp.route('/get',methods=['POST'])
def getAll():
    db_class = dbModule.Database()
    data = json.loads(request.get_data().decode('utf-8'))
    sql      = """SELECT * FROM mydb.musclePosition Where muscleposition_id='%s'""" %(data["muscleposition_id"])
    row      = db_class.executeAll(sql)
    
    return jsonify({'position': row, 'result':'success'})

@bp.route('/create',methods=['POST'])
def create():
    try:
        data = json.loads(request.get_data().decode('utf-8'))
        db_class = dbModule.Database()

        findData = {}
        findData["positionName"] = data["positionName"]

        sql = "INSERT INTO mydb.musclePosition(power,time,muscleposition_id,user_id) \
                VALUES('%s','%s','%s','%s')" % (data["position_name"])
        db_class.execute(sql)
        db_class.commit()
        return jsonify({'position': getAll(),'result': 'success'})
    except ValueError:
        return jsonify({'position': getAll(),'result': ValueError})

@bp.route('/delete/<string:musclePositionId>',methods=['DELETE'])
def deleteAll(musclePositionId):
    try:
        db_class = dbModule.Database()
        sql = "DELETE FROM mydb.musclePosition WHERE muscleposition_id = ('%s')" %(musclePositionId)
        db_class.execute(sql)
        db_class.commit()
        return jsonify({'position': getAll(),'result': 'success'})
    except ValueError:
        return jsonify({'position': getAll(),'result': ValueError})