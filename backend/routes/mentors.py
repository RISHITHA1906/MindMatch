from flask import Blueprint, request, jsonify
from config.database import mongo
from utils.jwt_utils import token_required

mentors_bp = Blueprint('mentors', __name__)

@mentors_bp.route('/', methods=['GET'])
@token_required
def get_mentors():
    mentors = list(mongo.db.users.find({'mentor_tag': True}).sort('reputation_score', -1))
    return jsonify([{
        'id': str(m['_id']), 'name': m.get('name',''), 'avatar': m.get('avatar',''),
        'subjects': m.get('subjects',[]), 'skills_have': m.get('skills_have',[]),
        'reputation_score': m.get('reputation_score',0),
        'total_sessions': m.get('total_sessions',0),
        'bio': m.get('bio',''), 'college': m.get('college','')
    } for m in mentors]), 200
