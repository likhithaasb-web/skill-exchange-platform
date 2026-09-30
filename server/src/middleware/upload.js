const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = process.env.VERCEL
  ? '/tmp/skillx-uploads'
  : path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, uniqueSuffix + '-' + sanitizedName);
  }
});

const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt',
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg',
  '.zip', '.tar', '.gz',
  '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.c', '.cpp', '.cs',
  '.html', '.css', '.json', '.sql', '.md'
]);

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type '${ext}' is not permitted for security reasons. Allowed formats include PDF, DOCX, Code, Images, PPTX, and TXT.`));
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15 MB limit
  },
  fileFilter: fileFilter
});

function getCategoryFromExtension(ext) {
  ext = ext.toLowerCase();
  if (['.pdf'].includes(ext)) return 'PDF';
  if (['.doc', '.docx'].includes(ext)) return 'DOCX';
  if (['.ppt', '.pptx'].includes(ext)) return 'PPT';
  if (['.txt', '.md'].includes(ext)) return 'TXT';
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)) return 'IMAGE';
  if (['.zip', '.tar', '.gz'].includes(ext)) return 'ZIP';
  if (['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.c', '.cpp', '.cs', '.html', '.css', '.json', '.sql'].includes(ext)) return 'CODE';
  return 'OTHER';
}

module.exports = {
  upload,
  getCategoryFromExtension
};
