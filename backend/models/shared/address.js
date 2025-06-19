import mongoose from "mongoose";

export const AddressSchema = new mongoose.Schema(
  {
    street: { type: String },
    ward: { type: String },
    district: { type: String },
    province: { type: String },
    country: { type: String, default: "Vietnam" },
    postalCode: { type: String },
  },
  { _id: false } // disable _id for subdocuments
);
