import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import { UserProvider } from '../../../context/UserContext';
import { LanguageProvider } from '../../../context/LanguageContext';

// ── Framer Motion mock ─────────────────────────────────────────────────────
// AnimatePresence with mode="wait" keeps exiting children alive until their
// exit animation completes — which never happens in jsdom.  We replace the
// whole module with stubs so only the current card is ever in the DOM.
vi.mock('framer-motion', async () => {
  const R = await import('react');

  // Props that are framer-motion-only and must not be forwarded to DOM elements.
  const FM_PROPS = new Set([
    'animate', 'initial', 'exit', 'variants', 'custom', 'whileHover',
    'whileTap', 'layout', 'transition', 'drag', 'dragConstraints',
    'dragElastic', 'onDragEnd', 'onAnimationComplete', 'layoutId',
  ]);
  const filter = (props) =>
    Object.fromEntries(Object.entries(props).filter(([k]) => !FM_PROPS.has(k)));

  const make = (tag) =>
    R.forwardRef(({ children, ...props }, ref) =>
      R.createElement(tag, { ...filter(props), ref }, children)
    );

  return {
    motion: new Proxy({}, { get: (_, tag) => make(tag) }),
    // Pass children directly — no exit animation, so only the live card is mounted.
    AnimatePresence: ({ children }) => children,
    useAnimation: () => ({ start: vi.fn() }),
    useInView: () => true,
    useMotionValue: (v) => ({ get: () => v, set: vi.fn() }),
  };
});

// Import AFTER vi.mock so the hoisted mock is already registered.
import AssessmentPage from '../AssessmentPage';

// ── Wrapper ────────────────────────────────────────────────────────────────

const renderAssessment = () =>
  render(
    <MemoryRouter initialEntries={['/assessment']}>
      <UserProvider>
        <LanguageProvider>
          <Routes>
            <Route path="/" element={<div data-testid="home-page">Home</div>} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/results" element={<div data-testid="results-page">Results</div>} />
          </Routes>
        </LanguageProvider>
      </UserProvider>
    </MemoryRouter>
  );

// ── Step detection ─────────────────────────────────────────────────────────
// The component renders <motion.div data-testid="step-{id}"> for each card.
// We use findByTestId to wait for a specific step to appear.  This avoids
// the duplicate-text problem (step indicator labels share text with card h2s)
// and is immune to translation changes.

const waitForStep = (stepId) => screen.findByTestId(`step-${stepId}`);

// ── Action helpers ─────────────────────────────────────────────────────────

/**
 * Click an option card by its visible label.
 * findAllByText + last element handles cases where a label appears both in
 * the step-indicator span and in the card option label.
 */
const selectOption = async (label) => {
  const els = await screen.findAllByText(label);
  await act(async () => {
    fireEvent.click(els[els.length - 1]);
  });
};

/** Click the Next / Submit button (CSS-class based, language-agnostic). */
const clickNext = async () => {
  await act(async () => {
    const btn = document.querySelector('.assessment__btn--next');
    if (!btn) throw new Error('Next button (.assessment__btn--next) not found');
    fireEvent.click(btn);
  });
};

/** Click the Back (previous step) button. */
const clickBack = async () => {
  await act(async () => {
    const btn = document.querySelector('.assessment__btn--prev');
    if (!btn) throw new Error('Back button (.assessment__btn--prev) not found');
    fireEvent.click(btn);
  });
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe('AssessmentPage', () => {
  // localStorage is cleared before each test by the global setup.js.

  // ── Rendering ────────────────────────────────────────────────────────────

  it('renders step 1 (Transport) and options', async () => {
    renderAssessment();
    await waitForStep('transport'); // waits for data-testid="step-transport"
    expect(screen.getByText(/How do you usually get around/i)).toBeInTheDocument();
    expect(screen.getByText(/^Car$/i)).toBeInTheDocument();
    expect(screen.getByText(/Bicycle/i)).toBeInTheDocument();
  });

  it('disables Next until a transport option is selected', async () => {
    renderAssessment();
    await waitForStep('transport');

    // No option chosen yet → button disabled
    expect(document.querySelector('.assessment__btn--next')).toBeDisabled();

    // Select an option
    await selectOption('Bicycle');

    // Button should become enabled after re-render
    await waitFor(() =>
      expect(document.querySelector('.assessment__btn--next')).not.toBeDisabled()
    );
  });

  // ── Step navigation ──────────────────────────────────────────────────────

  it('advances through all four steps in order', async () => {
    renderAssessment();

    await waitForStep('transport');
    await selectOption('Car');
    await clickNext();

    await waitForStep('energy');
    await clickNext();

    await waitForStep('food');
    await selectOption('Vegetarian');
    await clickNext();

    await waitForStep('water');
    // All four steps reached ✓
  });

  it('Back button returns to the previous step', async () => {
    renderAssessment();

    await waitForStep('transport');
    await selectOption('Car');
    await clickNext();

    await waitForStep('energy');
    await clickBack();

    // Should be back on transport
    await waitForStep('transport');
    expect(screen.getByText(/How do you usually get around/i)).toBeInTheDocument();
  });

  // ── Final step: writes to localStorage and navigates ─────────────────────

  it('writes result to localStorage synchronously and navigates to /results', async () => {
    renderAssessment();

    await waitForStep('transport');
    await selectOption('Car');
    await clickNext();

    await waitForStep('energy');
    await clickNext();

    await waitForStep('food');
    await selectOption('Mixed');
    await clickNext();

    await waitForStep('water');
    await selectOption('Medium');
    await clickNext(); // final submit

    // Must land on /results — not loop back to assessment
    await waitFor(() =>
      expect(screen.getByTestId('results-page')).toBeInTheDocument()
    );

    // The synchronous write must have happened before navigate() fired,
    // so ResultsPage never sees null and the loop is prevented.
    const stored = localStorage.getItem('ecomirror_assessment_result');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored);
    expect(parsed).toHaveProperty('ecoScore');
    expect(parsed.ecoScore).toBeGreaterThanOrEqual(0);
    expect(parsed.ecoScore).toBeLessThanOrEqual(100);
    expect(parsed).toHaveProperty('impactLevel');
    expect(parsed).toHaveProperty('responses');
  });

  it('does NOT redirect back to /assessment after submission (loop prevention)', async () => {
    renderAssessment();

    await waitForStep('transport');
    await selectOption('Walking');
    await clickNext();

    await waitForStep('energy');
    await clickNext();

    await waitForStep('food');
    await selectOption('Vegetarian');
    await clickNext();

    await waitForStep('water');
    await selectOption('Low');
    await clickNext();

    // Results page shown
    await waitFor(() =>
      expect(screen.getByTestId('results-page')).toBeInTheDocument()
    );

    // Wizard must be gone — not looping
    expect(screen.queryByText(/How do you usually get around/i)).not.toBeInTheDocument();
  });

  // ── Step counter & progress indicator ────────────────────────────────────
  // The progress fill is animated via Framer Motion's `animate={{ width }}`,
  // which is mocked away.  We instead verify the step counter text and the
  // CSS class-based step indicator, both of which are set synchronously.

  it('step counter and indicator reflect progress through all steps', async () => {
    const { container } = renderAssessment();

    // Step 1
    await waitForStep('transport');
    expect(screen.getByText(/Step 1 of 4/i)).toBeInTheDocument();
    expect(container.querySelector('.assessment__step-dot--active')).not.toBeNull();

    await selectOption('Car');
    await clickNext();

    // Step 2
    await waitForStep('energy');
    expect(screen.getByText(/Step 2 of 4/i)).toBeInTheDocument();

    await clickNext();

    // Step 3
    await waitForStep('food');
    expect(screen.getByText(/Step 3 of 4/i)).toBeInTheDocument();

    await selectOption('Mixed');
    await clickNext();

    // Step 4 — three dots are "done", one is "active"
    await waitForStep('water');
    expect(screen.getByText(/Step 4 of 4/i)).toBeInTheDocument();
    await waitFor(() => {
      const doneDots = container.querySelectorAll('.assessment__step-dot--done');
      expect(doneDots).toHaveLength(3);
    });
    expect(container.querySelector('.assessment__step-dot--active')).not.toBeNull();
  });
});
