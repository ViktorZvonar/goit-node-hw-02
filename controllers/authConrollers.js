const User = require("../models/userModel");

const gravatar = require("gravatar");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const createError = require("http-errors");

const { SECRET_KEY } = process.env;

const fs = require("fs/promises");

const path = require("path");

const register = async (req, res, next) => {
  const tempDir = path.join(__dirname, "../temp");
  const userAvatarDir = path.join(__dirname, "../public/avatars");

  const sourcePath = path.join(tempDir, "avatar.jpg");
  const destinationPath = path.join(userAvatarDir, "avatar.jpg");

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw createError(409, "Email in use");
    }

    const avatarURL = gravatar.url(email);

    await fs.rename(sourcePath, destinationPath);
    const avatar = path.join("avatars", "avatar.jpg");

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      ...req.body,
      password: hashPassword,
      avatar,
    });
    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw createError(401, "Email or password is wrong");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw createError(401, "Email or password is wrong");
    }

    const payload = {
      id: user._id,
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23d" });
    await User.findByIdAndUpdate(user._id, { token });
    res.json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCurrent = async (req, res, next) => {
  try {
    const { email, subscription } = req.user;
    res.json({
      email,
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });
    res.status(204).json({
      message: "No content",
    });
  } catch (error) {
    next(error);
  }
};

const updateSubscription = async (req, res, next) => {
  try {
    const { subscription } = req.body;
    const { _id } = req.user;

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { subscription },
      { new: true }
    );

    res.status(200).json({
      user: {
        email: updatedUser.email,
        subscription: updatedUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

// const avatarData = async (req, res) => {
//   console.log(req.file);

//   const tempDir = path.join(__dirname, "../temp");
//   const publicAvatarsDir = path.join(__dirname, "../public/avatars");

//   const sourcePath = path.join(tempDir, "avatar.jpg");
//   const destinationPath = path.join(publicAvatarsDir, "avatars.jpg");

//   try {
//     await fs.rename(sourcePath, destinationPath);
//     res.status(200).send("File moved successfully");
//   } catch (error) {
//     console.error("Error moving file:", error);
//     res.status(500).send("Error moving file");
//   }
// };

module.exports = {
  register,
  login,
  getCurrent,
  logout,
  updateSubscription,
  // avatarData,
};
