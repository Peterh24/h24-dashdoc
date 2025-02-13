import { FILE_IMAGE_MAX_WIDTH } from "../services/constants";

export class FileUtils {
    async resizeImage (file: File) {
        if (!file || !file.type.match (/^image/i)) return file;
    
        const base64 = await this.readFileAsDataURL(file);
        const resizedBlob = await this.resizeBase64Image(base64, FILE_IMAGE_MAX_WIDTH); // Resize to 300px width
    
        return new File([resizedBlob], file.name.replace (/\.\w+$/, '.jpeg'), { type: "image/jpeg" });
    }

    readFileAsDataURL(file: File): Promise<string> {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
        });
    }

    private resizeBase64Image(base64: string, width: number): Promise<Blob> {
        return new Promise(resolve => {
            const img = new Image();
            img.src = base64;

            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d")!;
                const height = (img.height / img.width) * width;
    
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
    
                canvas.toBlob(blob => resolve(blob!), "image/jpeg", 0.8);
            };
        });
    }

    async serializeFile (file: File) {
        const base64 = await this.readFileAsDataURL(file);
        return {
            name: file.name,
            type: file.type,
            data: base64
        }
    }

    async unserializeFile (object: any) {
        if (object) {
            const byteCharacters = atob(object.data.split(',')[1]); // Decode Base64
            const byteArrays = new Uint8Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
              byteArrays[i] = byteCharacters.charCodeAt(i);
            }

            const blob = new Blob([byteArrays], { type: object.type });
            const file = new File([blob], object.name, { type: object.type });

            console.log('File retrieved:', file);

            return file;
        }

        return null;
    }
}