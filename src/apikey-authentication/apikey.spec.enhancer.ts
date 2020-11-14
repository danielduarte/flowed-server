import {injectable} from '@loopback/core';
import {
  asSpecEnhancer,
  mergeOpenAPISpec,
  OASEnhancer,
  OpenApiSpec,
  ReferenceObject,
  SecuritySchemeObject,
} from '@loopback/rest';
import debugModule from 'debug';
import {inspect} from 'util';
const debug = debugModule('flowedhub:apikey-extension:spec-enhancer');

export type SecuritySchemeObjects = {
  [securityScheme: string]: SecuritySchemeObject | ReferenceObject;
};

export const OPERATION_SECURITY_SPEC = [
  {
    apikey: [],
  },
];

export const SECURITY_SCHEME_SPEC: SecuritySchemeObjects = {
  apikey: {
    type: 'apiKey',
    name: 'x-api-key',
    in: 'header',
  },
};

/**
 * A spec enhancer to add API key OpenAPI security entry to
 * `spec.component.securitySchemes`
 */
@injectable(asSpecEnhancer)
export class ApikeySpecEnhancer implements OASEnhancer {
  name = 'apikeyAuth';

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    const patchSpec = {
      components: {
        securitySchemes: SECURITY_SCHEME_SPEC,
      },
      security: OPERATION_SECURITY_SPEC,
    };
    const mergedSpec = mergeOpenAPISpec(spec, patchSpec);
    debug(`security spec extension, merged spec: ${inspect(mergedSpec)}`);
    return mergedSpec;
  }
}
