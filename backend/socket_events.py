from flask_socketio import emit, join_room, leave_room
from config.database import mongo
from bson import ObjectId
from datetime import datetime

def register_socket_events(socketio):

    @socketio.on('connect')
    def handle_connect():
        emit('connected', {'status': 'ok'})

    @socketio.on('join')
    def handle_join(data):
        user_id = data.get('user_id')
        room = data.get('room')
        if user_id:
            join_room(user_id)
            mongo.db.users.update_one({'_id': ObjectId(user_id)}, {'$set': {'online': True}})
            emit('user_online', {'user_id': user_id}, broadcast=True)
        if room:
            join_room(room)

    @socketio.on('leave_room')
    def handle_leave(data):
        room = data.get('room')
        if room:
            leave_room(room)

    @socketio.on('disconnect')
    def handle_disconnect():
        pass

    @socketio.on('send_message')
    def handle_message(data):
        room = data.get('room_id')
        msg = {
            'id': data.get('id', ''),
            'sender_id': data.get('sender_id', ''),
            'content': data.get('content', ''),
            'type': data.get('type', 'text'),
            'file_url': data.get('file_url', ''),
            'file_name': data.get('file_name', ''),
            'created_at': str(datetime.utcnow())
        }
        emit('receive_message', msg, room=room)
        # Notify receiver
        receiver_id = data.get('receiver_id')
        sender_name = data.get('sender_name', 'Someone')
        if receiver_id:
            from routes.notifications import create_notification
            notif = create_notification(
                mongo.db, receiver_id, 'message',
                f'💬 New message from {sender_name}',
                data.get('content', '📎 File')[:80],
                {'sender_id': data.get('sender_id'), 'room_id': room}
            )
            emit('new_notification', {
                'id': str(notif['_id']), 'type': 'message',
                'title': f'💬 {sender_name}',
                'message': data.get('content', 'Sent a file')[:60],
                'created_at': str(notif['created_at'])
            }, room=receiver_id)

    @socketio.on('typing')
    def handle_typing(data):
        room = data.get('room_id')
        emit('user_typing', {'user_id': data.get('user_id'), 'typing': data.get('typing', True)}, room=room)

    # WebRTC signaling
    @socketio.on('call_offer')
    def handle_call_offer(data):
        to = data.get('to')
        from_id = data.get('from')
        from_name = data.get('from_name', '')
        emit('incoming_call', {
            'from': from_id, 'from_name': from_name,
            'offer': data.get('offer'), 'call_type': data.get('call_type', 'video')
        }, room=to)
        # Missed call notification will be set on end_call if not answered

    @socketio.on('call_answer')
    def handle_call_answer(data):
        to = data.get('to')
        emit('call_answered', {'answer': data.get('answer'), 'from': data.get('from')}, room=to)

    @socketio.on('call_ice_candidate')
    def handle_ice(data):
        to = data.get('to')
        emit('ice_candidate', {'candidate': data.get('candidate'), 'from': data.get('from')}, room=to)

    @socketio.on('end_call')
    def handle_end_call(data):
        to = data.get('to')
        from_id = data.get('from')
        missed = data.get('missed', False)
        emit('call_ended', {'from': from_id, 'missed': missed}, room=to)
        # Send missed call notification + chat message
        if missed:
            from_user = mongo.db.users.find_one({'_id': ObjectId(from_id)})
            name = from_user.get('name', 'Someone') if from_user else 'Someone'
            from routes.notifications import create_notification
            notif = create_notification(
                mongo.db, to, 'missed_call',
                f'📵 Missed call from {name}',
                'You missed a call. Tap to call back.',
                {'caller_id': from_id}
            )
            emit('new_notification', {
                'id': str(notif['_id']), 'type': 'missed_call',
                'title': f'📵 Missed call from {name}',
                'message': 'You missed a call.',
                'created_at': str(notif['created_at'])
            }, room=to)
            # Also insert a missed call message in chat
            room_id = '_'.join(sorted([from_id, str(to)]))
            mongo.db.messages.insert_one({
                'room_id': room_id, 'sender_id': from_id, 'receiver_id': str(to),
                'content': f'📵 Missed call from {name}', 'type': 'missed_call',
                'file_url': '', 'file_name': '', 'read': False, 'created_at': datetime.utcnow()
            })

    @socketio.on('set_offline')
    def handle_offline(data):
        user_id = data.get('user_id')
        if user_id:
            mongo.db.users.update_one({'_id': ObjectId(user_id)}, {
                '$set': {'online': False, 'last_seen': datetime.utcnow()}
            })
            emit('user_offline', {'user_id': user_id}, broadcast=True)

    @socketio.on('match_request_sent')
    def handle_match_notif(data):
        to = data.get('to_id')
        emit('new_notification', {
            'type': 'match_request', 'title': '🔗 New Match Request',
            'message': f"{data.get('from_name', 'Someone')} wants to study with you!",
            'created_at': str(datetime.utcnow())
        }, room=to)
