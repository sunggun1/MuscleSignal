from calendar import c
from datetime import datetime
import pymongo
from bson import ObjectId

from config import showjson


class Database(object):
    def __init__(self):
        self.client = pymongo.MongoClient(showjson()['db']['url'])  # configure db url
        self.db = self.client[showjson()['db']['name']]  # configure db name

    def validate_collection(self,collection_name):
        try:
            self.db.validate_collection(collection_name)
        except pymongo.errors.OperationFailure:  # If the collection doesn't exist
            print("This"+ collection_name +"collection doesn't exist")
            print('now making a'+ collection_name +'collection')
            self.db.create_collection(collection_name)

    def insert(self, element, collection_name):
        element["created"] = datetime.now()
        element["updated"] = datetime.now()
        inserted = self.db[collection_name].insert_one(element)  # insert data to db
        return str(inserted.inserted_id)

    def find(self, criteria, collection_name, projection=None, sort=None, limit=0, cursor=False):  # find all from db

        if "_id" in criteria:
            criteria["_id"] = ObjectId(criteria["_id"])

        found = self.db[collection_name].find(filter=criteria, projection=projection, limit=limit, sort=sort)

        if cursor:
            return found

        found = list(found)

        for i in range(len(found)):  # to serialize object id need to convert string
            if "_id" in found[i]:
                found[i]["_id"] = str(found[i]["_id"])

        return found

    def find_one(self, criteria, collection_name, projection=None, sort=None, limit=0, cursor=False):  # find one from db
        found = self.db[collection_name].find_one(filter=criteria, projection=projection, limit=limit, sort=sort)
        
        if found is None:
            return None
        
        if "_id" in criteria:
            criteria["_id"] = ObjectId(criteria["_id"])        

        if cursor:
            return found
        
        found["_id"] = str(found["_id"])
        
        return found
        

    def find_by_id(self, id, collection_name):
        found = self.db[collection_name].find_one({"_id": ObjectId(id)})
        
        if found is None:
            return None
        
        if "_id" in found:
             found["_id"] = str(found["_id"])

        return found

    def update(self, id, element, collection_name):
        criteria = {"_id": ObjectId(id)}

        element["updated"] = datetime.now()
        set_obj = {"$set": element}  # update value

        updated = self.db[collection_name].update_one(criteria, set_obj)
        if updated.matched_count == 1:
            return "Record Successfully Updated"

    def delete(self, id, collection_name):
        deleted = self.db[collection_name].delete_one({"_id": ObjectId(id)})
        return bool(deleted.deleted_count)