import type { ReactElement } from 'react';
import { Building2, GraduationCap, Users, Sparkles } from 'lucide-react';
import styles from './AuthLayout.module.css';

const STATS = [
  { icon: GraduationCap, value: '10k+', label: 'Students' },
  { icon: Sparkles, value: '28k+', label: 'Courses' },
  { icon: Building2, value: '300+', label: 'University' },
  { icon: Users, value: '1.2k+', label: 'Consultant' },
] as const;

const FLOW = [
  'Ready to Apply',
  'Submitted to University',
  'Offer Letter',
  'Enrollment',
] as const;

/** Decorative marketing panel shown beside the auth forms: map backdrop, stats, journey flow. */
export const AuthAside = (): ReactElement => (
  <aside className={styles.aside} aria-hidden="true">
    <div className={styles.map}>
      {[12, 28, 47, 63, 71, 84, 35, 55].map((left, index) => (
        <span
          key={left}
          className={styles.pin}
          style={{
            left: `${String(left)}%`,
            top: `${String(18 + ((index * 9) % 55))}%`,
          }}
        />
      ))}
    </div>

    <div className={styles.asideInner}>
      <p className={styles.asideKicker}>UAPP Academy</p>
      <h2 className={styles.asideHeading}>
        Your journey from application to enrollment.
      </h2>

      <div className={styles.stats}>
        {STATS.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <span className={styles.statIcon}>
              <stat.icon size={18} aria-hidden="true" />
            </span>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

      <ol className={styles.flow}>
        {FLOW.map((step, index) => (
          <li key={step} className={styles.flowStep}>
            <span className={styles.flowDot}>{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  </aside>
);
