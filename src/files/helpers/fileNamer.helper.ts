import { v4 as uuidv4 } from 'uuid';

export const fileNamer = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: Function,
) => {
    // Se genera un sufijo único usando la fecha actual y un número aleatorio
    const uuid = uuidv4();
    // El nombre final del archivo será: <timestamp-random>-<nombre-original>
    cb(null, uuid + '-' + file.originalname);
};
