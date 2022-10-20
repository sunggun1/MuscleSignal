import json
from multiprocessing.sharedctypes import Value
from flask import Flask, jsonify, request,Blueprint
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))

from app import muscle,db  # call model file
from sqlalchemy import and_

bp = Blueprint('muscle', __name__, url_prefix='/muscle')


@bp.route('/get',methods=['POST'])
def getAll():
    data = json.loads(request.get_data().decode('utf-8'))
    response = muscle.query.filter(and_(muscleposition_id=data["muscleposition_id"], user_id=data["user_id"])).all()
    return jsonify({'position': response, 'result':'success'})

@bp.route('/get/<string:id>',methods=['GET'])
def getById(id):
    response = muscle.query.filter(id=id).all()
    return jsonify({'position': response, 'result':'success'})

@bp.route('/create',methods=['POST'])
def create():
    try:
        data = json.loads(request.get_data().decode('utf-8'))
        muscle_data = muscle(data["power"],data["time"],data["muscleposition_id"],data["user_id"])
        db.session.add(muscle_data)
        db.session.commit()
        return jsonify({'position': muscle.query.filter(and_(muscle.muscleposition_id== data["muscleposition_id"], muscle.user_id==data["user_id"])).all(),'result': 'success'})
    except ValueError:
        return jsonify({'position': muscle.query.filter(and_(muscle.muscleposition_id== data["muscleposition_id"], muscle.user_id==data["user_id"])).all(),'result': ValueError})

@bp.route('/delete/<string:id>',methods=['DELETE'])
def delete(id):
    try:
        muscle_data = muscle.query.filter_by(id=id).first()
        db.session.delete(muscle_data)
        db.session.commit()
        return jsonify({'position': muscle.query.all(),'result': 'success'})
    except ValueError:
        return jsonify({'position': muscle.query.all(),'result': ValueError})



