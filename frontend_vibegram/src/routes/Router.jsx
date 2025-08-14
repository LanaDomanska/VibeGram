import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Loader from '../components/common/Loader/Loader';
import AuthLayout from '../components/Layout/AuthLayout/AuthLayout';
import PrivateLayout from '../components/Layout/PrivateLayout/PrivateLayout';
import ProtectedRoute from '../components/Routes/ProtectedRoute';
import PublicRoute from '../components/Routes/PublicRoute';
import { useAuth } from '../contexts/AuthContext';

const AuthPages = {
  Login: lazy(() => import('../pages/Auth/Login/Login')),
  Register: lazy(() => import('../pages/Auth/Register/Register')),
  ResetPassword: lazy(() => import('../pages/Auth/ResetPassword/ResetPassword')),
  ResetPasswordConfirm: lazy(() => import('../pages/Auth/ResetPassword/ResetPasswordConfirm')),

};

const MainPages = {
  Home: lazy(() => import('../pages/Home/Home')),
  Explore: lazy(() => import('../pages/Explore/Explore')),
  Search: lazy(() => import('../pages/Search/Search')),
  Messages: lazy(() => import('../pages/Messages/Messages')),
  Notifications: lazy(() => import('../pages/Notifications/Notifications')),
  CreatePost: lazy(() => import('../pages/CreatePost/CreatePost')),
};

const ProfilePages = {
  Profile: lazy(() => import('../pages/Profile/Profile/Profile')),
  Saved: lazy(() => import('../pages/Profile/Saved/Saved')),
  Tagged: lazy(() => import('../pages/Profile/Tagged/Tagged')),
  EditProfile: lazy(() => import('../pages/Profile/EditProfile/EditProfile')),
};

const PostPages = {
  PostDetails: lazy(() => import('../pages/PostDetails/PostDetails')),
  EditPost: lazy(() => import('../pages/PostDetails/EditPost')),

};
const RoutedPostModal = lazy(() => import('../components/modals/RoutedPostModal.jsx'));


const SettingsPages = {
  Settings: lazy(() => import('../pages/Settings/Settings')),
};

const NotFound = lazy(() => import('../pages/NotFound/NotFound'));


const MyProfileRedirect = () => {
  const { user, authChecked } = useAuth();
  if (!authChecked) return <Loader />;
  return <Navigate to={`/profile/${user?.username ?? ""}`} replace />;
};

export default function Router() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<AuthPages.Login />} />
            <Route path="/register" element={<AuthPages.Register />} />
            <Route path="/reset-password" element={<AuthPages.ResetPassword />} />
            <Route path="/reset-password-confirm" element={<AuthPages.ResetPasswordConfirm />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<PrivateLayout />}>
            <Route path="/" element={<MainPages.Home />} />
            <Route path="/explore" element={<MainPages.Explore />} />
            <Route path="/search" element={<MainPages.Search />} />
            <Route path="/messages" element={<MainPages.Messages />} />
            <Route path="/notifications" element={<MainPages.Notifications />} />
            <Route path="/create" element={<MainPages.CreatePost />} />

            <Route path="/profile" element={<MyProfileRedirect />} />
            <Route path="/me" element={<MyProfileRedirect />} />

            <Route path="/profile/:username">
              <Route index element={<ProfilePages.Profile />} />
              <Route path="saved" element={<ProfilePages.Saved />} />
              <Route path="tagged" element={<ProfilePages.Tagged />} />
            </Route>

            <Route path="/edit-profile" element={<ProfilePages.EditProfile />} />
            <Route path="/posts/:id" element={<PostPages.PostDetails />} />
            <Route path="/posts/:id/edit" element={<PostPages.EditPost />} />
            <Route path="/settings" element={<SettingsPages.Settings />} />
          </Route>
        </Route>
 <Route path="/p/:id" element={<RoutedPostModal />} />
       


        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

