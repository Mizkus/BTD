import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/intro', label: 'Введение' },
  { to: '/description', label: 'Описание' },
  { to: '/conclusion', label: 'Заключение' },
  { to: '/posts', label: 'Посты' },
];

const Sidebar = () => (
  <aside className="sidebar">
    <nav className="nav">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `nav__link${isActive ? ' nav__link--active' : ''}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
