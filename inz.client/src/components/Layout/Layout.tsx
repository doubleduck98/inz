import {
  IconCalendarEvent,
  IconFileText,
  IconHome,
  IconLogout,
  IconUsers,
} from '@tabler/icons-react';
import { AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, useNavigate } from 'react-router-dom';
import classes from './Layout.module.css';
import { useAuth } from '@/hooks/useAuth';
import ColorSchemeButton from './ColorSchemeButton/ColorSchemeButton';
import AccesibilityMenu from './A11yMenu/A11yMenu';

const linkData = [
  { link: '/', label: 'Strona główna', icon: IconHome },
  { link: '/patients', label: 'Pacjenci', icon: IconUsers },
  { link: '/docs', label: 'Dokumenty', icon: IconFileText },
  { link: '/schedule', label: 'Zajęcia', icon: IconCalendarEvent },
];

/**
 * Main layout component for the app.
 */
function Layout() {
  const [mobileOpened, { close: closeMobile, toggle: toggleMobile }] =
    useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const { user, logout } = useAuth();
  const authenticated = user !== null;

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
      navbar={{
        width: 240,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
      transitionDuration={250}
    >
      <AppShell.Header pl="md" pr="md">
        <Group h="100%">
          <Group justify="space-between" style={{ flex: 1 }}>
            <Group>
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
            </Group>
            <Group gap="sm">
              <AccesibilityMenu />
              <ColorSchemeButton />
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className={classes.navbar}>
        <div className={classes.navbarMain} onClick={closeMobile}>
          {links}
        </div>
        {authenticated && (
          <div className={classes.footer}>
            <a className={classes.link} onClick={logout}>
              <IconLogout className={classes.linkIcon} stroke={1.5} />
              <span>Wyloguj się</span>
            </a>
          </div>
        )}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

export default Layout;
