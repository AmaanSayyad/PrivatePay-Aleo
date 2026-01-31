import { createBrowserRouter, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import AuthLayout from "./layouts/AuthLayout.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import PlainLayout from "./layouts/PlainLayout.jsx";
import activityLogger from "./lib/activityLogger.js";

// Lazy load pages — Aleo only
const IndexPage = lazy(() => import("./pages/IndexPage.jsx"));
const PaymentPage = lazy(() => import("./pages/PaymentPage.jsx"));
const AliasDetailPage = lazy(() => import("./pages/AliasDetailPage.jsx").then(m => ({ default: m.AliasDetailPage })));
const TransferPage = lazy(() => import("./pages/TransferPage.jsx"));
const PaymentLinksPage = lazy(() => import("./pages/PaymentLinksPage.jsx"));
const TransactionsPage = lazy(() => import("./pages/TransactionsPage.jsx"));
const MainBalancePage = lazy(() => import("./pages/MainBalancePage.jsx"));
const PrivateBalancePage = lazy(() => import("./pages/PrivateBalancePage.jsx"));
// Send (no backend/relayer)
const SendPage = lazy(() => import("./pages/SendPage.jsx"));
const AleoPage = lazy(() => import("./pages/AleoPage.jsx"));
const AleoDarkPoolPage = lazy(() => import("./pages/AleoDarkPoolPage.jsx"));
const AleoAMMPage = lazy(() => import("./pages/AleoAMMPage.jsx"));
const AleoCreditPage = lazy(() => import("./pages/AleoCreditPage.jsx"));
const AleoLendingPage = lazy(() => import("./pages/AleoLendingPage.jsx"));
const AleoVaultsPage = lazy(() => import("./pages/AleoVaultsPage.jsx"));
const AleoTreasuryPage = lazy(() => import("./pages/AleoTreasuryPage.jsx"));
const PointsPage = lazy(() => import("./pages/PointsPage.jsx"));
import AleoErrorBoundary from "./components/aleo/AleoErrorBoundary.jsx";

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

const LazyRoute = ({ Component, routeName }) => {
  const location = useLocation();
  useEffect(() => {
    activityLogger.logNavigation(document.referrer || "unknown", location.pathname, "ReactRouter");
    activityLogger.info("RouteLoad", `Loading route: ${routeName || location.pathname}`, {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      routeName,
    });
  }, [location.pathname, routeName]);
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
};

const AleoRoute = ({ routeName }) => {
  const location = useLocation();
  useEffect(() => {
    activityLogger.logNavigation(document.referrer || "unknown", location.pathname, "ReactRouter");
    activityLogger.info("RouteLoad", `Loading route: ${routeName || location.pathname}`, {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      routeName,
    });
  }, [location.pathname, routeName]);
  return (
    <AleoErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <AleoPage />
      </Suspense>
    </AleoErrorBoundary>
  );
};

const EXCLUDED_SUBDOMAINS = [
  "www", "admin", "api", "app", "auth", "blog", "cdn", "dev", "forum",
  "mail", "shop", "support", "test", "server", "webmail",
];

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    loader: () => {
      const host = window.location.hostname;
      const websiteHost = import.meta.env.VITE_WEBSITE_HOST || "privatepay.me";
      const suffix = `.${websiteHost}`;
      if (host.endsWith(suffix)) {
        const subdomain = host.slice(0, -suffix.length);
        if (!EXCLUDED_SUBDOMAINS.includes(subdomain)) return { subdomain };
        return { subdomain: null };
      }
      return { subdomain: null };
    },
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <LazyRoute Component={IndexPage} routeName="Dashboard" /> },
      {
        path: "/:alias/detail/:parent",
        loader: ({ params, request }) => {
          const url = new URL(request.url);
          const id = url.searchParams.get("id");
          return { fullAlias: `${params.alias}.squidl.me`, aliasId: id };
        },
        element: <LazyRoute Component={AliasDetailPage} />,
        children: [{ path: "transfer", element: <LazyRoute Component={TransferPage} /> }],
      },
      { path: "/:alias/transfer", element: <LazyRoute Component={TransferPage} /> },
      { path: "/payment-links", element: <LazyRoute Component={PaymentLinksPage} routeName="Payment Links" /> },
      { path: "/transactions", element: <LazyRoute Component={TransactionsPage} routeName="Transactions" /> },
      { path: "/points", element: <LazyRoute Component={PointsPage} routeName="Points" /> },
      { path: "/main-details", element: <LazyRoute Component={MainBalancePage} /> },
      { path: "/private-details", element: <LazyRoute Component={PrivateBalancePage} /> },
      { path: "/send", element: <LazyRoute Component={SendPage} routeName="Send" /> },
      { path: "/transfer", element: <LazyRoute Component={TransferPage} /> },
      { path: "/aleo", element: <AleoRoute routeName="Aleo" /> },
      {
        path: "/aleo/darkpool",
        element: (
          <AleoErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <LazyRoute Component={AleoDarkPoolPage} routeName="Aleo Dark Pool" />
            </Suspense>
          </AleoErrorBoundary>
        ),
      },
      {
        path: "/aleo/amm",
        element: (
          <AleoErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <LazyRoute Component={AleoAMMPage} routeName="Aleo AMM" />
            </Suspense>
          </AleoErrorBoundary>
        ),
      },
      {
        path: "/aleo/credit",
        element: (
          <AleoErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <LazyRoute Component={AleoCreditPage} routeName="Aleo Credit" />
            </Suspense>
          </AleoErrorBoundary>
        ),
      },
      {
        path: "/aleo/lending",
        element: (
          <AleoErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <LazyRoute Component={AleoLendingPage} routeName="Aleo Lending" />
            </Suspense>
          </AleoErrorBoundary>
        ),
      },
      {
        path: "/aleo/vaults",
        element: (
          <AleoErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <LazyRoute Component={AleoVaultsPage} routeName="Aleo Vaults" />
            </Suspense>
          </AleoErrorBoundary>
        ),
      },
      {
        path: "/aleo/treasury",
        element: (
          <AleoErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <LazyRoute Component={AleoTreasuryPage} routeName="Aleo Treasury" />
            </Suspense>
          </AleoErrorBoundary>
        ),
      },
    ],
  },
  {
    path: "/payment",
    element: <PlainLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: ":alias_url", element: <LazyRoute Component={PaymentPage} /> },
    ],
  },
]);
