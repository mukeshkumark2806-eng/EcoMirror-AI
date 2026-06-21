/**
 * @fileoverview SectionHeading sub-component for the Landing Page.
 * @module pages/Landing/components/SectionHeading
 */

/**
 * Standardized Section Heading layout with badges and gradients.
 *
 * @param {object} props
 * @param {string} [props.badge] - Optional badge text displayed above heading.
 * @param {string} props.title - Main header title text.
 * @param {string} [props.highlight] - Accent text styled with a gradient.
 * @param {string} [props.subtitle] - Explanatory text beneath the heading.
 */
export default function SectionHeading({ badge, title, highlight, subtitle }) {
  return (
    <div className="lp-section-heading">
      {badge && <span className="lp-badge">{badge}</span>}
      <h2 className="lp-section-title">
        {title} {highlight && <span className="text-gradient">{highlight}</span>}
      </h2>
      {subtitle && <p className="lp-section-subtitle">{subtitle}</p>}
    </div>
  );
}
