import { useEffect, useState, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useCourses, type Course } from '@features/courses';
import { useTutorials, type Tutorial } from '@features/tutorials';
import { useResources, type Resource } from '@features/resources';
import { useCertificates, type Certificate } from '@features/certificates';
import styles from './SearchOverlay.module.css';

interface Hit {
  readonly key: string;
  readonly title: string;
  readonly sub: string;
  readonly to: string;
}

interface Sources {
  readonly courses: readonly Course[];
  readonly tutorials: readonly Tutorial[];
  readonly resources: readonly Resource[];
  readonly certificates: readonly Certificate[];
}

const has = (value: string, query: string): boolean =>
  value.toLowerCase().includes(query);

const buildHits = (
  query: string,
  sources: Sources,
): readonly (readonly [string, readonly Hit[]])[] => {
  if (query === '') {
    return [];
  }
  return [
    [
      'Courses',
      sources.courses
        .filter((c) => has(c.title, query) || has(c.category, query))
        .slice(0, 5)
        .map((c) => ({
          key: c.id,
          title: c.title,
          sub: c.category,
          to: `/courses/${c.id}`,
        })),
    ],
    [
      'Tutorials',
      sources.tutorials
        .filter((t) => has(t.title, query) || has(t.category, query))
        .slice(0, 5)
        .map((t) => ({ key: t.id, title: t.title, sub: t.category, to: '/tutorials' })),
    ],
    [
      'Resources',
      sources.resources
        .filter((r) => has(r.title, query) || has(r.category, query))
        .slice(0, 5)
        .map((r) => ({ key: r.id, title: r.title, sub: r.type, to: '/resources' })),
    ],
    [
      'Certificates',
      sources.certificates
        .filter((c) => has(c.courseName, query) || has(c.credentialId, query))
        .slice(0, 5)
        .map((c) => ({
          key: c.id,
          title: c.courseName,
          sub: c.credentialId,
          to: '/certificates',
        })),
    ],
  ];
};

const ResultGroup = ({
  label,
  hits,
  onGo,
}: {
  readonly label: string;
  readonly hits: readonly Hit[];
  readonly onGo: (to: string) => void;
}): ReactElement | null => {
  if (hits.length === 0) {
    return null;
  }
  return (
    <div className={styles.group}>
      <div className={styles.groupLabel}>{label}</div>
      {hits.map((hit) => (
        <button
          key={hit.key}
          type="button"
          className={styles.hit}
          onClick={() => {
            onGo(hit.to);
          }}
        >
          <span className={styles.hitTitle}>{hit.title}</span>
          <span className={styles.hitSub}>{hit.sub}</span>
        </button>
      ))}
    </div>
  );
};

/** Command-palette style search across courses, tutorials, resources and certificates. */
export const SearchOverlay = ({
  onClose,
}: {
  readonly onClose: () => void;
}): ReactElement => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const courses = useCourses();
  const tutorials = useTutorials();
  const resources = useResources();
  const certificates = useCertificates();

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const q = query.trim().toLowerCase();
  const go = (to: string): void => {
    navigate(to);
    onClose();
  };
  const groups = buildHits(q, {
    courses: courses.data ?? [],
    tutorials: tutorials.data ?? [],
    resources: resources.data ?? [],
    certificates: certificates.data ?? [],
  });
  const total = groups.reduce((sum, [, hits]) => sum + hits.length, 0);

  return (
    <div className={styles.overlay}>
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Close search"
        onClick={onClose}
      />
      <div className={styles.panel} role="dialog" aria-label="Search">
        <div className={styles.searchRow}>
          <Search size={18} aria-hidden="true" className={styles.searchIcon} />
          <input
            className={styles.input}
            placeholder="Search courses, tutorials, resources…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            aria-label="Search"
          />
        </div>
        <div className={styles.results}>
          {q === '' ? (
            <p className={styles.hint}>Type to search across the Knowledge Hub.</p>
          ) : (
            <>
              {groups.map(([label, hits]) => (
                <ResultGroup key={label} label={label} hits={hits} onGo={go} />
              ))}
              {total === 0 ? (
                <p className={styles.hint}>No results for “{query}”.</p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
