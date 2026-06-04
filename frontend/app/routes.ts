import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    route("/home", "pages/home/index.tsx"),
    route("/register", "pages/register/index.tsx"),
    route("/login", "pages/login/index.tsx")
] satisfies RouteConfig;