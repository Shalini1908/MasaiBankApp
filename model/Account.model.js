const mongoose = require("mongoose");

const accountSchema = mongoose.Schema({
    name: String,
    gender: String,
    dob: String,
    email: String,
    address: String,
    balance: Number,
    mobile: Number,
    adharNo: Number,
    panNo: String,
    isOpen: Boolean,
});

const AccountModel = mongoose.model("account", accountSchema);

module.exports = {
  AccountModel,
};
