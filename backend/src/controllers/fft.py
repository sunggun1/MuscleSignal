import json
from flask import Flask, jsonify, request,Blueprint
import sys
import os
import jwt
from src.database import dbModule
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))

bp = Blueprint('fft', __name__, url_prefix='/fft')


@bp.route('/get',methods=['POST'])
def getAll():
    db_class = dbModule.Database()
    data = json.loads(request.get_data().decode('utf-8'))
    sql      = """SELECT * FROM mydb.fft Where muscleposition_id='%s'""" %(data["muscleposition_id"])
    row      = db_class.executeAll(sql)
    
    return jsonify({'position': row, 'result':'success'})
