import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { setSocketServer as setHackSocketServer } from './controllers/HackController.js';
import { setSocketServer as setMarketSocketServer } from './controllers/MarketController.js';
import { setSocketServer as setStormSocketServer } from './controllers/StormController.js';
import type { SocketEvents } from '../shared/types.js';

const PORT = process.env.PORT || 3002;

const server = http.createServer(app);

const io = new Server<SocketEvents>(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setHackSocketServer(io);
setMarketSocketServer(io);
setStormSocketServer(io);

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  socket.on('error', (error) => {
    console.error(`Socket error from ${socket.id}:`, error);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server ready on port ${PORT}`);
  console.log(`📡 Socket.IO server running`);
  console.log(`🔗 API endpoints:`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   POST   /api/auth/register`);
  console.log(`   GET    /api/team`);
  console.log(`   POST   /api/team`);
  console.log(`   POST   /api/team/applications`);
  console.log(`   POST   /api/team/applications/:id/approve`);
  console.log(`   PUT    /api/team/members/:playerId/role`);
  console.log(`   DELETE /api/team/members/:playerId`);
  console.log(`   GET    /api/hack/targets`);
  console.log(`   POST   /api/hack/start`);
  console.log(`   GET    /api/hack/sessions/:id`);
  console.log(`   POST   /api/hack/sessions/:id/skill`);
  console.log(`   GET    /api/market/orders`);
  console.log(`   GET    /api/market/price-suggestion/:dataId`);
  console.log(`   POST   /api/market/list`);
  console.log(`   POST   /api/market/buy/:id`);
  console.log(`   DELETE /api/market/orders/:id`);
  console.log(`   GET    /api/storm/active`);
  console.log(`   POST   /api/storm/create`);
  console.log(`   POST   /api/storm/:id/join`);
  console.log(`   GET    /api/weekly`);
  console.log(`   GET    /api/ranking`);
  console.log(`   GET    /api/health`);
  console.log(`\n📡 Socket events:`);
  console.log(`   hack:update     - Real-time hack progress updates`);
  console.log(`   hack:event      - Hack events (vulnerabilities, counter-hacks, etc.)`);
  console.log(`   hack:complete   - Hack session completion`);
  console.log(`   market:announce - Market purchase announcements`);
  console.log(`   storm:update    - Data storm progress updates`);
  console.log(`   storm:complete  - Data storm completion`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  io.close(() => {
    console.log('Socket.IO server closed');
  });
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  io.close(() => {
    console.log('Socket.IO server closed');
  });
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
