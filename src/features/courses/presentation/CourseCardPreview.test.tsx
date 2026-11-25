import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { buildCourse } from '@testing';
import { CourseCardPreview } from './CourseCardPreview';

const LocationProbe = (): ReactElement => {
  const location = useLocation();
  return <span data-testid="pathname">{location.pathname}</span>;
};

describe('<CourseCardPreview />', () => {
  it('renders the title, subtitle, updated date, level, description, and outcomes checklist', () => {
    const course = buildCourse({
      title: 'Deep Dive into Onboarding',
      subtitle: 'Step-by-step onboarding walkthrough',
      description: 'Everything a new hire needs to know.',
      outcomes: ['Set up your workstation', 'Meet your team'],
      updatedAt: new Date('2026-03-05T00:00:00.000Z'),
    });

    render(
      <MemoryRouter>
        <CourseCardPreview course={course} difficultyLabel="Beginner" side="right" />
      </MemoryRouter>,
    );

    expect(screen.getByText('Deep Dive into Onboarding')).toBeInTheDocument();
    expect(screen.getByText('Step-by-step onboarding walkthrough')).toBeInTheDocument();
    expect(screen.getByText(/Updated/)).toBeInTheDocument();
    expect(screen.getByText(`${course.duration} · Beginner`)).toBeInTheDocument();
    expect(screen.getByText('Everything a new hire needs to know.')).toBeInTheDocument();
    expect(screen.getByText("What you'll learn")).toBeInTheDocument();
    expect(screen.getByText('Set up your workstation')).toBeInTheDocument();
    expect(screen.getByText('Meet your team')).toBeInTheDocument();
  });

  it('omits the subtitle when none is provided', () => {
    const course = buildCourse({
      title: 'Deep Dive into Onboarding',
      subtitle: null,
    });

    render(
      <MemoryRouter>
        <CourseCardPreview course={course} difficultyLabel="Beginner" side="right" />
      </MemoryRouter>,
    );

    expect(screen.getByText('Deep Dive into Onboarding')).toBeInTheDocument();
    expect(
      screen.queryByText('Step-by-step onboarding walkthrough'),
    ).not.toBeInTheDocument();
  });

  it('hides the outcomes block when there are none', () => {
    const course = buildCourse({ outcomes: [] });

    render(
      <MemoryRouter>
        <CourseCardPreview course={course} difficultyLabel={null} side="left" />
      </MemoryRouter>,
    );

    expect(screen.queryByText("What you'll learn")).not.toBeInTheDocument();
    expect(screen.getByText(course.duration)).toBeInTheDocument();
  });

  it('navigates to the course detail page when the CTA is clicked', () => {
    const course = buildCourse({ id: 'course-42' });

    render(
      <MemoryRouter initialEntries={['/courses']}>
        <CourseCardPreview course={course} difficultyLabel={null} side="right" />
        <LocationProbe />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Visit course' }));

    expect(screen.getByTestId('pathname')).toHaveTextContent('/courses/course-42');
  });
});
