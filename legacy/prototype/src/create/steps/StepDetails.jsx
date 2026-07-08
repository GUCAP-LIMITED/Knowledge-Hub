import React from 'react';
import {
  theme as antdTheme, Form, Input, Select, Segmented, Slider, Row, Col, Radio, Space,
} from 'antd';
import {
  InfoCircleOutlined, PictureOutlined, TagsOutlined, EyeOutlined, SearchOutlined,
  TeamOutlined, LockOutlined, GlobalOutlined,
} from '@ant-design/icons';
import { CATEGORIES, DIFFICULTIES, LANGUAGES } from '../contentTypes.js';

/**
 * Step 3 — Details. One long form is fatiguing and hides progress, so we split
 * it into scannable sections (General / Media / Metadata / Visibility / SEO).
 * Each section is a card with an icon+title, which also gives us anchor targets
 * for the in-page mini-nav and keeps validation errors visually grouped.
 */
export default function StepDetails({ type, data, setData, formRef }) {
  const { token } = antdTheme.useToken();
  const accent = type.accent;
  const details = data.details || {};

  const update = (patch) =>
    setData((d) => ({ ...d, details: { ...(d.details || {}), ...patch } }));

  return (
    <div style={{ width: '100%' }}>
      <Form
        ref={formRef}
        layout="vertical"
        initialValues={details}
        onValuesChange={(_, all) => update(all)}
        requiredMark="optional"
      >
        <Section token={token} accent={accent} icon={InfoCircleOutlined} title="General information">
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'A title is required' }, { min: 3, message: 'At least 3 characters' }]}
          >
            <Input placeholder={`e.g. ${type.key === 'course' ? 'Mastering the UAPP Sales Pipeline' : 'How to add a new student'}`} maxLength={90} showCount />
          </Form.Item>
          <Form.Item label="Subtitle" name="subtitle" extra="A one-line hook shown under the title.">
            <Input placeholder="Short, benefit-led summary" maxLength={120} />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Add a short description' }]}
          >
            <Input.TextArea rows={5} placeholder="What will learners take away? Who is it for?" showCount maxLength={1200} />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label="Category" name="category" rules={[{ required: true, message: 'Pick a category' }]}>
                <Select placeholder="Select" options={CATEGORIES.map((v) => ({ value: v, label: v }))} showSearch />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Topic" name="topic">
                <Input placeholder="e.g. Objection handling" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Difficulty" name="difficulty">
                <Segmented block options={DIFFICULTIES} />
              </Form.Item>
            </Col>
          </Row>
        </Section>

        <Section token={token} accent={accent} icon={PictureOutlined} title="Media">
          <p style={{ margin: '0 0 12px', fontSize: 13, color: token.colorTextTertiary }}>
            Thumbnail &amp; cover pulled from your uploads. Choose which represents this {type.label.toLowerCase()}.
          </p>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Thumbnail (card image)" name="thumbnailAlt">
                <Input placeholder="Alt text for accessibility" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Cover image alt" name="coverAlt">
                <Input placeholder="Alt text for the banner image" />
              </Form.Item>
            </Col>
          </Row>
        </Section>

        <Section token={token} accent={accent} icon={TagsOutlined} title="Metadata">
          <Form.Item label="Tags" name="tags" extra="Type and press enter. Helps search & recommendations.">
            <Select mode="tags" placeholder="Add tags" tokenSeparators={[',']} />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Language" name="language" initialValue="English">
                <Select options={LANGUAGES.map((v) => ({ value: v, label: v }))} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={type.key === 'resource' ? 'Estimated reading time' : 'Duration'}
                name="duration"
              >
                <Input suffix={type.key === 'resource' ? 'min read' : 'min'} placeholder="e.g. 45" type="number" />
              </Form.Item>
            </Col>
          </Row>
        </Section>

        <Section token={token} accent={accent} icon={EyeOutlined} title="Visibility">
          <Form.Item name="visibility" initialValue="team" style={{ marginBottom: 0 }}>
            <Radio.Group style={{ width: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }} size={10}>
                <VisibilityOption token={token} value="public" icon={GlobalOutlined} title="Public" desc="Anyone in UAPP Academy can find and open this." />
                <VisibilityOption token={token} value="team" icon={TeamOutlined} title="Team only" desc="Visible to your team and managers." />
                <VisibilityOption token={token} value="private" icon={LockOutlined} title="Private" desc="Only you, until you choose to share." />
              </Space>
            </Radio.Group>
          </Form.Item>
        </Section>

        <Section token={token} accent={accent} icon={SearchOutlined} title="SEO & discovery" last>
          <Form.Item label="Search keywords" name="keywords" extra="Comma-separated terms learners might search for.">
            <Input placeholder="onboarding, portal, new joiner" />
          </Form.Item>
        </Section>
      </Form>
    </div>
  );
}

function Section({ token, accent, icon: Icon, title, children, last }) {
  return (
    <section
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: 14,
        padding: 20,
        marginBottom: last ? 0 : 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, display: 'grid', placeItems: 'center', background: accent.soft, color: accent.color }}>
          <Icon />
        </div>
        <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: token.colorText }}>{title}</h3>
      </div>
      {children}
    </section>
  );
}

function VisibilityOption({ token, value, icon: Icon, title, desc }) {
  return (
    <Radio value={value} style={{ width: '100%' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <Icon style={{ color: token.colorTextSecondary }} />
        <span>
          <span style={{ fontWeight: 600, color: token.colorText }}>{title}</span>
          <span style={{ display: 'block', fontSize: 12.5, color: token.colorTextTertiary }}>{desc}</span>
        </span>
      </span>
    </Radio>
  );
}
