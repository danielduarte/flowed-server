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
import {AuthenticationComponent} from '@loopback/authentication';
import {JWTAuthenticationComponent, UserServiceBindings} from '@loopback/authentication-jwt';
import {DbDataSource} from './datasources';

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

    // Mount authentication system with jwt strategy
    this.component(AuthenticationComponent);
    this.component(JWTAuthenticationComponent);
    this.dataSource(DbDataSource, UserServiceBindings.DATASOURCE_NAME);
  }

  start: () => Promise<void> = async () => {
    await super.start();

    const isTesting = process.argv[1].endsWith('mocha');
    if (!isTesting) {
      // eslint-disable-next-line @typescript-eslint/no-invalid-this
      createWebsocketServer(this, {port: this.options.ws.port});
      // eslint-disable-next-line @typescript-eslint/no-invalid-this
      console.log(`WebSocket server is running at port ${this.options.ws.port}`);
    }
  };

  broadcast(message: OutgoingMessage) {
    this.wss.clients.forEach(function each(client) {
      if (client.readyState === WS.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}
