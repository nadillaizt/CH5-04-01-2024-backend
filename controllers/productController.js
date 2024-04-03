const multer = require("multer");
const { Product, Shop, User } = require("../models");
const imagekit = require("../lib/imagekit");
const ApiError = require("../utils/apiError");
const { Op } = require("sequelize");

const multerStorage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb("null", "public/img/products");
  },
  filename: (req, res, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `products-${req.body.name}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (
    file.mimetype == "image/png" ||
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/jpeg"
  ) {
    cb(null, true);
  } else {
    return cb(new ApiError("Format Image nya salah", 400));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadProductPhoto = upload.single("photo");

const createProduct = async (req, res, next) => {
  const { name, price, stock } = req.body;
  const file = req.file;
  let img;

  try {
    if (file) {
      // dapatkan extension file nya
      const split = file.originalname.split(".");
      const extension = split[split.length - 1];

      // upload file ke imagekit
      const uploadedImage = await imagekit.upload({
        file: file.buffer,
        fileName: `IMG-${Date.now()}.${extension}`,
      });
      img = uploadedImage.url;
    }

    const newProduct = await Product.create({
      name,
      price,
      stock,
      imageUrl: img,
      userId: req.user.id,
      shopId: req.user.shopId,
    });

    res.status(200).json({
      status: "Success",
      data: {
        newProduct,
      },
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const findProducts = async (req, res, next) => {
  try {
    const { productname, username, shop } = req.query;
    const condition = {};
    if (productname) condition.name = { [Op.iLike]: `%${productname}%` };

    const includeShopCondition = {};
    if (shop) includeShopCondition.name = { [Op.iLike]: `%${shop}%` };

    const includeUserCondition = {};
    if (username) includeUserCondition.name = { [Op.iLike]: `${username}%` };

    const products = await Product.findAll({
      include: [
        {
          model: Shop,
          where: includeShopCondition,
        },
      ],
      where: condition,
      order: [["id", "ASC"]],
    });

    res.status(200).json({
      status: "Success",
      data: {
        products,
      },
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const findProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({
      status: "Success",
      data: {
        product,
      },
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const UpdateProduct = async (req, res, next) => {
  const { name, price, stock } = req.body;
  try {
    const product = await Product.update(
      {
        name,
        price,
        stock,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    res.status(200).json({
      status: "Success",
      message: "sukses update produk",
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

const deleteProduct = async (req, res, next) => {
  const { name, price, stock } = req.body;
  try {
    const product = await Product.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!product) {
      next(new ApiError("Product id tersebut gak ada", 404));
    }

    await Product.destroy({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({
      status: "Success",
      message: "sukses delete produk",
    });
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

module.exports = {
  createProduct,
  findProducts,
  findProductById,
  UpdateProduct,
  deleteProduct,
};
