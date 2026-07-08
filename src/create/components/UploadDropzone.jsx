import React, { useState, useRef } from 'react';
import {
  InboxOutlined,
  FileTextOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileZipOutlined,
  DeleteOutlined,
  SwapOutlined,
  CloudUploadOutlined,
  HolderOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { Progress, Tooltip, Empty, theme as antdTheme } from 'antd';
import { ACCEPT_MAP } from '../contentTypes.js';

const iconFor = (name = '') => {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return FileImageOutlined;
  if (['mp4', 'mov', 'webm', 'm4v'].includes(ext)) return VideoCameraOutlined;
  if (ext === 'pdf') return FilePdfOutlined;
  if (['xls', 'xlsx', 'csv'].includes(ext)) return FileExcelOutlined;
  if (['ppt', 'pptx'].includes(ext)) return FilePptOutlined;
  if (['zip', 'rar', '7z'].includes(ext)) return FileZipOutlined;
  return FileTextOutlined;
};

const fmtSize = (b) => {
  if (!b && b !== 0) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

/**
 * A single named upload slot: drag & drop + browse + (optional) cloud, a live
 * progress bar per file, previews, delete / replace, and optional drag-to-
 * reorder. Deliberately does not depend on AntD's <Upload> internals so we fully
 * control the empty / uploading / done states the brief calls for.
 */
export default function UploadDropzone({
  slot,
  files = [],
  onAdd,
  onRemove,
  onReplace,
  onReorder,
  accent,
}) {
  const { token } = antdTheme.useToken();
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);
  const replaceRef = useRef(null);
  const replaceTarget = useRef(null);
  const dragItem = useRef(null);
  const accept = ACCEPT_MAP[slot.accept] || undefined;
  const single = slot.single;
  const canReorder = !!onReorder && files.length > 1;

  const pick = (fileList) => {
    const arr = Array.from(fileList || []);
    if (!arr.length) return;
    onAdd(slot.id, single ? arr.slice(0, 1) : arr);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    pick(e.dataTransfer.files);
  };

  const showDrop = !single || files.length === 0;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={!single}
        style={{ display: 'none' }}
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        ref={replaceRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files?.[0] && replaceTarget.current != null) {
            onReplace?.(slot.id, replaceTarget.current, e.target.files[0]);
          }
          replaceTarget.current = null;
          e.target.value = '';
        }}
      />

      {showDrop && (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Upload ${slot.label}`}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          style={{
            border: `1.5px dashed ${drag ? accent.color : token.colorBorder}`,
            background: drag ? accent.soft : token.colorFillQuaternary,
            borderRadius: 14,
            padding: '30px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all .18s cubic-bezier(0.4,0,0.2,1)',
            outline: 'none',
          }}
        >
          <div
            style={{
              width: 46, height: 46, borderRadius: 12, margin: '0 auto 12px',
              display: 'grid', placeItems: 'center',
              background: accent.soft, color: accent.color,
            }}
          >
            <InboxOutlined style={{ fontSize: 22 }} />
          </div>
          <div style={{ fontWeight: 600, color: token.colorText, marginBottom: 4 }}>
            Drag & drop, or <span style={{ color: accent.color }}>browse</span>
          </div>
          <div style={{ fontSize: 12.5, color: token.colorTextTertiary, marginBottom: 12 }}>
            {slot.hint}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              /* Cloud import is stubbed — wire to Drive/Dropbox picker in prod */
              inputRef.current?.click();
            }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12.5, color: token.colorTextSecondary,
              background: token.colorBgContainer, border: `1px solid ${token.colorBorder}`,
              borderRadius: 8, padding: '5px 12px', cursor: 'pointer',
            }}
          >
            <CloudUploadOutlined /> Import from cloud
          </button>
        </div>
      )}

      {files.length > 0 && (
        <div style={{ display: 'grid', gap: 10, marginTop: showDrop ? 14 : 0 }}>
          {files.map((f, i) => {
            const Ico = iconFor(f.name);
            const uploading = f.progress != null && f.progress < 100;
            const errored = f.status === 'error';
            return (
              <div
                key={f.uid}
                draggable={canReorder}
                onDragStart={() => (dragItem.current = i)}
                onDragOver={(e) => canReorder && e.preventDefault()}
                onDrop={() => {
                  if (canReorder && dragItem.current != null && dragItem.current !== i) {
                    onReorder(slot.id, dragItem.current, i);
                  }
                  dragItem.current = null;
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  border: `1px solid ${errored ? token.colorError : token.colorBorder}`,
                  background: errored ? token.colorErrorBg : token.colorBgContainer,
                  borderRadius: 12,
                }}
              >
                {canReorder && (
                  <HolderOutlined
                    style={{ color: token.colorTextQuaternary, cursor: 'grab' }}
                    aria-label="Drag to reorder"
                  />
                )}
                <div
                  style={{
                    width: 40, height: 40, borderRadius: 9, flexShrink: 0,
                    display: 'grid', placeItems: 'center',
                    background: accent.soft, color: accent.color,
                  }}
                >
                  <Ico style={{ fontSize: 18 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600, fontSize: 13.5, color: token.colorText,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}
                  >
                    {f.name}
                    {i === 0 && slot.id === 'files' && (
                      <span style={{ marginLeft: 8, fontSize: 11, color: accent.color, fontWeight: 600 }}>
                        · Primary
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: token.colorTextTertiary, marginTop: 2 }}>
                    {errored ? 'Upload failed — retry' : uploading ? `Uploading… ${f.progress}%` : fmtSize(f.size)}
                  </div>
                  {uploading && (
                    <Progress
                      percent={f.progress}
                      showInfo={false}
                      size="small"
                      strokeColor={accent.color}
                      style={{ marginTop: 4, marginBottom: 0 }}
                    />
                  )}
                </div>
                {!uploading && !errored && (
                  <CheckCircleFilled style={{ color: token.colorSuccess, fontSize: 16 }} />
                )}
                <div style={{ display: 'flex', gap: 4 }}>
                  <Tooltip title="Replace">
                    <button
                      type="button"
                      aria-label={`Replace ${f.name}`}
                      onClick={() => {
                        replaceTarget.current = i;
                        replaceRef.current?.click();
                      }}
                      style={iconBtn(token)}
                    >
                      <SwapOutlined />
                    </button>
                  </Tooltip>
                  <Tooltip title="Remove">
                    <button
                      type="button"
                      aria-label={`Remove ${f.name}`}
                      onClick={() => onRemove(slot.id, i)}
                      style={iconBtn(token, token.colorError)}
                    >
                      <DeleteOutlined />
                    </button>
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {single && files.length === 0 && slot.required && (
        <div style={{ marginTop: 8, fontSize: 12, color: token.colorTextTertiary }}>
          Required
        </div>
      )}
    </div>
  );
}

const iconBtn = (token, color) => ({
  width: 30, height: 30, borderRadius: 8,
  display: 'grid', placeItems: 'center',
  border: `1px solid ${token.colorBorder}`,
  background: token.colorBgContainer,
  color: color || token.colorTextSecondary,
  cursor: 'pointer',
});

export { fmtSize, iconFor };
