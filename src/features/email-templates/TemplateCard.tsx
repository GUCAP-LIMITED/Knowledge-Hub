import type { ReactElement } from 'react';
import { Badge, IconButton, Switch } from '@shared/ui';
import { Edit2, Mail, MessageSquare, Trash2 } from 'lucide-react';
import { EmailTemplateKind, type EmailTemplate } from './types';
import styles from './EmailTemplatesManager.module.css';

export interface TemplateCardProps {
  readonly template: EmailTemplate;
  readonly onToggleActive: (template: EmailTemplate, active: boolean) => void;
  readonly onEdit: (template: EmailTemplate) => void;
  readonly onDelete: (id: string) => void;
}

export const TemplateCard = ({
  template,
  onToggleActive,
  onEdit,
  onDelete,
}: TemplateCardProps): ReactElement => (
  <div className={styles.templateCard}>
    <div className={styles.cardHeader}>
      <div className={styles.cardTitleArea}>
        <h4 className={styles.cardTitle}>{template.name}</h4>
        <div className={styles.badgeRow}>
          <Badge tone={template.isDefault ? 'primary' : 'neutral'}>
            {template.isDefault ? 'System Default' : 'Personal'}
          </Badge>
          <Badge
            tone="neutral"
            icon={template.kind === EmailTemplateKind.Email ? Mail : MessageSquare}
          >
            {template.kind === EmailTemplateKind.Email ? 'Email' : 'SMS'}
          </Badge>
        </div>
      </div>
    </div>

    <div className={styles.cardBody}>{template.body}</div>

    <div className={styles.cardFooter}>
      <div className={styles.statusToggle}>
        <Switch
          label={`Toggle active for ${template.name}`}
          checked={template.isActive}
          onChange={(checked) => {
            onToggleActive(template, checked);
          }}
          size="sm"
        />
        <span className={styles.statusLabel}>
          {template.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className={styles.cardActions}>
        <IconButton
          label="Edit template"
          onClick={() => {
            onEdit(template);
          }}
        >
          <Edit2 size={15} />
        </IconButton>

        {!template.isDefault ? (
          <IconButton
            label="Delete template"
            onClick={() => {
              onDelete(template.id);
            }}
          >
            <Trash2 size={15} />
          </IconButton>
        ) : null}
      </div>
    </div>
  </div>
);
