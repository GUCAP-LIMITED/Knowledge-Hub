export * from './CoursesModuleProvider';
export * from './use-courses';
export * from './use-courses-module';
// `CoursesPage` is deliberately omitted: the router lazy-imports it from './CoursesPage' so it is
// code-split rather than pulled into the eagerly-imported barrel chain.
