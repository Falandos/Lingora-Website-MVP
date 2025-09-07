import { type ReactNode, useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

// Navigation icons
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21V12a1 1 0 011-1h4a1 1 0 011 1v9" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

const MessageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SupportIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5zm-1.5 4.5h3m-3 6h3" />
  </svg>
);

const SecurityIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ServicesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4v8a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2zM9 11h6" />
  </svg>
);

const StaffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

// Navigation function
const getNavigationItems = (userRole: string | undefined, providerSlug: string | null) => {
  const currentPath = window.location.pathname;
  
  if (userRole === 'admin') {
    return [
      { name: 'Overview', href: '/dashboard', icon: HomeIcon, current: currentPath === '/dashboard' },
      { name: 'Providers', href: '/dashboard/providers', icon: UsersIcon, current: currentPath.startsWith('/dashboard/providers') },
      { name: 'Messages', href: '/dashboard/messages', icon: MessageIcon, current: currentPath.startsWith('/dashboard/messages') },
      { name: 'Statistics', href: '/dashboard/stats', icon: ChartIcon, current: currentPath.startsWith('/dashboard/stats') },
      { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon, current: currentPath === '/dashboard/settings' },
      { name: 'Security', href: '/dashboard/security', icon: SecurityIcon, current: currentPath.startsWith('/dashboard/security') },
    ];
  } else {
    // Provider navigation - Core dashboard items
    const coreItems = [
      { name: 'Overview', href: '/dashboard', icon: HomeIcon, current: currentPath === '/dashboard' },
      { name: 'Profile', href: '/dashboard/profile', icon: ProfileIcon, current: currentPath.startsWith('/dashboard/profile') },
      { name: 'Services', href: '/dashboard/services', icon: ServicesIcon, current: currentPath.startsWith('/dashboard/services') },
      { name: 'Staff', href: '/dashboard/staff', icon: StaffIcon, current: currentPath.startsWith('/dashboard/staff') },
      { name: 'Messages', href: '/dashboard/messages', icon: MessageIcon, current: currentPath.startsWith('/dashboard/messages') },
      { name: 'Support Tickets', href: '/dashboard/tickets', icon: SupportIcon, current: currentPath.startsWith('/dashboard/tickets') },
      { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon, current: currentPath === '/dashboard/settings' },
      { name: 'Security', href: '/dashboard/security', icon: SecurityIcon, current: currentPath.startsWith('/dashboard/security') }
    ];

    // Special action - Edit Public Page (if available)
    const specialItems = providerSlug ? [{ 
      name: 'Edit Public Page', 
      href: `/provider/${providerSlug}?edit=true`, 
      icon: EditIcon, 
      current: false,
      external: true,
      special: true // Flag for special styling
    }] : [];

    return { coreItems, specialItems };
  }
};

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [providerSlug, setProviderSlug] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  // Fetch provider data for provider users
  useEffect(() => {
    const fetchProviderData = async () => {
      if (user?.role === 'provider') {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('/api/providers/my', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const provider = data.data || data;
            setProviderSlug(provider.slug);
          }
        } catch (error) {
          console.error('Failed to fetch provider data:', error);
        }
      }
    };

    fetchProviderData();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6 text-white" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4 mb-8">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shadow-medium">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <h1 className="ml-3 text-xl font-bold text-gray-900">
                  Lingora
                </h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {user?.role === 'admin' 
                  ? getNavigationItems(user?.role, providerSlug).map((item: any) => (
                      <a
                        key={item.name}
                        href={item.href}
                        target={item.external ? '_blank' : undefined}
                        rel={item.external ? 'noopener noreferrer' : undefined}
                        className={`${
                          item.current
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <div className={`${
                          item.current ? 'text-primary-500' : 'text-gray-400'
                        } mr-4 flex-shrink-0 h-6 w-6`}>
                          <item.icon />
                        </div>
                        {item.name}
                      </a>
                    ))
                  : (
                      <>
                        {/* Core Navigation Items */}
                        {(getNavigationItems(user?.role, providerSlug) as any).coreItems?.map((item: any) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className={`${
                              item.current
                                ? 'bg-primary-100 text-primary-700'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <div className={`${
                              item.current ? 'text-primary-500' : 'text-gray-400'
                            } mr-4 flex-shrink-0 h-6 w-6`}>
                              <item.icon />
                            </div>
                            {item.name}
                          </a>
                        ))}
                        
                        {/* Special Items Section */}
                        {(getNavigationItems(user?.role, providerSlug) as any).specialItems?.length > 0 && (
                          <>
                            <div className="border-t border-gray-200 my-2 mx-2"></div>
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
                              Live Editing
                            </div>
                            {(getNavigationItems(user?.role, providerSlug) as any).specialItems.map((item: any) => (
                              <a
                                key={item.name}
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-orange-700 hover:bg-orange-50 hover:text-orange-800 group flex items-center px-2 py-2 text-base font-medium rounded-md border border-orange-200 bg-orange-50"
                                onClick={() => setSidebarOpen(false)}
                                title="Opens in new tab"
                              >
                                <div className="text-orange-500 mr-4 flex-shrink-0 h-6 w-6">
                                  <item.icon />
                                </div>
                                <span className="flex-1">{item.name}</span>
                                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            ))}
                          </>
                        )}
                      </>
                    )
                }
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          {/* Logo/Brand */}
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shadow-medium">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <h1 className="ml-3 text-xl font-bold text-gray-900">
              Lingora Dashboard
            </h1>
          </div>

          {/* Navigation */}
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {user?.role === 'admin' 
              ? getNavigationItems(user?.role, providerSlug).map((item: any) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className={`${
                      item.current
                        ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
                  >
                    <div className={`${
                      item.current ? 'text-primary-500' : 'text-gray-400'
                    } mr-3 flex-shrink-0 h-5 w-5`}>
                      <item.icon />
                    </div>
                    {item.name}
                  </a>
                ))
              : (
                  <>
                    {/* Core Navigation Items */}
                    {(getNavigationItems(user?.role, providerSlug) as any).coreItems?.map((item: any) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={`${
                          item.current
                            ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
                      >
                        <div className={`${
                          item.current ? 'text-primary-500' : 'text-gray-400'
                        } mr-3 flex-shrink-0 h-5 w-5`}>
                          <item.icon />
                        </div>
                        {item.name}
                      </a>
                    ))}
                    
                    {/* Special Items Section */}
                    {(getNavigationItems(user?.role, providerSlug) as any).specialItems?.length > 0 && (
                      <>
                        <div className="border-t border-gray-200 my-3 mx-2"></div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-3">
                          Live Editing
                        </div>
                        {(getNavigationItems(user?.role, providerSlug) as any).specialItems.map((item: any) => (
                          <a
                            key={item.name}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-700 hover:bg-orange-100 hover:text-orange-800 group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors border border-orange-200 bg-orange-50 hover:border-orange-300"
                            title="Opens in new tab - Edit your public page content"
                          >
                            <div className="text-orange-500 mr-3 flex-shrink-0 h-5 w-5">
                              <item.icon />
                            </div>
                            <span className="flex-1">{item.name}</span>
                            <svg className="w-4 h-4 text-orange-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ))}
                      </>
                    )}
                  </>
                )
            }
          </nav>

          {/* User info at bottom */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user?.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow border-b border-gray-200">
          {/* Mobile menu button */}
          <button 
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1 flex">
              {/* Breadcrumb placeholder */}
              <div className="text-sm text-gray-600">
                Dashboard Home
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* User email for mobile */}
              <div className="md:hidden text-sm text-gray-700">
                {user?.email}
              </div>
              
              {/* Logout button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;