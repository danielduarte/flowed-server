import {repository} from '@loopback/repository';
import {LogEntry, LogEntryRelations} from '../models';
import {OwnedCrudRepository} from './abstract/owned-crud.repository';
import {LogEntryRepository} from './log-entry.repository';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {inject} from '@loopback/core';

export class OwnedLogEntryRepository extends OwnedCrudRepository<LogEntry, typeof LogEntry.prototype.id, LogEntryRelations> {
  constructor(
    @repository(LogEntryRepository) protected versionRepository: LogEntryRepository,
    @inject(SecurityBindings.USER) protected owner: UserProfile,
  ) {
    super(versionRepository, owner);
  }
}
