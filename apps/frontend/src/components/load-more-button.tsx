import React, { useEffect, useRef } from 'react';
import { Button } from './ui/button';

type LoadMoreProps = {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
};

export const LoadMoreButton: React.FC<LoadMoreProps> = ({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}) => {
  const loadMoreRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        if (entries[0].isIntersecting && (hasNextPage || isFetchingNextPage)) {
          fetchNextPage();
        }
      },
    );
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Button
      ref={loadMoreRef}
      type="button"
      variant={'link'}
      onClick={() => fetchNextPage()}
      disabled={!hasNextPage || isFetchingNextPage}
    >
      {isFetchingNextPage
        ? 'Loading more...'
        : hasNextPage
          ? 'Load More'
          : 'No more items'}
    </Button>
  );
};
