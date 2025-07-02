import ImageBg from '@/assets/img/bg/37.png';
import { SignInForm } from '..';

export function SignIn() {
  return (
    <div className="container-fluid bg-300 dark__bg-1200">
      <div
        className="bg-holder bg-auth-card-overlay"
        style={{ backgroundImage: `url(${ImageBg})` }}
      ></div>

      <div className="row flex-center position-relative min-vh-100 g-0 py-5">
        <div className="col-12 col-xl-4 col-lg-5 col-md-6">
          <div className="card border border-200 auth-card">
            <div className="card-body pe-md-0">
              <div className="row align-items-center gx-0 gy-10">
                <div className="col mx-auto">
                  <SignInForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
