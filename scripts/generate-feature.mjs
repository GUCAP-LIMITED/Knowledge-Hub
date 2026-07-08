#!/usr/bin/env node
// @ts-nocheck
/**
 * Feature generator — stamps out a complete, lint-clean, test-passing vertical slice that follows
 * the architecture in docs/DEVELOPER_GUIDE.md (domain → application → infrastructure → presentation,
 * + module + barrel + tests + testing doubles). It mirrors the `tasks` reference feature, scoped to
 * list + create (the canonical worked example), including the react-hook-form + domainResolver form.
 *
 * Usage:
 *   npm run new:feature -- <feature-kebab> [EntityPascal]
 *   e.g.  npm run new:feature -- invoices Invoice
 *         npm run new:feature -- notes            (entity inferred as "Note")
 *
 * It NEVER edits your hand-written app wiring; instead it prints the exact 3 steps to wire the
 * feature into composition-root.ts / App.tsx / AppRouter.tsx.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src');

const fail = (msg) => {
  console.error(`\x1b[31m✗ ${msg}\x1b[0m`);
  process.exit(1);
};

const [, , featureArg, entityArg] = process.argv;

if (!featureArg) {
  fail('Usage: npm run new:feature -- <feature-kebab> [EntityPascal]');
}
if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(featureArg)) {
  fail(`Feature name must be kebab-case (got "${featureArg}"), e.g. "invoices" or "payment-methods".`);
}
if (entityArg !== undefined && !/^[A-Z][A-Za-z0-9]*$/.test(entityArg)) {
  fail(`Entity name must be PascalCase (got "${entityArg}"), e.g. "Invoice".`);
}

const toPascal = (s) =>
  s
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');
const toCamel = (p) => (p ? p[0].toLowerCase() + p.slice(1) : p);
const toKebab = (p) => p.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const toScream = (kebab) => kebab.split('-').join('_').toUpperCase();
const singularize = (w) => {
  if (/ies$/.test(w)) return w.replace(/ies$/, 'y');
  if (/(ses|xes|zes|ches|shes)$/.test(w)) return w.replace(/es$/, '');
  if (/ss$/.test(w)) return w;
  if (/s$/.test(w)) return w.replace(/s$/, '');
  return w;
};

const featureKebab = featureArg;
const featurePascal = toPascal(featureKebab);
const featureCamel = toCamel(featurePascal);
const featureScream = toScream(featureKebab);
const entityPascal = entityArg ?? singularize(featurePascal);
const entityCamel = toCamel(entityPascal);
const entityKebab = toKebab(entityPascal);

const n = {
  featureKebab,
  featurePascal,
  featureCamel,
  entityPascal,
  entityCamel,
  entityKebab,
  voName: `${entityPascal}Name`,
  voFile: `${entityKebab}-name`,
  errBase: `${entityPascal}Error`,
  errUnavailable: `${featurePascal}UnavailableError`,
  errInvalidName: `Invalid${entityPascal}NameError`,
  gateway: `${entityPascal}Gateway`,
  httpGateway: `${entityPascal}HttpGateway`,
  mapperFn: `to${entityPascal}`,
  dtoSchema: `${entityPascal}DtoSchema`,
  dtoListSchema: `${entityPascal}ListDtoSchema`,
  dtoType: `${entityPascal}Dto`,
  listUseCase: `List${featurePascal}UseCase`,
  createUseCase: `Create${entityPascal}UseCase`,
  module: `${featurePascal}Module`,
  moduleDeps: `${featurePascal}ModuleDeps`,
  createModule: `create${featurePascal}Module`,
  provider: `${featurePascal}ModuleProvider`,
  providerProps: `${featurePascal}ModuleProviderProps`,
  context: `${featurePascal}ModuleContext`,
  useModule: `use${featurePascal}Module`,
  useList: `use${featurePascal}`,
  useCreate: `useCreate${entityPascal}`,
  queryKey: `${featureCamel}QueryKey`,
  page: `${featurePascal}Page`,
  addForm: `Add${entityPascal}Form`,
  listProp: `list${featurePascal}`,
  createProp: `create${entityPascal}`,
  fake: `Fake${entityPascal}Gateway`,
  builder: `build${entityPascal}`,
  endpoint: `/${featureKebab}`,
  route: `/${featureKebab}`,
  endpointConst: `${featureScream}_ENDPOINT`,
  invalidNameCode: `${featureScream}_INVALID_NAME`,
  unavailableCode: `${featureScream}_UNAVAILABLE`,
};

const featureDir = join(srcDir, 'features', featureKebab);
if (existsSync(featureDir)) {
  fail(`src/features/${featureKebab} already exists — refusing to overwrite.`);
}

const files = {
  // ---------------------------------------------------------------- domain
  [`features/${featureKebab}/domain/value-objects/${n.voFile}.ts`]: `import { type Result, ok, err } from '@core/result';
import { ${n.errInvalidName} } from '../errors/${n.entityKebab}-errors';

const MAX_LENGTH = 120;

/**
 * ${n.entityPascal} name value object. Immutable and self-validating: trimmed and bounded in length.
 * Construct through ${n.voName}.create (returns a Result) — the private constructor makes an invalid
 * name unrepresentable anywhere in the system.
 */
export class ${n.voName} {
  public static readonly maxLength = MAX_LENGTH;

  private constructor(public readonly value: string) {}

  public static create(raw: string): Result<${n.voName}, ${n.errInvalidName}> {
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
      return err(new ${n.errInvalidName}('a name is required'));
    }
    if (trimmed.length > MAX_LENGTH) {
      return err(new ${n.errInvalidName}('must be at most ' + String(MAX_LENGTH) + ' characters'));
    }
    return ok(new ${n.voName}(trimmed));
  }

  public toString(): string {
    return this.value;
  }
}
`,

  [`features/${featureKebab}/domain/value-objects/${n.voFile}.test.ts`]: `import { describe, expect, it } from 'vitest';
import { isErr, isOk } from '@core/result';
import { ${n.voName} } from './${n.voFile}';

describe('${n.voName}', () => {
  it('trims valid input', () => {
    const result = ${n.voName}.create('  Hello world  ');
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.value).toBe('Hello world');
    }
  });

  it.each(['', '   '])('rejects blank input %j', (raw) => {
    expect(isErr(${n.voName}.create(raw))).toBe(true);
  });

  it('rejects input longer than the max length', () => {
    expect(isErr(${n.voName}.create('a'.repeat(${n.voName}.maxLength + 1)))).toBe(true);
  });
});
`,

  [`features/${featureKebab}/domain/entities/${n.entityKebab}.ts`]: `export interface ${n.entityPascal}Props {
  readonly id: string;
  readonly name: string;
  readonly createdAt: Date;
}

/**
 * A ${n.entityCamel}. Immutable: state changes return a new ${n.entityPascal} rather than mutating in
 * place, so the presentation layer can rely on reference equality for cache updates.
 */
export class ${n.entityPascal} {
  public readonly id: string;
  public readonly name: string;
  public readonly createdAt: Date;

  public constructor(props: ${n.entityPascal}Props) {
    this.id = props.id;
    this.name = props.name;
    this.createdAt = props.createdAt;
  }

  /** Return a copy with a different name. */
  public withName(name: string): ${n.entityPascal} {
    return new ${n.entityPascal}({ id: this.id, name, createdAt: this.createdAt });
  }
}
`,

  [`features/${featureKebab}/domain/errors/${n.entityKebab}-errors.ts`]: `import { DomainError } from '@core/errors';

/** Base type for every ${featureKebab}-domain failure. Lets callers catch/switch on intent. */
export abstract class ${n.errBase} extends DomainError {}

/** The ${featureKebab} API could not be reached or returned an unexpected response. */
export class ${n.errUnavailable} extends ${n.errBase} {
  public readonly code = '${n.unavailableCode}';

  public constructor(cause?: unknown) {
    super('The ${featureKebab} service is currently unavailable. Please try again.', { cause });
  }
}

/** A ${n.entityCamel} name failed validation (empty, blank, or too long). */
export class ${n.errInvalidName} extends ${n.errBase} {
  public readonly code = '${n.invalidNameCode}';

  public constructor(reason: string) {
    super('Invalid ${n.entityCamel} name: ' + reason, { context: { reason } });
  }
}
`,

  [`features/${featureKebab}/domain/ports/${n.entityKebab}-gateway.ts`]: `import type { Result } from '@core/result';
import type { ${n.errBase} } from '../errors/${n.entityKebab}-errors';
import type { ${n.entityPascal} } from '../entities/${n.entityKebab}';
import type { ${n.voName} } from '../value-objects/${n.voFile}';

/**
 * Port to the ${featureKebab} service. The domain states the contract in its own terms; HTTP details
 * live in the infrastructure implementation. This is the Dependency Inversion seam.
 */
export interface ${n.gateway} {
  /** Fetch every ${n.entityCamel}. */
  list(): Promise<Result<readonly ${n.entityPascal}[], ${n.errBase}>>;

  /** Create a ${n.entityCamel} from a validated name. */
  create(name: ${n.voName}): Promise<Result<${n.entityPascal}, ${n.errBase}>>;
}
`,

  [`features/${featureKebab}/domain/index.ts`]: `export * from './errors/${n.entityKebab}-errors';
export * from './value-objects/${n.voFile}';
export * from './entities/${n.entityKebab}';
export type { ${n.gateway} } from './ports/${n.entityKebab}-gateway';
`,

  // ----------------------------------------------------------- application
  [`features/${featureKebab}/application/use-cases/list-${featureKebab}.ts`]: `import type { Result } from '@core/result';
import type { Logger } from '@core/logger';
import type { ${n.entityPascal}, ${n.errBase}, ${n.gateway} } from '../../domain';

export interface ${n.listUseCase}Deps {
  readonly ${n.entityCamel}Gateway: ${n.gateway};
  readonly logger: Logger;
}

/** Fetch every ${n.entityCamel}. Pure orchestration: delegate to the gateway and return its Result. */
export class ${n.listUseCase} {
  private readonly ${n.entityCamel}Gateway: ${n.gateway};
  private readonly logger: Logger;

  public constructor(deps: ${n.listUseCase}Deps) {
    this.${n.entityCamel}Gateway = deps.${n.entityCamel}Gateway;
    this.logger = deps.logger.child('list-${featureKebab}');
  }

  public async execute(): Promise<Result<readonly ${n.entityPascal}[], ${n.errBase}>> {
    const result = await this.${n.entityCamel}Gateway.list();
    if (!result.ok) {
      this.logger.warn('Listing ${featureKebab} failed', { code: result.error.code });
    }
    return result;
  }
}
`,

  [`features/${featureKebab}/application/use-cases/create-${n.entityKebab}.ts`]: `import { type Result, isErr } from '@core/result';
import type { Logger } from '@core/logger';
import { type ${n.entityPascal}, type ${n.errBase}, type ${n.gateway}, ${n.voName} } from '../../domain';

export interface ${n.createUseCase}Deps {
  readonly ${n.entityCamel}Gateway: ${n.gateway};
  readonly logger: Logger;
}

/**
 * Create a ${n.entityCamel} from raw input. Validates the name via the domain value object before
 * touching the gateway, so the API only ever receives well-formed data.
 */
export class ${n.createUseCase} {
  private readonly ${n.entityCamel}Gateway: ${n.gateway};
  private readonly logger: Logger;

  public constructor(deps: ${n.createUseCase}Deps) {
    this.${n.entityCamel}Gateway = deps.${n.entityCamel}Gateway;
    this.logger = deps.logger.child('create-${n.entityKebab}');
  }

  public async execute(rawName: string): Promise<Result<${n.entityPascal}, ${n.errBase}>> {
    const name = ${n.voName}.create(rawName);
    if (isErr(name)) {
      this.logger.warn('Rejected invalid ${n.entityCamel} name', { code: name.error.code });
      return name;
    }

    const result = await this.${n.entityCamel}Gateway.create(name.value);
    if (isErr(result)) {
      this.logger.warn('Creating ${n.entityCamel} failed', { code: result.error.code });
      return result;
    }

    this.logger.info('${n.entityPascal} created', { id: result.value.id });
    return result;
  }
}
`,

  [`features/${featureKebab}/application/use-cases/create-${n.entityKebab}.test.ts`]: `import { beforeEach, describe, expect, it } from 'vitest';
import { isErr, isOk, ok } from '@core/result';
import { ${n.fake}, ${n.builder}, silentLogger } from '@testing';
import { ${n.errInvalidName} } from '../../domain';
import { ${n.createUseCase} } from './create-${n.entityKebab}';

describe('${n.createUseCase}', () => {
  let gateway: ${n.fake};
  let useCase: ${n.createUseCase};

  beforeEach(() => {
    gateway = new ${n.fake}();
    useCase = new ${n.createUseCase}({ ${n.entityCamel}Gateway: gateway, logger: silentLogger() });
  });

  it('rejects a blank name without calling the gateway', async () => {
    const result = await useCase.execute('   ');

    expect(isErr(result) && result.error).toBeInstanceOf(${n.errInvalidName});
    expect(gateway.lastCreatedName).toBeNull();
  });

  it('forwards a trimmed, valid name to the gateway', async () => {
    const created = ${n.builder}({ name: 'Sample name' });
    gateway.createResult = ok(created);

    const result = await useCase.execute('  Sample name  ');

    expect(isOk(result)).toBe(true);
    expect(gateway.lastCreatedName).toBe('Sample name');
    if (isOk(result)) {
      expect(result.value).toBe(created);
    }
  });
});
`,

  [`features/${featureKebab}/application/index.ts`]: `export * from './use-cases/list-${featureKebab}';
export * from './use-cases/create-${n.entityKebab}';
`,

  // -------------------------------------------------------- infrastructure
  [`features/${featureKebab}/infrastructure/dto/${n.entityKebab}-api.dto.ts`]: `import { z } from 'zod';

/**
 * Wire contract for the ${featureKebab} endpoints. Every response is validated with Zod at the
 * boundary so malformed payloads are caught here — the domain only sees data it expects.
 */
export const ${n.dtoSchema} = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  createdAt: z.string().datetime(),
});

export const ${n.dtoListSchema} = z.array(${n.dtoSchema});

export type ${n.dtoType} = z.infer<typeof ${n.dtoSchema}>;
`,

  [`features/${featureKebab}/infrastructure/${n.entityKebab}-mapper.ts`]: `import { ${n.entityPascal} } from '../domain';
import type { ${n.dtoType} } from './dto/${n.entityKebab}-api.dto';

/**
 * Translates the transport-level DTO into the domain ${n.entityPascal}. All knowledge of how the API
 * encodes a ${n.entityCamel} (e.g. ISO date strings) lives here, keeping the domain free of wire concerns.
 */
export function ${n.mapperFn}(dto: ${n.dtoType}): ${n.entityPascal} {
  return new ${n.entityPascal}({
    id: dto.id,
    name: dto.name,
    createdAt: new Date(dto.createdAt),
  });
}
`,

  [`features/${featureKebab}/infrastructure/${n.entityKebab}-http-gateway.ts`]: `import { type HttpClient, HttpError } from '@core/http';
import type { Logger } from '@core/logger';
import { type Failure, type Result, ok, err } from '@core/result';
import type { z } from 'zod';
import {
  type ${n.entityPascal},
  type ${n.errBase},
  type ${n.gateway},
  type ${n.voName},
  ${n.errUnavailable},
} from '../domain';
import { ${n.dtoSchema}, ${n.dtoListSchema} } from './dto/${n.entityKebab}-api.dto';
import { ${n.mapperFn} } from './${n.entityKebab}-mapper';

const ${n.endpointConst} = '${n.endpoint}';

export interface ${n.httpGateway}Deps {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

/** HTTP implementation of the {@link ${n.gateway}} port against a JSON ${featureKebab} API. */
export class ${n.httpGateway} implements ${n.gateway} {
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;

  public constructor(deps: ${n.httpGateway}Deps) {
    this.httpClient = deps.httpClient;
    this.logger = deps.logger.child('${n.entityKebab}-gateway');
  }

  public async list(): Promise<Result<readonly ${n.entityPascal}[], ${n.errBase}>> {
    try {
      const raw = await this.httpClient.get<unknown>(${n.endpointConst});
      const parsed = ${n.dtoListSchema}.safeParse(raw);
      if (!parsed.success) {
        return this.unexpectedShape(parsed.error);
      }
      return ok(parsed.data.map((dto) => ${n.mapperFn}(dto)));
    } catch (cause) {
      return err(this.mapError(cause));
    }
  }

  public async create(name: ${n.voName}): Promise<Result<${n.entityPascal}, ${n.errBase}>> {
    try {
      const raw = await this.httpClient.post<unknown>(${n.endpointConst}, {
        name: name.value,
      });
      const parsed = ${n.dtoSchema}.safeParse(raw);
      if (!parsed.success) {
        return this.unexpectedShape(parsed.error);
      }
      return ok(${n.mapperFn}(parsed.data));
    } catch (cause) {
      return err(this.mapError(cause));
    }
  }

  private unexpectedShape(error: z.ZodError): Failure<${n.errBase}> {
    this.logger.error('${n.featurePascal} endpoint returned an unexpected shape', error);
    return err(new ${n.errUnavailable}(error));
  }

  private mapError(cause: unknown): ${n.errBase} {
    if (cause instanceof HttpError) {
      this.logger.error('${n.featurePascal} request failed', cause, { status: cause.status });
    } else {
      this.logger.error('${n.featurePascal} request failed', cause);
    }
    return new ${n.errUnavailable}(cause);
  }
}
`,

  [`features/${featureKebab}/infrastructure/index.ts`]: `export * from './dto/${n.entityKebab}-api.dto';
export * from './${n.entityKebab}-mapper';
export * from './${n.entityKebab}-http-gateway';
`,

  // ----------------------------------------------------------- presentation
  [`features/${featureKebab}/presentation/use-${featureKebab}.ts`]: `import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { isErr } from '@core/result';
import type { ${n.entityPascal} } from '../domain';
import { ${n.useModule} } from './use-${featureKebab}-module';

/** Stable query key for the ${featureKebab} list. Mutations invalidate this so the list re-fetches. */
export const ${n.queryKey} = ['${featureKebab}'] as const;

export const ${n.useList} = (): UseQueryResult<readonly ${n.entityPascal}[]> => {
  const { ${n.listProp} } = ${n.useModule}();

  return useQuery({
    queryKey: ${n.queryKey},
    queryFn: async (): Promise<readonly ${n.entityPascal}[]> => {
      const result = await ${n.listProp}.execute();
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
  });
};

export const ${n.useCreate} = (): UseMutationResult<${n.entityPascal}, Error, string> => {
  const { ${n.createProp} } = ${n.useModule}();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string): Promise<${n.entityPascal}> => {
      const result = await ${n.createProp}.execute(name);
      if (isErr(result)) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ${n.queryKey} });
    },
  });
};
`,

  [`features/${featureKebab}/presentation/${featureKebab}-module-context.ts`]: `import { createContext } from 'react';
import type { ${n.module} } from '../${featureKebab}-module';

/** Holds the DI-built ${featureKebab} module. Populated by ${n.provider} at the composition root. */
export const ${n.context} = createContext<${n.module} | null>(null);
`,

  [`features/${featureKebab}/presentation/use-${featureKebab}-module.ts`]: `import { useContext } from 'react';
import type { ${n.module} } from '../${featureKebab}-module';
import { ${n.context} } from './${featureKebab}-module-context';

/** Resolve the injected ${featureKebab} use cases. Throws if used outside the provider. */
export const ${n.useModule} = (): ${n.module} => {
  const module = useContext(${n.context});
  if (module === null) {
    throw new Error('${n.featurePascal} hooks must be used within <${n.provider}>.');
  }
  return module;
};
`,

  [`features/${featureKebab}/presentation/${n.provider}.tsx`]: `import type { ReactElement, ReactNode } from 'react';
import type { ${n.module} } from '../${featureKebab}-module';
import { ${n.context} } from './${featureKebab}-module-context';

export interface ${n.providerProps} {
  readonly module: ${n.module};
  readonly children: ReactNode;
}

/**
 * Provides the injected ${featureKebab} use cases to the React tree. The module is built by the
 * composition root, so this component stays free of wiring.
 */
export const ${n.provider} = ({
  module,
  children,
}: ${n.providerProps}): ReactElement => (
  <${n.context}.Provider value={module}>{children}</${n.context}.Provider>
);
`,

  [`features/${featureKebab}/presentation/${n.addForm}.tsx`]: `import { type ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { Button, TextField } from '@shared/ui';
import { domainResolver } from '@shared/forms';
import { ${n.voName} } from '../domain';
import { ${n.useCreate} } from './use-${featureKebab}';
import styles from './${n.page}.module.css';

interface ${n.addForm}Values {
  name: string;
}

/**
 * Inline form that creates a ${n.entityCamel} and clears itself on success. Validation delegates to the
 * ${n.voName} value object via domainResolver — the same rule the use case enforces.
 */
export const ${n.addForm} = (): ReactElement => {
  const ${n.createProp} = ${n.useCreate}();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<${n.addForm}Values>({
    defaultValues: { name: '' },
    resolver: domainResolver<${n.addForm}Values>({
      name: (value) => ${n.voName}.create(value),
    }),
  });

  const onSubmit = handleSubmit(({ name }) => {
    ${n.createProp}.mutate(name, {
      onSuccess: () => {
        reset();
      },
    });
  });

  const fieldError =
    errors.name?.message ??
    (${n.createProp}.isError ? ${n.createProp}.error.message : undefined);

  return (
    <form
      className={styles.addForm}
      onSubmit={(event) => {
        void onSubmit(event);
      }}
    >
      <div className={styles.addField}>
        <TextField
          label="New ${n.entityCamel}"
          placeholder="Enter a name"
          {...(fieldError !== undefined ? { error: fieldError } : {})}
          {...register('name')}
        />
      </div>
      <Button type="submit" isLoading={${n.createProp}.isPending}>
        Add
      </Button>
    </form>
  );
};
`,

  [`features/${featureKebab}/presentation/${n.page}.tsx`]: `import { type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Spinner } from '@shared/ui';
import { ${n.addForm} } from './${n.addForm}';
import { ${n.useList} } from './use-${featureKebab}';
import styles from './${n.page}.module.css';

/**
 * ${n.featurePascal} list, demonstrating the TanStack Query pattern end-to-end: server state flows
 * through Query -> use case -> gateway (Zod + mapper) -> domain Result. Requires a backend exposing
 * ${n.endpoint} (GET/POST) — tests cover the slice with the fake gateway instead.
 */
export const ${n.page} = (): ReactElement => {
  const ${n.featureCamel} = ${n.useList}();

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.title}>${n.featurePascal}</h1>
        <Link to="/">Back to dashboard</Link>
      </header>

      <${n.addForm} />

      {${n.featureCamel}.isPending ? (
        <div className={styles.center}>
          <Spinner size="lg" label="Loading ${featureKebab}" />
        </div>
      ) : null}

      {${n.featureCamel}.isError ? (
        <Alert tone="error" title="Could not load ${featureKebab}">
          {${n.featureCamel}.error.message}
        </Alert>
      ) : null}

      {${n.featureCamel}.isSuccess && ${n.featureCamel}.data.length === 0 ? (
        <p className={styles.empty}>No ${featureKebab} yet. Add one above to get started.</p>
      ) : null}

      {${n.featureCamel}.isSuccess && ${n.featureCamel}.data.length > 0 ? (
        <ul className={styles.list}>
          {${n.featureCamel}.data.map((item) => (
            <li key={item.id} className={styles.row}>
              {item.name}
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
};
`,

  [`features/${featureKebab}/presentation/${n.page}.module.css`]: `.screen {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.title {
  margin: 0;
  font-size: 1.5rem;
}

.addForm {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
}

.addField {
  flex: 1;
}

.center {
  display: grid;
  place-items: center;
  padding: 2rem 0;
}

.empty {
  margin: 0;
  padding: 1.5rem;
  text-align: center;
  color: var(--color-text-muted);
  background-color: var(--color-surface-muted);
  border-radius: var(--radius-md);
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.6rem 0.85rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
`,

  [`features/${featureKebab}/presentation/index.ts`]: `export * from './${n.provider}';
export * from './use-${featureKebab}';
export * from './use-${featureKebab}-module';
// ${n.page} is deliberately omitted: the router lazy-imports it directly so it is code-split.
`,

  // ------------------------------------------------------- feature wiring
  [`features/${featureKebab}/${featureKebab}-module.ts`]: `import type { HttpClient } from '@core/http';
import type { Logger } from '@core/logger';
import { ${n.createUseCase}, ${n.listUseCase} } from './application';
import { ${n.httpGateway} } from './infrastructure';

export interface ${n.moduleDeps} {
  readonly httpClient: HttpClient;
  readonly logger: Logger;
}

/** The use cases exposed by the ${featureKebab} feature, consumed via the provider. */
export interface ${n.module} {
  readonly ${n.listProp}: ${n.listUseCase};
  readonly ${n.createProp}: ${n.createUseCase};
}

/**
 * Composition root *for the ${featureKebab} feature*. Wires the concrete HTTP gateway to the use
 * cases. This is the only place inside the feature where layers are joined.
 */
export const ${n.createModule} = (deps: ${n.moduleDeps}): ${n.module} => {
  const ${n.entityCamel}Gateway = new ${n.httpGateway}({
    httpClient: deps.httpClient,
    logger: deps.logger,
  });

  return {
    ${n.listProp}: new ${n.listUseCase}({ ${n.entityCamel}Gateway, logger: deps.logger }),
    ${n.createProp}: new ${n.createUseCase}({ ${n.entityCamel}Gateway, logger: deps.logger }),
  };
};
`,

  [`features/${featureKebab}/index.ts`]: `/**
 * Public API of the ${featureKebab} feature. Other features and the app shell import ONLY from here.
 */
export {
  ${n.createModule},
  type ${n.module},
  type ${n.moduleDeps},
} from './${featureKebab}-module';
export {
  ${n.provider},
  ${n.useList},
  ${n.useCreate},
  ${n.queryKey},
} from './presentation';
export type { ${n.entityPascal} } from './domain';

// NOTE: ${n.page} is intentionally NOT re-exported — the router lazy-loads it from its module path
// so it can be code-split into its own chunk.
`,

  // ---------------------------------------------------------- test doubles
  [`testing/fakes/fake-${n.entityKebab}-gateway.ts`]: `import { type Result, ok } from '@core/result';
import type {
  ${n.entityPascal},
  ${n.errBase},
  ${n.gateway},
  ${n.voName},
} from '@features/${featureKebab}/domain';
import { ${n.builder} } from '../builders/${n.entityKebab}.builder';

/** Hand-written, fully-typed fake of the {@link ${n.gateway}} port. */
export class ${n.fake} implements ${n.gateway} {
  public listResult: Result<readonly ${n.entityPascal}[], ${n.errBase}> = ok([]);
  public createResult: Result<${n.entityPascal}, ${n.errBase}> = ok(${n.builder}());

  public lastCreatedName: string | null = null;

  public list(): Promise<Result<readonly ${n.entityPascal}[], ${n.errBase}>> {
    return Promise.resolve(this.listResult);
  }

  public create(name: ${n.voName}): Promise<Result<${n.entityPascal}, ${n.errBase}>> {
    this.lastCreatedName = name.value;
    return Promise.resolve(this.createResult);
  }
}
`,

  [`testing/builders/${n.entityKebab}.builder.ts`]: `import { ${n.entityPascal} } from '@features/${featureKebab}/domain';

export interface ${n.entityPascal}Overrides {
  readonly id?: string;
  readonly name?: string;
  readonly createdAt?: Date;
}

/** Construct a valid {@link ${n.entityPascal}} for tests, overriding only what matters per case. */
export const ${n.builder} = (overrides: ${n.entityPascal}Overrides = {}): ${n.entityPascal} =>
  new ${n.entityPascal}({
    id: overrides.id ?? '${n.entityKebab}-1',
    name: overrides.name ?? 'Sample name',
    createdAt: overrides.createdAt ?? new Date('2026-01-01T00:00:00.000Z'),
  });
`,
};

// Write every file.
const written = [];
for (const [rel, content] of Object.entries(files)) {
  const abs = join(srcDir, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content, 'utf8');
  written.push(rel);
}

// Wire the new test doubles into the @testing barrel (idempotent).
const testingIndexPath = join(srcDir, 'testing', 'index.ts');
const testingIndex = readFileSync(testingIndexPath, 'utf8');
const exportsToAdd = [
  `export * from './fakes/fake-${n.entityKebab}-gateway';`,
  `export * from './builders/${n.entityKebab}.builder';`,
].filter((line) => !testingIndex.includes(line));
if (exportsToAdd.length > 0) {
  const next = testingIndex.replace(/\s*$/, '\n') + exportsToAdd.join('\n') + '\n';
  writeFileSync(testingIndexPath, next, 'utf8');
}

// Report.
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
console.log(green(`\n✓ Generated feature "${featureKebab}" (entity ${n.entityPascal})`));
console.log(`  ${written.length + exportsToAdd.length} files written under src/features/${featureKebab}/ and src/testing/\n`);
console.log(bold('Next — wire it into the app (3 steps), then run `npm run validate`:\n'));
console.log(`1) src/app/di/composition-root.ts`);
console.log(`     import { ${n.createModule}, type ${n.module} } from '@features/${featureKebab}';`);
console.log(`     // add to AppComposition:   readonly ${n.featureCamel}Module: ${n.module};`);
console.log(`     const ${n.featureCamel}Module = ${n.createModule}({ httpClient, logger });`);
console.log(`     // add to the returned object:   ${n.featureCamel}Module\n`);
console.log(`2) src/app/App.tsx  (nest near the other module providers)`);
console.log(`     import { ${n.provider} } from '@features/${featureKebab}';`);
console.log(`     <${n.provider} module={composition.${n.featureCamel}Module}> … </${n.provider}>\n`);
console.log(`3) src/app/router/AppRouter.tsx  (lazy-load from the MODULE PATH, add a route)`);
console.log(`     const ${n.page} = lazy(async () => ({`);
console.log(`       default: (await import('@features/${featureKebab}/presentation/${n.page}')).${n.page},`);
console.log(`     }));`);
console.log(`     <Route path="${n.route}" element={<${n.page} />} />   // under <ProtectedRoute>\n`);
