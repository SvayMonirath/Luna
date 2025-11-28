import os
from dotenv import load_dotenv

from flask import Flask
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_cors import CORS

from .models.models import db
from .configs.config import Config

load_dotenv()
jwt = JWTManager()
migrate = Migrate()
cors = CORS()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    cors.init_app(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    jwt.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)

    from .controllers.auth import auth_blp
    from .controllers.rooms import rooms_blp
    app.register_blueprint(auth_blp)
    app.register_blueprint(rooms_blp)

    return app
