from flask import Blueprint, request, jsonify
from config.database import mongo
from utils.jwt_utils import token_required
from bson import ObjectId
from datetime import datetime

skills_bp = Blueprint('skills', __name__)

@skills_bp.route('/transfer', methods=['POST'])
@token_required
def transfer_credits():
    data = request.get_json()
    to_id = data.get('to_user_id')
    amount = int(data.get('amount', 10))
    reason = data.get('reason', 'Skill exchange')
    
    me = mongo.db.users.find_one({'_id': ObjectId(request.user_id)})
    if me.get('skill_credits', 0) < amount:
        return jsonify({'error': 'Insufficient credits'}), 400
    
    mongo.db.users.update_one({'_id': ObjectId(request.user_id)}, {'$inc': {'skill_credits': -amount}})
    mongo.db.users.update_one({'_id': ObjectId(to_id)}, {'$inc': {'skill_credits': amount}})
    
    tx = {'from': request.user_id, 'to': to_id, 'amount': amount,
          'reason': reason, 'created_at': datetime.utcnow()}
    mongo.db.transactions.insert_one(tx)
    return jsonify({'message': 'Credits transferred', 'amount': amount}), 200

@skills_bp.route('/transactions', methods=['GET'])
@token_required
def get_transactions():
    txs = list(mongo.db.transactions.find({
        '$or': [{'from': request.user_id}, {'to': request.user_id}]
    }).sort('created_at', -1).limit(50))
    result = []
    for t in txs:
        direction = 'sent' if t['from'] == request.user_id else 'received'
        other_id = t['to'] if direction == 'sent' else t['from']
        other = mongo.db.users.find_one({'_id': ObjectId(other_id)})
        result.append({
            'id': str(t['_id']), 'direction': direction,
            'amount': t['amount'], 'reason': t.get('reason',''),
            'other_user': other.get('name','Unknown') if other else 'Unknown',
            'created_at': str(t['created_at'])
        })
    return jsonify(result), 200

@skills_bp.route('/all', methods=['GET'])
@token_required
def get_all_skills():
    pipeline = [
        {'$unwind': '$skills_have'},
        {'$group': {'_id': '$skills_have', 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}}
    ]
    skills = list(mongo.db.users.aggregate(pipeline))
    return jsonify([{'skill': s['_id'], 'count': s['count']} for s in skills]), 200
