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
import {TokenServiceBindings} from '@loopback/authentication-jwt';

export {ApplicationConfig};

export class FlowedServerApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  public wss: WS.Server;

  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    const explorerDisabled = !options.rest.openApiSpec || options.rest.openApiSpec.disabled;
    if (!explorerDisabled) {
      // Customize @loopback/rest-explorer configuration here
      this.configure(RestExplorerBindings.COMPONENT).to({
        path: '/explorer',
      });
      this.component(RestExplorerComponent);
    }

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
    this.setupSecurity();

    this.dataSource(DbDataSource, UserServiceBindings.DATASOURCE_NAME);
  }

  setupSecurity() {
    if (process.env.TOKEN_SECRET) {
      this.bind(TokenServiceBindings.TOKEN_SECRET).to(process.env.TOKEN_SECRET);
    }
    if (process.env.TOKEN_EXPIRES_IN) {
      this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(process.env.TOKEN_EXPIRES_IN);
    }
  }

  start: () => Promise<void> = async () => {
    await super.start();

    const isTesting = process.argv[1].endsWith('mocha');
    if (!isTesting) {
      if (process.env.WS_ENABLED !== '1') {
        console.log('WebSocket disabled by configuration');
        return;
      }
      createWebsocketServer(this, {port: this.options.ws.port});
      console.log(`WebSocket server is running at port ${this.options.ws.port}`);
    }
  };

  broadcast(message: OutgoingMessage) {
    if (!this.wss) {
      console.log('WebSocket disabled by configuration. Broadcast message not sent:', message);
      return;
    }

    this.wss.clients.forEach(function each(client) {
      if (client.readyState === WS.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}
