from factory.validation import Validator
from factory.database import Database


class MusclePosition(object):
    def __init__(self):
        self.validator = Validator()
        self.db = Database()

        self.collection_name = 'muscle_position'  # collection name

        self.fields = {
            "positionName" : "string",
            "email" : "string",
            "created": "datetime",
            "updated": "datetime",
        }

        self.create_required_fields = ["positionName","email"]

        # Fields optional for CREATE
        self.create_optional_fields = []

        # Fields required for UPDATE
        self.update_required_fields = ["positionName","email"]

        # Fields optional for UPDATE
        self.update_optional_fields = []

    def validateCollection(self):
        self.db.validate_collection(self.collection_name)


    def create(self, musclePosition):
        # Validator will throw error if invalid
        self.validator.validate(musclePosition, self.fields, self.create_required_fields, self.create_optional_fields)
        res = self.db.insert(musclePosition, self.collection_name)
        return "Inserted Id " + res

    def find(self, musclePosition):  # find all
        return self.db.find(musclePosition, self.collection_name)
        
    def find_by_one(self, musclePosition):
        return self.db.find_one(musclePosition, self.collection_name)

    def find_by_id(self, id):
        return self.db.find_by_id(id, self.collection_name)

    def update(self, id, musclePosition):
        self.validator.validate(musclePosition, self.fields, self.update_required_fields, self.update_optional_fields)
        return self.db.update(id, musclePosition ,self.collection_name)

    def delete(self, id):
        return self.db.delete(id, self.collection_name)