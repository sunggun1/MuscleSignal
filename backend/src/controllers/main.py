from flask import Blueprint
import sys
import os
from src.database import dbModule

bp = Blueprint('home', __name__, url_prefix='/')
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))


@bp.route('/',methods=['GET'])
def index():
    db_class = dbModule.Database()
    db_class.createTable()
    return 'hi'
