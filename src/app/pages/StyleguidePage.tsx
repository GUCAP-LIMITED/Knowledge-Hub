import type { ReactElement, ReactNode } from 'react';
import { PageHeader } from '@shared/ui';
import {
  BadgesSection,
  ButtonsSection,
  ColorsSection,
  FeedbackSection,
  FormsSection,
  IllustrationSection,
  MotionSection,
  TypographySection,
} from './styleguide-sections';
import styles from './StyleguidePage.module.css';

const Section = ({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}): ReactElement => (
  <section className={styles.section}>
    <h2 className={styles.sectionTitle}>{title}</h2>
    {children}
  </section>
);

/** Living style guide: the design tokens and shared primitives, in one place. Unlisted route. */
export const StyleguidePage = (): ReactElement => (
  <div className={styles.screen}>
    <PageHeader
      title="Style guide"
      subtitle="The design tokens and primitives that make up the interface."
    />
    <Section title="Colours">
      <ColorsSection />
    </Section>
    <Section title="Typography">
      <TypographySection />
    </Section>
    <Section title="Buttons">
      <ButtonsSection />
    </Section>
    <Section title="Badges & status">
      <BadgesSection />
    </Section>
    <Section title="Forms">
      <FormsSection />
    </Section>
    <Section title="Feedback">
      <FeedbackSection />
    </Section>
    <Section title="Illustrations">
      <IllustrationSection />
    </Section>
    <Section title="Motion">
      <MotionSection />
    </Section>
  </div>
);
