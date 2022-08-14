import json
from multiprocessing.sharedctypes import Value
from flask import Flask, jsonify, request,Blueprint
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))

from models import muscle  # call model file

bp = Blueprint('muscle', __name__, url_prefix='/muscle')

muscle = muscle.Muscle()

@bp.route('/get',methods=['POST'])
def getAll():
    data = json.loads(request.get_data().decode('utf-8'))
    response = muscle.find({data})
    return jsonify({'position': response, 'result':'success'})

@bp.route('/get/<string:id>',methods=['GET'])
def getById(id):
    response = muscle.find_by_id(id)
    return jsonify({'position': response, 'result':'success'})

@bp.route('/create',methods=['POST'])
def create():
    try:
        data = json.loads(request.get_data().decode('utf-8'))
        muscle.create(data)
        return jsonify({'position': muscle.find({}),'result': 'success'})
    except ValueError:
        return jsonify({'position': muscle.find({}),'result': ValueError})

@bp.route('/delete/<string:id>',methods=['DELETE'])
def delete(id):
    try:
        muscle.delete(id)
        return jsonify({'position': muscle.find({}),'result': 'success'})
    except ValueError:
        return jsonify({'position': muscle.find({}),'result': ValueError})



