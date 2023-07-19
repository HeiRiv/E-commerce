const router = require("express").Router();
const { Tag, Product, ProductTag } = require("../../models");

// The `/api/tags` endpoint

router.get("/", async (req, res) => {
  try {
    // Find all tags, including associated Product data
    const tags = await Tag.findAll({
      include: [{ model: Product, through: ProductTag }],
    });
    res.json(tags);
  } catch (err) {
    console.error("Error retrieving tags:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  const tagId = req.params.id;
  try {
    // Find a single tag by its `id`, including associated Product data
    const tag = await Tag.findByPk(tagId, {
      include: [{ model: Product, through: ProductTag }],
    });

    if (!tag) {
      res.status(404).json({ error: "Tag not found" });
      return;
    }

    res.json(tag);
  } catch (err) {
    console.error("Error retrieving tag:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    // Create a new tag
    const newTag = await Tag.create(req.body);
    res.status(201).json(newTag);
  } catch (err) {
    console.error("Error creating tag:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", async (req, res) => {
  const tagId = req.params.id;
  try {
    // Update a tag's name by its `id` value
    const [affectedRows] = await Tag.update(req.body, {
      where: { id: tagId },
    });

    if (affectedRows === 0) {
      res.status(404).json({ error: "Tag not found" });
      return;
    }

    res.status(200).json({ message: "Tag updated successfully" });
  } catch (err) {
    console.error("Error updating tag:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req, res) => {
  const tagId = req.params.id;
  try {
    // Delete a tag by its `id` value
    const deletedTag = await Tag.destroy({
      where: { id: tagId },
    });

    if (!deletedTag) {
      res.status(404).json({ error: "Tag not found" });
      return;
    }

    res.status(200).json({ message: "Tag deleted successfully" });
  } catch (err) {
    console.error("Error deleting tag:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
