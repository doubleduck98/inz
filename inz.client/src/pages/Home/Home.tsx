import { Container, Group } from '@mantine/core';
import ActionBanner from './ActionBanner';
import Schedule from './assets/schedule.svg';
import Docs from './assets/docs.svg';
import Patients from './assets/patients.svg';
import CalendarCard from './CalendarCard';
import WelcomeCard from './WelcomeCard';

const links = [
  {
    title: 'Dokumenty',
    description: 'Przeglądaj i zarządzaj zapisanymi dokumentami.',
    image: Docs,
    link: '/docs',
  },
  {
    title: 'Pacjenci',
    description: 'Przeglądaj dane pacjenów.',
    image: Patients,
    link: '/patients',
  },
  {
    title: 'Zajęcia',
    description: 'Zarządzaj swoimi zajęciami i dodawaj nowe do kalendarza.',
    image: Schedule,
    link: '/schedule',
  },
];

const Home = () => {
  const banners = links.map((i) => <ActionBanner {...i} key={i.link} />);
  return (
    <Container fluid>
      <Group justify="center">
        <WelcomeCard />
        <CalendarCard />
      </Group>
      <Group py="md" justify="center">
        {banners}
      </Group>
    </Container>
  );
};

export default Home;
