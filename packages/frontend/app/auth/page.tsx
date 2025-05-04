export const dynamic = 'force-dynamic';

import AuthClient from './AuthClient';

interface PageProps {
  searchParams: Promise<{ redirect?: string | string[] }>;
}

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  const redirectParam = searchParams.redirect;
  const redirect = Array.isArray(redirectParam)
    ? redirectParam[0]
    : redirectParam ?? '/dashboard';
  return <AuthClient redirect={redirect} />;
}
