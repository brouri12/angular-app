import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { Home } from "./pages/Home";
import { Courses } from "./pages/Courses";
import { Instructors } from "./pages/Instructors";
import { Pricing } from "./pages/Pricing";
import { About } from "./pages/About";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "courses", Component: Courses },
      { path: "instructors", Component: Instructors },
      { path: "pricing", Component: Pricing },
      { path: "about", Component: About },
      { path: "*", Component: NotFound },
    ],
  },
]);