import {AuthenticationStrategy, UserService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {UserServiceBindings} from '@loopback/authentication-jwt';
import {UserProfile, securityId} from '@loopback/security';
import {Request} from 'express';
import {HttpErrors, RedirectRoute} from '@loopback/rest';
import {SECURITY_SCHEME_SPEC} from './apikey.spec.enhancer';
import {AnyObject, repository} from '@loopback/repository';
import {ApiKeyRepository} from '../repositories';


export interface Credentials {
  username: string;
  password: string;
}

type Key = string;
type UserId = string;

export class ApikeyAuthenticationStrategy implements AuthenticationStrategy {
  name: string = 'apikey';

  apiCache = new Map<Key, UserId>();

  blockCache = new Set<Key>();

  constructor(
    @inject(UserServiceBindings.USER_SERVICE) private userService: UserService<UserProfile, Credentials>,
    @repository(ApiKeyRepository) public apiKeyRepository: ApiKeyRepository,
  ) {}

  async authenticate(request: Request): Promise<UserProfile | RedirectRoute | undefined> {

    // Get user provided API Key
    const apiKey = ApikeyAuthenticationStrategy.extractCredentials(request);

    // Check if blocked
    if (this.blockCache.has(apiKey)) {
      throw new HttpErrors.Unauthorized(`Invalid API key.`);
    }

    // Find in cache
    let userId = this.apiCache.get(apiKey);

    // Find in database
    if (typeof userId === 'undefined') {
      const storedApiKey = await this.apiKeyRepository.findOne({ where: { key: apiKey } });
      if (storedApiKey === null) {
        this.blockCache.add(apiKey); // @todo control size of this.blockCache
        throw new HttpErrors.Unauthorized(`Invalid API key.`);
      }

      userId = storedApiKey.ownerId;
      this.apiCache.set(apiKey, userId); // @todo control size of this.apiCache
    }

    const userProfile = { [securityId]: userId };

    return userProfile;
  }

  static extractCredentials(request: Request): string {
    const headerName = (SECURITY_SCHEME_SPEC.apikey as AnyObject).name;
    if (!request.headers[headerName]) {
      throw new HttpErrors.Unauthorized(`API key header not found.`);
    }

    // For example : x-api-key 111111aaaaaaaa22222222bbbbbbbb
    const apiKey = request.headers[headerName] as string;

    // @todo add some quick validations to check format and length and early fail in case of invalid

    return apiKey;
  }
}
