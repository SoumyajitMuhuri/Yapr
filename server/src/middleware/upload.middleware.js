import multer from "multer";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const ALLOWED_MIME_TYPES = [
    "image/",
    "video/",
    "audio/",
    "text/txt",
    "text/csv",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        const isAllowed = ALLOWED_MIME_TYPES.some(type =>
            file.mimetype.startsWith(type)
        );

        if (!isAllowed) {
            cb(new Error("This file type is not supported"));
            return;
        }

        cb(null, true);
    },
});