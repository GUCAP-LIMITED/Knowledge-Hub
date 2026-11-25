import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LandingPagePreview, type LandingPageSection } from './LandingPagePreview';

const mockSections: LandingPageSection[] = [
  {
    id: 'sec-1',
    title: 'Introduction to Architecture',
    lessons: [
      { id: 'les-1', title: 'Welcome and Overview', kind: 0, isPreview: true },
      { id: 'les-2', title: 'Core Principles', kind: 5 },
      { id: 'les-3', title: 'Knowledge Check', kind: 10 },
    ],
  },
];

describe('<LandingPagePreview />', () => {
  it('renders hero information, metadata, and description correctly', () => {
    render(
      <LandingPagePreview
        title="Modern Clean Architecture"
        subtitle="Mastering domain-driven design and enterprise patterns"
        description="A comprehensive guide to clean architecture in React."
        categoryName="Engineering"
        difficultyLabel="Advanced"
        durationText="2 hr 30 min"
        sections={mockSections}
        author="Jane Doe"
        contentType="Course"
        language="English"
      />,
    );

    expect(screen.getByText('Modern Clean Architecture')).toBeInTheDocument();
    expect(
      screen.getByText('Mastering domain-driven design and enterprise patterns'),
    ).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('2 hr 30 min')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(
      screen.getByText('A comprehensive guide to clean architecture in React.'),
    ).toBeInTheDocument();
    expect(screen.getByText('About This Course')).toBeInTheDocument();
    expect(screen.getByText('Enroll in Course (Learner View)')).toBeInTheDocument();
  });

  it('renders fallbacks when optional fields are omitted', () => {
    render(
      <LandingPagePreview
        title=""
        difficultyLabel="Beginner"
        durationText="Self-paced"
        sections={[]}
        author="System Admin"
        contentType="Tutorial"
      />,
    );

    expect(screen.getByText('Untitled Content')).toBeInTheDocument();
    expect(screen.getByText('No description provided.')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.queryByText('Course Curriculum')).not.toBeInTheDocument();
  });

  it('renders curriculum sections, lessons, and preview badges', () => {
    render(
      <LandingPagePreview
        title="Curriculum Test"
        difficultyLabel="Intermediate"
        durationText="1 hr"
        sections={mockSections}
        author="Trainer"
        contentType="Course"
      />,
    );

    expect(screen.getByText('Course Curriculum')).toBeInTheDocument();
    expect(
      screen.getByText('Section 1: Introduction to Architecture'),
    ).toBeInTheDocument();
    expect(screen.getByText('Welcome and Overview')).toBeInTheDocument();
    expect(screen.getByText('Free Preview')).toBeInTheDocument();
    expect(screen.getByText('Core Principles')).toBeInTheDocument();
    expect(screen.getByText('Knowledge Check')).toBeInTheDocument();
  });
});
