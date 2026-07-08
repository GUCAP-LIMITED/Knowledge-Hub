/**
 * Shared domain kernel: framework-agnostic value objects (and their errors) used by MORE THAN ONE
 * feature. Importable from anywhere as `@core/domain`.
 *
 * A type belongs here only once a *second* feature needs it — until then it lives in that feature's
 * own `domain/`. Everything here depends solely on `@core/result` and `@core/errors`; it must never
 * reach for HTTP, DI, React, or any feature.
 */
export { Email } from './value-objects/email';
export { InvalidEmailError } from './errors/invalid-email-error';
export { Category, CATEGORIES, type CategoryName } from './value-objects/category';
export { InvalidCategoryError } from './errors/invalid-category-error';
