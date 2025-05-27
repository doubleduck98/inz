import {
  IconDevicesQuestion,
  IconFileText,
  IconHome,
  IconLogout,
  IconUsers,
} from '@tabler/icons-react';
import { AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import classes from './Layout.module.css';
import { useAuth } from './hooks/useAuth';

const linkData = [
  { link: '/', label: 'Home', icon: IconHome },
  { link: '/patients', label: 'Pacjenci', icon: IconUsers },
  { link: '/docs', label: 'Dokumenty', icon: IconFileText },
  { link: '/test', label: 'Sale', icon: IconDevicesQuestion },
];

function Layout() {
  const [mobileOpened, { close: closeMobile, toggle: toggleMobile }] =
    useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  const { logout } = useAuth();

  const navigate = useNavigate();
  const links = linkData.map((l) => (
    <a
      className={classes.link}
      data-active={l.link === location.pathname || undefined}
      href={l.link}
      key={l.label}
      onClick={(event) => {
        event.preventDefault();
        navigate(l.link);
      }}
    >
      <l.icon className={classes.linkIcon} stroke={1.5} />
      <span>{l.label}</span>
    </a>
  ));

  return (
    <AppShell
      header={{ height: 50 }}
      navbar={
        isLoginPage
          ? undefined
          : {
              width: 240,
              breakpoint: 'sm',
              collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
            }
      }
      padding="md"
      transitionDuration={isLoginPage ? 0 : 250}
    >
      <AppShell.Header pl="md" pr="md">
        <Group h="100%">
          <Group justify="space-between" style={{ flex: 1 }}>
            <Group>
              {!isLoginPage && (
                <div>
                  <Burger
                    opened={mobileOpened}
                    onClick={toggleMobile}
                    hiddenFrom="sm"
                    size="sm"
                  />
                  <Burger
                    opened={desktopOpened}
                    onClick={toggleDesktop}
                    visibleFrom="sm"
                    size="sm"
                  />
                </div>
              )}
            </Group>
            <Group>
              <NavLink to={'/login'}>login</NavLink>
              <NavLink to={'/'}>home</NavLink>
              <NavLink to={'/test'}>test</NavLink>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      {!isLoginPage && (
        <AppShell.Navbar className={classes.navbar}>
          <div className={classes.navbarMain} onClick={closeMobile}>
            {links}
          </div>
          <div className={classes.footer}>
            <a className={classes.link} onClick={logout}>
              <IconLogout className={classes.linkIcon} stroke={1.5} />
              <span>Wyloguj się</span>
            </a>
          </div>
        </AppShell.Navbar>
      )}

      <AppShell.Main pt={{ base: 52, sm: 66 }} pb="0px">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

export default Layout;
