const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");

// The `/api/products` endpoint

// get all products
router.get("/", async (req, res) => {
  try {
    // Find all products, including associated Category and Tag data
    const products = await Product.findAll({
      include: [{ model: Category }, { model: Tag, through: ProductTag }],
    });
    res.json(products);
  } catch (err) {
    console.error("Error retrieving products:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get one product
router.get("/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    // Find a single product by its `id`, including associated Category and Tag data
    const product = await Product.findByPk(productId, {
      include: [{ model: Category }, { model: Tag, through: ProductTag }],
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(product);
  } catch (err) {
    console.error("Error retrieving product:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// create new product
router.post("/", async (req, res) => {
  try {
    // Create a new product
    const newProduct = await Product.create(req.body);

    // if there are product tags, create pairings to bulk create in the ProductTag model
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tagId) => ({
        product_id: newProduct.id,
        tag_id: tagId,
      }));

      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// update product
router.put("/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    // Update product data
    await Product.update(req.body, {
      where: { id: productId },
    });

    // Find all associated tags from ProductTag
    const productTags = await ProductTag.findAll({
      where: { product_id: productId },
    });

    // Get list of current tag_ids
    const productTagIds = productTags.map(({ tag_id }) => tag_id);

    // Create filtered list of new tag_ids
    const newProductTags = req.body.tagIds
      .filter((tagId) => !productTagIds.includes(tagId))
      .map((tagId) => ({
        product_id: productId,
        tag_id: tagId,
      }));

    // Figure out which ones to remove
    const productTagsToRemove = productTags
      .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
      .map(({ id }) => id);

    // Run both actions
    await Promise.all([
      ProductTag.destroy({ where: { id: productTagsToRemove } }),
      ProductTag.bulkCreate(newProductTags),
    ]);

    res.status(200).json({ message: "Product updated successfully" });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    // Delete one product by its `id` value
    const deletedProduct = await Product.destroy({
      where: { id: productId },
    });

    if (!deletedProduct) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
