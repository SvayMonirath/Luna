from marshmallow import Schema, fields

class CreateRoomSchema(Schema):
    name = fields.Str(required=True)
    genre = fields.Str()
    #  what is missing for?
    is_private = fields.Bool(load_default=False)
    password = fields.Str(load_default=None)

class EditRoomSchema(Schema):
    name = fields.Str()
    genre = fields.Str()
    is_private = fields.Bool()
    password = fields.Str()
