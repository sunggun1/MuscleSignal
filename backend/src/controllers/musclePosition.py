import json
from multiprocessing.sharedctypes import Value
from flask import Flask, jsonify, request,Blueprint
import sys
import os
import jwt
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))


bp = Blueprint('musclePosition', __name__, url_prefix='/musclePosition')
from app import musclePosition,db
from sqlalchemy import and_

@bp.route('/get',methods=['POST'])
def getAll():
    data = json.loads(request.get_data().decode('utf-8'))
    token = jwt.decode(data['token'],os.environ.get("JWT_SECRET_KEY"),os.environ.get("JWT_ALGORITHM"))
    email = token['email']
    response = musclePosition.query.filter(email=email).all()
    return jsonify({'musclePosition': response, 'result':'success'})

@bp.route('/get/<string:id>',methods=['POST'])
def getById(id):
    data = json.loads(request.get_data().decode('utf-8'))
    response = musclePosition.query.filter(and_(user_id=data["user_id"],id=id)).all()
    return jsonify({'musclePosition': response, 'result':'success'})

@bp.route('/create',methods=['POST'])
def create():
    try:
        data = json.loads(request.get_data().decode('utf-8'))
        token = jwt.decode(data['token'],os.environ.get("JWT_SECRET_KEY"),os.environ.get("JWT_ALGORITHM"))
        email = token['email']

        findData = {}
        findData["positionName"] = data["positionName"]
        findData["email"] = email

        if(musclePosition.query.filter(and_(user_id=data["user_id"],id=id)).first()):
            return jsonify({'musclePosition': musclePosition.query.all(),'result': '이미 존재합니다.'})
        else:
            musclePosition_data = musclePosition(data["position_name"],data["user_id"])
            db.session.add(musclePosition_data)
            db.session.commit()
        return jsonify({'musclePosition': musclePosition.query.all(),'result': 'success'})
    except ValueError:
        return jsonify({'musclePosition': musclePosition.query.all(),'result': ValueError})

@bp.route('/delete/<string:id>',methods=['DELETE'])
def delete(id):
    try:
        musclePosition_data = musclePosition().query.filter(id=id).first()
        db.session.delete(musclePosition_data)
        db.session.commit()
        return jsonify({'musclePosition': musclePosition.query.all(),'result': 'success'})
    except ValueError:
        return jsonify({'musclePosition': musclePosition.query.all(),'result': ValueError})



