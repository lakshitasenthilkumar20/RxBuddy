import { createBrowserRouter } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Prescriptions from "./pages/Prescriptions";
import Allergies from "./pages/Allergies";
import DrugInteraction from "./pages/DrugInteraction";
import Settings from "./pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: SignUp,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/dashboard/prescriptions",
    Component: Prescriptions,
  },
  {
    path: "/dashboard/allergies",
    Component: Allergies,
  },
  {
    path: "/dashboard/interactions",
    Component: DrugInteraction,
  },
  {
    path: "/dashboard/settings",
    Component: Settings,
  },
]);