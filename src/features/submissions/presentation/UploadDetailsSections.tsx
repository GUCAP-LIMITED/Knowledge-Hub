import type { ReactElement, ReactNode } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Image, Info, Search, Tags } from 'lucide-react';
import { Select, TextField, Textarea } from '@shared/ui';
import { CATEGORIES } from '@core/domain';
import {
  DIFFICULTIES,
  type Details,
  LANGUAGES,
  VISIBILITY_OPTIONS,
} from './upload-details';
import styles from './UploadPage.module.css';

type Register = UseFormRegister<Details>;

export const DetailsSection = ({
  icon: Icon,
  title,
  children,
}: {
  readonly icon: typeof Info;
  readonly title: string;
  readonly children: ReactNode;
}): ReactElement => (
  <section className={styles.detailSection}>
    <div className={styles.detailSectionHead}>
      <span className={styles.detailSectionIcon}>
        <Icon size={17} aria-hidden="true" />
      </span>
      <h3 className={styles.detailSectionTitle}>{title}</h3>
    </div>
    {children}
  </section>
);

export const GeneralSection = ({
  register,
  errors,
}: {
  readonly register: Register;
  readonly errors: FieldErrors<Details>;
}): ReactElement => (
  <DetailsSection icon={Info} title="General information">
    <div className={styles.form}>
      <TextField
        label="Title"
        placeholder="e.g. Mastering the UAPP Sales Pipeline"
        error={errors.title?.message ?? ''}
        {...register('title')}
      />
      <TextField
        label="Subtitle"
        placeholder="Short, benefit-led summary"
        {...register('subtitle')}
      />
      <Textarea
        label="Description"
        rows={4}
        placeholder="What will learners take away? Who is it for?"
        error={errors.description?.message ?? ''}
        {...register('description')}
      />
      <div className={styles.formRow}>
        <Select
          label="Category"
          error={errors.category?.message ?? ''}
          {...register('category')}
        >
          <option value="">Select…</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
        <TextField
          label="Topic"
          placeholder="e.g. Objection handling"
          {...register('topic')}
        />
        <Select label="Difficulty" {...register('difficulty')}>
          {DIFFICULTIES.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </Select>
      </div>
    </div>
  </DetailsSection>
);

export const MetadataSection = ({
  register,
}: {
  readonly register: Register;
}): ReactElement => (
  <DetailsSection icon={Tags} title="Metadata">
    <div className={styles.form}>
      <TextField
        label="Tags"
        placeholder="Comma-separated — helps search & recommendations"
        {...register('tags')}
      />
      <div className={styles.formRow}>
        <Select label="Language" {...register('language')}>
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </Select>
        <TextField
          label="Duration (min)"
          placeholder="e.g. 45"
          {...register('duration')}
        />
      </div>
    </div>
  </DetailsSection>
);

export const MediaSection = ({
  register,
}: {
  readonly register: Register;
}): ReactElement => (
  <DetailsSection icon={Image} title="Media">
    <div className={styles.formRow}>
      <TextField
        label="Thumbnail alt text"
        placeholder="For accessibility"
        {...register('thumbnailAlt')}
      />
      <TextField
        label="Cover image alt"
        placeholder="For the banner image"
        {...register('coverAlt')}
      />
    </div>
  </DetailsSection>
);

export const SeoSection = ({
  register,
}: {
  readonly register: Register;
}): ReactElement => (
  <DetailsSection icon={Search} title="SEO & discovery">
    <TextField
      label="Search keywords"
      placeholder="onboarding, portal, new joiner"
      {...register('keywords')}
    />
  </DetailsSection>
);

export const VisibilitySection = ({
  register,
}: {
  readonly register: Register;
}): ReactElement => (
  <DetailsSection icon={Search} title="Visibility">
    <div className={styles.visList}>
      {VISIBILITY_OPTIONS.map((option) => (
        <label key={option.value} className={styles.visOption}>
          <input type="radio" value={option.value} {...register('visibility')} />
          <span>
            <span className={styles.visTitle}>{option.title}</span>
            <span className={styles.visDesc}>{option.desc}</span>
          </span>
        </label>
      ))}
    </div>
  </DetailsSection>
);
