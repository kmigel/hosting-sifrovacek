import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

let filename = fileURLToPath(import.meta.url);
let dirname = path.dirname(filename);

let DIR = path.join(dirname, "..", "..", "uploads", "tmp");

if(!fs.existsSync(DIR)) {
    fs.mkdirSync(DIR, {recursive: true});
}

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        let newName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, newName + ext);
    }
});

function fileFilter(req, file, cb) {
    if(file.mimetype !== "application/pdf") {
        return cb(new Error("Only PDF format is allowed"), false);
    }
    cb(null, true);
}

let uploadCipher = multer ({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

export default uploadCipher;