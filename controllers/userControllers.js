const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
  // Endpoint POST /api/v1/users = menambahkan user baru beserta dengan profilnya.
  registerUser: async (req, res) => {
    const user = await prisma.users.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        profile: {
          create: {
            identity_number: req.body.identity_number,
            identity_type: req.body.identity_type,
            address: req.body.address,
          },
        },
      },
    });

    return res.json({
      data: user,
    });
  },

  // menampilkan daftar users.
  daftarUser: async (req, res) => {
    const user = await prisma.users.findMany({});
    return res.json({
      data: user,
    });
  },

  // menampilkan detail informasi user (tampilkan juga profilnya).
  InformasiUser: async (req, res) => {
    const { userId } = req.params;
    const user = await prisma.users.findUnique({
      where: { id: +userId },
    });
    return res.json({
      data: user,
    });
  },

  // Update User
  updateUser: async (req, res) => {
    const { userId } = req.params;
    const user = await prisma.users.update({
      where: { id: +userId },
      data: {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      },
    });
    return res.json({
      data: user,
    });
  },

  // Delete User
  deleteiUser: async (req, res) => {
    const { userId } = req.params;
    const user = await prisma.users.delete({
      where: { id: +userId },
    });
    return res.json(user);
  },
};
