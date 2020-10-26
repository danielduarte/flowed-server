import {repository} from '@loopback/repository';
import {post, getModelSchemaRef, requestBody} from '@loopback/rest';
import {LogEntry} from '../models';
import {OwnedInstanceRepository, OwnedLogEntryRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';

@authenticate('jwt')
export class LogEntryController {
  constructor(
    @repository(OwnedLogEntryRepository) public logEntryRepository: OwnedLogEntryRepository,
    @repository(OwnedInstanceRepository) public instanceRepository: OwnedInstanceRepository,
  ) {}

  @post('/log-entries', {
    responses: {
      '200': {
        description: 'LogEntry model instance',
        content: {'application/json': {schema: getModelSchemaRef(LogEntry)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(LogEntry, {
            title: 'NewLogEntry',
            exclude: ['id'],
          }),
        },
      },
    })
    logEntry: Omit<LogEntry, 'id'>,
  ): Promise<LogEntry> {
    if (typeof logEntry.objectId === 'string') {
      try {
        await this.instanceRepository.findById(logEntry.objectId);
      } catch (getErr) {
        if (getErr.code === 'ENTITY_NOT_FOUND') {
          try {
            await this.instanceRepository.create({id: logEntry.objectId});
          } catch (createErr) {
            if (createErr.code !== 11000 /* MongoDB duplicated key error */) {
              throw createErr;
            }
          }
        } else {
          throw getErr;
        }
      }
    }

    return this.logEntryRepository.create(logEntry);
  }
}
