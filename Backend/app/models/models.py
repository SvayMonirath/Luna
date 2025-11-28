from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# -------------------- User Model --------------------
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(512), nullable=False)

    # To avoid circular FK issue for initial migration, keep nullable and no FK
    joined_room_id = db.Column(db.Integer, nullable=True)

    # Relationships
    rooms = db.relationship('Room', backref='owner', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# -------------------- Music Model --------------------
class Music(db.Model):
    __tablename__ = 'musics'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    artist = db.Column(db.String(100), nullable=False)
    album = db.Column(db.String(100), nullable=True)
    genre = db.Column(db.String(50), nullable=True)
    audio_file_path = db.Column(db.String(500), nullable=False)
    cover_image_path = db.Column(db.String(500), nullable=True)

# -------------------- Association Table --------------------
class RoomMusicAssociation(db.Model):
    __tablename__ = 'room_music_association'

    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), primary_key=True)
    music_id = db.Column(db.Integer, db.ForeignKey('musics.id'), primary_key=True)

# -------------------- Room Model --------------------
class Room(db.Model):
    __tablename__ = 'rooms'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)
    is_private = db.Column(db.Boolean, default=False, nullable=False)
    genre = db.Column(db.String(50), nullable=True)
    password = db.Column(db.String(100), nullable=True)

    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Many-to-many relationship with Music
    musics = db.relationship(
        'Music',
        secondary='room_music_association',
        backref=db.backref('rooms', lazy=True)
    )
