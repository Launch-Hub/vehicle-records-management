// this file is not in use now, but it's a good reference for future use

// run this file to initialize the database
// docker exec -it vrm-mongo mongo -u admin -p secure_password_here --authenticationDatabase vehicle_records_db

db = db.getSiblingDB("vehicle_records_db");

if (db.getCollectionNames().length === 0) {
  db.createUser({
    user: "admin",
    pwd: "secure_password_here",
    roles: [{ role: "readWrite", db: "vehicle_records_db" }],
  });

  db.sample.insertOne({ initialized: true });
}
