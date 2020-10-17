import {FlowedServerApplication} from './application';
import {IncomingMessage, IncomingMessageType, OutgoingMessageType} from './types';
const WS = require('ws');


export function createWebsocketServer(app: FlowedServerApplication, config: any) {
  const wss = new WS.Server(config);
  app.wss = wss;

  wss.on('connection', function (ws: any) {
    console.log('WS: Client connected');

    ws.on('message', function (messageStr: string) {
      const message: IncomingMessage = JSON.parse(messageStr);
      console.log('WS: Message received: %s', message);
      if (message.type === IncomingMessageType.FlowOpened) {
        app.broadcast({ type: OutgoingMessageType.FlowOpened, payload: message.payload });
      }
    });
  });

  return wss;
}
