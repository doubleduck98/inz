import { useAuth } from './hooks/useAuth';

const Test = () => {
  const auth = useAuth();
  return (
    <div>
      <h1>Test</h1>
      {auth.user?.name ?? 'pusto'}
    </div>
  );
};

export default Test;
