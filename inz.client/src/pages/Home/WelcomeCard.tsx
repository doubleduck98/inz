import { Paper, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import classes from './Home.module.css';

const WelcomeCard = () => {
  const [time, setTime] = useState(dayjs());
  const { user } = useAuth();

  useEffect(() => {
    setInterval(() => {
      setTime(dayjs());
    }, 1000);
  }, []);

  return (
    <Paper
      h={{ base: '140px', sm: '350px' }}
      maw="350px"
      className={classes.welcomeCard}
    >
      <Title size="xl" mb="sm" style={{ color: 'var(--mantine-color-gray-7)' }}>
        Dzień dobry, {user?.name}!
      </Title>
      <Text size="lg" style={{ color: 'var(--mantine-color-gray-6)' }}>
        Jest godzina {time.format('HH:mm:ss')}
      </Text>
    </Paper>
  );
};

export default WelcomeCard;
