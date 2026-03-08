import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  getFilePath(fileName: string): string {
    return `/uploads/${fileName}`;
  }
}
