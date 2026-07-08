import React, { useState, useRef } from 'react';
import {
  theme as antdTheme, Button, Input, Select, Collapse, Empty, Tooltip, Tag,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, HolderOutlined, VideoCameraOutlined,
  FilePdfOutlined, QuestionCircleOutlined, FileDoneOutlined, LinkOutlined,
  DownloadOutlined, PaperClipOutlined, CloseCircleFilled, FileImageOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { LESSON_KINDS } from '../contentTypes.js';

const KIND_ICON = {
  video: VideoCameraOutlined,
  pdf: FilePdfOutlined,
  quiz: QuestionCircleOutlined,
  assignment: FileDoneOutlined,
  link: LinkOutlined,
  download: DownloadOutlined,
};

const fileIcon = (name = '') => {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['mp4', 'mov', 'webm', 'm4v'].includes(ext)) return VideoCameraOutlined;
  if (ext === 'pdf') return FilePdfOutlined;
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return FileImageOutlined;
  return FileOutlined;
};

const fmt = (b) => (b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

let _id = 100;
const nid = () => ++_id;

/**
 * Step 4 — Curriculum builder (Courses only). Udemy-style: Sections (modules)
 * contain Lessons. Section and lesson names are always-visible editable fields.
 * Each lesson can hold one or more attached videos/files, so a module can
 * contain multiple videos either as several lessons or several files on a
 * lesson. Sections and lessons reorder by drag handle and sections collapse.
 */
export default function StepCurriculum({ type, data, setData }) {
  const { token } = antdTheme.useToken();
  const accent = type.accent;
  const sections = data.curriculum || [];
  const dragSection = useRef(null);
  const dragLesson = useRef(null);

  // Single hidden file input reused for every "attach" button.
  const fileRef = useRef(null);
  const pendingTarget = useRef(null); // { sid, lid, kind }

  const setSections = (next) =>
    setData((d) => ({ ...d, curriculum: typeof next === 'function' ? next(d.curriculum || []) : next }));

  const addSection = () =>
    setSections((s) => [...s, { id: nid(), title: '', lessons: [] }]);

  const removeSection = (sid) => setSections((s) => s.filter((x) => x.id !== sid));

  const renameSection = (sid, title) =>
    setSections((s) => s.map((x) => (x.id === sid ? { ...x, title } : x)));

  const addLesson = (sid, kind = 'video', openPicker = false) => {
    const lid = nid();
    setSections((s) =>
      s.map((x) =>
        x.id === sid ? { ...x, lessons: [...x.lessons, { id: lid, title: '', kind, files: [] }] } : x,
      ),
    );
    if (openPicker) {
      pendingTarget.current = { sid, lid, kind };
      // Defer so the input's accept updates before opening.
      setTimeout(() => fileRef.current?.click(), 0);
    }
  };

  const updateLesson = (sid, lid, patch) =>
    setSections((s) =>
      s.map((x) =>
        x.id === sid ? { ...x, lessons: x.lessons.map((l) => (l.id === lid ? { ...l, ...patch } : l)) } : x,
      ),
    );

  const removeLesson = (sid, lid) =>
    setSections((s) => s.map((x) => (x.id === sid ? { ...x, lessons: x.lessons.filter((l) => l.id !== lid) } : x)));

  const openAttach = (sid, lid, kind) => {
    pendingTarget.current = { sid, lid, kind };
    fileRef.current?.click();
  };

  const onFilesPicked = (fileList) => {
    const t = pendingTarget.current;
    pendingTarget.current = null;
    if (!t) return;
    const picked = Array.from(fileList || []).map((f) => ({
      uid: `${t.lid}-${f.name}-${f.size}-${nid()}`,
      name: f.name,
      size: f.size,
    }));
    if (!picked.length) return;
    setSections((s) =>
      s.map((x) =>
        x.id === t.sid
          ? { ...x, lessons: x.lessons.map((l) => (l.id === t.lid ? { ...l, files: [...(l.files || []), ...picked] } : l)) }
          : x,
      ),
    );
  };

  const removeFile = (sid, lid, uid) =>
    setSections((s) =>
      s.map((x) =>
        x.id === sid
          ? { ...x, lessons: x.lessons.map((l) => (l.id === lid ? { ...l, files: (l.files || []).filter((f) => f.uid !== uid) } : l)) }
          : x,
      ),
    );

  const moveSection = (from, to) =>
    setSections((s) => {
      const n = [...s];
      const [m] = n.splice(from, 1);
      n.splice(to, 0, m);
      return n;
    });

  const moveLesson = (sid, from, to) =>
    setSections((s) =>
      s.map((x) => {
        if (x.id !== sid) return x;
        const n = [...x.lessons];
        const [m] = n.splice(from, 1);
        n.splice(to, 0, m);
        return { ...x, lessons: n };
      }),
    );

  const totalLessons = sections.reduce((a, s) => a + s.lessons.length, 0);

  return (
    <div style={{ width: '100%' }}>
      <p style={{ margin: '0 0 18px', fontSize: 13.5, color: token.colorTextTertiary }}>
        Add modules, name them, then add lessons and attach the videos or files for each.
      </p>

      {/* hidden reused file input */}
      <input
        ref={fileRef}
        type="file"
        multiple
        accept=".mp4,.mov,.webm,.m4v,.pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.zip"
        style={{ display: 'none' }}
        onChange={(e) => {
          onFilesPicked(e.target.files);
          e.target.value = '';
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Tag color={accent.color}>{sections.length} module{sections.length !== 1 && 's'}</Tag>
        <Tag>{totalLessons} lesson{totalLessons !== 1 && 's'}</Tag>
      </div>

      {sections.length === 0 ? (
        <div style={{ border: `1.5px dashed ${token.colorBorder}`, borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span style={{ color: token.colorTextTertiary }}>No modules yet. Add your first module to start.</span>}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={addSection}>Add first module</Button>
          </Empty>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {sections.map((sec, si) => (
            <div
              key={sec.id}
              draggable
              onDragStart={() => (dragSection.current = si)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragSection.current != null && dragSection.current !== si) moveSection(dragSection.current, si);
                dragSection.current = null;
              }}
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorder}`,
                borderRadius: 14,
                overflow: 'hidden',
              }}
            >
              <Collapse
                defaultActiveKey={[String(sec.id)]}
                ghost
                items={[
                  {
                    key: String(sec.id),
                    label: (
                      <SectionHeader
                        token={token}
                        accent={accent}
                        index={si}
                        section={sec}
                        onRename={(t) => renameSection(sec.id, t)}
                        onRemove={() => removeSection(sec.id)}
                      />
                    ),
                    children: (
                      <div style={{ paddingBottom: 4 }}>
                        {sec.lessons.length === 0 && (
                          <div style={{ fontSize: 13, color: token.colorTextTertiary, padding: '4px 0 12px 8px' }}>
                            No lessons yet — add a video or another lesson type below.
                          </div>
                        )}
                        <div style={{ display: 'grid', gap: 10 }}>
                          {sec.lessons.map((les, li) => {
                            const Icon = KIND_ICON[les.kind] || VideoCameraOutlined;
                            return (
                              <div
                                key={les.id}
                                draggable
                                onDragStart={(e) => {
                                  e.stopPropagation();
                                  dragLesson.current = { sid: sec.id, from: li };
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.stopPropagation();
                                  if (dragLesson.current?.sid === sec.id && dragLesson.current.from !== li) {
                                    moveLesson(sec.id, dragLesson.current.from, li);
                                  }
                                  dragLesson.current = null;
                                }}
                                style={{
                                  padding: '10px 12px', marginLeft: 8,
                                  border: `1px solid ${token.colorBorderSecondary}`,
                                  borderRadius: 12, background: token.colorFillQuaternary,
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <HolderOutlined style={{ color: token.colorTextQuaternary, cursor: 'grab' }} aria-label="Drag lesson" />
                                  <div style={{ width: 28, height: 28, borderRadius: 7, display: 'grid', placeItems: 'center', background: accent.soft, color: accent.color, flexShrink: 0 }}>
                                    <Icon style={{ fontSize: 14 }} />
                                  </div>
                                  <Input
                                    value={les.title}
                                    placeholder={`Lesson ${li + 1} title`}
                                    onChange={(e) => updateLesson(sec.id, les.id, { title: e.target.value })}
                                    style={{ flex: 1 }}
                                  />
                                  <Select
                                    value={les.kind}
                                    onChange={(v) => updateLesson(sec.id, les.id, { kind: v })}
                                    options={LESSON_KINDS.map((k) => ({ value: k.key, label: k.label }))}
                                    style={{ width: 130 }}
                                  />
                                  <Tooltip title="Attach video / file">
                                    <Button
                                      icon={<PaperClipOutlined />}
                                      onClick={() => openAttach(sec.id, les.id, les.kind)}
                                      aria-label="Attach file"
                                    />
                                  </Tooltip>
                                  <Tooltip title="Remove lesson">
                                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeLesson(sec.id, les.id)} aria-label="Remove lesson" />
                                  </Tooltip>
                                </div>

                                {(les.files || []).length > 0 && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10, marginLeft: 38 }}>
                                    {les.files.map((f) => {
                                      const FIcon = fileIcon(f.name);
                                      return (
                                        <span
                                          key={f.uid}
                                          style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 8,
                                            padding: '5px 10px', borderRadius: 8,
                                            border: `1px solid ${token.colorBorder}`, background: token.colorBgContainer,
                                            fontSize: 12.5, color: token.colorText, maxWidth: 260,
                                          }}
                                        >
                                          <FIcon style={{ color: accent.color }} />
                                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                                          <span style={{ color: token.colorTextTertiary }}>{fmt(f.size)}</span>
                                          <CloseCircleFilled
                                            role="button"
                                            aria-label={`Remove ${f.name}`}
                                            onClick={() => removeFile(sec.id, les.id, f.uid)}
                                            style={{ color: token.colorTextQuaternary, cursor: 'pointer' }}
                                          />
                                        </span>
                                      );
                                    })}
                                    <Button size="small" type="link" icon={<PlusOutlined />} onClick={() => openAttach(sec.id, les.id, les.kind)}>
                                      Add another
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginLeft: 8, marginTop: 12, flexWrap: 'wrap' }}>
                          <Button type="primary" size="small" icon={<VideoCameraOutlined />} onClick={() => addLesson(sec.id, 'video', true)}>
                            Add video
                          </Button>
                          <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => addLesson(sec.id, 'video', false)}>
                            Add lesson
                          </Button>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          ))}

          <Button type="primary" ghost icon={<PlusOutlined />} onClick={addSection} block style={{ height: 44 }}>
            Add module
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Section (module) header. The title is an always-visible input so renaming is
 * obvious — no hidden click-to-edit. Clicks inside the input don't toggle the
 * collapse panel.
 */
function SectionHeader({ token, accent, index, section, onRename, onRemove }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingRight: 4 }}>
      <HolderOutlined style={{ color: token.colorTextQuaternary, cursor: 'grab' }} aria-label="Drag module" />
      <span
        style={{
          width: 24, height: 24, borderRadius: 6, flexShrink: 0,
          display: 'grid', placeItems: 'center',
          background: accent.soft, color: accent.color, fontSize: 12, fontWeight: 700,
        }}
      >
        {index + 1}
      </span>
      <Input
        value={section.title}
        placeholder={`Module ${index + 1} name — e.g. Getting started`}
        onChange={(e) => onRename(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        style={{ flex: 1, fontWeight: 600 }}
      />
      <span style={{ fontSize: 12.5, color: token.colorTextTertiary, whiteSpace: 'nowrap' }}>
        {section.lessons.length} lesson{section.lessons.length !== 1 && 's'}
      </span>
      <Tooltip title="Remove module">
        <Button
          size="small" type="text" danger icon={<DeleteOutlined />}
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          aria-label="Remove module"
        />
      </Tooltip>
    </div>
  );
}
