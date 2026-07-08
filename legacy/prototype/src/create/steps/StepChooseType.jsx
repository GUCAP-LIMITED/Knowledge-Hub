import React from 'react';
import { theme as antdTheme } from 'antd';
import { CheckCircleFilled, ArrowRightOutlined } from '@ant-design/icons';
import { CONTENT_TYPES } from '../contentTypes.js';

/**
 * Step 1 — Choose content type. Three large, equally-weighted cards. The chosen
 * card locks an accent colour that follows the user through the rest of the
 * flow. Selecting a card auto-advances (via onChoose) to remove a redundant
 * "Continue" click — the choice *is* the intent.
 */
export default function StepChooseType({ value, onChoose }) {
  const { token } = antdTheme.useToken();
  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 20,
        }}
      >
        {CONTENT_TYPES.map((t) => {
          const Icon = t.icon;
          const selected = value === t.key;
          return (
            <button
              key={t.key}
              type="button"
              aria-pressed={selected}
              onClick={() => onChoose(t.key)}
              style={{
                textAlign: 'left',
                position: 'relative',
                background: token.colorBgContainer,
                border: `2px solid ${selected ? t.accent.color : token.colorBorder}`,
                borderRadius: 18,
                padding: 24,
                cursor: 'pointer',
                transition: 'all .18s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: selected ? `0 12px 28px -12px ${t.accent.color}` : 'none',
                transform: selected ? 'translateY(-3px)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!selected) {
                  e.currentTarget.style.borderColor = t.accent.color;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!selected) {
                  e.currentTarget.style.borderColor = token.colorBorder;
                  e.currentTarget.style.transform = 'none';
                }
              }}
            >
              {selected && (
                <CheckCircleFilled
                  style={{
                    position: 'absolute', top: 16, right: 16,
                    color: t.accent.color, fontSize: 22,
                  }}
                />
              )}
              <div
                style={{
                  width: 56, height: 56, borderRadius: 14,
                  display: 'grid', placeItems: 'center',
                  background: t.accent.soft, color: t.accent.color,
                  marginBottom: 18,
                }}
              >
                <Icon style={{ fontSize: 28 }} />
              </div>
              <div style={{ fontSize: 19, fontWeight: 700, color: token.colorText, marginBottom: 6 }}>
                {t.label}
              </div>
              <div style={{ fontSize: 13.5, color: token.colorTextTertiary, marginBottom: 16, minHeight: 38 }}>
                {t.tagline}
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
                {t.bullets.map((b) => (
                  <li key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: token.colorTextSecondary }}>
                    <span style={{ width: 5, height: 5, borderRadius: 99, background: t.accent.color, flexShrink: 0 }} />
                    {b}
                  </li>
                ))}
              </ul>
              {selected && (
                <div
                  style={{
                    marginTop: 20, display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 13.5, fontWeight: 600, color: t.accent.color,
                  }}
                >
                  Continue as {t.label.toLowerCase()} <ArrowRightOutlined />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
