import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  type OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  type BidNewPayload,
  type ClientToServerEvents,
  type JoinLotAck,
  type LotClosedPayload,
  type LotExtendedPayload,
  lotRoom,
  type ServerToClientEvents,
  SocketEvent,
  userRoom,
  type YouOutbidPayload,
} from '@pregao/shared';
import type { Server, Socket } from 'socket.io';
import type { JwtPayload, RequestUser } from '../../common/auth/request-user.js';
import { Clock } from '../../common/time/clock.js';

type LotSocket = Socket<ClientToServerEvents, ServerToClientEvents, object, { user?: RequestUser }>;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Live lot rooms (`lot:{id}`) for everyone, plus a private room (`user:{id}`) for
 * authenticated sockets. Spectators connect without a token.
 */
@WebSocketGateway()
export class RealtimeGateway implements OnGatewayConnection {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  private readonly server: Server<ClientToServerEvents, ServerToClientEvents>;

  constructor(
    private readonly jwt: JwtService,
    private readonly clock: Clock,
  ) {}

  async handleConnection(socket: LotSocket): Promise<void> {
    const token: unknown = socket.handshake.auth?.token;
    if (typeof token !== 'string' || !token) return;
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token);
      socket.data.user = { id: payload.sub, role: payload.role };
      await socket.join(userRoom(payload.sub));
    } catch {
      // An expired token still lets the socket watch lots, just without private events.
      this.logger.debug('Socket connected with an invalid token; treating it as a spectator');
    }
  }

  @SubscribeMessage(SocketEvent.JOIN_LOT)
  async joinLot(socket: LotSocket, lotId: unknown): Promise<JoinLotAck> {
    const ok = typeof lotId === 'string' && UUID_PATTERN.test(lotId);
    if (ok) await socket.join(lotRoom(lotId));
    return { ok, serverNow: this.clock.now().toISOString() };
  }

  @SubscribeMessage(SocketEvent.LEAVE_LOT)
  async leaveLot(socket: LotSocket, lotId: unknown): Promise<void> {
    if (typeof lotId === 'string') await socket.leave(lotRoom(lotId));
  }

  publishBid(payload: BidNewPayload): void {
    this.server.to(lotRoom(payload.lotId)).emit(SocketEvent.BID_NEW, payload);
  }

  publishExtension(payload: LotExtendedPayload): void {
    this.server.to(lotRoom(payload.lotId)).emit(SocketEvent.LOT_EXTENDED, payload);
  }

  publishClosed(payload: LotClosedPayload): void {
    this.server.to(lotRoom(payload.lotId)).emit(SocketEvent.LOT_CLOSED, payload);
  }

  notifyOutbid(userId: string, payload: YouOutbidPayload): void {
    this.server.to(userRoom(userId)).emit(SocketEvent.YOU_OUTBID, payload);
  }
}
