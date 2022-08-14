from flask import Blueprint

bp = Blueprint('home', __name__, url_prefix='/')

@bp.route('/',methods=['GET'])
def index():
    return 'hi'
