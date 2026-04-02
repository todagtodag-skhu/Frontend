import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';

import { getPostLoginRoute } from '@/features/auth/routing';
import { getAuthSession } from '@/features/auth/session';

export default function HomeScreen() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const session = await getAuthSession();

      if (!isMounted) {
        return;
      }

      setInitialRoute(session ? getPostLoginRoute(session.role) : '/(auth)/login');
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!initialRoute) {
    return null;
  }

  return <Redirect href={initialRoute} />;
}
