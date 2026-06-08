import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes =[
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
    ]
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPEG, PNG, JPG, and WEBP are allowed."), false);
    }
};

export const uploadProductImage = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
});
