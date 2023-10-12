const express = require("express");
const router = express.Router();
const userControllers = require("./controllers/userControllers");
const accountControllers = require("./controllers/accountControllers");
const transactionControllers = require("./controllers/transactionControllers");

router.get("/", (req, res) => {
  return res.json({
    message: "Hello World",
  });
});

// user
router.post("/users", userControllers.registerUser);
router.get("/users", userControllers.daftarUser);
router.get("/users/:userId", userControllers.InformasiUser);
router.put("/users/:userId", userControllers.updateUser);
router.delete("/users/:userId", userControllers.deleteiUser);

// Account
router.post("/accounts", accountControllers.registerAccount);
router.get("/accounts", accountControllers.getAccounts);
router.get("/accounts/:id", accountControllers.getAccountById);
router.put("/accounts/:id", accountControllers.updateAccount);
router.delete("/accounts/:id", accountControllers.deleteAccount);

// Transaction
router.post("/transactions", transactionControllers.createTransaction);
router.get("/transactions", transactionControllers.getAllTransaction);
router.get("/transactions/:id", transactionControllers.getTransactionById);
router.put("/transactions/:id", transactionControllers.updateTransaction);
router.delete("/transactions/:id", transactionControllers.deleteTransaction);

module.exports = router;
