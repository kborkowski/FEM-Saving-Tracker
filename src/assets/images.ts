// Import all image assets so Vite bundles them with correct relative URLs.
// Using absolute public-folder paths (/assets/...) breaks in Power Apps deployments
// because the app is served from a deep URL, not the domain root.

import logoSmall from './images/logo-small.svg';
import iconArrowDown from './images/icon-arrow-down.svg';
import iconCalendar from './images/icon-calendar.svg';
import iconCheckmark from './images/icon-checkmark.svg';
import iconChevronLeft from './images/icon-chevron-left.svg';
import iconCross from './images/icon-cross.svg';
import iconDollar from './images/icon-dollar.svg';
import iconError from './images/icon-error.svg';
import iconFilter from './images/icon-filter.svg';
import iconPlus from './images/icon-plus.svg';
import iconSort from './images/icon-sort.svg';
import iconTarget from './images/icon-target.svg';
import patternGrid from './images/pattern-grid.svg';

export {
  logoSmall,
  iconArrowDown,
  iconCalendar,
  iconCheckmark,
  iconChevronLeft,
  iconCross,
  iconDollar,
  iconError,
  iconFilter,
  iconPlus,
  iconSort,
  iconTarget,
  patternGrid,
};
