import {DefaultCrudRepository, ensurePromise, DataObject, Options} from '@loopback/repository';
import {Flow, FlowRelations} from '../models';
import {FlowDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class FlowRepository extends DefaultCrudRepository<Flow, typeof Flow.prototype.id, FlowRelations> {
  constructor(@inject('datasources.Flow') dataSource: FlowDataSource) {
    super(Flow, dataSource);
  }

  async upsert(entity: DataObject<Flow>, options?: Options): Promise<Flow> {
    const data = await this.entityToData(entity, options);
    const model = await ensurePromise(this.modelClass.upsert(data, options));
    return this.toEntity(model);
  }
}
