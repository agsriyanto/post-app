import { useEffect } from 'react';
import { useRouter } from 'next/router';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>): React.FC<P> => {
  return (props) => {
    const router = useRouter();

    useEffect(() => {
      const token = sessionStorage.getItem('access_token');
      if (!token) {
        router.push('/');
      }
    }, [router]);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
