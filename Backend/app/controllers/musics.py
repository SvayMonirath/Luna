from flask import request
from flask_smorest import Blueprint, abort
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..schemas.music_schemas import AddMusicDB
from ..models.models import Music, db
# BASIC MUSIC operation
musics_blp = Blueprint("Musics", __name__, url_prefix="/api/v1/musics")
@musics_blp.route('/add_songs_to_database', methods=['POST'])
@musics_blp.arguments(AddMusicDB)
def add_songs_to_database(musicData):
    title = musicData.get('title')
    artist = musicData.get('artist')
    album = musicData.get('album')
    genre = musicData.get('genre')
    audio_file_path = musicData.get('audio_file_path')
    cover_image_path = musicData.get('cover_image_path')

    new_music = Music(
        title=title,
        artist=artist,
        album=album,
        genre=genre,
        audio_file_path=audio_file_path,
        cover_image_path=cover_image_path
    )

    db.session.add(new_music)
    db.session.commit()

    return {"message": "Music added to database successfully.", "music_id": new_music.id}, 201

# TEST GET SONG OPERATION
@musics_blp.route('/get_all_songs', methods=['GET'])
def get_all_songs():
    songs = Music.query.all()
    songs_list = []
    for song in songs:
        songs_list.append({
            "id": song.id,
            "title": song.title,
            "artist": song.artist,
            "album": song.album,
            "genre": song.genre,
            "audio_file_path": song.audio_file_path,
            "cover_image_path": song.cover_image_path
        })

    return {"songs": songs_list}, 200

@musics_blp.route('/get_random/<int:limit>', methods=['GET'])
def get_random_song(limit):
    songs = Music.query.order_by(db.func.random()).limit(limit).all()
    songs_list = []
    for song in songs:
        songs_list.append({
            "id": song.id,
            "title": song.title,
            "artist": song.artist,
            "album": song.album,
            "genre": song.genre,
            "audio_file_path": song.audio_file_path,
            "cover_image_path": song.cover_image_path
        })

    return {"songs": songs_list}, 200


@musics_blp.route('/search', methods=['GET'])
def search_songs():
    query = request.args.get('q', '')
    if not query:
        return {"songs": []}, 200

    results = Music.query.filter(
        (Music.title.ilike(f'%{query}%')) |
        (Music.artist.ilike(f'%{query}%')) |
        (Music.album.ilike(f'%{query}%')) |
        (Music.genre.ilike(f'%{query}%'))
    ).all()

    song_list = [
        {
            "id": song.id,
            "title": song.title,
            "artist": song.artist,
            "album": song.album,
            "genre": song.genre,
            "audio_file_path": song.audio_file_path,
            "cover_image_path": song.cover_image_path
        }
        for song in results
    ]

    return {"songs": song_list}, 200

# play music individually
# pause music individually
# skip music individually


# WEBSOCKET OPERATION
# ENTER ROOM (AFTER JOIN ROOM)
# LEAVE ROOM
# PLAY MUSIC
# PAUSE MUSIC
# SKIP MUSIC
# ADD MUSIC TO MUSIC QUEUE
# REMOVE MUSIC FROM MUSIC QUEUE

