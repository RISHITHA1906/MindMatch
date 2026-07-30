from flask import Blueprint, request, jsonify
from config.database import mongo
from utils.jwt_utils import token_required
from ai.matching_engine import compute_match_score, get_match_reasons, recommend_skills_for_user
from bson import ObjectId

matching_bp = Blueprint('matching', __name__)

def _fmt(user):
    return {
        'id': str(user['_id']),
        'name': user.get('name', ''),
        'bio': user.get('bio', ''),
        'avatar': user.get('avatar', ''),
        'college': user.get('college', ''),
        'year': user.get('year', ''),
        'subjects': user.get('subjects', []),
        'skills_have': user.get('skills_have', []),
        'skills_want': user.get('skills_want', []),
        'subjectDetails': user.get('subjectDetails', []),
        'teachSubjectDetails': user.get('teachSubjectDetails', []),
        'learnSubjectDetails': user.get('learnSubjectDetails', []),
        'availability': user.get('availability', []),
        'preparation_level': user.get('preparation_level', 'Beginner'),
        'reputation_score': user.get('reputation_score', 0),
        'mentor_tag': user.get('mentor_tag', False),
        'online': user.get('online', False),
        'skill_credits': user.get('skill_credits', 100),
        # Match request status fields
        'match_status': None,  # filled per-user below
    }


@matching_bp.route('/partners', methods=['GET'])
@token_required
def find_partners():
    me = mongo.db.users.find_one({'_id': ObjectId(request.user_id)})
    if not me:
        return jsonify({'error': 'User not found'}), 404

    all_users = list(mongo.db.users.find({'_id': {'$ne': ObjectId(request.user_id)}}))

    # Get existing match request statuses involving current user
    sent_requests = set()
    received_requests = set()
    accepted_partners = set()

    existing_requests = list(mongo.db.match_requests.find({
        '$or': [{'from_id': request.user_id}, {'to_id': request.user_id}]
    }))
    for req in existing_requests:
        if req['status'] == 'accepted':
            other = req['to_id'] if req['from_id'] == request.user_id else req['from_id']
            accepted_partners.add(other)
        elif req['status'] == 'pending':
            if req['from_id'] == request.user_id:
                sent_requests.add(req['to_id'])
            else:
                received_requests.add(req['from_id'])

    scored = []
    for u in all_users:
        uid = str(u['_id'])
        score = compute_match_score(me, u)
        reasons = get_match_reasons(me, u)
        data = _fmt(u)
        data['match_score'] = score
        data['match_reasons'] = reasons

        # Determine status
        if uid in accepted_partners:
            data['match_status'] = 'accepted'
        elif uid in sent_requests:
            data['match_status'] = 'request_sent'
        elif uid in received_requests:
            data['match_status'] = 'request_received'
        else:
            data['match_status'] = None

        scored.append(data)

    scored.sort(key=lambda x: x['match_score'], reverse=True)
    return jsonify(scored[:30]), 200


@matching_bp.route('/skill-recommendations', methods=['GET'])
@token_required
def skill_recommendations():
    me = mongo.db.users.find_one({'_id': ObjectId(request.user_id)})
    if not me:
        return jsonify({'error': 'Not found'}), 404
    all_users = list(mongo.db.users.find({'_id': {'$ne': ObjectId(request.user_id)}}))
    recs = recommend_skills_for_user(me, all_users)
    return jsonify(recs), 200


@matching_bp.route('/skill-barter', methods=['GET'])
@token_required
def skill_barter():
    me = mongo.db.users.find_one({'_id': ObjectId(request.user_id)})
    my_wants = {str(x).lower() for x in me.get('skills_want', [])}
    my_have  = {str(x).lower() for x in me.get('skills_have', [])}

    users = list(mongo.db.users.find({'_id': {'$ne': ObjectId(request.user_id)}}))
    matches = []
    for u in users:
        their_have = {str(x).lower() for x in u.get('skills_have', [])}
        their_want = {str(x).lower() for x in u.get('skills_want', [])}
        can_give = their_have & my_wants
        can_get  = my_have & their_want
        if can_give or can_get:
            d = _fmt(u)
            d['can_teach_you'] = [s.title() for s in can_give]
            d['you_can_teach'] = [s.title() for s in can_get]
            d['barter_score']  = len(can_give) + len(can_get)
            matches.append(d)

    matches.sort(key=lambda x: x['barter_score'], reverse=True)
    return jsonify(matches[:20]), 200
