export const fileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: Function,
) => {
    if (!file) return cb(new Error('No file provided'), false);

    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/gif',
        'application/pdf',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                'Invalid file type. Only JPEG, PNG, JPG, GIF and PDF files are allowed.',
            ),
            false,
        );
    }
};
