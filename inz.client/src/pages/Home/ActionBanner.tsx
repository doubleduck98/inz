import { Button, Card, Text } from '@mantine/core';
import classes from './Home.module.css';
import { IconArrowRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useMediaQuery } from '@mantine/hooks';

interface ActionBannerProps {
  title: string;
  description: string;
  image: string;
  link: string;
}

const ActionBanner = ({
  title,
  description,
  image,
  link,
}: ActionBannerProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <Card
      radius="md"
      style={{ backgroundImage: `url(${image})` }}
      className={`${classes.actionCard} ${isMobile ? classes.smallCard : classes.bigCard}`}
    >
      <div className={classes.overlay} />

      <div className={classes.content}>
        <div>
          <Text size="lg" className={classes.title} fw={500}>
            {title}
          </Text>

          <Text size="sm" className={classes.description}>
            {description}
          </Text>
        </div>

        <Button
          className={classes.action}
          variant="white"
          color="dark"
          component={Link}
          to={link}
          size="xs"
          rightSection={<IconArrowRight size={16} />}
        >
          Przejdź
        </Button>
      </div>
    </Card>
  );
};

export default ActionBanner;
