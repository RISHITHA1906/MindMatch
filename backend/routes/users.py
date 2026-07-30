from flask import Blueprint, request, jsonify
from config.database import mongo
from utils.jwt_utils import token_required
from bson import ObjectId
from datetime import datetime
import base64, os

users_bp = Blueprint('users', __name__)

def _fmt(user):
    return {
        'id': str(user['_id']),
        'name': user.get('name',''), 'email': user.get('email',''),
        'subjects': user.get('subjects',[]), 'skills_have': user.get('skills_have',[]),
        'skills_want': user.get('skills_want',[]), 'availability': user.get('availability',[]),
        'preparation_level': user.get('preparation_level','Beginner'),
        'bio': user.get('bio',''), 'avatar': user.get('avatar',''),
        'college': user.get('college',''), 'year': user.get('year',''),
        'skill_credits': user.get('skill_credits',100),
        'reputation_score': user.get('reputation_score',0),
        'total_sessions': user.get('total_sessions',0),
        'is_mentor': user.get('is_mentor',False), 'mentor_tag': user.get('mentor_tag',False),
        'online': user.get('online',False), 'last_seen': str(user.get('last_seen','')),
        'created_at': str(user.get('created_at',''))
    }

@users_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    data = request.get_json()
    allowed = ['name','bio','subjects','skills_have','skills_want','availability',
               'preparation_level','college','year','avatar']
    update = {k: data[k] for k in allowed if k in data}
    update['updated_at'] = datetime.utcnow()
    mongo.db.users.update_one({'_id': ObjectId(request.user_id)}, {'$set': update})
    user = mongo.db.users.find_one({'_id': ObjectId(request.user_id)})
    return jsonify(_fmt(user)), 200

@users_bp.route('/<user_id>', methods=['GET'])
@token_required
def get_user(user_id):
    user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    if not user:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(_fmt(user)), 200

@users_bp.route('/search', methods=['GET'])
@token_required
def search_users():
    q = request.args.get('q', '')
    users = list(mongo.db.users.find({
        '$or': [
            {'name': {'$regex': q, '$options': 'i'}},
            {'subjects': {'$regex': q, '$options': 'i'}},
            {'skills_have': {'$regex': q, '$options': 'i'}}
        ]
    }).limit(20))
    return jsonify([_fmt(u) for u in users if str(u['_id']) != request.user_id]), 200

@users_bp.route('/rate/<user_id>', methods=['POST'])
@token_required
def rate_user(user_id):
    data = request.get_json()
    rating = data.get('rating', 5)
    review = data.get('review', '')
    rating_doc = {
        'from_user': request.user_id,
        'rating': rating,
        'review': review,
        'created_at': datetime.utcnow()
    }
    mongo.db.users.update_one({'_id': ObjectId(user_id)}, {'$push': {'ratings_received': rating_doc}})
    # Update reputation score
    user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    ratings = [r['rating'] for r in user.get('ratings_received', [])]
    avg = sum(ratings)/len(ratings) if ratings else 0
    mentor_tag = avg >= 4.5 and len(ratings) >= 5
    mongo.db.users.update_one({'_id': ObjectId(user_id)}, {
        '$set': {'reputation_score': round(avg, 2), 'mentor_tag': mentor_tag}
    })
    return jsonify({'message': 'Rating submitted'}), 200
