import { useState, type ReactElement } from 'react';
import {
  Avatar,
  Badge,
  Button,
  PageHeader,
  TextField,
  Textarea,
  type BadgeTone,
} from '@shared/ui';
import { useLocalStorage } from '@shared/utils';
import { useAuth, type AuthenticatedUser } from '@features/auth';
import { useCourses } from '@features/courses';
import styles from './ProfilePage.module.css';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
}

const FIELDS: readonly { readonly key: keyof ProfileData; readonly label: string }[] = [
  { key: 'name', label: 'Full name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'location', label: 'Location' },
];

const roleTone = (user: AuthenticatedUser | null): BadgeTone => {
  if (user?.hasRole('admin') === true) {
    return 'danger';
  }
  return user?.hasRole('manager') === true ? 'info' : 'primary';
};

const ProfileCard = ({
  profile,
  user,
  active,
  completed,
}: {
  readonly profile: ProfileData;
  readonly user: AuthenticatedUser | null;
  readonly active: number;
  readonly completed: number;
}): ReactElement => (
  <div className={styles.summary}>
    <Avatar name={profile.name} size={88} />
    <h2 className={styles.name}>{profile.name}</h2>
    <Badge tone={roleTone(user)}>{user?.userType ?? 'Learner'}</Badge>
    <p className={styles.bio}>{profile.bio}</p>
    <div className={styles.stats}>
      <div>
        <div className={styles.statValue}>{active}</div>
        <div className={styles.statLabel}>Courses</div>
      </div>
      <div>
        <div className={styles.statValue}>{completed}</div>
        <div className={styles.statLabel}>Done</div>
      </div>
      <div>
        <div className={styles.statValue}>{completed}</div>
        <div className={styles.statLabel}>Certs</div>
      </div>
    </div>
  </div>
);

const InfoCard = ({
  edit,
  profile,
  draft,
  onDraft,
}: {
  readonly edit: boolean;
  readonly profile: ProfileData;
  readonly draft: ProfileData;
  readonly onDraft: (data: ProfileData) => void;
}): ReactElement => (
  <div className={styles.info}>
    <h3 className={styles.infoTitle}>Personal information</h3>
    {FIELDS.map((field) =>
      edit ? (
        <TextField
          key={field.key}
          label={field.label}
          value={draft[field.key]}
          onChange={(event) => {
            onDraft({ ...draft, [field.key]: event.target.value });
          }}
        />
      ) : (
        <div key={field.key} className={styles.viewRow}>
          <span className={styles.viewLabel}>{field.label}</span>
          <span className={styles.viewValue}>{profile[field.key]}</span>
        </div>
      ),
    )}
    {edit ? (
      <Textarea
        label="Bio"
        rows={3}
        value={draft.bio}
        onChange={(event) => {
          onDraft({ ...draft, bio: event.target.value });
        }}
      />
    ) : (
      <div className={styles.viewRow}>
        <span className={styles.viewLabel}>Bio</span>
        <span className={styles.viewValue}>{profile.bio}</span>
      </div>
    )}
  </div>
);

/** The signed-in user's profile — view and edit (persisted locally). */
export const ProfilePage = (): ReactElement => {
  const { user } = useAuth();
  const courses = useCourses();
  const [profile, setProfile] = useLocalStorage<ProfileData>('uapp:profile', {
    name: user?.fullName ?? '',
    email: user?.email.value ?? '',
    phone: '+44 7700 900123',
    location: 'London, UK',
    bio: 'Passionate about education and helping learners succeed.',
  });
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState(profile);

  const list = courses.data ?? [];
  const completed = list.filter((course) => course.isCompleted()).length;
  const active = list.filter((course) => course.hasStarted()).length;

  return (
    <section className={styles.screen}>
      <PageHeader title="My Profile" subtitle="Manage your personal information.">
        {edit ? (
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setEdit(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setProfile(draft);
                setEdit(false);
              }}
            >
              Save changes
            </Button>
          </>
        ) : (
          <Button
            onClick={() => {
              setDraft(profile);
              setEdit(true);
            }}
          >
            Edit profile
          </Button>
        )}
      </PageHeader>
      <div className={styles.layout}>
        <ProfileCard
          profile={profile}
          user={user}
          active={active}
          completed={completed}
        />
        <InfoCard edit={edit} profile={profile} draft={draft} onDraft={setDraft} />
      </div>
    </section>
  );
};
