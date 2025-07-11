'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

export function CheckUserExists() {
  const { data: session } = useSession();

  useEffect(() => {
    // Check if the user is missing from the database
    if (session?.userMissing) {
      // Sign out and reload the page to create a new guest user
      signOut({ redirect: false }).then(() => {
        window.location.reload();
      });
    }
  }, [session]);

  // This component doesn't render anything
  return null;
}
