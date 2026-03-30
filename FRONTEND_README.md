# Quantity Measurement Frontend

React + Vite frontend for the Quantity Measurement application. This project handles user authentication, stores JWT-based session data in the browser, and provides UI screens for compare, convert, arithmetic operations, and history.

This README is written as both project documentation and interview preparation material, so it explains not only what the app does, but also how the important flows work internally.

## Tech Stack

- React 19
- Vite 8
- Axios
- Local React Context for authentication state
- Browser `localStorage` for persisted session data

## What The Application Does

After login, the user can:

- Compare two quantities
- Convert a quantity from one unit to another
- Perform arithmetic operations like add, subtract, and divide
- View measurement history

The supported measurement groups in the frontend are:

- `LengthUnit`: `FEET`, `INCHES`, `YARDS`, `CENTIMETERS`
- `WeightUnit`: `KILOGRAMS`, `GRAMS`, `POUNDS`
- `VolumeUnit`: `LITRE`, `MILLILITRE`, `GALLON`
- `TemperatureUnit`: `CELSIUS`, `FAHRENHEIT`

## Project Structure

```text
src/
  components/
    Login.jsx
    Signup.jsx
    Compare.jsx
    Convert.jsx
    Arithmetic.jsx
    History.jsx
  context/
    AuthContext.jsx
  services/
    api.js
  styles/
    Auth.css
    Operations.css
    History.css
  App.jsx
  App.css
  main.jsx
  index.css
```

## Component Responsibilities

### `src/main.jsx`

- Entry point of the React app
- Wraps `App` inside `AuthProvider`
- Makes authentication state available to the whole application

### `src/App.jsx`

- Acts as the top-level screen controller
- If `user` is `null`, it shows `Login` or `Signup`
- If `user` exists, it shows the main application with tabs:
  - Compare
  - Convert
  - Arithmetic
  - History
- Includes the logout button

### `src/context/AuthContext.jsx`

This is the core authentication layer.

It is responsible for:

- Logging in
- Signing up
- Logging out
- Restoring session from `localStorage`
- Exposing `user`, `loading`, `error`, `login`, `signup`, and `logout`

### `src/services/api.js`

This is the centralized Axios layer.

It is responsible for:

- Creating the Axios instance
- Setting the base URL
- Adding the JWT to outgoing requests
- Handling unauthorized responses
- Exposing `authService`
- Exposing `measurementService`

### Feature Components

- `Compare.jsx`: sends two quantities to the compare endpoint and shows a boolean result
- `Convert.jsx`: converts one quantity to a target unit
- `Arithmetic.jsx`: performs `ADD`, `SUBTRACT`, and `DIVIDE`
- `History.jsx`: fetches and filters saved measurement history
- `Login.jsx` and `Signup.jsx`: collect user credentials and call auth methods from context

## Authentication Flow

### 1. Application startup

When the application loads, `AuthContext` checks:

- `localStorage.getItem('jwt')`
- `localStorage.getItem('userId')`

If both exist, it restores the session by setting:

```js
setUser({ id: userId });
```

Because of this, page refresh does not immediately log the user out.

### 2. Login flow

The login UI in `Login.jsx` calls:

```js
login(username, password)
```

Inside `AuthContext.jsx`:

1. It calls `authService.login(username, password)`
2. The backend responds with user information and a JWT
3. The frontend extracts the token and user id
4. It stores them in `localStorage`
5. It updates React state with `setUser({ id: finalId })`
6. The app re-renders and shows the protected screens

### 3. Token persistence

After successful login, the frontend stores:

```js
localStorage.setItem('jwt', finalJwt);
localStorage.setItem('userId', String(finalId));
```

This is why the session survives refresh.

### 4. Sending authenticated requests

Every request created through `api.js` passes through an Axios request interceptor.

That interceptor:

1. Reads the JWT from `localStorage`
2. Adds the header:

```http
Authorization: Bearer <token>
```

Because of this, all calls from `measurementService` automatically become authenticated once the token is stored.

### 5. Logout flow

When the user clicks logout:

```js
localStorage.removeItem('jwt');
localStorage.removeItem('userId');
setUser(null);
```

This clears the session and sends the UI back to the login screen.

### 6. Expired or invalid token handling

The Axios response interceptor checks for `401 Unauthorized`.

If a `401` happens, the frontend:

- Removes `jwt`
- Removes `userId`
- Redirects the browser to `/`

This acts like an automatic logout when the token is invalid or expired.

## API Integration

## Development URL Behavior

In development, the frontend uses the Vite proxy instead of calling the backend directly from the browser.

Proxy rules in `vite.config.js` forward:

- `/auth/*` to `http://localhost:8080`
- `/api/*` to `http://localhost:8080`

This avoids local CORS problems during development.

In production mode, the Axios base URL is:

```js
http://localhost:8080
```

## Auth Endpoints

The frontend calls:

- `POST /auth/login`
- `POST /auth/signup`

Through:

```js
authService.login(username, password)
authService.signup(username, password)
```

## Measurement Endpoints

The frontend calls these authenticated endpoints:

- `POST /api/measurements/compare`
- `POST /api/measurements/convert`
- `POST /api/measurements/add`
- `POST /api/measurements/subtract`
- `POST /api/measurements/divide`
- `GET /api/measurements/history`
- `GET /api/measurements/history/{operation}`

These are wrapped in `measurementService`.

## Important Real-World Fix Done In This Project

During validation of the auth flow against the running backend, a response-shape mismatch was found.

### Problem

The backend login response returned:

```json
{
  "id": 4,
  "Jwt": "token-value"
}
```

But the frontend was originally trying to read:

```js
response.data.jwt
```

That meant:

- Login API could succeed
- But the frontend would think the token was missing
- So it would fail to save the token to `localStorage`
- Protected API requests would then fail because no token was attached

### Fix

`AuthContext.jsx` was updated to support both property names:

```js
const jwt = response.data?.jwt || response.data?.Jwt;
const jwtDirect = response.data['jwt'] || response.data['Jwt'];
```

This makes the frontend more tolerant to backend casing differences.

### Why this matters in an interview

This is a strong example of integration debugging:

- The UI code looked correct at first glance
- The backend was returning a token
- But the contract between frontend and backend did not exactly match
- The bug was not in storage logic, but in response parsing

This is the kind of issue that often appears in real full-stack work.

## Validation And Simulation Performed

The live backend on `http://localhost:8080` was checked during verification.

### What was tested

1. Verified backend port `8080` was reachable
2. Created a test user using signup
3. Logged in using that user
4. Confirmed the backend returned a JWT
5. Used that JWT in authenticated measurement requests
6. Confirmed protected endpoint behavior with and without the token

### Actual observations

- Signup worked successfully
- Login returned a token
- The protected history endpoint succeeded with a bearer token
- The protected history endpoint returned `403 Forbidden` without the token
- Compare endpoint also succeeded when called with the valid token

### Meaning

This proves:

- Backend authentication is active
- Measurement APIs are protected
- Frontend token storage and interceptor logic are the key bridge between login and feature access

## How Each Feature Works

## Compare

`Compare.jsx`:

- Stores two quantities in local state
- Lets the user choose value, measurement type, and unit
- Sends both objects to `measurementService.compare`
- Displays either equal or not equal

Example request shape:

```json
{
  "thisQuantity": {
    "value": 12,
    "unit": "INCHES",
    "measurementType": "LengthUnit"
  },
  "thatQuantity": {
    "value": 1,
    "unit": "FEET",
    "measurementType": "LengthUnit"
  }
}
```

## Convert

`Convert.jsx`:

- Stores one quantity and a target unit
- Automatically updates the default unit options when measurement type changes
- Sends data to `measurementService.convert`
- Displays the converted result

## Arithmetic

`Arithmetic.jsx`:

- Supports `ADD`, `SUBTRACT`, and `DIVIDE`
- Uses two quantities as input
- For add and subtract, the user can optionally choose a target unit
- Sends the request to the matching service method
- Shows either a numeric result or a `{ value, unit }` style result depending on backend response

## History

`History.jsx`:

- Loads history on mount
- Stores the original list and filtered list separately
- Lets the user filter by operation type
- Renders different text blocks depending on whether the item is compare, convert, add, subtract, or divide

## State Management Approach

This project uses simple local and contextual state instead of Redux or another global state library.

### Local state

Each feature component manages:

- Input values
- Loading state
- Result state
- Error state

This keeps feature logic isolated and easy to understand.

### Context state

Authentication is managed globally through React Context because:

- Multiple components depend on the auth state
- The app layout changes based on whether a user is logged in
- Login/logout should affect the entire app

## Error Handling

The app handles errors at multiple levels:

### Auth errors

- Invalid login errors are captured in `AuthContext`
- Error messages are shown in the login/signup screens

### Feature errors

- Each operation screen catches request failures
- Errors are displayed near the action that failed

### Global auth failure

- `401` responses trigger automatic token clearing and redirect

## Strengths Of The Current Frontend

- Clean separation between UI, auth state, and API layer
- Reusable Axios service setup
- Persistent login using `localStorage`
- Simple routing logic without extra dependencies
- Protected backend integration through JWT bearer token
- Clear feature split across independent components

## Limitations / Improvement Areas

These are useful talking points in an interview.

- Authentication currently stores JWT in `localStorage`, which is simple but less secure than an HTTP-only cookie approach
- There is a lot of debug logging in `AuthContext.jsx` and `api.js`; this is useful while developing but should be reduced for production
- The app uses tab-based conditional rendering instead of React Router, which is okay for a small project but less scalable
- Some UI text contains encoding artifacts because of emoji/special character rendering in source files
- There are no automated frontend tests yet
- The request interceptor comment says auth requests are excluded, but the current implementation still attaches a token to all requests if one exists

## How To Run The Project

### Prerequisites

- Node.js
- npm
- Quantity Measurement backend running on `http://localhost:8080`

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

By default, the frontend runs on:

```text
http://localhost:5173
```

## Build Commands

```bash
npm run build
npm run preview
npm run lint
```

## Interview Summary

If you need to explain this project quickly in an interview, you can say:

1. This is a React + Vite frontend for a quantity measurement system.
2. I used React Context for authentication and Axios interceptors for JWT-based API communication.
3. After login, the JWT and user ID are stored in `localStorage`, and all protected measurement requests automatically include `Authorization: Bearer <token>`.
4. The app has feature modules for compare, convert, arithmetic, and history.
5. I also debugged a real integration issue where the backend returned `Jwt` instead of `jwt`, which prevented token persistence until the frontend parsing was updated.

## Suggested Interview Questions You Should Be Ready For

- Why did you choose React Context instead of Redux?
- Why is `localStorage` used for JWT persistence?
- What are the tradeoffs of storing tokens in `localStorage`?
- How do Axios interceptors help in this project?
- What happens when the token expires?
- How does the app restore session after page refresh?
- How is the frontend separated into concerns?
- What bug did you find while integrating with the backend?
- How would you improve this app for production?

## Short Answer For "What Did You Do In This Project?"

You can say:

"I built a React frontend for a quantity measurement system with JWT authentication, protected API integration, and feature screens for compare, convert, arithmetic operations, and history. I used React Context for auth state, Axios interceptors for bearer token handling, localStorage for session persistence, and I also debugged a backend/frontend contract mismatch in the JWT response shape."
