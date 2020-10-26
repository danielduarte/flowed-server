import {DataObject, EntityNotFoundError, Options, repository} from '@loopback/repository';
import {Flow, FlowRelations} from '../models';
import {OwnedCrudRepository} from './abstract/owned-crud.repository';
import {FlowRepository} from './flow.repository';
import {SecurityBindings, UserProfile, securityId} from '@loopback/security';
import {inject} from '@loopback/core';

export class OwnedFlowRepository extends OwnedCrudRepository<Flow, typeof Flow.prototype.id, FlowRelations> {
  constructor(
    @repository(FlowRepository) protected flowRepository: FlowRepository,
    @inject(SecurityBindings.USER) protected owner: UserProfile,
  ) {
    super(flowRepository, owner);
    console.log('created flow repository for user', owner);
  }

  async upsert(entity: DataObject<Flow>, options?: Options): Promise<Flow> {
    if (entity.ownerId !== this.owner[securityId]) {
      throw new EntityNotFoundError(this.entityClass, entity.id);
    }
    return this.flowRepository.upsert(entity, options);
  }
}
