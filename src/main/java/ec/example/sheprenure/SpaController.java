package ec.example.sheprenure;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * SPA (Single Page Application) controller.
 *
 * Forwards all non-API, non-static-resource requests to index.html
 * so that React Router can handle client-side routing.
 *
 * IMPORTANT: Do NOT add /oauth2/**, /login/oauth2/**, or any Spring Security
 * paths here — those must be handled exclusively by the security filter chain.
 */
@Controller
public class SpaController {

    @RequestMapping(value = {
        "/",
        "/login",
        "/register",
        "/dashboard",
        "/dashboard/**",
        "/products",
        "/products/**",
        "/cart",
        "/orders",
        "/profile",
        "/oauth/callback",
        "/forgot-password",
        "/admin",
        "/admin/**"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
