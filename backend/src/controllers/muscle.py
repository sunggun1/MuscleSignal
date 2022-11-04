import json
from flask import Flask, jsonify, request,Blueprint
import sys
import os
from src.database import dbModule
from src.controllers.musclePosition import getOneMusclePositionByName
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))

bp = Blueprint('muscle', __name__, url_prefix='/muscle')


def getAllMuscleByName(positionName):
    db_class = dbModule.Database()
    musclePosition = getOneMusclePositionByName(positionName)
    sql      = "SELECT * FROM mydb.muscle where musclePositionId='%s'" %(musclePosition["id"])
    row      = db_class.executeAll(sql)
    return row

def getAllMuscleById(musclePositionId):
    db_class = dbModule.Database()
    sql      = "SELECT * FROM mydb.muscle Where musclePositionId='%s'" %(musclePositionId)
    row      = db_class.executeAll(sql)
    return row

@bp.route('/<int:musclePositionId>',methods=['GET'])
def getAll(musclePositionId):
    db_class = dbModule.Database()
    sql      = "SELECT * FROM mydb.muscle Where musclePositionId='%s'" %(musclePositionId)
    row      = db_class.executeAll(sql)
    
    return jsonify({'position': row, 'result':'success'})

@bp.route('/create',methods=['POST'])
def create():
    try:
        data = request.get_json()
        db_class = dbModule.Database()
        musclePosition = []
        if data['positionName']:
            musclePosition = getOneMusclePositionByName(data['positionName'])

        if data['muscleArrays'] and musclePosition:
            for val in data['muscleArrays']:
                sql      = "INSERT INTO mydb.muscle(musclePositionId,power,created) \
                        VALUES('%s','%s','%s')" % (musclePosition["id"],val["power"],val["created"])
                db_class.execute(sql)
                db_class.commit()
        return jsonify({'position': getAllMuscleByName(data['positionName']),'result': 'success'})
    except ValueError:
        return jsonify({'position': getAllMuscleByName(data['positionName']),'result': ValueError})

@bp.route('/delete',methods=['DELETE'])
def deleteAll():
    try:
        data = request.get_json()
        musclePosition = getOneMusclePositionByName(data['positionName'])
        db_class = dbModule.Database()
        sql = "DELETE FROM mydb.muscle WHERE musclePositionId = '%s'" %(musclePosition['id'])
        db_class.execute(sql)
        db_class.commit()
        return jsonify({'position': getAllMuscleByName(data['positionName']),'result': 'success'})
    except ValueError:
        return jsonify({'position': getAllMuscleByName(data['positionName']),'result': ValueError})
