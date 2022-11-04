import json
from flask import Flask, jsonify, request,Blueprint
import sys
import os
from src.database import dbModule
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))

bp = Blueprint('musclePosition', __name__, url_prefix='/musclePosition')

def getAllMusclePosition():
    db_class = dbModule.Database()
    sql      = """SELECT * FROM mydb.muscle_position """
    row      = db_class.executeAll(sql)
    return row

def getOneMusclePositionByName(positionName):
    db_class = dbModule.Database()
    sql      = """SELECT * FROM mydb.muscle_position where positionName = '%s'""" %(positionName)
    row      = db_class.executeOne(sql)
    return row

@bp.route('/getAll',methods=['GET'])
def getAll():
    return jsonify({'position' : getAllMusclePosition(),'result' : 'success'})

@bp.route('/get/<string:positionName>',methods=['GET'])
def getOne(positionName):
    try:
        db_class = dbModule.Database()
        sql      = """SELECT * FROM mydb.muscle_position where positionName = '%s'""" %(positionName)
        row      = db_class.executeAll(sql)
        
        return jsonify({'position' : row,'result' : 'success'})
    except ValueError:
        return jsonify({'position' : row,'result' : ValueError})

@bp.route('/create',methods=['GET','POST'])
def create():
    try:
        data = json.loads(request.get_data().decode('utf-8'))
        db_class = dbModule.Database()

        sql = "SELECT * FROM mydb.muscle_position WHERE positionName = '%s'" %(data['positionName'])
        row = db_class.executeAll(sql)
        if len(row) <= 0 :
            sql = "INSERT INTO mydb.muscle_position(positionName) VALUES('%s')" % (data["positionName"])
            db_class.execute(sql)
            db_class.commit()
        else:
            raise Exception("이미 만들어져있습니다.")

        return jsonify({'position': getAllMusclePosition(),'result': 'success'})
    except ValueError:
        return jsonify({'position': getAllMusclePosition(),'result': ValueError})

@bp.route('/delete',methods=['DELETE'])
def deleteAll():
    try:
        data = json.loads(request.get_data().decode('utf-8'))
        db_class = dbModule.Database()
        sql = "DELETE FROM mydb.muscle_position WHERE positionName = '%s'" %(data['positionName'])
        db_class.execute(sql)
        db_class.commit()
        return jsonify({'position': getAllMusclePosition(),'result': 'success'})
    except ValueError:
        return jsonify({'position': getAllMusclePosition(),'result': ValueError})