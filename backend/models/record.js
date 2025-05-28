import mongoose from "mongoose";
import Issuer from "./issuer";

const recordSchema = new mongoose.Schema({
  licensePlate: { type: String, unique: true, required: true },
  issuer: { type: mongoose.Schema.Types.ObjectId, ref: "Issuer", required: true },
  description: String,
  // the issuer ref can be populated
  // by using .populate('issuer', '<field_1> <field_2> ...')
  // or simply .populate('issuer')
  note: String,
});

const Record = mongoose.model("Record", recordSchema);
export default Record;
