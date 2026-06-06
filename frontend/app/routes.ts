import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
    route("/home", "pages/home/index.tsx"),
    route("/rooms/:id", "pages/room/index.tsx"),
    route("/register", "pages/register/index.tsx"),
    route("/", "pages/login/index.tsx")
] satisfies RouteConfig;