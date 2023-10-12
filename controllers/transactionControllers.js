const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
module.exports = {
  // Create Transaksi
  createTransaction: async (req, res) => {
    try {
      const sourceAccountId = parseInt(req.body.source_account_id);
      const destinationAccountId = parseInt(req.body.destination_account_id);
      const amount = BigInt(req.body.amount);

      // Mengambil catatan akun pengirim
      const sourceAccount = await prisma.bank_accounts.findUnique({
        where: { id: sourceAccountId },
        include: {
          user: true,
        },
      });

      // Mengambil data akun penerima
      const destinationAccount = await prisma.bank_accounts.findUnique({
        where: { id: destinationAccountId },
        include: {
          user: true,
        },
      });

      // validasi akun pengirim dan penerima
      if (!sourceAccount || !destinationAccount) {
        return res
          .status(404)
          .json({ error: "Akun Pengirim atau Penerima Tidak Ditemukan!" });
      }

      // validasi saldo akun pengirim
      if (sourceAccount.balance < amount) {
        return res
          .status(400)
          .json({ error: "Saldo Rekening Pengirim Tidak Cukup" });
      }

      // operasi transaksi akun pengirim dan penerima
      const transaction = await prisma.$transaction([
        prisma.bank_accounts_transactions.create({
          data: {
            source_account_id: sourceAccountId,
            destination_account_id: destinationAccountId,
            amount,
          },
          include: {
            source_account: true,
            destination_account: true,
          },
        }),

        prisma.bank_accounts.update({
          where: { id: sourceAccountId },
          data: { balance: sourceAccount.balance - amount },
        }),
        prisma.bank_accounts.update({
          where: { id: destinationAccountId },
          data: { balance: destinationAccount.balance + amount },
        }),
      ]);

      return res.json({
        data: {
          transaction_id: transaction.id,
          source_account_id: transaction.sourceAccountId,
          destination_account_id: transaction.destinationAccountId,
          source_account_id: sourceAccount.id,
          source_account_name: sourceAccount.user.name,
          destination_account_id: destinationAccount.id,
          destination_account_name: destinationAccount.user.name,
          amount: amount.toString(),
        },
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Terjadi Kesalahan saat Memproses Transaksi" });
    }
  },

  // Melihat / membaca semua data yang ada di transaksi
  getAllTransaction: async (req, res) => {
    try {
      const transactions = await prisma.bank_accounts_transactions.findMany({
        include: {
          source_account: {
            include: {
              user: true,
            },
          },
          destination_account: {
            include: {
              user: true,
            },
          },
        },
      });

      const formatedTransactions = transactions.map((transaction) => ({
        transaction_id: transaction.id,
        source_account_id: transaction.source_account_id,
        source_account_name: transaction.source_account.user.name,
        destination_account_id: transaction.destination_account_id,
        destination_account_name: transaction.destination_account.user.name,
        amount: transaction.amount.toString(),
      }));
      return res.json({ data: formatedTransactions });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Terjadi Kesalahan saat Mengambil Transaksi" });
    }
  },

  // Melihat / membaca transaksi setiap ID nya
  getTransactionById: async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id);

      const transaction = await prisma.bank_accounts_transactions.findUnique({
        where: { id: transactionId },
        include: {
          source_account: {
            include: {
              user: true,
            },
          },
          destination_account: {
            include: {
              user: true,
            },
          },
        },
      });
      if (!transaction) {
        return res.status(404).json({ error: "Transaksi Tidak Ditemukan!" });
      }
      const transactionById = {
        transaction_id: transaction.id,
        source_account_id: transaction.source_account_id,
        source_account_name: transaction.source_account.user.name,
        destination_account_id: transaction.destination_account_id,
        destination_account_name: transaction.destination_account.user.name,
        amount: transaction.amount.toString(),
      };
      return res.json({ data: transactionById });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Terjadi Kesalahan saat Mengambil Transaksi" });
    }
  },

  // Update Transaksi
  updateTransaction: async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id); // Assuming you are passing the transaction ID in the URL params

      // Find the existing transaction
      const existingTransaction =
        await prisma.bank_accounts_transactions.findUnique({
          where: {
            id: transactionId,
          },
        });

      if (!existingTransaction) {
        return res.status(404).json({ error: "Transaction Not Found" });
      }

      // Update the transaction details
      const updatedTransaction = await prisma.bank_accounts_transactions.update(
        {
          where: {
            id: transactionId,
          },
          data: {
            // Convert BigInt to a string for serialization
            source_account_id: parseInt(req.body.source_account_id),
            destination_account_id: parseInt(req.body.destination_account_id),
            amount: BigInt(req.body.amount.toString()),
          },
        }
      );

      updatedTransaction.amount = updatedTransaction.amount.toString(); // Mengubah string sebelum masuk ke json
      // Json tidak bisa langsung menerima BigInt

      return res.json({
        data: updatedTransaction,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Delete Transaksi
  deleteTransaction: async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id); // Dengan asumsi Anda meneruskan ID transaksi di parameter URL

      // Temukan transaksi yang ada
      const existingTransaction =
        await prisma.bank_accounts_transactions.findUnique({
          where: {
            id: transactionId,
          },
        });

      if (!existingTransaction) {
        return res.status(404).json({ error: "Transaksi Tidak Ditemukan" });
      }

      // Delete the transaction
      await prisma.bank_accounts_transactions.delete({
        where: {
          id: transactionId,
        },
      });

      return res.json({ message: "Transaction deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
