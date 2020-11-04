import {inject} from '@loopback/core';
import {TokenServiceBindings, MyUserService, UserServiceBindings, UserRepository} from '@loopback/authentication-jwt';
import {TokenService, authenticate} from '@loopback/authentication';
import {SecurityBindings, UserProfile, securityId} from '@loopback/security';
import {repository, model, property} from '@loopback/repository';
import {Credentials, User} from '@loopback/authentication-jwt';
import {get, getModelSchemaRef, post, requestBody, SchemaObject} from '@loopback/rest';
import {genSalt, hash} from 'bcryptjs';
import _ from 'lodash';

@model()
export class NewUserRequest extends User {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}

const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 6,
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};

export class UserController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE) public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE) public userService: MyUserService,
    @inject(SecurityBindings.USER, {optional: true}) public user: UserProfile,
    @repository(UserRepository) protected userRepository: UserRepository,
  ) {}

  @post('/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(@requestBody(CredentialsRequestBody) credentials: Credentials): Promise<{token: string}> {
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);

    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);

    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);

    return {token};
  }

  @post('/register', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  async register(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NewUserRequest, {
            title: 'NewUser',
          }),
        },
      },
    })
    newUserRequest: NewUserRequest,
  ): Promise<User> {
    const password = await hash(newUserRequest.password, await genSalt());
    const savedUser = await this.userRepository.create(_.omit(newUserRequest, 'password'));

    await this.userRepository.userCredentials(savedUser.id).create({password});

    // @todo parametrize autoLogin option
    const autoLogin = true;
    if (autoLogin) {
      // @todo Check if credentials needs to be verified here or if it is redundant
      const user = await this.userService.verifyCredentials({ email: newUserRequest.email, password: newUserRequest.password });
      const userProfile = this.userService.convertToUserProfile(user);
      const token = await this.jwtService.generateToken(userProfile);

      savedUser.token = token;
    }

    return savedUser;
  }
}
