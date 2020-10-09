import {DefaultCrudRepository, ensurePromise, DataObject, Options, repository} from '@loopback/repository';
import {Flow, FlowRelations, FlowVersion} from '../models';
import {FlowDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {FlowVersionRepository} from './flow-version.repository';
import {FilterExcludingWhere} from '@loopback/filter';

type ID = typeof Flow.prototype.id;
type T = Flow;
type Relations = FlowRelations;

export class FlowRepository extends DefaultCrudRepository<T, ID, Relations> {
  constructor(
    @inject('datasources.Flow') dataSource: FlowDataSource,
    @repository(FlowVersionRepository) public flowVersionRepository: FlowVersionRepository,
  ) {
    super(Flow, dataSource);
  }

  async findById(id: ID, filter?: FilterExcludingWhere<T>, options?: Options): Promise<T & Relations> {
    const flow = await super.findById(id, filter, options);

    // Get spec from active version
    const version = await this.flowVersionRepository.findById(flow.activeVersion);
    flow.spec = version.spec;

    return flow;
  }

  async replaceById(id: ID, data: DataObject<T>, options?: Options): Promise<void> {
    await this.assignNewVersion(data, options);
    return super.replaceById(id, data, options);
  }

  async upsert(entity: DataObject<T>, options?: Options): Promise<T> {
    await this.assignNewVersion(entity, options);

    // @todo check if it is equivalent to PUT or to PATCH
    const data = await this.entityToData(entity, options);
    const model = await ensurePromise(this.modelClass.upsert(data, options));
    return this.toEntity(model);
  }

  async assignNewVersion(data: DataObject<T>, options?: Options): Promise<FlowVersion> {
    // Create version
    const newVersion = await this.flowVersionRepository.create(
      new FlowVersion({
        spec: data.spec ?? {},
        flowId: data.id,
      }),
      options,
    );

    // Update flow
    data.updatedAt = newVersion.createdAt;
    data.activeVersion = newVersion.id;
    delete data.spec;

    return newVersion;
  }
}
