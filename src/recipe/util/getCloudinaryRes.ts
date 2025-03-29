import { handleUpload } from '../fileUpload/cloudinary';

const getCloudinaryRes = async (image: Express.Multer.File) => {
  const b64 = Buffer.from(image.buffer).toString('base64');
  const dataURI = 'data:' + image.mimetype + ';base64,' + b64;
  const cloudinaryRes = await handleUpload(dataURI);
  return cloudinaryRes;
};
export default getCloudinaryRes;
