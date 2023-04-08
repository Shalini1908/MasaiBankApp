const mongoose = require("mongoose");

const receiptSchema = mongoose.Schema({
  accountId: String,
  transactionType: String,
  date: String,
  amount: Number,
  balance: Number,
  receiver: Object,
});

const ReceiptModel = mongoose.model("receipt", receiptSchema);

module.exports = { ReceiptModel };