import UserProfileMobile from '../../components/layout/MobileProfilePage';
import UserProfileDesktop from '../../components/layout/DesktopProfilePage'; // твій десктопний

export default function ProfilePage() {
  return (
    <>
      <div className="lg:hidden">
        <UserProfileMobile />
      </div>
      <div className="hidden lg:block">
        <UserProfileDesktop />
      </div>
    </>
  );
}
