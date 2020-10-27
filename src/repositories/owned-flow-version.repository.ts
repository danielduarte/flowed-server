import {repository} from '@loopback/repository';
import {FlowVersion, FlowVersionRelations} from '../models';
import {OwnedCrudRepository} from './abstract/owned-crud.repository';
import {FlowVersionRepository} from './flow-version.repository';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {inject} from '@loopback/core';

export class OwnedFlowVersionRepository extends OwnedCrudRepository<
  FlowVersion,
  typeof FlowVersion.prototype.id,
  FlowVersionRelations
> {
  constructor(
    @repository(FlowVersionRepository) protected versionRepository: FlowVersionRepository,
    @inject(SecurityBindings.USER) protected owner: UserProfile,
  ) {
    super(versionRepository, owner);
  }
}
