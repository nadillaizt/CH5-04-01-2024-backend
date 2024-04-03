const router = require("express").Router();

const productController = require("../controllers/productController");

const upload = require("../middlewares/uploader");
const autentikasi = require("../middlewares/authenticate");
const checkOwnership = require("../middlewares/checkOwnership");

// router.post("/", autentikasi, upload.single("image"), Product.createProduct);
router.get("/", productController.findProducts);
// router.get("/:id", Product.findProductById);
// router.patch("/:id", Product.UpdateProduct);
// router.delete("/:id", Product.deleteProduct);

module.exports = router;
