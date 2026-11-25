export * from './ResourcesModuleProvider';
export * from './use-resources';
export * from './use-resources-module';
export * from './ResourceEditModal';
// `ResourcesPage` is deliberately omitted: the router lazy-imports it from './ResourcesPage' so it
// is code-split rather than pulled into the eagerly-imported barrel chain.
