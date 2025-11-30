from marshmallow import Schema, fields

class AddMusicDB(Schema):
    title = fields.Str(required=True)
    artist = fields.Str(required=True)
    album = fields.Str(required=True)
    genre = fields.Str(required=False)
    audio_file_path = fields.Str(required=True)
    cover_image_path = fields.Str(required=True)

