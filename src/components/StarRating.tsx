import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  totalStars?: number;
  size?: number;
  className?: string;
  onRate?: (rating: number) => void;
  readOnly?: boolean;
}

export const StarRating = ({
  rating,
  totalStars = 5,
  size = 20,
  className,
  onRate,
  readOnly = false,
}: StarRatingProps) => {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={index}
            size={size}
            className={cn(
              'transition-colors',
              starValue <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300',
              !readOnly && 'cursor-pointer hover:text-yellow-300'
            )}
            onClick={() => !readOnly && onRate?.(starValue)}
          />
        );
      })}
    </div>
  );
};