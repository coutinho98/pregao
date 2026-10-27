import type { ClientToServerEvents, ServerToClientEvents } from '@pregao/shared';
import { io, type Socket } from 'socket.io-client';
import { API_URL } from './env';
import { getToken, onTokenChange } from './session';

export type LotSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: LotSocket | null = null;

/**
 * One connection for the whole app. The token is read on every (re)connect, so signing in
 * or out reconnects with the right identity; without a token the socket is a spectator.
 */
export function getSocket(): LotSocket {
  if (!socket) {
    socket = io(API_URL, {
      transports: ['websocket'],
      auth: (setAuth) => setAuth({ token: getToken() }),
    });
    onTokenChange(() => {
      if (socket?.connected) socket.disconnect().connect();
    });
  }
  return socket;
}
