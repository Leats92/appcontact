const mongoose = require("mongoose");

const contactSchema = mongoose.Schema(
  {
    ownerId: {
      type: String,
      required: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      minlength: 10,
      trim: true,
      match: [/^\d+$/, "Téléphone invalide: uniquement des chiffres"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Contacts = mongoose.model("Contacts", contactSchema);

module.exports = Contacts;
