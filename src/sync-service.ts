import {FlowedServerApplication} from './application';
import {IncomingMessage, IncomingMessageType, OutgoingMessageType, WebSocketServerConfig} from './types';
import WS, {Server} from 'ws';

export function createWebsocketServer(app: FlowedServerApplication, config: WebSocketServerConfig) {
  const wss = new WS.Server(config);
  app.wss = wss;

  wss.on('connection', function (ws: Server) {
    ws.on('message', function (messageStr: string) {
      const message: IncomingMessage = JSON.parse(messageStr);
      if (message.type === IncomingMessageType.FlowOpened) {
        app.broadcast({type: OutgoingMessageType.FlowOpened, payload: message.payload});
      }
    });
  });

  return wss;
}
