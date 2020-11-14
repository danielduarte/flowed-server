import {DefaultCrudRepository} from '@loopback/repository';
import {ApiKey, ApiKeyRelations} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ApiKeyRepository extends DefaultCrudRepository<ApiKey, typeof ApiKey.prototype.id, ApiKeyRelations> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(ApiKey, dataSource);
  }
}
