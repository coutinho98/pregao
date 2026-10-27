import type { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import type { Server, ServerOptions } from 'socket.io';

/** Socket.IO with the same allowed origins as the HTTP API. */
export class CorsIoAdapter extends IoAdapter {
  constructor(
    app: INestApplicationContext,
    private readonly origins: string[],
  ) {
    super(app);
  }

  override createIOServer(port: number, options?: Partial<ServerOptions>): Server {
    const withCors = { ...options, cors: { origin: this.origins } } as ServerOptions;
    return super.createIOServer(port, withCors) as Server;
  }
}
