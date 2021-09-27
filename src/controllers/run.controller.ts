import {AnyObject, repository} from '@loopback/repository';
import {post, getModelSchemaRef, param, requestBody, HttpErrors} from '@loopback/rest';
import {OwnedFlowRepository, OwnedInstanceRepository} from '../repositories';
import {Flow, Instance} from '../models';
import {FlowManager, ValueMap} from 'flowed';
import {authenticate} from '@loopback/authentication';
import {SecurityBindings, UserProfile, securityId} from '@loopback/security';
import {inject} from '@loopback/core';

@authenticate('jwt', 'apikey')
export class RunController {
  constructor(
    @repository(OwnedFlowRepository) public flowRepository: OwnedFlowRepository,
    @repository(OwnedInstanceRepository) public instanceRepository: OwnedInstanceRepository,
    @inject(SecurityBindings.USER) protected owner: UserProfile,
  ) {}

  @post('/start/{id}', {
    responses: {
      '200': {
        description: 'Flow model instance started',
        content: {'application/json': {schema: getModelSchemaRef(Flow)}},
      },
    },
  })
  async start(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {},
      },
    })
    executionParams: AnyObject,
  ): Promise<ValueMap> {
    const flow = await this.flowRepository.findById(id);

    if (flow.status !== 'enabled') {
      throw new HttpErrors.Conflict(`Flow with id '${flow.id}' cannot be executed because it is not enabled.`);
    }

    const instanceInfo = new Instance({
      versionId: flow.activeVersion,
      params: executionParams.params,
      expectedResults: executionParams.expectedResults,
    });

    const newInstance = await this.instanceRepository.create(instanceInfo);
    await this.flowRepository.updateById(flow.id, {
      extra: {...(flow.extra ?? {}), _lastRunAt: new Date()},
    });

    try {
      const results = await FlowManager.run(
        flow.spec ?? {},
        executionParams.params,
        executionParams.expectedResults,
        undefined,
        undefined,
        {
          instanceId: newInstance.id,
          logFields: { ownerId: this.owner[securityId] },
        },
      );

      await this.instanceRepository.updateById(newInstance.id, {
        state: 'finished',
        finishedCond: 'ok',
        extra: {...newInstance.extra, results},
      });

      return results;
    } catch (err) {
      await this.instanceRepository.updateById(newInstance.id, {
        state: 'finished',
        finishedCond: 'error',
      });

      throw new HttpErrors.BadRequest(err.message);
    }
  }
}
