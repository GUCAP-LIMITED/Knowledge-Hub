/**
 * Public API of the `tutorials` feature. The app shell and other features import ONLY from here.
 * Backed by an in-memory gateway seeded from the prototype library (swap for HTTP to go live).
 */
export {
  createTutorialsModule,
  type TutorialsModule,
  type TutorialsModuleDeps,
} from './tutorials-module';
export {
  TutorialsModuleProvider,
  useTutorials,
  useInfiniteTutorials,
  useTutorial,
  useUpdateTutorial,
  useMarkTutorialComplete,
  useMarkTutorialHelpful,
  useMarkVideoComplete,
  tutorialsQueryKey,
  tutorialQueryKey,
  TutorialEditModal,
  type TutorialEditModalProps,
  formatVideoTitle,
  formatVideoTimestamp,
  formatPlaylistDuration,
  computePlaylistTotalDuration,
  type PlaylistDurationVideoItem,
  measureVideoDuration,
  TutorialPlaylistSidebar,
  TutorialPlayerControls,
  ExternalVideoHint,
  type ExternalVideoHintProps,
  useTutorialAutoplay,
  type UseTutorialAutoplayReturn,
  type AutoplayPhase,
} from './presentation';
export {
  Tutorial,
  type TutorialProps,
  type TutorialVideo,
  type TutorialCatalogParams,
  type PagedResult,
  getSavedPlaylistOrder,
  savePlaylistOrder,
  sortMediaBySavedOrder,
} from './domain';
