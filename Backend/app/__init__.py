import os
from dotenv import load_dotenv

from flask import Flask
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_cors import CORS
from flask_socketio import SocketIO

from .models.models import db
from .configs.config import Config

load_dotenv()
jwt = JWTManager()
migrate = Migrate()
cors = CORS()
socketio = SocketIO(cors_allowed_origins="*")

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    cors.init_app(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    jwt.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)

    from .controllers.auth import auth_blp
    from .controllers.rooms import rooms_blp
    from .controllers.utils import utils_blp
    from .controllers.musics import musics_blp
    from .controllers.users import user_blp

    app.register_blueprint(auth_blp)
    app.register_blueprint(rooms_blp)
    app.register_blueprint(utils_blp)
    app.register_blueprint(musics_blp)
    app.register_blueprint(user_blp)

    socketio.init_app(app)

    return app
