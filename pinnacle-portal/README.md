# Welcome to your project

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. 

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

You can deploy this project using your preferred hosting provider.

## Can I connect a custom domain to my project?

Yes, you can! You can connect a custom domain to your project by configuring the DNS settings of your domain to point to your hosting provider.

## Frontend-Backend Connection using Axios

I have set up the connection between the React frontend and the Node.js backend using Axios. Here is a summary of the implementation:

### 1. Axios Configuration (`src/lib/api.ts`)

A reusable Axios instance is created with the following features:
- **`baseURL`**: Set to `http://localhost:5000/api` for all API requests.
- **Request Interceptor**: Automatically adds the JWT token from `localStorage` to the `Authorization` header of every request.
- **Response Interceptor**: Handles API errors globally. If a `401 Unauthorized` error is received, it removes the token from `localStorage` and redirects the user to the login page.

### 2. Authentication Service (`src/services/authService.ts`)

This service provides functions for handling user authentication:
- **`register(userData)`**: Sends a `POST` request to `/auth/register` to create a new user.
- **`login(credentials)`**: Sends a `POST` request to `/auth/login`. If the login is successful, it stores the received JWT token in `localStorage`.
- **`logout()`**: Removes the JWT token from `localStorage` and redirects the user to the login page.

### 3. Quiz Service (`src/services/quizService.ts`)

This service provides functions for interacting with the quiz API:
- **`getQuiz(quizId)`**: Fetches quiz details with a `GET` request to `/quiz/:quizId`.
- **`startQuiz(quizId)`**: Sends a `POST` request to `/quiz/start`.
- **`submitQuiz(quizId, answers)`**: Submits the user's answers with a `POST` request to `/quiz/submit`.
- **`getResult(attemptId)`**: Fetches the quiz result with a `GET` request to `/quiz/result/:attemptId`.

### 4. Example Usage in a React Component (`src/components/QuizComponent.tsx`)

This component demonstrates how to use the services to:
- Fetch a quiz when the component mounts.
- Handle loading and error states during the API call.
- Display the quiz questions and options.
- Submit the user's answers.
- Show a loading state while the quiz is being submitted.

This setup provides a clean and scalable way to manage API requests in your React application, with proper error handling and authentication.
