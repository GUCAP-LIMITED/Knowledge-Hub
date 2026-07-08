import React, { useState } from 'react';
import { theme as antdTheme, Segmented, Alert, Tag } from 'antd';
import { DesktopOutlined, TabletOutlined, MobileOutlined } from '@ant-design/icons';
import LearnerPreview from '../components/LearnerPreview.jsx';

const FRAMES = {
  desktop: { width: '100%', label: 'Desktop', icon: DesktopOutlined, compact: false },
  tablet: { width: 720, label: 'Tablet', icon: TabletOutlined, compact: true },
  mobile: { width: 390, label: 'Mobile', icon: MobileOutlined, compact: true },
};

/**
 * Step 5 — Preview & publish. This is NOT a review form. It renders the exact
 * <LearnerPreview> a student will see, inside switchable device frames. What you
 * see here is what publishing produces — same component, same data.
 */
export default function StepPreview({ type, data, author, missing = [] }) {
  const { token } = antdTheme.useToken();
  const [device, setDevice] = useState('desktop');
  const frame = FRAMES[device];

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <Segmented
          value={device}
          onChange={setDevice}
          options={Object.entries(FRAMES).map(([k, f]) => ({
            value: k,
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <f.icon /> {f.label}
              </span>
            ),
          }))}
        />
      </div>

      {missing.length > 0 && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="A few things are still missing"
          description={
            <span>
              You can still save a draft, but publishing needs:{' '}
              {missing.map((m) => <Tag key={m} color="warning" style={{ marginBottom: 4 }}>{m}</Tag>)}
            </span>
          }
        />
      )}

      <div
        style={{
          background: token.colorFillQuaternary,
          borderRadius: 20,
          padding: device === 'desktop' ? 16 : 28,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: frame.width,
            maxWidth: '100%',
            transition: 'width .25s cubic-bezier(0.4,0,0.2,1)',
            border: device === 'desktop' ? 'none' : `1px solid ${token.colorBorder}`,
            borderRadius: device === 'desktop' ? 0 : 24,
            overflow: 'hidden',
            boxShadow: device === 'desktop' ? 'none' : token.boxShadowSecondary,
            background: token.colorBgLayout,
          }}
        >
          {device !== 'desktop' && (
            <div style={{ height: 26, display: 'grid', placeItems: 'center', background: token.colorBgContainer, borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
              <div style={{ width: 46, height: 5, borderRadius: 99, background: token.colorTextQuaternary }} />
            </div>
          )}
          <LearnerPreview type={type} data={data} author={author} compact={frame.compact} />
        </div>
      </div>
    </div>
  );
}
