import * as dotenv from 'dotenv';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as axs from 'axios';
const httpReq = axs.default;

dotenv.config();
@Injectable()
export class SocketIOService {
  constructor() {}

  private socketUrl = process.env.SOCKET_URL;

  async broadcast(payload: {
    collection: string;
    action: string;
    roomId: string;
    data: { [id: string]: any };
    socketId?: string;
  }): Promise<void> {
    try {
      if (!this.socketUrl) {
        throw new InternalServerErrorException('No socket configuration');
      }
      console.log({ payload });
      await httpReq.post(`${this.socketUrl}/broadcast`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error(' Failed to broadcast in socket: ', error);
      throw error;
    }
  }
}
