import {Count, CountSchema, Filter, FilterExcludingWhere, repository, Where} from '@loopback/repository';
import {post, param, get, getModelSchemaRef, patch, put, del, requestBody} from '@loopback/rest';
import {ApiKey} from '../models';
import {OwnedApiKeyRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';

@authenticate('jwt', 'apikey')
export class ApiKeyController {
  constructor(
    @repository(OwnedApiKeyRepository) public apiKeyRepository: OwnedApiKeyRepository,
  ) {}

  @post('/api-keys', {
    responses: {
      '200': {
        description: 'ApiKey model instance',
        content: {'application/json': {schema: getModelSchemaRef(ApiKey)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ApiKey, {
            title: 'NewApiKey',
            exclude: ['id'],
          }),
        },
      },
    })
    apiKey: Omit<ApiKey, 'id'>,
  ): Promise<ApiKey> {
    return this.apiKeyRepository.create(apiKey);
  }

  @get('/api-keys/count', {
    responses: {
      '200': {
        description: 'ApiKey model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(@param.where(ApiKey) where?: Where<ApiKey>): Promise<Count> {
    return this.apiKeyRepository.count(where);
  }

  @get('/api-keys', {
    responses: {
      '200': {
        description: 'Array of ApiKey model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ApiKey, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(@param.filter(ApiKey) filter?: Filter<ApiKey>): Promise<ApiKey[]> {
    return this.apiKeyRepository.find(filter);
  }

  @patch('/api-keys', {
    responses: {
      '200': {
        description: 'ApiKey PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ApiKey, {partial: true}),
        },
      },
    })
    apiKey: ApiKey,
    @param.where(ApiKey) where?: Where<ApiKey>,
  ): Promise<Count> {
    return this.apiKeyRepository.updateAll(apiKey, where);
  }

  @get('/api-keys/{id}', {
    responses: {
      '200': {
        description: 'ApiKey model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ApiKey, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(ApiKey, {exclude: 'where'}) filter?: FilterExcludingWhere<ApiKey>,
  ): Promise<ApiKey> {
    return this.apiKeyRepository.findById(id, filter);
  }

  @get('/api-keys/mine', {
    responses: {
      '200': {
        description: 'ApiKey model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ApiKey, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findOne(
    @param.filter(ApiKey, {exclude: 'where'}) filter?: FilterExcludingWhere<ApiKey>,
  ): Promise<ApiKey> {
    let key = await this.apiKeyRepository.findOne(filter);
    if (key === null) {
      // @todo Improve generation of API key
      key = await this.apiKeyRepository.create(new ApiKey({
        key: Math.random().toString(36).substring(2)
          + Math.random().toString(36).substring(2)
          + Math.random().toString(36).substring(2)
          + Math.random().toString(36).substring(2),
      }));
    }

    return key;
  }

  @patch('/api-keys/{id}', {
    responses: {
      '204': {
        description: 'ApiKey PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ApiKey, {partial: true}),
        },
      },
    })
    apiKey: ApiKey,
  ): Promise<void> {
    await this.apiKeyRepository.updateById(id, apiKey);
  }

  @put('/api-keys/{id}', {
    responses: {
      '204': {
        description: 'ApiKey PUT success',
      },
    },
  })
  async replaceById(@param.path.string('id') id: string, @requestBody() apiKey: ApiKey): Promise<void> {
    await this.apiKeyRepository.replaceById(id, apiKey);
  }

  @del('/api-keys/{id}', {
    responses: {
      '204': {
        description: 'ApiKey DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.apiKeyRepository.deleteById(id);
  }
}
