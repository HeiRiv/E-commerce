const router = require("express").Router();
const { Category, Product } = require("../../models");

// The `/api/categories` endpoint

router.get("/", async (req, res) => {
  try {
    // Find all categories, including associated Products
    const categories = await Category.findAll({
      include: [Product],
    });
    res.json(categories);
  } catch (err) {
    console.error("Error retrieving categories:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  const categoryId = req.params.id;
  try {
    // Find one category by its `id` value, including associated Products
    const category = await Category.findByPk(categoryId, {
      include: [Product],
    });

    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.json(category);
  } catch (err) {
    console.error("Error retrieving category:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    // Create a new category
    const newCategory = await Category.create(req.body);
    res.status(201).json(newCategory);
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", async (req, res) => {
  const categoryId = req.params.id;
  try {
    // Update a category by its `id` value
    const [affectedRows] = await Category.update(req.body, {
      where: { id: categoryId },
    });

    if (affectedRows === 0) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.status(200).json({ message: "Category updated successfully" });
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req, res) => {
  const categoryId = req.params.id;
  try {
    // Delete a category by its `id` value
    const deletedCategory = await Category.destroy({
      where: { id: categoryId },
    });

    if (!deletedCategory) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
