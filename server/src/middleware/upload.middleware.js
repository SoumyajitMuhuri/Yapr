import multer from "multer";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
      return;
    }

    cb(null, true);
  },
});

export function uploadSingleMedia(req, res, next) {
  upload.single("media")(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "Media file exceeds the 50 MiB limit" });
    }

    if (error instanceof multer.MulterError) {
      return res.status(400).json({ message: "Unsupported media file or upload field" });
    }

    return res.status(400).json({ message: "Unable to process media upload" });
  });
}

function hasValidFileSignature(file) {
  const { buffer, mimetype } = file;
  if (!buffer || buffer.length < 12) return false;

  switch (mimetype) {
    case "image/avif":
      return buffer.toString("ascii", 4, 8) === "ftyp" &&
        /^(avif|avis)$/.test(buffer.toString("ascii", 8, 12));
    case "image/gif":
      return /^GIF8[79]a$/.test(buffer.toString("ascii", 0, 6));
    case "image/jpeg":
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case "image/png":
      return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case "image/webp":
      return buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP";
    case "video/mp4":
      return buffer.toString("ascii", 4, 8) === "ftyp";
    case "video/quicktime":
      return buffer.toString("ascii", 4, 8) === "ftyp" &&
        buffer.toString("ascii", 8, 12) === "qt  ";
    case "video/webm":
      return buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
    default:
      return false;
  }
}

export function validateUploadedMedia(req, res, next) {
  if (!req.file) return next();
  if (!hasValidFileSignature(req.file)) {
    return res.status(400).json({ message: "File content does not match a supported media type" });
  }
  next();
}
