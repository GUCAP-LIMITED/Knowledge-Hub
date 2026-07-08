import type { ResourceProps } from '../domain';

/**
 * Seed knowledge base ported from the original Knowledge Hub prototype. This is the in-memory data
 * source standing in for a backend. Swapping to a real API is a matter of binding an
 * `HttpResourceGateway` (Zod DTO + mapper) in the feature module — no domain/application/
 * presentation change.
 */
export const RESOURCE_SEED: readonly ResourceProps[] = [
  {
    id: 'resource-1',
    title: 'Overview of Application Process',
    type: 'Guide',
    category: 'Getting Started',
    views: 2341,
    helpful: 95,
    updated: new Date('2024-01-15'),
  },
  {
    id: 'resource-2',
    title: 'Data Protection & GDPR Policy',
    type: 'Document',
    category: 'Policies & SOPs',
    views: 1876,
    helpful: 72,
    updated: new Date('2024-01-20'),
  },
  {
    id: 'resource-3',
    title: 'Portal Integration Setup Guide',
    type: 'Technical Guides',
    category: 'Technical Guides',
    views: 1204,
    helpful: 48,
    updated: new Date('2024-02-02'),
  },
  {
    id: 'resource-4',
    title: 'Frequently Asked Questions',
    type: 'Document',
    category: 'FAQs',
    views: 3120,
    helpful: 128,
    updated: new Date('2024-02-10'),
  },
  {
    id: 'resource-5',
    title: 'Best Practices for Onboarding',
    type: 'PDF',
    category: 'Best Practices',
    views: 987,
    helpful: 41,
    updated: new Date('2024-02-18'),
  },
  {
    id: 'resource-6',
    title: 'Troubleshooting Common Errors',
    type: 'Template',
    category: 'Troubleshooting',
    views: 1543,
    helpful: 63,
    updated: new Date('2024-02-25'),
  },
];
