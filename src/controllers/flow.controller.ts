import {AnyObject, Count, CountSchema, Filter, FilterExcludingWhere, repository, Where} from '@loopback/repository';
import {post, param, get, getModelSchemaRef, patch, put, del, requestBody, HttpErrors} from '@loopback/rest';
import {Flow, LogEntry} from '../models';
import {FlowRepository, InstanceRepository} from '../repositories';
import {CoreBindings, inject} from '@loopback/core';
import {FlowedServerApplication} from '../application';
import {OutgoingMessageType} from '../types';
import {authenticate} from '@loopback/authentication';
import {securityId, SecurityBindings, UserProfile} from '@loopback/security';


@authenticate('jwt')
export class FlowController {
  constructor(
    @repository(FlowRepository) protected flowRepository: FlowRepository,
    @repository(InstanceRepository) protected instanceRepository: InstanceRepository,
    @inject(CoreBindings.APPLICATION_INSTANCE) protected app: FlowedServerApplication,
    @inject(SecurityBindings.USER) protected user: UserProfile,
  ) {}

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
          schema: getModelSchemaRef(Flow, {
            title: 'NewFlow',
            exclude: ['ownerId'],
          }),
        },
      },
    })
    flow: Omit<Flow, 'ownerId'>,
    @param.query.boolean('upsert') upsert = false,
  ): Promise<Flow> {
    const newFlow: Flow = new Flow(flow);
    newFlow.ownerId = this.user[securityId];
    try {
      return await this.flowRepository[upsert ? 'upsert' : 'create'](newFlow);
    } catch (err) {
      if (err.code === 11000 && err.name === 'MongoError') {
        throw new HttpErrors.Conflict(`Flow with id '${newFlow.id}' already exists.`);
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
    // @todo manage versions
    const instanceCounts = await this.instanceRepository.countByFlow();

    const countByFlow = instanceCounts.reduce((acc: AnyObject, count: AnyObject) => {
      acc[count.flowId] = count.count;
      return acc;
    }, {});

    const flows = await this.flowRepository.find(filter);
    flows.forEach(flow => {
      (flow as AnyObject).totalInstances = countByFlow[flow.id] || 0;
    });

    return flows;
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
    // @todo manage versions
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
    // @todo manage versions
    await this.flowRepository.updateById(id, flow);
  }

  @put('/flows/{id}', {
    responses: {
      '204': {
        description: 'Flow PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @param.query.string('sessionId') sessionId: string,
    @requestBody() flow: Flow,
  ): Promise<void> {
    await this.flowRepository.replaceById(id, flow, {reuseVersionIfEquivalent: true});
    this.app.broadcast({type: OutgoingMessageType.FlowChanged, payload: {flow, token: sessionId}});
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
    // @todo delete versions: cascade? restrict?
    // @todo delete instances: cascade? restrict?
  }
}
