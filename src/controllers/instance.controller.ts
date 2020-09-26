import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {Instance} from '../models';
import {InstanceRepository} from '../repositories';

export class InstanceController {
  constructor(
    @repository(InstanceRepository)
    public instanceRepository: InstanceRepository,
  ) {}

  @post('/instances', {
    responses: {
      '200': {
        description: 'Instance model instance',
        content: {'application/json': {schema: getModelSchemaRef(Instance)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Instance, {
            title: 'NewInstance',
            exclude: ['id'],
          }),
        },
      },
    })
    instance: Omit<Instance, 'id'>,
  ): Promise<Instance> {
    return this.instanceRepository.create(instance);
  }

  @get('/instances/count', {
    responses: {
      '200': {
        description: 'Instance model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(@param.where(Instance) where?: Where<Instance>): Promise<Count> {
    return this.instanceRepository.count(where);
  }

  @get('/instances', {
    responses: {
      '200': {
        description: 'Array of Instance model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Instance, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Instance) filter?: Filter<Instance>,
  ): Promise<Instance[]> {
    return this.instanceRepository.find(filter);
  }

  @patch('/instances', {
    responses: {
      '200': {
        description: 'Instance PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Instance, {partial: true}),
        },
      },
    })
    instance: Instance,
    @param.where(Instance) where?: Where<Instance>,
  ): Promise<Count> {
    return this.instanceRepository.updateAll(instance, where);
  }

  @get('/instances/{id}', {
    responses: {
      '200': {
        description: 'Instance model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Instance, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Instance, {exclude: 'where'})
    filter?: FilterExcludingWhere<Instance>,
  ): Promise<Instance> {
    return this.instanceRepository.findById(id, filter);
  }

  @patch('/instances/{id}', {
    responses: {
      '204': {
        description: 'Instance PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Instance, {partial: true}),
        },
      },
    })
    instance: Instance,
  ): Promise<void> {
    await this.instanceRepository.updateById(id, instance);
  }

  @put('/instances/{id}', {
    responses: {
      '204': {
        description: 'Instance PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() instance: Instance,
  ): Promise<void> {
    await this.instanceRepository.replaceById(id, instance);
  }

  @del('/instances/{id}', {
    responses: {
      '204': {
        description: 'Instance DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.instanceRepository.deleteById(id);
  }
}
