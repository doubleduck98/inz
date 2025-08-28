import { Button, Center, Container, Group, Title, Text } from '@mantine/core';
import { Illustration } from './Illustration';
import classes from './NotFound.module.css';
import { useNavigate } from 'react-router-dom';

/**
 * Wildcard not found page prompting user to go back to home page.
 */
const NotFound = () => {
  const navigate = useNavigate();
  return (
    <Container className={classes.root}>
      <Center>
        <div className={classes.inner}>
          <Illustration className={classes.image} />
          <div className={classes.content}>
            <Title className={classes.title}>Nic tu nie ma</Title>
            <Text
              c="dimmed"
              size="lg"
              ta="center"
              className={classes.description}
            >
              Strona, którą próbujesz otworzyć, nie istnieje. Być może źle
              wpisałeś adres strony lub została ona przeniesiona.
            </Text>
            <Group justify="center">
              <Button size="md" onClick={() => navigate('/')}>
                Powrót na stronę główną
              </Button>
            </Group>
          </div>
        </div>
      </Center>
    </Container>
  );
};

export default NotFound;
