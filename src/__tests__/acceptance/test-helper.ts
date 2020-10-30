import {FlowedServerApplication} from '../..';
import {createRestAppClient, givenHttpServerConfig, Client} from '@loopback/testlab';
import {AnyObject} from '@loopback/repository';

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });

  (restConfig as AnyObject).openApiSpec = {
    // useful when used with OpenAPI-to-GraphQL to locate your application
    setServersFromRequest: true,
    disabled: process.env.API_EXPLORER_ENABLED !== '1',
  };

  const app = new FlowedServerApplication({
    rest: restConfig,
  });

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: FlowedServerApplication;
  client: Client;
}
