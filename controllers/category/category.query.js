import * as CategoryService from "../../services/category.service.js";

export const getAllCategoryController = async (_, res) => {

  try {
    const allCategory = await CategoryService.getAllCategory();

    return res.status(200).json(allCategory);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error upon getting all category data", error);
    }
    return res
      .status(500)
      .json({ error: "An internal server error has occured" });
  }
};
