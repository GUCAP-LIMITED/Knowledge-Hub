export interface MockEmailTemplate {
  id: string;
  name: string;
  body: string;
  /** 1 Email · 2 SMS. */
  kind: 1 | 2;
  isDefault: boolean;
  isActive: boolean;
  ownerUserId: string | null;
  creationTime: string;
  lastModificationTime: string | null;
}

export const createEmailTemplates = (nowIso: string): MockEmailTemplate[] => [
  {
    id: 'tpl-assigned',
    name: 'Training assigned',
    body: '<p>Hi {{name}},</p><p>You have been assigned <strong>{{content}}</strong>. Please complete it by {{dueDate}}.</p>',
    kind: 1,
    isDefault: true,
    isActive: true,
    ownerUserId: null,
    creationTime: nowIso,
    lastModificationTime: null,
  },
  {
    id: 'tpl-reminder',
    name: 'Overdue reminder',
    body: '<p>Hi {{name}},</p><p>Your training <strong>{{content}}</strong> is now overdue. Please complete it as soon as possible.</p>',
    kind: 1,
    isDefault: false,
    isActive: true,
    ownerUserId: null,
    creationTime: nowIso,
    lastModificationTime: null,
  },
  {
    id: 'tpl-certificate',
    name: 'Certificate issued',
    body: '<p>Congratulations {{name}}! Your certificate for <strong>{{content}}</strong> is ready.</p>',
    kind: 1,
    isDefault: false,
    isActive: false,
    ownerUserId: null,
    creationTime: nowIso,
    lastModificationTime: null,
  },
  {
    id: 'tpl-sms-reminder',
    name: 'SMS due-date nudge',
    body: 'Hi {{name}}, {{content}} is due on {{dueDate}}.',
    kind: 2,
    isDefault: false,
    isActive: true,
    ownerUserId: null,
    creationTime: nowIso,
    lastModificationTime: null,
  },
];
