import {
  CustomDropDown,
  DropdownEllipsisToggle,
} from '@/components/custom-dropdown';
import { Icons } from '@/components/icons';
import { LoadMoreButton } from '@/components/load-more-button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  format,
  formatDistanceToNow,
  formatDistanceToNowStrict,
  isToday,
  parseISO,
} from 'date-fns';
import { Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Uploads, useGetInfiniteUploadEvents } from '..';

interface Props {
  dataQuery: ReturnType<typeof useGetInfiniteUploadEvents>;
}

export function UploadEventsContainer({ dataQuery }: Props) {
  const { t } = useTranslation();
  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } = dataQuery;

  const items = data?.pages.flatMap((page) => page.items) ?? [];
  const groupedItems = items.reduce(
    (groups, item) => {
      const date = format(parseISO(item.createdAt), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
      return groups;
    },
    {} as Record<string, (typeof items)[0][]>,
  );

  const sortedDates = Object.keys(groupedItems).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  const sectionedItems = sortedDates.reduce(
    (arr, date) => {
      arr.push(date);
      arr.push(...groupedItems[date]);
      return arr;
    },
    [] as (string | (typeof items)[0])[],
  );

  return (
    <Card className=" position-relative border-0">
      <CardHeader className="card-header p-2">
        <div className="d-flex justify-content-between">
          <h5 className="text-black mb-0">{t('keyText_nofications')}</h5>
          {/* <button className="btn btn-link p-0 fs--1 fw-normal" type="button">
            Mark all as read
          </button> */}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="scrollbar-overlay" style={{ height: '27rem' }}>
          <div className="simplebar-content">
            {sectionedItems.map((item, index) => {
              if (typeof item === 'string') {
                return (
                  <NotifcationHeaderCard key={index + item} dateString={item} />
                );
              } else {
                return <NotifcationCard key={item._id} item={item} />;
              }
            })}
          </div>
          <div className="w-100 d-flex justify-content-center">
            <LoadMoreButton
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-0 border-top border-0">
        <div className="my-2 text-center fw-bold fs--2 text-600">
          {/* TODO if needed this is the link for noticatin page */}
          <a className="fw-bolder d-none" href="#">
            Notification history
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}

function NotifcationHeaderCard({ dateString }: { dateString: string }) {
  const { t } = useTranslation();
  const date = new Date(dateString);
  let formattedDate = formatDistanceToNow(date, { addSuffix: true });

  if (isToday(date)) {
    formattedDate = t('keyDate_today');
  }

  return (
    <div className="px-2 px-sm-3 pb-1 pt-4 border-bottom border-300 position-relative">
      <h4 className="fs--1 text-black">{formattedDate}</h4>
    </div>
  );
}

interface NotifcationCardProps {
  item: Uploads;
}

function NotifcationCard({ item }: NotifcationCardProps) {
  const { t } = useTranslation();
  const createdBy = item.createdBy;
  const assort = item.item;

  const iconText = createdBy.name.charAt(0).toUpperCase();
  const itemNo = assort.customerItemNo;

  const createdAt = new Date(item.createdAt);
  const timeAgo = formatDistanceToNowStrict(createdAt, { addSuffix: true });
  const timeInfo = format(createdAt, 'hh:mm a');
  const dateInfo = format(createdAt, 'MMMM d, yyyy');

  let name = "name";

  return (
    <div className="px-2 px-sm-3 py-3 border-300 notification-card position-relative read border-bottom">
      <div className="d-flex align-items-center justify-content-between position-relative">
        <div className="d-flex">
          <div className="avatar avatar-m me-3">
            <div className="avatar-name rounded-circle">
              <span>{iconText}</span>
            </div>
          </div>
          <div className="flex-1 me-sm-3">
            <h4 className="fs--1 text-black">{name}</h4>
            <p className="fs--1 text-1000 mb-2 mb-sm-3 fw-normal">
              {t('keyText_uploadImagesforItem')}
              <span className="fw-bold">"{itemNo}"</span>
              <span className="ms-2 text-400 fw-bold fs--2">{timeAgo}</span>
            </p>
            <p className="text-800 fs--1 mb-0">
              <Icons.Clock height="16px" width="16px" className="me-1" />
              <span className="fw-bold">{timeInfo} </span>
              {dateInfo}
            </p>
          </div>
        </div>
        <Dropdown
          as={CustomDropDown}
          className="font-sans-serif d-none d-sm-block"
        >
          <Dropdown.Toggle as={DropdownEllipsisToggle} />
          <Dropdown.Menu className="dropdown-menu dropdown-menu-end py-2 w-100">
            <Dropdown.Item as={Link} to={`/assortments/${assort._id}`}>
              {t('keyButton_view')}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
}
