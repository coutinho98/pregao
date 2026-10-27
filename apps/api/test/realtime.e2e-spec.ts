import type { INestApplication } from '@nestjs/common';
import {
  type AuthResponse,
  type BidNewPayload,
  type ClientToServerEvents,
  type LotExtendedPayload,
  Role,
  type ServerToClientEvents,
  SocketEvent,
  type YouOutbidPayload,
} from '@pregao/shared';
import type { AddressInfo } from 'node:net';
import { io, type Socket } from 'socket.io-client';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { catalogItem, FakeCatalogProvider } from './fakes/fake-catalog.provider.js';
import { FakeClock } from './fakes/fake-clock.js';
import { scenario } from './scenario.js';
import { createTestApp, registerUser, resetDatabase } from './test-app.js';

type LotSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const MINUTE = 60_000;
/** Long enough for an event that was going to arrive to have arrived on localhost. */
const SILENCE_MS = 300;

describe('Realtime (e2e)', () => {
  let app: INestApplication;
  let url: string;
  let clock: FakeClock;
  let s: ReturnType<typeof scenario>;
  let auctioneer: AuthResponse;
  const sockets: LotSocket[] = [];

  const connect = (token?: string) =>
    new Promise<LotSocket>((resolve, reject) => {
      const socket: LotSocket = io(url, {
        auth: token ? { token } : {},
        transports: ['websocket'],
        forceNew: true,
      });
      sockets.push(socket);
      socket.once('connect', () => resolve(socket));
      socket.once('connect_error', reject);
    });

  const next = <E extends keyof ServerToClientEvents>(socket: LotSocket, event: E) =>
    new Promise<Parameters<ServerToClientEvents[E]>[0]>((resolve) => {
      socket.once(event, ((payload: Parameters<ServerToClientEvents[E]>[0]) =>
        resolve(payload)) as never);
    });

  const silence = (socket: LotSocket, event: keyof ServerToClientEvents) =>
    new Promise<boolean>((resolve) => {
      const heard = () => resolve(false);
      socket.once(event, heard as never);
      setTimeout(() => {
        socket.off(event, heard as never);
        resolve(true);
      }, SILENCE_MS);
    });

  const bidder = async () => {
    const user = await registerUser(app, Role.BIDDER);
    await s.deposit(user.accessToken, 1_000_000);
    return user;
  };

  beforeAll(async () => {
    clock = new FakeClock();
    app = await createTestApp({
      clock,
      catalog: new FakeCatalogProvider([catalogItem({ externalId: '1' })]),
    });
    await app.listen(0, '127.0.0.1');
    url = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}`;
    s = scenario(app, clock);
  });

  beforeEach(async () => {
    await resetDatabase(app);
    auctioneer = await registerUser(app, Role.AUCTIONEER);
  });

  afterEach(() => {
    sockets.splice(0).forEach((socket) => socket.disconnect());
  });

  afterAll(async () => {
    await app.close();
  });

  it('lets anonymous spectators join a lot room and acknowledges with the server clock', async () => {
    const lot = await s.createLot(auctioneer.accessToken, '1');
    const spectator = await connect();

    const ack = await spectator.emitWithAck(SocketEvent.JOIN_LOT, lot.id);

    expect(ack).toEqual({ ok: true, serverNow: clock.now().toISOString() });
    expect(await spectator.emitWithAck(SocketEvent.JOIN_LOT, 'not-a-lot')).toMatchObject({
      ok: false,
    });
  });

  it('broadcasts each accepted bid to the room with the new minimum and serverNow', async () => {
    const lot = await s.createLot(auctioneer.accessToken, '1');
    const ana = await bidder();
    const spectator = await connect();
    await spectator.emitWithAck(SocketEvent.JOIN_LOT, lot.id);

    const heard = next(spectator, SocketEvent.BID_NEW);
    await s.acceptedBid(ana.accessToken, lot.id, 100_000);
    const payload = (await heard) as BidNewPayload;

    expect(payload).toMatchObject({
      lotId: lot.id,
      currentBidCents: 100_000,
      minNextBidCents: 105_000,
      bidCount: 1,
      endsAt: lot.endsAt,
      serverNow: clock.now().toISOString(),
    });
    expect(payload.bid.bidderPseudonym).toMatch(/^Licitante #/);
    expect(JSON.stringify(payload)).not.toContain(ana.user.email);
  });

  it('tells only the outbid bidder, privately, that they were outbid', async () => {
    const lot = await s.createLot(auctioneer.accessToken, '1');
    const ana = await bidder();
    const bia = await bidder();
    await s.acceptedBid(ana.accessToken, lot.id, 100_000);
    const anaSocket = await connect(ana.accessToken);
    const biaSocket = await connect(bia.accessToken);
    const spectator = await connect();
    await spectator.emitWithAck(SocketEvent.JOIN_LOT, lot.id);

    const anaHears = next(anaSocket, SocketEvent.YOU_OUTBID);
    const biaSilent = silence(biaSocket, SocketEvent.YOU_OUTBID);
    const spectatorSilent = silence(spectator, SocketEvent.YOU_OUTBID);
    await s.acceptedBid(bia.accessToken, lot.id, 120_000);

    expect((await anaHears) as YouOutbidPayload).toMatchObject({
      lotId: lot.id,
      lotNumber: lot.number,
      currentBidCents: 120_000,
      minNextBidCents: 125_000,
    });
    expect(await biaSilent).toBe(true);
    expect(await spectatorSilent).toBe(true);
  });

  it('announces anti-sniping extensions to the room', async () => {
    const lot = await s.createLot(auctioneer.accessToken, '1', {
      endsAt: new Date(clock.now().getTime() + 10 * MINUTE).toISOString(),
    });
    const ana = await bidder();
    const spectator = await connect();
    await spectator.emitWithAck(SocketEvent.JOIN_LOT, lot.id);
    clock.advance(9 * MINUTE);

    const heard = next(spectator, SocketEvent.LOT_EXTENDED);
    await s.acceptedBid(ana.accessToken, lot.id, 100_000);

    expect((await heard) as LotExtendedPayload).toEqual({
      lotId: lot.id,
      endsAt: new Date(clock.now().getTime() + 2 * MINUTE).toISOString(),
      serverNow: clock.now().toISOString(),
    });
  });

  it('stays silent when a bid is refused', async () => {
    const lot = await s.createLot(auctioneer.accessToken, '1');
    const ana = await bidder();
    const spectator = await connect();
    await spectator.emitWithAck(SocketEvent.JOIN_LOT, lot.id);

    const silent = silence(spectator, SocketEvent.BID_NEW);
    await s.bid(ana.accessToken, lot.id, 1).expect(422);

    expect(await silent).toBe(true);
  });

  it("returns the user's standing in the lot", async () => {
    const lot = await s.createLot(auctioneer.accessToken, '1');
    const ana = await bidder();
    const bia = await bidder();
    await s.acceptedBid(ana.accessToken, lot.id, 100_000);
    await s.acceptedBid(bia.accessToken, lot.id, 105_000);

    const standing = await s
      .http()
      .get(`/lots/${lot.id}/bids/me`)
      .set('Authorization', `Bearer ${ana.accessToken}`)
      .expect(200);

    expect(standing.body).toMatchObject({
      standing: 'OUTBID',
      position: 2,
      totalBidders: 2,
      myHighestBidCents: 100_000,
    });
    expect(standing.body.pseudonym).toMatch(/^Licitante #/);
  });
});
