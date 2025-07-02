import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { VIEW_STYLE, ViewStyle } from '@/constant';
import { useTypedSearchParams } from '@/hooks/useTypedSearchParams';
import { cn } from '@/lib/utils';

export function ViewStyleButton() {
  const { params, setParams } = useTypedSearchParams();
  const viewStyle = params.view_style;

  function handleViewStyleChange(e: React.MouseEvent<HTMLButtonElement>) {
    setParams({
      view_style: e.currentTarget.name as ViewStyle,
      page: undefined,
    });
  }

  return (
    <div className="d-flex align-items-center">
      <Button
        name={VIEW_STYLE.LIST}
        variant={'phoenix-secondary'}
        size={'icon'}
        className={cn('mx-1', viewStyle !== VIEW_STYLE.LIST && 'text-primary')}
        onClick={handleViewStyleChange}
      >
        <Icons.FaList width={14} height={14} />
      </Button>
      <Button
        name={VIEW_STYLE.GRID}
        variant={'phoenix-secondary'}
        size={'icon'}
        className={cn('mx-1', viewStyle !== VIEW_STYLE.GRID && 'text-primary')}
        onClick={handleViewStyleChange}
      >
        <Icons.FaGrid width={14} height={14} />
      </Button>
    </div>
  );
}
