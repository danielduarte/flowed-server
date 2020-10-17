import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RestExplorerBindings, RestExplorerComponent} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {createWebsocketServer} from './sync-service';
import WS from 'ws';
import {OutgoingMessage} from './types';


export {ApplicationConfig};

export class FlowedServerApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {

  public wss: WS.Server;

  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }

  start: () => Promise<void> = async () => {
    await super.start();
    createWebsocketServer(this, { port: 4002 });
  };

  broadcast(message: OutgoingMessage) {
    this.wss.clients.forEach(function each(client) {
      if (client.readyState === WS.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}
