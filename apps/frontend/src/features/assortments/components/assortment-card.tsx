// import { Badge } from '@/components/ui/badge';
import { Card, CardFooter } from '@/components/ui/card';
// import { getStatusVariant } from '@/utils/getStatusVariant';
import { CardImg } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { Assortment } from '..';

interface AssortmentCardProps {
  assortment: Assortment;
}

export function AssortmentCard({ assortment }: AssortmentCardProps) {
  return (
    <NavLink to={`${assortment._id}`}>
      <>
        <Card className="product-grid-item p-2">
          <CardImg
            src={`/api/files/static/${assortment.image?.filename}`}
            alt={assortment.itemNo}
            className="lazy"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              display: 'block',
              margin: 'auto',
              objectFit: 'contain',
            }}
          />
          {/* <Badge
            className="position-absolute top-0 end-0 m-2 text-uppercase"
            variant={getStatusVariant(assortment.status)}
          >
            {assortment.status}
          </Badge> */}
          <CardFooter className="p-0 d-flex flex-column text-center text-secondary">
            <span className="fs--1 fw-black">
              {assortment.customerItemNo} | {assortment.itemNo}
            </span>
            <span className="fs--1 text-limit">{assortment.name}</span>
          </CardFooter>
        </Card>
      </>
    </NavLink>
  );
}
