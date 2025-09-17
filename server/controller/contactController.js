const mongoose = require('mongoose');
const Contacts = require('../model/contactModel');
const createError = (status, message) => ({ status, message });



const isValidPhone = (value) => {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  return /^\d+$/.test(v) && v.length >= 10;
};

const validerContact = (body, requireAll = true) => {
  const { firstName, lastName, phone } = body;
  if (requireAll) {
    if (!firstName || !lastName || !phone) {
      throw createError(400, "Champs requis: firstName, lastName, phone");
    }
    if (!isValidPhone(phone)) {
      throw createError(400, "Téléphone invalide: 10 caractères minimum et uniquement des chiffres");
    }
  } else if (!firstName && !lastName && !phone) {
    throw createError(400, "Au moins un champ à mettre à jour");
  } else if (phone !== undefined && phone !== null) {
    if (!isValidPhone(phone)) {
      throw createError(400, "Téléphone invalide: 10 caractères minimum et uniquement des chiffres");
    }
  }
  return { firstName, lastName, phone };
};


const createContact = async (req, res) => {
  try {
    const { firstName, lastName, phone } = validerContact(req.body, true);
    const ownerId = req.user.id;

    const newContact = await Contacts.create({
      ownerId,
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      phone: String(phone).trim(),
    });
    return res.status(201).json(newContact);
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || "Erreur lors de la création du contact";
    return res.status(status).json({ message });
  }
};

const listContacts = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const result = await Contacts.find({ ownerId }).lean();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: "Erreur lors de la récupération des contacts" });
  }
};

const getContactById = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'ID invalide' });
    const contact = await Contacts.findOne({ _id: id, ownerId }).lean();
    if (!contact) return res.status(404).json({ message: "Contact non trouvé" });
    return res.status(200).json(contact);
  } catch (err) {
    return res.status(500).json({ message: "Erreur lors de la récupération du contact" });
  }
};

const updateContact = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const id = req.params.id;
    const { firstName, lastName, phone } = validerContact(req.body, false);
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'ID invalide' });
    const update = {};
    if (firstName !== undefined) update.firstName = String(firstName).trim();
    if (lastName !== undefined) update.lastName = String(lastName).trim();
    if (phone !== undefined) update.phone = String(phone).trim();
    const updated = await Contacts.findOneAndUpdate(
      { _id: id, ownerId },
      { $set: update },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ message: 'Contact non trouvé' });
    return res.status(200).json(updated);
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || "Erreur lors de la mise à jour du contact";
    return res.status(status).json({ message });
  }
};


const deleteContact = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'ID invalide' });
    const deleted = await Contacts.findOneAndDelete({ _id: id, ownerId });
    if (!deleted) return res.status(404).json({ message: 'Contact non trouvé' });
    return res.status(200).json({ message: "Contact supprimé" });
  } catch (err) {
    return res.status(500).json({ message: "Erreur lors de la suppression du contact" });
  }
};

module.exports = {
  createContact,
  listContacts,
  getContactById,
  updateContact,
  deleteContact,
};
