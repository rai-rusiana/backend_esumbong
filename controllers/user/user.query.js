import * as userService from "../../services/user.service.js";
/**
 * @description
 * Retrieves a list of all users
 */
export const getAllUsers = async (req, res) => {
  const { search, type } = req.query
  try {
    const users = await userService.getAllUsers({ search, type });
    return res.status(200).json(users);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error getting users", error);
    }
    return res.status(500).json({
      error: "An internal server error occured.",
    });
  }
};

export const getMe = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await userService.getUserById(parseInt(userId));
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    return res.status(200).json(user);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error getting user by Id:", error);
    }
    return res.status(500).json({
      error: "An internal server error has occured",
    });
  }
};

/**
 * @description
 * Retires a single user by their ID.
 */
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userService.getUserById(parseInt(id));
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    res.status(200).json(user);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error getting user by Id:", error);
    }
    res.status(500).json({
      error: "An internal server error has occured",
    });
  }
};

/**
 * @description
 * @param {query}
 * Retrieves a list of users
 */
export const queryUsers = async (req, res) => {
  const body = req.params;
  let size = body.size;
  const orderBy = body.orderBy;
  size = size ? Number(size) : size;
  try {
    const users = await userService.queryUsers(query, size, orderBy);
    res.status(200).json(users);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error Querying users:", error);
    }
    res.status(500).json({
      error: "An internal server error occured",
    });
  }
};
