import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  ConfigProvider, theme as antdTheme, Steps, Button, Skeleton, Modal, Result,
  Tooltip, Grid, Drawer, message,
} from 'antd';
import {
  ArrowLeftOutlined, ArrowRightOutlined, SaveOutlined, CloudSyncOutlined,
  CheckCircleFilled, CloseOutlined, EyeOutlined, SendOutlined, RocketOutlined,
  ForwardOutlined, MenuOutlined, LoadingOutlined,
} from '@ant-design/icons';
import { makeAntdTheme, surfaceTokens } from './theme.js';
import { getType, STEP_META } from './contentTypes.js';
import { useAutosave, loadDraft, clearDraft } from './hooks/useAutosave.js';
import StepChooseType from './steps/StepChooseType.jsx';
import StepUpload from './steps/StepUpload.jsx';
import StepDetails from './steps/StepDetails.jsx';
import StepCurriculum from './steps/StepCurriculum.jsx';
import StepPreview from './steps/StepPreview.jsx';

const DRAFT_KEY = 'uapp:create-draft';
const emptyData = { typeKey: null, files: {}, links: [], details: {}, curriculum: [] };

/**
 * CreateFlow — the redesigned content-authoring wizard.
 *
 * Props:
 *   isDark   — inherit KnowledgeHub's dark mode
 *   role     — 'admin' | 'manager' | ... drives Publish vs Submit-for-review
 *   author   — display name shown in the learner preview
 *   onExit   — called when the user leaves the flow
 *   onComplete(payload) — called on publish/submit
 */
export default function CreateFlow({ embedded = false, isDark = false, role = 'manager', author = 'You', onExit, onComplete }) {
  const s = surfaceTokens(isDark);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [booting, setBooting] = useState(true);
  const [data, setData] = useState(emptyData);
  const [stepIdx, setStepIdx] = useState(0);
  const [showResumeAsk, setShowResumeAsk] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedAs, setPublishedAs] = useState(null); // 'published' | 'submitted'
  const [navOpen, setNavOpen] = useState(false);
  const detailsFormRef = useRef(null);

  const type = data.typeKey ? getType(data.typeKey) : null;
  const stepKeys = type ? type.steps : ['type'];
  const currentKey = stepKeys[stepIdx] || 'type';

  const { status: saveStatus, lastSavedAt } = useAutosave(DRAFT_KEY, data, {
    enabled: !booting && !!data.typeKey,
  });

  // Skeleton on mount + offer to resume a cached draft.
  useEffect(() => {
    const draft = loadDraft(DRAFT_KEY);
    const t = setTimeout(() => {
      setBooting(false);
      if (draft?.data?.typeKey) setShowResumeAsk(true);
    }, 650);
    return () => clearTimeout(t);
  }, []);

  const isDirty = !!data.typeKey || (data.details && Object.keys(data.details).length > 0);

  /* ---- validation gating per step ---- */
  const missingToPublish = useMemo(() => {
    const m = [];
    const d = data.details || {};
    if (!d.title || d.title.length < 3) m.push('Title');
    if (!d.description) m.push('Description');
    if (!d.category) m.push('Category');
    const files = data.files || {};
    const anyFile = Object.values(files).some((arr) => (arr || []).length > 0) || (data.links || []).length > 0;
    if (!anyFile) m.push('At least one file');
    if (type?.key === 'course' && (data.curriculum || []).reduce((a, sec) => a + sec.lessons.length, 0) === 0) {
      m.push('At least one lesson');
    }
    return m;
  }, [data, type]);

  const canContinue = () => {
    if (currentKey === 'type') return !!data.typeKey;
    if (currentKey === 'upload') {
      const files = data.files || {};
      const requiredSlots = (type?.upload.slots || []).filter((sl) => sl.required);
      const requiredOk = requiredSlots.every((sl) => (files[sl.id] || []).length > 0);
      const anyFile = Object.values(files).some((arr) => (arr || []).length > 0) || (data.links || []).length > 0;
      return requiredOk && anyFile;
    }
    if (currentKey === 'details') {
      const d = data.details || {};
      return d.title && d.title.length >= 3 && d.description && d.category;
    }
    return true;
  };

  const stepOptional = currentKey === 'curriculum' || (currentKey === 'upload' && type?.key === 'resource');

  /* ---- navigation ---- */
  const goNext = () => {
    if (currentKey === 'details' && detailsFormRef.current) {
      detailsFormRef.current
        .validateFields()
        .then(() => setStepIdx((i) => Math.min(i + 1, stepKeys.length - 1)))
        .catch(() => message.warning('Please complete the required fields.'));
      return;
    }
    setStepIdx((i) => Math.min(i + 1, stepKeys.length - 1));
  };
  const goBack = () => setStepIdx((i) => Math.max(i - 1, 0));

  const chooseType = (key) => {
    setData((d) => ({ ...d, typeKey: key }));
    setTimeout(() => setStepIdx(1), 180); // brief highlight before advancing
  };

  const jumpTo = (idx) => {
    // Only allow jumping to a visited/earlier step or the immediate next if valid.
    if (idx <= stepIdx || canContinue()) setStepIdx(idx);
    setNavOpen(false);
  };

  const doSaveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ data, at: Date.now() }));
    message.success('Draft saved');
  };

  const doPublish = () => {
    setPublishing(true);
    const submitting = role !== 'admin';
    setTimeout(() => {
      setPublishing(false);
      setPublishedAs(submitting ? 'submitted' : 'published');
      clearDraft(DRAFT_KEY);
      onComplete?.({ ...data, status: submitting ? 'review' : 'published' });
    }, 1100);
  };

  const requestExit = () => (isDirty && !publishedAs ? setConfirmExit(true) : onExit?.());

  /* ---- render ---- */
  const stepItems = stepKeys.map((k) => ({
    title: STEP_META[k].title,
    description: !isMobile ? STEP_META[k].subtitle : undefined,
  }));

  const body = () => {
    if (booting) return <BootSkeleton s={s} />;
    switch (currentKey) {
      case 'type':
        return <StepChooseType value={data.typeKey} onChoose={chooseType} />;
      case 'upload':
        return <StepUpload type={type} data={data} setData={setData} />;
      case 'details':
        return <StepDetails type={type} data={data} setData={setData} formRef={detailsFormRef} />;
      case 'curriculum':
        return <StepCurriculum type={type} data={data} setData={setData} />;
      case 'preview':
        return <StepPreview type={type} data={data} author={author} missing={missingToPublish} />;
      default:
        return null;
    }
  };

  const Sidebar = (
    <ProgressSidebar
      s={s}
      steps={stepItems}
      current={stepIdx}
      onJump={jumpTo}
      saveStatus={saveStatus}
      lastSavedAt={lastSavedAt}
      typeLabel={type?.label}
    />
  );

  // Embedded mode lives INSIDE the KnowledgeHub app shell (its sidebar +
  // header stay visible), so the flow reads as part of the product rather than
  // a separate app. Standalone mode owns the whole viewport.
  const rootStyle = embedded
    ? { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 160px)', background: 'transparent', borderRadius: 16 }
    : { display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100vh', background: s.bg };

  return (
    <ConfigProvider theme={makeAntdTheme(isDark)}>
      <div style={rootStyle}>
        {/* Top bar — standalone (focused) mode only. In embedded mode the single
            step header inside the content area carries title + save status, so
            there's never a duplicated header. */}
        {!embedded && (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: s.surface, borderBottom: `1px solid ${s.border}`, position: 'sticky', top: 0, zIndex: 20 }}
          >
            {isMobile && (
              <Button type="text" icon={<MenuOutlined />} onClick={() => setNavOpen(true)} aria-label="Open steps" />
            )}
            <div style={{ fontWeight: 800, color: s.text, fontSize: 15 }}>
              Create {type ? type.label.toLowerCase() : 'content'}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
              <SaveIndicator status={saveStatus} s={s} />
              <Tooltip title="Close">
                <Button type="text" icon={<CloseOutlined />} onClick={requestExit} aria-label="Close creator" />
              </Tooltip>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flex: 1, minHeight: 0, gap: embedded ? 24 : 0 }}>
          {!isMobile && (
            <div
              style={
                embedded
                  ? { width: 244, flexShrink: 0, position: 'sticky', top: 84, alignSelf: 'flex-start', maxHeight: 'calc(100vh - 108px)', overflow: 'auto', background: s.surface, border: `1px solid ${s.border}`, borderRadius: 14 }
                  : { width: 288, flexShrink: 0, borderRight: `1px solid ${s.border}`, background: s.surface, position: 'sticky', top: 57, alignSelf: 'flex-start', height: 'calc(100vh - 57px)', overflow: 'auto' }
              }
            >
              {Sidebar}
            </div>
          )}

          {/* Content — flows with the page in embedded mode */}
          <div
            style={
              embedded
                ? { flex: 1, minWidth: 0, padding: isMobile ? '8px 0 96px' : '8px 4px 96px' }
                : { flex: 1, minWidth: 0, overflow: 'auto', padding: isMobile ? '24px 16px 112px' : '36px 40px 120px' }
            }
          >
            {/* Single consistent content column — one width, one header, for
                every step (preview gets extra room for device frames). */}
            <div style={{ maxWidth: currentKey === 'preview' ? 1060 : 880, margin: '0 auto' }}>
              {!booting && (
                <StepHeader
                  s={s}
                  stepKey={currentKey}
                  onMenu={embedded && isMobile ? () => setNavOpen(true) : null}
                  saveNode={embedded ? <SaveIndicator status={saveStatus} s={s} /> : null}
                />
              )}
              {body()}
            </div>
          </div>
        </div>

        {/* Sticky footer with context-aware actions */}
        {!booting && (
          <Footer
            s={s}
            embedded={embedded}
            currentKey={currentKey}
            stepIdx={stepIdx}
            lastIdx={stepKeys.length - 1}
            canContinue={canContinue()}
            optional={stepOptional}
            role={role}
            publishing={publishing}
            onBack={goBack}
            onNext={goNext}
            onSkip={goNext}
            onSaveDraft={doSaveDraft}
            onPublish={doPublish}
          />
        )}
      </div>

      {/* Mobile steps drawer */}
      <Drawer
        title="Steps"
        placement="left"
        open={navOpen}
        onClose={() => setNavOpen(false)}
        width={300}
        styles={{ body: { padding: 0 } }}
      >
        {Sidebar}
      </Drawer>

      {/* Resume draft */}
      <Modal
        open={showResumeAsk}
        title="Resume your draft?"
        okText="Resume"
        cancelText="Start fresh"
        onOk={() => {
          const draft = loadDraft(DRAFT_KEY);
          if (draft?.data) {
            setData({ ...emptyData, ...draft.data });
            const t = getType(draft.data.typeKey);
            setStepIdx(t ? Math.min(1, t.steps.length - 1) : 0);
          }
          setShowResumeAsk(false);
        }}
        onCancel={() => {
          clearDraft(DRAFT_KEY);
          setShowResumeAsk(false);
        }}
      >
        We found an unfinished draft. Pick up where you left off, or start over.
      </Modal>

      {/* Exit confirmation */}
      <Modal
        open={confirmExit}
        title="Leave without publishing?"
        okText="Save draft & leave"
        cancelText="Keep editing"
        onOk={() => { doSaveDraft(); setConfirmExit(false); onExit?.(); }}
        onCancel={() => setConfirmExit(false)}
        footer={(_, { OkBtn, CancelBtn }) => (
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Button danger onClick={() => { clearDraft(DRAFT_KEY); setConfirmExit(false); onExit?.(); }}>
              Discard
            </Button>
            <div style={{ display: 'flex', gap: 8 }}><CancelBtn /><OkBtn /></div>
          </div>
        )}
      >
        Your progress is autosaved. You can save this as a draft and finish later.
      </Modal>

      {/* Success state */}
      <Modal open={!!publishedAs} footer={null} closable={false} centered>
        <Result
          icon={<CheckCircleFilled style={{ color: type?.accent.color || '#10b981' }} />}
          status="success"
          title={publishedAs === 'published' ? `${type?.label} published!` : 'Submitted for review'}
          subTitle={
            publishedAs === 'published'
              ? 'Learners can now find and start this content.'
              : 'Your content is with the review team. You’ll be notified once it’s approved.'
          }
          extra={[
            <Button key="view" type="primary" onClick={() => onExit?.()}>
              {publishedAs === 'published' ? 'View in catalog' : 'Go to submissions'}
            </Button>,
            <Button
              key="another"
              onClick={() => { setPublishedAs(null); setData(emptyData); setStepIdx(0); }}
            >
              Create another
            </Button>,
          ]}
        />
      </Modal>
    </ConfigProvider>
  );
}

/* ------------------------------------------------------------------ */

function ProgressSidebar({ s, steps, current, onJump, saveStatus, lastSavedAt, typeLabel }) {
  return (
    <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: s.textSubtle, marginBottom: 18 }}>
        {typeLabel ? `New ${typeLabel}` : 'Get started'}
      </div>
      <Steps
        direction="vertical"
        size="small"
        current={current}
        onChange={onJump}
        items={steps.map((st, i) => ({
          title: st.title,
          description: st.description,
          disabled: i > current + 1,
        }))}
      />
    </div>
  );
}

/**
 * The single header for every step. Removing per-step headers and centralising
 * here guarantees consistent title size, alignment and spacing across the whole
 * wizard. In embedded mode it also carries the (single) autosave indicator and
 * the mobile step-drawer trigger.
 */
function StepHeader({ s, stepKey, onMenu, saveNode }) {
  const meta = STEP_META[stepKey];
  if (!meta) return null;
  return (
    <header
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        marginBottom: 24, paddingBottom: 18, borderBottom: `1px solid ${s.border}`,
      }}
    >
      {onMenu && (
        <Button type="text" icon={<MenuOutlined />} onClick={onMenu} aria-label="Open steps" style={{ marginTop: 2 }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: s.text, margin: '0 0 6px' }}>{meta.title}</h2>
        <p style={{ fontSize: 14, color: s.textSubtle, margin: 0 }}>{meta.subtitle}</p>
      </div>
      {saveNode && <div style={{ flexShrink: 0, paddingTop: 4 }}>{saveNode}</div>}
    </header>
  );
}

function SaveIndicator({ status, s }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: s.textSubtle }}>
      {status === 'saving' ? <LoadingOutlined /> : <CheckCircleFilled style={{ color: '#10b981' }} />}
      {status === 'saving' ? 'Saving' : 'Saved'}
    </span>
  );
}

function Footer({ s, embedded, currentKey, stepIdx, lastIdx, canContinue, optional, role, publishing, onBack, onNext, onSkip, onSaveDraft, onPublish }) {
  const isLast = stepIdx === lastIdx;
  const isFirst = stepIdx === 0;
  const publishLabel = role === 'admin' ? 'Publish now' : 'Submit for review';
  const PublishIcon = role === 'admin' ? RocketOutlined : SendOutlined;

  return (
    <div
      style={{
        position: 'sticky', bottom: embedded ? 12 : 0, zIndex: 20,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 20px', background: s.surface,
        border: `1px solid ${s.border}`,
        borderRadius: embedded ? 14 : 0,
        borderLeft: embedded ? `1px solid ${s.border}` : 'none',
        borderRight: embedded ? `1px solid ${s.border}` : 'none',
        marginTop: embedded ? 8 : 0,
        boxShadow: embedded ? s.shadowLg : '0 -4px 16px -8px rgba(15,23,42,0.15)',
      }}
    >
      <div>
        {!isFirst && (
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>Back</Button>
        )}
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        {currentKey !== 'type' && (
          <Button type="text" icon={<SaveOutlined />} onClick={onSaveDraft}>Save draft</Button>
        )}
        {optional && !isLast && (
          <Button type="text" icon={<ForwardOutlined />} onClick={onSkip}>Skip for now</Button>
        )}
        {isLast ? (
          <Button type="primary" size="large" icon={<PublishIcon />} loading={publishing} onClick={onPublish}>
            {publishLabel}
          </Button>
        ) : (
          <Tooltip title={!canContinue ? 'Complete this step to continue' : ''}>
            <Button
              type="primary"
              size="large"
              icon={currentKey === 'details' || stepIdx === lastIdx - 1 ? <EyeOutlined /> : <ArrowRightOutlined />}
              iconPosition="end"
              disabled={!canContinue}
              onClick={onNext}
            >
              {stepIdx === lastIdx - 1 ? 'Preview' : 'Continue'}
            </Button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

function BootSkeleton({ s }) {
  return (
    <div style={{ width: '100%' }}>
      <Skeleton.Input active block style={{ height: 34, marginBottom: 10, maxWidth: 320 }} />
      <Skeleton.Input active block style={{ height: 18, marginBottom: 32, maxWidth: 460 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ border: `1px solid ${s.border}`, borderRadius: 18, padding: 24, background: s.surface }}>
            <Skeleton active avatar paragraph={{ rows: 4 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
