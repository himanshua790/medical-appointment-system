export const dynamic = 'force-dynamic';

import AuthClient from './AuthClient';

interface PageProps {
  searchParams: { redirect?: string | string[] };
}

export default function Page({ searchParams }: PageProps) {
  const redirectParam = searchParams.redirect;
  const redirect = Array.isArray(redirectParam)
    ? redirectParam[0]
    : redirectParam ?? '/dashboard';
  return <AuthClient redirect={redirect} />;
}
