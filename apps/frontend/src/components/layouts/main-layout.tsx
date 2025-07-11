// import { useUser } from '@/hooks/useUser';
// import { SideNavBar } from './navbar-side';
//import { TopNavBar } from './navbar-top';

type MainLayoutProps = React.PropsWithChildren;

export const MainLayout = ({ children }: MainLayoutProps) => {
  // const { user } = useUser();

  return (
    <>
      {/*<SideNavBar />*/}  {/*user={user}*/}
      {/*<TopNavBar />*/}{/*user={user}*/}
      <main className="content px-12">{children}</main>
    </>
  );
};
