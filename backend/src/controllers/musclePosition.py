import json
from multiprocessing.sharedctypes import Value
from flask import Flask, jsonify, request,Blueprint
import sys
import os
import jwt
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))

from models import musclePosition  # call model file

bp = Blueprint('musclePosition', __name__, url_prefix='/musclePosition')

musclePosition = musclePosition.MusclePosition()

@bp.route('/get',methods=['POST'])
def getAll():
    data = json.loads(request.get_data().decode('utf-8'))
    token = jwt.decode(data['token'],os.environ.get("JWT_SECRET_KEY"),os.environ.get("JWT_ALGORITHM"))
    email = token['email']
    response = musclePosition.find({"email": email})
    return jsonify({'musclePosition': response, 'result':'success'})

@bp.route('/get/<string:id>',methods=['POST'])
def getById(id):
    data = json.loads(request.get_data().decode('utf-8'))
    response = musclePosition.find({"email":data["email"],"_id":id})
    return jsonify({'musclePosition': response, 'result':'success'})

@bp.route('/create',methods=['POST'])
def create():
    try:
        data = json.loads(request.get_data().decode('utf-8'))
        token = jwt.decode(data['token'],os.environ.get("JWT_SECRET_KEY"),os.environ.get("JWT_ALGORITHM"))
        email = token['email']

        musclePosition.validateCollection()

        findData = {}
        findData["positionName"] = data["positionName"]
        findData["email"] = email

        if(musclePosition.find(findData)):
            return jsonify({'musclePosition': musclePosition.find({}),'result': '이미 존재합니다.'})
        else:
            musclePosition.create(findData)    
        return jsonify({'musclePosition': musclePosition.find({}),'result': 'success'})
    except ValueError:
        return jsonify({'musclePosition': musclePosition.find({}),'result': ValueError})

@bp.route('/delete/<string:id>',methods=['DELETE'])
def delete(id):
    try:
        if(musclePosition.delete(id)):
            return jsonify({'musclePosition': musclePosition.find({}),'result': 'success'})
        else:
            return jsonify({'musclePosition': musclePosition.find({}),'result': 'fail'})
    except ValueError:
        return jsonify({'musclePosition': musclePosition.find({}),'result': ValueError})



