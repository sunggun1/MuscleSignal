from factory.validation import Validator
from factory.database import Database


class Muscle(object):
    def __init__(self):
        self.validator = Validator()
        self.db = Database()

        self.collection_name = 'muscle'  # collection name

        self.fields = {
            "power" : "string",
            "time" : "datetime",
            "email" : "string",
            "positionName" : "string",
            "created": "datetime",
            "updated": "datetime",
        }

        self.create_required_fields = ["power","time","email","positionName"]

        # Fields optional for CREATE
        self.create_optional_fields = []

        # Fields required for UPDATE
        self.update_required_fields = ["power","time"]

        # Fields optional for UPDATE
        self.update_optional_fields = []

    def create(self, muscle):
        # Validator will throw error if invalid
        self.validator.validate(muscle, self.fields, self.create_required_fields, self.create_optional_fields)
        res = self.db.insert(muscle, self.collection_name)
        return "Inserted Id " + res

    def find(self, muscle):  # find all
        return self.db.find(muscle, self.collection_name)
        
    def find_by_one(self, muscle):
        return self.db.find_one(muscle, self.collection_name)

    def find_by_id(self, id):
        return self.db.find_by_id(id, self.collection_name)

    def update(self, id, muscle):
        self.validator.validate(muscle, self.fields, self.update_required_fields, self.update_optional_fields)
        return self.db.update(id, muscle ,self.collection_name)

    def delete(self, id):
        return self.db.delete(id, self.collection_name)