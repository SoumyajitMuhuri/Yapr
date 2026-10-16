import ImageKit, { toFile } from "@imagekit/nodejs"
import {nanoid } from "nanoid"
const imageKit=new ImageKit({ privateKey: process.env.IMAGEKIT_PRIVATE_KEY });

function hasImageKitKey(){
    return Boolean(process.env.IMAGEKIT_PRIVATE_KEY);
}

function createFileName(originalName="upload") {
    const newName = originalName.replace(/[^a-zA-Z0-9._-]/g,"_");
    return `chat-${Date.now()}-${nanoid(10)}-${newName}`;
}

async function uploadChatMedia(file){
    const fileName = createFileName(file.originalName);

    const result = await imageKit.files.upload({
        file: await toFile(file.buffer, fileName, { type: file.mimetype }),
        fileName,
        folde:"/chatMedia"
    });

    return result.url;
}

export { uploadChatMedia, hasImageKitKey };