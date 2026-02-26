import * as CategoryService from "../../services/category.service.js";

export const createCategoryController = async (req, res) => {
  try {
    const { description, name } = req.body;


    if (!description || !name) {
      return res.status(400).json({
        error: "Both name and description are required.",
      });
    }

    const newCategory = await CategoryService.createCategory({ description, name });
    return res.status(201).json(newCategory);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error upon creating category:", error);
    }
    return res.status(500).json({
      error: "An internal server error has occurred.",
    });
  }
};



export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await CategoryService.deleteCategory(parseInt(id));
    return res.status(200).json(deleted);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error upon deleting category:", error);
    }
    return res.status(500).json({
      error: "An internal server error has occurred.",
    });
  }
};

export const updateCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, name } = req.body;

    if (!description && !name) {
      return res.status(400).json({
        error: "At least one of 'name' or 'description' is required.",
      });
    }
    const updated = await CategoryService.updateCategory(Number(id), { description, name });
    return res.status(200).json(updated);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error upon updating category:", error);
    }

    return res.status(500).json({
      error: "An internal server error has occurred.",
    });
  }
};


