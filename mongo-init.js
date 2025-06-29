db = db.getSiblingDB("vehicle_records_db");

if (db.getCollectionNames().length === 0) {
  db.createUser({
    user: "admin",
    pwd: "secure_password_here",
    roles: [{ role: "readWrite", db: "vehicle_records_db" }],
  });

  db.sample.insertOne({ initialized: true });
}
