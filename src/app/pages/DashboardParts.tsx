import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Badge, KpiCard, Skeleton } from '@shared/ui';
import { cn } from '@shared/utils';
import type { GreetingCta, Kpi, QuickAction } from './dashboard-data';
import styles from './DashboardPage.module.css';

const todayLabel = (): string =>
  new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

export const GreetingBar = ({
  firstName,
  subtitle,
  cta,
}: {
  readonly firstName: string;
  readonly subtitle: string;
  readonly cta: GreetingCta;
}): ReactElement => (
  <div className={styles.greet}>
    <div className={styles.greetText}>
      <div className={styles.greetRow}>
        <h1 className={styles.greetTitle}>Welcome back, {firstName}</h1>
        <span className={styles.greetDate}>{todayLabel()}</span>
      </div>
      <p className={styles.greetSub}>{subtitle}</p>
    </div>
    <Link to={cta.to} className={cn(styles.cta, cta.muted === true && styles.ctaMuted)}>
      {cta.label}
      <ArrowRight size={16} aria-hidden="true" />
    </Link>
  </div>
);

export const KpiStrip = ({ kpis }: { readonly kpis: readonly Kpi[] }): ReactElement => (
  <div className={styles.kpis}>
    {kpis.map((kpi) => (
      <KpiCard
        key={kpi.label}
        label={kpi.label}
        value={kpi.value}
        icon={kpi.icon}
        to={kpi.to}
        spark={kpi.spark}
        {...(kpi.delta !== undefined ? { delta: kpi.delta } : {})}
      />
    ))}
  </div>
);

export const KpiStripSkeleton = (): ReactElement => (
  <div className={styles.kpis}>
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className={styles.kpiSkeleton}>
        <Skeleton width="45%" height={12} />
        <Skeleton width="40%" height={26} />
        <Skeleton width="100%" height={16} />
      </div>
    ))}
  </div>
);

export const QuickActionsRail = ({
  actions,
}: {
  readonly actions: readonly QuickAction[];
}): ReactElement => (
  <div className={styles.panel}>
    <div className={styles.panelHead}>
      <h2 className={styles.panelTitle}>Quick actions</h2>
    </div>
    <div className={styles.railList}>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.label} to={action.to} className={styles.railItem}>
            <span className={styles.railIcon}>
              <Icon size={17} aria-hidden="true" />
            </span>
            <span className={styles.railText}>
              <span className={styles.railLabel}>{action.label}</span>
              <span className={styles.railDesc}>{action.desc}</span>
            </span>
            {action.count !== undefined && action.count > 0 ? (
              <Badge tone="warning" size="sm">
                {action.count}
              </Badge>
            ) : (
              <ChevronRight size={16} aria-hidden="true" className={styles.railChevron} />
            )}
          </Link>
        );
      })}
    </div>
  </div>
);
