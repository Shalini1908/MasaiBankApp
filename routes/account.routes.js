const express = require("express");
const { AccountModel } = require("../model/Account.model");
const { ReceiptModel } = require("../model/reciept.model");
const accountRouter = express.Router();
const { Auth } = require("../middleware/Auth.middleware");
const jwt = require("jsonwebtoken");

accountRouter.get("/", async (req, res) => {
    try {
      let accounts = await AccountModel.find();
      res.send(accounts);
    } catch (error) {
      console.log(error);
      res.send({ msg: "Something went wrong"});
    }
  });
  
  accountRouter.post("/openAccount", async (req, res) => {
    try {
      const {
        name,
        gender,
        dob,
        email,
        initialBalance,
        mobile,
        address,
        adharNo,
        panNo,
      } = req.body;
      let Existingaccount = await AccountModel.findOne({ email, panNo });
  
      if (Existingaccount) {
        let token = jwt.sign(
          {
            data: {
              accountId: Existingaccount._id,
            },
          },
          "masai"
        );
        res.send({
          status: "ok",
          msg: "Account already exists.",
          account: Existingaccount,
          token: token,
        });
      } else {
        let newAccount = new AccountModel({
          name,
          gender,
          dob,
          email,
          balance: initialBalance,
          mobile,
          address,
          adharNo,
          panNo,
          isOpen: true,
        });
        await newAccount.save();
  
        let Existingaccount = await AccountModel.findOne({ email, panNo });
  
        let token = jwt.sign(
          {
            data: {
              accountId: Existingaccount._id,
            },
          },
          "masai"
        );
        res.send({
          status: "ok",
          msg: "Account Opened successfully.",
          account: Existingaccount,
          token: token,
        });
      }
    } catch (error) {
      console.log(error);
      res.send({
        status: "error",
        msg: "error in opening account",
        err: error,
      });
    }
  });
  
  accountRouter.patch("/updateKYC", Auth, async (req, res) => {
    try {
      const { accountId, name, dob, email, mobile, adharNo, panNo } = req.body;
  
      await AccountModel.findByIdAndUpdate(accountId, {
        name,
        dob,
        email,
        mobile,
        adharNo,
        panNo,
      });
  
      res.send({
        status: "ok",
        msg: "KYC Complete",
      });
    } catch (error) {
      console.log(error);
      res.send({ msg: "error in KYC Update", status: "failed" });
    }
  });
  
  accountRouter.patch("/depositMoney", Auth, async (req, res) => {
    try {
      const { accountId, amount } = req.body;
      let account = await AccountModel.findById(accountId);
  
      if (account.isOpen === false) {
        res.send({
          msg: "Your account is closed, to activate your account contact to you branch",
        });
      } else {
        let updateBalance = account.balance + amount;
  
        await AccountModel.findByIdAndUpdate(accountId, {
          balance: updateBalance,
        });
  
        const newReceiptEntry = new ReceiptModel({
          accountId: accountId,
          transactionType: "deposit",
          amount: amount,
          date: new Date(),
          balance: updateBalance,
        });
  
        await newReceiptEntry.save();
  
        res.send({
          status: "ok",
          msg: "Deposit Complete",
        });
      }
    } catch (error) {
      console.log(error);
      res.send({ msg: "error in Deposit", status: "failed" });
    }
  });
  
  accountRouter.patch("/withdrawMoney", Auth, async (req, res) => {
    try {
      const { accountId, amount } = req.body;
      let account = await AccountModel.findById(accountId);
  
      if (account.isOpen === false) {
        res.send({
          msg: "Your account is closed, to activate your account contact to you branch",
        });
      } else {
        if (amount > account.balance) {
          res.send({ msg: "Insufficient balance in your account" });
        }
        let updateBalance = account.balance - amount;
  
        await AccountModel.findByIdAndUpdate(accountId, {
          balance: updateBalance,
        });
  
        const newReceiptEntry = new ReceiptModel({
          accountId: accountId,
          transactionType: "withdraw",
          amount: amount,
          date: new Date(),
          balance: updateBalance,
        });
  
        await newReceiptEntry.save();
  
        res.send({
          status: "ok",
          msg: "withdraw Complete",
        });
      }
    } catch (error) {
      console.log(error);
      res.send({ msg: "error in withdraw", status: "failed" });
    }
  });
  
  accountRouter.patch("/transferMoney", Auth, async (req, res) => {
    try {
      const { accountId, toName, email, panNo, amount } = req.body;
      let sender = await AccountModel.findById(accountId);
  
      if (sender.isOpen === false) {
        res.send({
          msg: "Your account is closed, to activate your account contact to you branch",
        });
      } else {
        let receiver = await AccountModel.findOne({ name: toName, email, panNo });
  
        if (amount > sender.balance) {
          res.send({ msg: "Insufficient balance in your account" });
        } else {
          let updateSenderBalance = sender.balance - amount;
          let updateReceiverBalance = receiver.balance + amount;
  
          await AccountModel.findByIdAndUpdate(accountId, {
            balance: updateSenderBalance,
          });
          await AccountModel.findByIdAndUpdate(receiver._id, {
            balance: updateReceiverBalance,
          });
  
          const newReceiptEntry = new ReceiptModel({
            accountId: accountId,
            transactionType: "transfer",
            amount: amount,
            date: new Date(),
            balance: updateSenderBalance,
            receiver: { name: toName, email, panNo },
          });
  
          await newReceiptEntry.save();
  
          res.send({
            status: "ok",
            msg: "transfer Complete",
          });
        }
      }
    } catch (error) {
      console.log(error);
      res.send({ msg: "error in transfer", status: "failed" });
    }
  });
  
  accountRouter.get("/printStatement", Auth, async (req, res) => {
    try {
      const { accountId } = req.body;
      let accountDetails = await AccountModel.findById(accountId);
  
      if (accountDetails.isOpen === false) {
        res.send({
          msg: "Your account is closed, to activate your account contact to you branch",
        });
      } else {
        let transactions = await ReceiptModel.find({ accountId });
        res.send({ accountDetails: accountDetails, transactions: transactions });
      }
    } catch (error) {
      console.log(error);
      res.send({ msg: "error in getting statement", status: "failed" });
    }
  });
  
  accountRouter.patch("/closeAccount", Auth, async (req, res) => {
    try {
      const { accountId } = req.body;
      let accountDetails = await AccountModel.findById(accountId);
  
      if (accountDetails.isOpen === false) {
        res.send({
          msg: "Your account is already closed",
        });
      } else {
        await AccountModel.findByIdAndUpdate(accountId, {
          isOpen: false,
        });
  
        res.send({ msg: "Account closed successfully", status: "ok" });
      }
    } catch (error) {
      console.log(error);
      res.send({ msg: "error in getting statement", status: "failed" });
    }
  });



module.exports = {
  accountRouter,
};
