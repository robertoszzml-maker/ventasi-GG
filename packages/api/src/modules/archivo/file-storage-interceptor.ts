import { FileInterceptor } from '@nest-lab/fastify-multer';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as crypto from 'crypto';

export const fileStorageInterceptor = () => {
    return FileInterceptor('file', {
        storage: diskStorage({
            destination: './files', // Ubicación donde se guardarán los archivos
            filename: (req, file, cb) => {
                const uniqueName = crypto.randomBytes(16).toString('hex');
                const ext = path.extname(file.originalname);
                cb(null, uniqueName + ext);
            },
        }),
    });
};
