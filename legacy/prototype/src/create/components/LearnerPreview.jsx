import React, { useState } from 'react';
import { theme as antdTheme, Tag, Progress, Avatar, Button, Collapse, Rate } from 'antd';
import {
  PlayCircleFilled, DownloadOutlined, ClockCircleOutlined, BookOutlined,
  FilePdfOutlined, VideoCameraOutlined, QuestionCircleOutlined, FileDoneOutlined,
  LinkOutlined, LockFilled, CheckCircleFilled, StarFilled, UserOutlined, GlobalOutlined,
} from '@ant-design/icons';

const KIND_ICON = {
  video: VideoCameraOutlined, pdf: FilePdfOutlined, quiz: QuestionCircleOutlined,
  assignment: FileDoneOutlined, link: LinkOutlined, download: DownloadOutlined,
};

/**
 * The single source of truth for "what the learner sees". Both the preview step
 * and (in production) the real published learner page render from this same
 * component + data — guaranteeing the brief's promise: publish now, and the
 * student sees exactly this. `compact` scales it for tablet/mobile frames.
 */
export default function LearnerPreview({ type, data, author = 'You', compact }) {
  const { token } = antdTheme.useToken();
  const accent = type.accent;
  const d = data.details || {};
  const files = data.files || {};
  const sections = data.curriculum || [];
  const totalLessons = sections.reduce((a, s) => a + s.lessons.length, 0);
  const resourceFiles = files.files || [];
  const links = data.links || [];
  const pad = compact ? 16 : 28;

  const hero = (
    <div
      style={{
        position: 'relative',
        borderRadius: compact ? 12 : 16,
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${accent.color}, ${token.colorText})`,
        color: '#fff',
        padding: compact ? '28px 18px' : '44px 32px',
        minHeight: compact ? 150 : 210,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)' }} />
      {(type.key !== 'resource') && (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          <PlayCircleFilled style={{ fontSize: compact ? 44 : 64, color: 'rgba(255,255,255,0.92)' }} />
        </div>
      )}
      <div style={{ position: 'relative' }}>
        <Tag color="rgba(255,255,255,0.22)" style={{ color: '#fff', border: 'none', marginBottom: 10 }}>
          {type.label}
        </Tag>
        <h1 style={{ margin: 0, fontSize: compact ? 20 : 30, fontWeight: 800, lineHeight: 1.15 }}>
          {d.title || `Untitled ${type.label.toLowerCase()}`}
        </h1>
        {d.subtitle && <p style={{ margin: '8px 0 0', fontSize: compact ? 13 : 15, opacity: 0.92 }}>{d.subtitle}</p>}
      </div>
    </div>
  );

  const meta = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: compact ? 10 : 18, alignItems: 'center', color: token.colorTextTertiary, fontSize: 13 }}>
      {d.difficulty && <span><BookOutlined /> {d.difficulty}</span>}
      {d.duration && <span><ClockCircleOutlined /> {d.duration} {type.key === 'resource' ? 'min read' : 'min'}</span>}
      {type.key === 'course' && <span><VideoCameraOutlined /> {totalLessons} lessons</span>}
      {d.language && <span><GlobalOutlined /> {d.language}</span>}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <StarFilled style={{ color: '#f59e0b' }} /> New
      </span>
    </div>
  );

  const instructor = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Avatar style={{ background: accent.color }} icon={<UserOutlined />} />
      <div>
        <div style={{ fontSize: 12, color: token.colorTextTertiary }}>Instructor</div>
        <div style={{ fontWeight: 600, color: token.colorText, fontSize: 13.5 }}>{author}</div>
      </div>
    </div>
  );

  return (
    <div style={{ background: token.colorBgLayout, borderRadius: 16, padding: pad }}>
      {hero}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: compact ? '1fr' : 'minmax(0,1fr) 260px',
          gap: compact ? 18 : 28,
          marginTop: compact ? 16 : 24,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ marginBottom: 16 }}>{meta}</div>

          <Section token={token} title="About this">
            <p style={{ margin: 0, color: token.colorTextSecondary, fontSize: 14, lineHeight: 1.6 }}>
              {d.description || 'No description yet — add one in the Details step so learners know what to expect.'}
            </p>
            {(d.tags || []).length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {d.tags.map((t) => <Tag key={t}>{t}</Tag>)}
              </div>
            )}
          </Section>

          {type.key === 'course' && sections.length > 0 && (
            <Section token={token} title={`Curriculum · ${totalLessons} lessons`}>
              <Collapse
                defaultActiveKey={sections.map((s) => String(s.id))}
                items={sections.map((s, si) => ({
                  key: String(s.id),
                  label: <span style={{ fontWeight: 600 }}>{s.title || `Module ${si + 1}`} <span style={{ color: token.colorTextTertiary, fontWeight: 400 }}>· {s.lessons.length} lessons</span></span>,
                  children: (
                    <div style={{ display: 'grid', gap: 6 }}>
                      {s.lessons.map((l, i) => {
                        const Icon = KIND_ICON[l.kind] || VideoCameraOutlined;
                        const locked = i > 0;
                        const attachments = (l.files || []).length;
                        return (
                          <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 4px', fontSize: 13.5, color: token.colorTextSecondary }}>
                            <Icon style={{ color: accent.color }} />
                            <span style={{ flex: 1 }}>{l.title || `Lesson ${i + 1}`}</span>
                            {attachments > 0 && <span style={{ fontSize: 11, color: token.colorTextTertiary }}>{attachments} file{attachments !== 1 && 's'}</span>}
                            <Tag bordered={false} style={{ fontSize: 11, textTransform: 'capitalize' }}>{l.kind}</Tag>
                            {locked ? <LockFilled style={{ color: token.colorTextQuaternary }} /> : <PlayCircleFilled style={{ color: accent.color }} />}
                          </div>
                        );
                      })}
                    </div>
                  ),
                }))}
              />
            </Section>
          )}

          {(resourceFiles.length > 0 || links.length > 0) && (
            <Section token={token} title="Attachments & downloads">
              <div style={{ display: 'grid', gap: 8 }}>
                {resourceFiles.map((f) => (
                  <div key={f.uid} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 10 }}>
                    <FilePdfOutlined style={{ color: accent.color, fontSize: 18 }} />
                    <span style={{ flex: 1, fontSize: 13, color: token.colorText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                    <Button size="small" icon={<DownloadOutlined />}>Download</Button>
                  </div>
                ))}
                {links.map((l) => (
                  <div key={l.uid} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 10 }}>
                    <LinkOutlined style={{ color: accent.color, fontSize: 18 }} />
                    <span style={{ flex: 1, fontSize: 13, color: token.colorText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.url}</span>
                    <Button size="small" type="link">Open</Button>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {!compact && (
          <aside>
            <div style={{ position: 'sticky', top: 12, background: token.colorBgContainer, border: `1px solid ${token.colorBorder}`, borderRadius: 14, padding: 18, boxShadow: token.boxShadowSecondary }}>
              <Button type="primary" size="large" block icon={type.key === 'resource' ? <DownloadOutlined /> : <PlayCircleFilled />} style={{ marginBottom: 12 }}>
                {type.key === 'course' ? 'Start course' : type.key === 'tutorial' ? 'Watch now' : 'Download'}
              </Button>
              {type.key === 'course' && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: token.colorTextTertiary, marginBottom: 4 }}>
                    <span>Your progress</span><span>0%</span>
                  </div>
                  <Progress percent={0} strokeColor={accent.color} showInfo={false} />
                </div>
              )}
              <div style={{ borderTop: `1px solid ${token.colorBorderSecondary}`, paddingTop: 14, marginBottom: 14 }}>{instructor}</div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8, fontSize: 13, color: token.colorTextSecondary }}>
                {type.key === 'course' && <li><CheckCircleFilled style={{ color: token.colorSuccess, marginRight: 8 }} />Certificate on completion</li>}
                <li><CheckCircleFilled style={{ color: token.colorSuccess, marginRight: 8 }} />{(d.visibility || 'team') === 'public' ? 'Open to everyone' : (d.visibility === 'private' ? 'Private' : 'Team access')}</li>
                <li><CheckCircleFilled style={{ color: token.colorSuccess, marginRight: 8 }} />Lifetime access</li>
              </ul>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function Section({ token, title, children }) {
  return (
    <section style={{ marginBottom: 20 }}>
      <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 700, color: token.colorText }}>{title}</h3>
      {children}
    </section>
  );
}
