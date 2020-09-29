import {Count, CountSchema, Filter, FilterExcludingWhere, repository, Where} from '@loopback/repository';
import {post, param, get, getModelSchemaRef, patch, put, del, requestBody, HttpErrors} from '@loopback/rest';
import {Flow} from '../models';
import {FlowRepository} from '../repositories';

export class FlowController {
  constructor(@repository(FlowRepository) public flowRepository: FlowRepository) {}

  @post('/flows', {
    responses: {
      '200': {
        description: 'Flow model instance',
        content: {'application/json': {schema: getModelSchemaRef(Flow)}},
      },
      '409': {
        description: 'Flow model conflict error',
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Flow, {title: 'NewFlow'}),
        },
      },
    })
    flow: Flow,
    @param.query.boolean('upsert') upsert = false,
  ): Promise<Flow> {
    try {
      return await this.flowRepository[upsert ? 'upsert' : 'create'](flow);
    } catch (err) {
      if (err.code === 11000 && err.name === 'MongoError') {
        throw new HttpErrors.Conflict(`Flow with id '${flow.id}' already exists.`);
      }
      throw err;
    }
  }

  @get('/flows/count', {
    responses: {
      '200': {
        description: 'Flow model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(@param.where(Flow) where?: Where<Flow>): Promise<Count> {
    return this.flowRepository.count(where);
  }

  @get('/flows', {
    responses: {
      '200': {
        description: 'Array of Flow model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Flow, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(@param.filter(Flow) filter?: Filter<Flow>): Promise<Flow[]> {
    return this.flowRepository.find(filter);
  }

  @patch('/flows', {
    responses: {
      '200': {
        description: 'Flow PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Flow, {partial: true}),
        },
      },
    })
    flow: Flow,
    @param.where(Flow) where?: Where<Flow>,
  ): Promise<Count> {
    flow.updatedAt = new Date();
    return this.flowRepository.updateAll(flow, where);
  }

  @get('/flows/{id}', {
    responses: {
      '200': {
        description: 'Flow model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Flow, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Flow, {exclude: 'where'}) filter?: FilterExcludingWhere<Flow>,
  ): Promise<Flow> {
    return this.flowRepository.findById(id, filter);
  }

  @patch('/flows/{id}', {
    responses: {
      '204': {
        description: 'Flow PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Flow, {partial: true}),
        },
      },
    })
    flow: Flow,
  ): Promise<void> {
    flow.updatedAt = new Date();
    await this.flowRepository.updateById(id, flow);
  }

  @put('/flows/{id}', {
    responses: {
      '204': {
        description: 'Flow PUT success',
      },
    },
  })
  async replaceById(@param.path.string('id') id: string, @requestBody() flow: Flow): Promise<void> {
    flow.updatedAt = new Date();
    await this.flowRepository.replaceById(id, flow);
  }

  @del('/flows/{id}', {
    responses: {
      '204': {
        description: 'Flow DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.flowRepository.deleteById(id);
  }
}
