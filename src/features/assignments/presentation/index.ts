export * from './AssignmentsModuleProvider';
export * from './use-assignments';
export * from './use-assignments-module';
// `AssignTrainingPage` is omitted: the router lazy-imports it from './AssignTrainingPage' so it
// code-splits, rather than being pulled into the eagerly-imported barrel chain.
