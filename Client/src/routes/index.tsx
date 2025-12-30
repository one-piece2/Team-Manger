import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
    authenticationRoutePaths,

} from "./common/routes";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>


                <Route >

                    {authenticationRoutePaths.map((route) => (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={route.element}
                        />
                    ))}

                </Route>


            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;