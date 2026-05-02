import multer from 'multer';
import path from 'path';
import fs from 'fs';

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function makeStorage(dir: string) {
  ensureDir(dir);
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    }
  });
}

export const upload = multer({
  storage: makeStorage('uploads/screenshots'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /jpeg|jpg|png/.test(path.extname(file.originalname).toLowerCase())
      && /jpeg|jpg|png/.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Seuls JPG et PNG sont autorisés'));
  }
});

export const uploadDoc = multer({
  storage: makeStorage('uploads/docs'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Seuls PDF, DOC et DOCX sont autorisés'));
  }
});

export const uploadImage = multer({
  storage: makeStorage('uploads/lesson-images'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Seuls JPG, PNG et WEBP sont autorisés'));
  }
});
