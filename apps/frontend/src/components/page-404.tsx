import { useNavigate } from 'react-router-dom';

import illustration404 from '@/assets/img/spot-illustrations/404-illustration.png';
import img404 from '@/assets/img/spot-illustrations/404.png';
import iIllustrationDark404 from '@/assets/img/spot-illustrations/dark_404-illustration.png';
import imgDark404 from '@/assets/img/spot-illustrations/dark_404.png';

export function Page404() {
  const navigate = useNavigate();
  return (
    <div className="px-3">
      <div className="row min-vh-100 flex-center p-5">
        <div className="col-12 col-xl-10 col-xxl-8">
          <div className="row justify-content-center align-items-center g-5">
            <div className="col-12 col-lg-6 text-center order-lg-1">
              <img
                className="img-fluid w-lg-100 d-dark-none"
                src={illustration404}
                alt="Illustration404"
                width="400"
              />
              <img
                className="img-fluid w-md-50 w-lg-100 d-light-none"
                src={iIllustrationDark404}
                alt="IllustrationDark404"
                width="540"
              />
            </div>
            <div className="col-12 col-lg-6 text-center text-lg-start">
              <img
                className="img-fluid mb-6 w-50 w-lg-75 d-dark-none"
                src={img404}
                alt="Img404"
              />
              <img
                className="img-fluid mb-6 w-50 w-lg-75 d-light-none"
                src={imgDark404}
                alt="ImgDark404"
              />
              <h2 className="text-800 fw-bolder mb-3">Page Missing!</h2>
              <p className="text-900 mb-5">
                But no worries! Our ostrich is looking everywhere{' '}
                <br className="d-none d-sm-block" />
                while you wait safely.{' '}
              </p>
              <button
                className="btn btn-lg btn-primary"
                onClick={() => navigate('/')}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
