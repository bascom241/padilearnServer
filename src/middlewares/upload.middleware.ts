import multer from "multer";

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AVATAR_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
});
