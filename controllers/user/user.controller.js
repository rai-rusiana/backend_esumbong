import * as userService from "../../services/user.service.js";

/**
 * @description
 * Creates a new user.
 */
export const createUser = async (req, res) => {
  const { email, password, fullname, age, type, address, contactNumber } = req.body;

  if (!email || !password || !fullname || !address || !type || !contactNumber) {
    return res.status(400).json({
      error:
        "Missing required fields: email, password, fullname, username, and type",
    });
  }
  try {
    const newUser = await userService.createUser({
      email,
      password,
      fullname,
      age,
      type,
      address,
      contactNumber,
    });
    res.status(201).json(newUser);
  } catch (error) {
    // We've also updated this block to give a more specific error for unique constraints.

    if (error.name === "AppError") {
      return res.status(error.statusCode).json({
        error: error.message
      })
    }
    if (error.code === "P2002") {
      const target = error.meta?.target;
      if (target.includes("email")) {
        return res
          .status(409)
          .json({ error: "A user with this email already exists." });
      }
      return res.status(409).json({
        error: "A unique field already exists.",
      });
    }
    if (process.env.NODE_ENV === "development") {
      console.error("Error creating user:", error);
    }
    res.status(500).json({
      error: "An internal server error occurred.",
    });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await userService.loginUser(email, password);
    if (user.status === 423) {
      return res.status(423).json(user.user)
    }
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    // Authentication successful, return the user details (without the password)
    return res.status(200).json(user);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error logging in user:", error);
    }
    if (error.name === "AppError") {
      return res.status(error.status).json({ error: error.message })
    }
    if (error.message === "You are restricted from using this account.") {
      return res.status(403).json({ error: error.message })
    }
    if (error.message === "Incorrect password.") {
      return res.status(401).json({ error: error.message })
    }
    if (error.message === "User not found.") {
      return res.status(404).json({ error: error.message })
    }
    return res.status(500).json({ error: "An internal server error occurred." });
  }
};
export const updateUserById = async (req, res) => {
  const { id } = req.params;
  const updateData = {};
  if (process.env.NODE_ENV === "development") console.log("Controller updating")
  const { email, contactNumber, password, fullname, role } = req.body;

  if (email) updateData.email = email;
  if (contactNumber) updateData.contactNumber = contactNumber;
  if (fullname) updateData.fullname = fullname;
  if (role) updateData.role = role;
  if (password && password.trim() !== "") updateData.password = password;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: "No fields provided to update." });
  }

  try {

    if (process.env.NODE_ENV === "development") console.log("Controller passed the checks")
    const updatedUser = await userService.updateUser(parseInt(id), updateData);
    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser, // optional, send updated user back
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error message", error);
    }
    if (error.message === "Email already taken.") {
      return res.status(400).json({ error: "Email already taken." });
    }

    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(500).json({ error: "An internal server error occurred." });
  }
};

/**
 * @description
 * Deletes a user from the database.
 */
export const deleteUserById = async (req, res) => {
  const { id } = req.params;
  try {
    await userService.toggleUserActive(parseInt(id));
    return res.status(200).json({
      message: "restricted"
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error deleting user:", error);
    }
    if (error.code === "P2025") {
      return res.status(404).json({
        error: "User not found.",
      });
    }
    res.status(500).json({
      error: "An internal server error occured",
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token is missing" });
    }
    const payload = await userService.refreshAccessToken();
    return res.status(200).json(payload);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error deleting user:", error);
    }
    return res.status(500).json({
      error: "An internal server error occured",
    });
  }
};

export const updateUser = async (req, res) => {
  const { email, password, role, fullname } = req.body
  const { id } = req.params

  try {
    await userService.updateUser(parseInt(id), {
      email,
      password,
      role,
      fullname
    })
    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error updating user:", error);
    }
    return res.status(500).json({
      error: "An internal server error occured",
    });
  }
}

export const sendVerify = async (req, res) => {
  ///const { id } = req.params
  const userId = req.user.userId
  const {
    url,
    name,
    size,
    type,
    isAI, } = req.body
  if (process.env.NODE_ENV === "development") console.log(isAI)
  try {
    await userService.sendVerify(Number(userId), {
      url,
      name,
      size,
      type,
      isAI,
    })
    return res.status(200).json({
      message: "ID verification sent."
    })
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("Error sending verification", error)
    return res.status(500).json({
      error: "An internal server error occured."
    })
  }
}

export const verifyUser = async (req, res) => {
  const adminId = req.user.userId
  const { userId } = req.params
  const { verificationStatus } = req.body
  try {
    await userService.verifyUser(Number(userId), Number(adminId), verificationStatus)
    return res.status(200).json({
      message: `User verification ${verificationStatus}.`
    })
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("Error sending verification", error)
    return res.status(500).json({
      error: "An internal server error occured."
    })
  }
}

export const checkVerified = async (req, res) => {
  const userId = req.user.userId
  try {
    const data = await userService.checkVerified(Number(userId))
    return res.status(200).json({
      message: "Success",
      data
    })
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("Error Checking your verification", error)
    return res.status(500).json({
      error: "An internal server error occured."
    })
  }
}

export const getStats = async (req, res) => {

  try {
    const data = await userService.getStats()
    return res.status(200).json({
      message: "Success",
      stats: data
    })
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("Error Getting stats", error)
    return res.status(500).json({
      error: "An internal server error occured."
    })
  }
}
