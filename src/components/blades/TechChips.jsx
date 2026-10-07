import Icon from '../Icon';
import { TECH_ICONS } from '../../data/techIcons';

/* Things with no logo of their own borrow a line icon and stay pearl-coloured,
   so they read as categories rather than brands. */
const GENERIC = { SQL: 'archive', 'REST API': 'code', PayMongo: 'card' };

function TechMark({ name }) {
  const brand = TECH_ICONS[name];

  if (brand) {
    return (
      <svg className="tchip__mark" viewBox="0 0 24 24" style={{ color: brand.c }} aria-hidden="true">
        <path d={brand.d} fill="currentColor" />
      </svg>
    );
  }

  return <Icon name={GENERIC[name] || 'code'} size={17} strokeWidth={1.6} className="tchip__mark" />;
}

/** The tech stack, as brand marks with their names. */
export default function TechChips({ items }) {
  return (
    <ul className="tchips">
      {items.map((it) => (
        <li className="tchip" key={it}>
          <TechMark name={it} />
          {it}
        </li>
      ))}
    </ul>
  );
}
