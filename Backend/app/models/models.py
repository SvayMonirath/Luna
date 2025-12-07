from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import string, random

db = SQLAlchemy()

# -------------------- Association Tables --------------------
# Many-to-many for users joining rooms
room_members = db.Table(
    'room_members',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('room_id', db.Integer, db.ForeignKey('rooms.id'), primary_key=True)
)

# Many-to-many for room music
room_music_association = db.Table(
    'room_music_association',
    db.Column('room_id', db.Integer, db.ForeignKey('rooms.id'), primary_key=True),
    db.Column('music_id', db.Integer, db.ForeignKey('musics.id'), primary_key=True)
)

# -------------------- User Model --------------------
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(512), nullable=False)

    # Relationships
    owned_rooms = db.relationship('Room', backref='owner', lazy=True)
    joined_rooms = db.relationship('Room', secondary=room_members, backref='members', lazy='dynamic')

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
    cover_image_path = db.Column(db.String(500), nullable=False)

# -------------------- Room Model --------------------
class Room(db.Model):
    __tablename__ = 'rooms'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), unique=True, nullable=False)
    code = db.Column(db.String(6), unique=True, nullable=False, index=True)
    description = db.Column(db.String(255), nullable=True)
    is_private = db.Column(db.Boolean, default=False, nullable=False)
    vibe = db.Column(db.String(50), nullable=True)
    password = db.Column(db.String(100), nullable=True)

    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Many-to-many relationship with Music
    musics = db.relationship(
        'Music',
        secondary=room_music_association,
        backref=db.backref('rooms', lazy=True)
    )

    # -------------------- Helper Methods --------------------
    @staticmethod
    def generate_unique_code(length=6):
        """Generate a random alphanumeric code."""
        characters = string.ascii_uppercase + string.digits
        while True:
            code = ''.join(random.choices(characters, k=length))
            if not Room.query.filter_by(code=code).first():
                return code
