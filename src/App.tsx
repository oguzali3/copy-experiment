import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import { DashboardLayout } from "./components/layouts/DashboardLayout";
import Financials from "./pages/Financials";
import Social from "./pages/Social";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import { SearchResultsPage } from "./pages/SearchResults";

const router = createBrowserRouter([
  {
    path: "/",
    element: <SignIn />,
  },
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/dashboard/financials/:ticker",
        element: <Financials />,
      },
    ],
  },
  {
    path: "/social",
    element: <Social />,
  },
  {
    path: "/feed",
    element: <Feed />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/search",
    element: <SearchResultsPage />
  }
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
