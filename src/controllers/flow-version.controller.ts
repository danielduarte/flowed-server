import {Count, CountSchema, Filter, FilterExcludingWhere, repository, Where} from '@loopback/repository';
import {post, param, get, getModelSchemaRef, patch, put, del, requestBody} from '@loopback/rest';
import {FlowVersion} from '../models';
import {FlowVersionRepository} from '../repositories';

export class FlowVersionController {
  constructor(
    @repository(FlowVersionRepository)
    public flowVersionRepository: FlowVersionRepository,
  ) {}

  @post('/flow-versions', {
    responses: {
      '200': {
        description: 'FlowVersion model instance',
        content: {'application/json': {schema: getModelSchemaRef(FlowVersion)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(FlowVersion, {
            title: 'NewFlowVersion',
            exclude: ['id'],
          }),
        },
      },
    })
    flowVersion: Omit<FlowVersion, 'id'>,
  ): Promise<FlowVersion> {
    return this.flowVersionRepository.create(flowVersion);
  }

  @get('/flow-versions/count', {
    responses: {
      '200': {
        description: 'FlowVersion model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(@param.where(FlowVersion) where?: Where<FlowVersion>): Promise<Count> {
    return this.flowVersionRepository.count(where);
  }

  @get('/flow-versions', {
    responses: {
      '200': {
        description: 'Array of FlowVersion model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(FlowVersion, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(@param.filter(FlowVersion) filter?: Filter<FlowVersion>): Promise<FlowVersion[]> {
    return this.flowVersionRepository.find(filter);
  }

  @patch('/flow-versions', {
    responses: {
      '200': {
        description: 'FlowVersion PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(FlowVersion, {partial: true}),
        },
      },
    })
    flowVersion: FlowVersion,
    @param.where(FlowVersion) where?: Where<FlowVersion>,
  ): Promise<Count> {
    return this.flowVersionRepository.updateAll(flowVersion, where);
  }

  @get('/flow-versions/{id}', {
    responses: {
      '200': {
        description: 'FlowVersion model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(FlowVersion, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(FlowVersion, {exclude: 'where'}) filter?: FilterExcludingWhere<FlowVersion>,
  ): Promise<FlowVersion> {
    return this.flowVersionRepository.findById(id, filter);
  }

  @patch('/flow-versions/{id}', {
    responses: {
      '204': {
        description: 'FlowVersion PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(FlowVersion, {partial: true}),
        },
      },
    })
    flowVersion: FlowVersion,
  ): Promise<void> {
    await this.flowVersionRepository.updateById(id, flowVersion);
  }

  @put('/flow-versions/{id}', {
    responses: {
      '204': {
        description: 'FlowVersion PUT success',
      },
    },
  })
  async replaceById(@param.path.string('id') id: string, @requestBody() flowVersion: FlowVersion): Promise<void> {
    await this.flowVersionRepository.replaceById(id, flowVersion);
  }

  @del('/flow-versions/{id}', {
    responses: {
      '204': {
        description: 'FlowVersion DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.flowVersionRepository.deleteById(id);
  }
}
