import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const navItems = [
  { to: '/intro', label: 'Введение' },
  { to: '/description', label: 'Описание' },
  { to: '/conclusion', label: 'Заключение' },
  { to: '/posts', label: 'Посты' },
  { to: '/api', label: 'API' },
  { to: '/stats', label: 'Статистика', adminOnly: true },
];

const Sidebar = () => {
  const { auth, logout } = useContext(AuthContext);
  const filteredItems = navItems.filter((item) =>
    item.adminOnly ? auth.user?.role === 'admin' : true
  );

  return (
    <aside className="sidebar">
      <nav className="nav">
        {filteredItems.map((item) => (
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
      <button
        type="button"
        className="nav__link nav__link--logout"
        onClick={logout}
      >
        Выйти
      </button>
    </aside>
  );
};

export default Sidebar;
