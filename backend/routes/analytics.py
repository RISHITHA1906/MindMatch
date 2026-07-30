from flask import Blueprint, request, jsonify
from config.database import mongo
from utils.jwt_utils import token_required
from bson import ObjectId

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/dashboard', methods=['GET'])
@token_required
def dashboard():
    uid = request.user_id
    total_users = mongo.db.users.count_documents({})
    total_sessions = mongo.db.sessions.count_documents({'$or': [{'host_id': uid},{'partner_id': uid}]})
    my_credits = mongo.db.users.find_one({'_id': ObjectId(uid)})
    top_skills = list(mongo.db.users.aggregate([
        {'$unwind': '$skills_have'},
        {'$group': {'_id': '$skills_have', 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}}, {'$limit': 10}
    ]))
    return jsonify({
        'total_users': total_users,
        'my_sessions': total_sessions,
        'skill_credits': my_credits.get('skill_credits', 100) if my_credits else 100,
        'top_skills': [{'skill': s['_id'], 'count': s['count']} for s in top_skills],
        'reputation': my_credits.get('reputation_score', 0) if my_credits else 0
    }), 200
