from marshmallow import Schema, fields

class LoginInput(Schema):
    username = fields.Str(required=True)
    password = fields.Str(required=True)

class LoginOutput(Schema):
    message = fields.Str(required=True)
    accessToken = fields.Str(required=True)

class RegisterInput(Schema):
    username = fields.Str(required=True)
    email = fields.Email(required=True)
    password = fields.Str(required=True)
    confirm_password = fields.Str(required=True)

class RegisterOutput(Schema):
    message = fields.Str(required=True)
