import React, { useState } from 'react';
import { theme as antdTheme, Input, Button, Tag, message } from 'antd';
import { LinkOutlined, PlusOutlined, GlobalOutlined, DeleteOutlined } from '@ant-design/icons';
import UploadDropzone from '../components/UploadDropzone.jsx';

/**
 * Step 2 — Upload content. Renders one card per named slot defined by the chosen
 * content type. Course = several slots (thumbnail, intro, lessons, resources);
 * Tutorial = a single primary asset; Resource = one multi-file reorderable slot
 * plus external-URL support.
 */
export default function StepUpload({ type, data, setData }) {
  const { token } = antdTheme.useToken();
  const accent = type.accent;
  const files = data.files || {};
  const [url, setUrl] = useState('');

  const mutate = (slotId, next) =>
    setData((d) => ({ ...d, files: { ...(d.files || {}), [slotId]: next } }));

  // Simulate an async upload so progress bars are real behaviour, not decoration.
  const addFiles = (slotId, fileObjs) => {
    const existing = files[slotId] || [];
    const mapped = fileObjs.map((f, idx) => ({
      uid: `${slotId}-${existing.length + idx}-${f.name}-${f.size}`,
      name: f.name,
      size: f.size,
      progress: 0,
      status: 'uploading',
    }));
    const next = [...existing, ...mapped];
    mutate(slotId, next);
    mapped.forEach((m) => simulate(slotId, m.uid));
  };

  const simulate = (slotId, uid) => {
    let p = 0;
    const tick = () => {
      p += Math.floor(12 + Math.random() * 22);
      setData((d) => {
        const list = (d.files?.[slotId] || []).map((f) =>
          f.uid === uid ? { ...f, progress: Math.min(p, 100), status: p >= 100 ? 'done' : 'uploading' } : f,
        );
        return { ...d, files: { ...(d.files || {}), [slotId]: list } };
      });
      if (p < 100) setTimeout(tick, 220);
    };
    setTimeout(tick, 200);
  };

  const removeFile = (slotId, i) =>
    mutate(slotId, (files[slotId] || []).filter((_, idx) => idx !== i));

  const replaceFile = (slotId, i, file) => {
    const next = [...(files[slotId] || [])];
    next[i] = { uid: `${slotId}-r-${file.name}-${file.size}`, name: file.name, size: file.size, progress: 0, status: 'uploading' };
    mutate(slotId, next);
    simulate(slotId, next[i].uid);
  };

  const reorder = (slotId, from, to) => {
    const next = [...(files[slotId] || [])];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    mutate(slotId, next);
  };

  const addUrl = () => {
    const v = url.trim();
    if (!v) return;
    if (!/^https?:\/\//i.test(v)) return message.error('Enter a full URL starting with http(s)://');
    setData((d) => ({ ...d, links: [...(d.links || []), { uid: `url-${Date.now()}`, url: v }] }));
    setUrl('');
  };

  const guidance =
    type.key === 'tutorial'
      ? 'Add one video, PDF, or document — that’s all a tutorial needs.'
      : type.key === 'resource'
      ? 'Add files or paste links. Drag files to set their order.'
      : 'Add your media now — you’ll arrange lessons into a curriculum next.';

  return (
    <div style={{ width: '100%' }}>
      <p style={{ margin: '0 0 20px', fontSize: 13.5, color: token.colorTextTertiary }}>{guidance}</p>

      <div style={{ display: 'grid', gap: 22 }}>
        {type.upload.slots.map((slot) => (
          <section key={slot.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <h3 style={{ fontSize: 14.5, fontWeight: 700, color: token.colorText, margin: 0 }}>
                {slot.label}
              </h3>
              {slot.required && <Tag color={accent.color} style={{ marginInlineEnd: 0 }}>Required</Tag>}
            </div>
            <UploadDropzone
              slot={slot}
              accent={accent}
              files={files[slot.id] || []}
              onAdd={addFiles}
              onRemove={removeFile}
              onReplace={replaceFile}
              onReorder={type.upload.reorder ? reorder : undefined}
            />
          </section>
        ))}

        {type.upload.allowUrl && (
          <section>
            <h3 style={{ fontSize: 14.5, fontWeight: 700, color: token.colorText, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <GlobalOutlined style={{ color: accent.color }} /> External links
            </h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <Input
                prefix={<LinkOutlined style={{ color: token.colorTextTertiary }} />}
                placeholder="https://example.com/reference"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onPressEnter={addUrl}
                allowClear
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={addUrl}>Add</Button>
            </div>
            {(data.links || []).length > 0 && (
              <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                {data.links.map((l, i) => (
                  <div
                    key={l.uid}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                      border: `1px solid ${token.colorBorder}`, borderRadius: 10, background: token.colorBgContainer,
                    }}
                  >
                    <GlobalOutlined style={{ color: accent.color }} />
                    <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: token.colorText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {l.url}
                    </span>
                    <button
                      type="button"
                      aria-label="Remove link"
                      onClick={() => setData((d) => ({ ...d, links: d.links.filter((_, idx) => idx !== i) }))}
                      style={{ border: 'none', background: 'transparent', color: token.colorError, cursor: 'pointer' }}
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
