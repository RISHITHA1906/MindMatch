from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from config.database import init_db
from routes.auth import auth_bp
from routes.users import users_bp
from routes.matching import matching_bp
from routes.skills import skills_bp
from routes.chat import chat_bp
from routes.sessions import sessions_bp
from routes.mentors import mentors_bp
from routes.analytics import analytics_bp
from routes.notifications import notif_bp
from routes.match_requests import match_req_bp
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'mindmatch-secret-2024')
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

CORS(app, resources={r"/api/*": {"origins": "*"}, r"/socket.io/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading', logger=False, engineio_logger=False)

init_db(app)

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(matching_bp, url_prefix='/api/matching')
app.register_blueprint(skills_bp, url_prefix='/api/skills')
app.register_blueprint(chat_bp, url_prefix='/api/chat')
app.register_blueprint(sessions_bp, url_prefix='/api/sessions')
app.register_blueprint(mentors_bp, url_prefix='/api/mentors')
app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
app.register_blueprint(notif_bp, url_prefix='/api/notifications')
app.register_blueprint(match_req_bp, url_prefix='/api/match-requests')

from socket_events import register_socket_events
register_socket_events(socketio)

@app.route('/api/health')
def health():
    return {'status': 'ok', 'message': 'MindMatch API running'}

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)
