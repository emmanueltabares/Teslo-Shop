/* eslint-disable prettier/prettier */
import { Request } from 'express';

export const fileFilter = (req: Request, file: Express.Multer.File, cb) => {

    // console.log({ file })
    if(!fileFilter) return cb(new Error('File is empty'), false);

    const fileExptension = file.mimetype.split('/')[1];
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif']

    if( validExtensions.includes(fileExptension)) {
        return cb(null, true)
    }

    cb(null, false);

}