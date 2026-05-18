# GitHub OAuth Setup

## Current Backend Behavior
The `OAuth2SuccessHandler.java` currently writes raw text to the response:
```java
response.getWriter().write("JWT Token: " + token);
```

## Required Change to Backend
To make GitHub OAuth work with Angular, change `OAuth2SuccessHandler.java` to redirect back to Angular with the token:

```java
@Override
public void onAuthenticationSuccess(HttpServletRequest request,
                                    HttpServletResponse response,
                                    Authentication authentication)
        throws IOException, ServletException {

    OAuth2User user = (OAuth2User) authentication.getPrincipal();

    String email = user.getAttribute("email");
    if (email == null) {
        email = user.getAttribute("login") + "@github.com";
    }

    UserCredential existingUser = authRepository.findByEmail(email).orElse(null);
    if (existingUser == null) {
        UserCredential newUser = new UserCredential();
        newUser.setEmail(email);
        newUser.setPasswordHash("OAUTH_USER");
        newUser.setRole(Role.CANDIDATE);
        newUser.setProvider(AuthProvider.GITHUB);
        newUser.setCreatedAt(LocalDateTime.now());
        existingUser = authRepository.save(newUser);
    }

    String token = jwtUtil.generateToken(email, existingUser.getRole().name(), existingUser.getUserId());

    // ✅ REDIRECT TO ANGULAR with token as query param
    String redirectUrl = "http://localhost:4200/auth/github/callback"
            + "?token=" + token
            + "&email=" + email
            + "&role=" + existingUser.getRole().name();

    response.sendRedirect(redirectUrl);
}
```

## GitHub App Settings
In your GitHub OAuth App settings (github.com → Settings → Developer Settings → OAuth Apps):
- **Authorization callback URL**: `http://localhost:8081/login/oauth2/code/github`

This is already the Spring default and should work as-is.
