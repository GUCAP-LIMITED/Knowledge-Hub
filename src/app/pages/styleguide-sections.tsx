import type { ReactElement } from 'react';
import { Inbox } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  ProgressBar,
  Skeleton,
  Spinner,
  Spot,
  StatusBadge,
  Switch,
  TextField,
  Toggle,
  type BadgeTone,
} from '@shared/ui';
import styles from './StyleguidePage.module.css';

const COLOR_TOKENS: readonly string[] = [
  '--color-primary',
  '--color-primary-strong',
  '--color-primary-soft',
  '--color-secondary',
  '--color-secondary-strong',
  '--color-secondary-soft',
  '--color-success',
  '--color-warning',
  '--color-danger',
  '--color-info',
  '--color-surface-muted',
  '--color-border',
];

export const ColorsSection = (): ReactElement => (
  <div className={styles.swatchGrid}>
    {COLOR_TOKENS.map((token) => (
      <div key={token} className={styles.swatch}>
        <span
          className={styles.swatchChip}
          style={{ backgroundColor: `var(${token})` }}
        />
        <code className={styles.swatchName}>{token}</code>
      </div>
    ))}
  </div>
);

export const TypographySection = (): ReactElement => (
  <div className={styles.stack}>
    <h1 className={styles.typeH1}>Heading one</h1>
    <h2 className={styles.typeH2}>Heading two</h2>
    <h3 className={styles.typeH3}>Heading three</h3>
    <p className={styles.typeBody}>
      Body copy — the workhorse text for descriptions, help, and content.
    </p>
    <p className={styles.typeMuted}>Muted secondary text for metadata and hints.</p>
  </div>
);

const BADGE_TONES: readonly BadgeTone[] = [
  'neutral',
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
];

export const ButtonsSection = (): ReactElement => (
  <div className={styles.stack}>
    <div className={styles.row}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="accent">Accent</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
    <div className={styles.row}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button isLoading>Loading</Button>
      <Button disabled>Disabled</Button>
    </div>
  </div>
);

export const BadgesSection = (): ReactElement => (
  <div className={styles.row}>
    {BADGE_TONES.map((tone) => (
      <Badge key={tone} tone={tone}>
        {tone}
      </Badge>
    ))}
    <StatusBadge tone="success" label="published" />
    <StatusBadge tone="warning" label="pending" />
  </div>
);

export const FormsSection = (): ReactElement => (
  <div className={styles.formGrid}>
    <TextField label="Text field" name="sg-text" placeholder="Type here…" />
    <div className={styles.controlRow}>
      <Toggle checked onChange={() => undefined} label="Toggle" />
      <Switch checked onChange={() => undefined} label="Switch" />
    </div>
  </div>
);

export const FeedbackSection = (): ReactElement => (
  <div className={styles.stack}>
    <Alert tone="info" title="Informational alert">
      Alerts communicate status inline.
    </Alert>
    <ProgressBar value={64} showLabel tone="auto" />
    <div className={styles.row}>
      <Spinner label="Loading" />
      <Skeleton width={160} height={16} />
    </div>
  </div>
);

export const IllustrationSection = (): ReactElement => (
  <div className={styles.row}>
    <Spot icon={Inbox} tone="primary" />
    <Spot icon={Inbox} tone="secondary" />
    <EmptyState
      title="Empty state"
      description="Shown when a list or area has no content."
    />
  </div>
);

const MOTION: readonly [string, string][] = [
  ['--motion-fast', '0.12s'],
  ['--motion-base', '0.18s'],
  ['--motion-slow', '0.28s'],
];

export const MotionSection = (): ReactElement => (
  <ul className={styles.motionList}>
    {MOTION.map(([token, value]) => (
      <li key={token} className={styles.motionRow}>
        <code className={styles.swatchName}>{token}</code>
        <span className={styles.motionValue}>{value}</span>
      </li>
    ))}
  </ul>
);
