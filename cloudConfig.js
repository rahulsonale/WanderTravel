const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "WanderTravel_DEV",
    format: async (req, file) => {
      return file.mimetype.split("/")[1];
    },
  },
});

module.exports = {
  cloudinary,
  storage,
};
