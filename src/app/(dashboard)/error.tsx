'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 md:p-6">
      <div className="text-center space-y-6 max-w-lg">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Something went wrong!
          </h1>
          <p className="text-muted-foreground">
            We apologize for the inconvenience. An unexpected error has occurred.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={reset}
            variant="default"
            className="px-8"
          >
            Try again
          </Button>
          
          <p className="text-sm text-muted-foreground">
            If the problem persists, please contact support or try again later.
          </p>
        </div>
      </div>
    </main>
  );
}
// GGG


