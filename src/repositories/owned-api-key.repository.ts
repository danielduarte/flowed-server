import {repository} from '@loopback/repository';
import {ApiKey, ApiKeyRelations} from '../models';
import {OwnedCrudRepository} from './abstract/owned-crud.repository';
import {ApiKeyRepository} from './api-key.repository';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {inject} from '@loopback/core';

export class OwnedApiKeyRepository extends OwnedCrudRepository<ApiKey, typeof ApiKey.prototype.id, ApiKeyRelations> {
  constructor(
    @repository(ApiKeyRepository) protected apiKeyRepository: ApiKeyRepository,
    @inject(SecurityBindings.USER) protected owner: UserProfile,
  ) {
    super(apiKeyRepository, owner);
  }
}
