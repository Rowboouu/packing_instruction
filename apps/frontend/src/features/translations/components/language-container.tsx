import { Icons } from '@/components/icons';
import { useTranslation } from 'react-i18next';

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserResource } from '@/features/auth';
import useCollapsible from '@/hooks/useCollapsible';
import { Language, supportedLang } from '@/i18n';
import { cn } from '@/lib/utils';
import { useUpdateUserLanguage } from '..';

interface ProfileContainerProps {
  user?: UserResource | null;
}

export function LanguageContainer({ user }: ProfileContainerProps) {
  const { containerRef, show, isCollapse, toggle } = useCollapsible();

  const { t, i18n } = useTranslation();
  const { mutate, isPending } = useUpdateUserLanguage();

  const langKey = i18n.language as Language;
  const langValue = t(`languages.${langKey}`);

  function handleLanguageChange(lang: string) {
    toggle();
    if (user) {
      mutate({
        _id: user._id,
        language: lang,
      });
    }
  }

  if (!user) return null;

  return (
    <div ref={containerRef}>
      <button
        className={cn('btn nav-link lh-1 pe-0', show)}
        id="navbarDropdownNotification"
        role="button"
        data-bs-toggle="dropdown"
        data-bs-auto-close="outside"
        aria-haspopup="true"
        aria-expanded={isCollapse}
        onClick={toggle}
      >
        {isPending ? (
          <Icons.LoaderSpinner
            height={16}
            width={16}
            className="custom-spinner"
          />
        ) : (
          <Icons.Globe height="20" width="20" />
        )}
        <span className="mx-2">{langValue}</span>
      </button>
      <div
        className={cn(
          'dropdown-menu dropdown-menu-end navbar-dropdown-caret py-0 dropdown-nide-dots shadow border border-300',
          show,
        )}
        aria-labelledby="navbarDropdownNindeDots"
        data-bs-popper="static"
      >
        <Card className="bg-white position-relative border-0">
          <CardContent className="p-4 overflow-auto scrollbar">
            <RadioGroup value={langKey} onValueChange={handleLanguageChange}>
              {supportedLang.map((lang, index) => (
                <div
                  key={index}
                  className="border-top border-bottom custom-form-check py-2"
                >
                  <RadioGroupItem value={lang} id={`r-${index}`} />
                  <Label htmlFor={`r-${index}`} className="form-check-label">
                    {t(`languages.${lang}`)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
