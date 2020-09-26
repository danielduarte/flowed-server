import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'Instances',
  connector: 'mongodb',
  url: '',
  host: 'localhost',
  port: 0,
  user: '',
  password: '',
  database: 'flowed',
  useNewUrlParser: true,
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class InstancesDataSource
  extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'Instances';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.Instances', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
