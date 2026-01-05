import http from 'k6/http';
import { check, sleep } from 'k6';

// Test data from user
const QUIZ_ACCESS_CODE = 'SN76KQ';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 users over 30 seconds
    { duration: '1m', target: 100 },  // Stay at 100 users for 1 minute
    { duration: '30s', target: 0 },   // Ramp down to 0 users over 30 seconds
  ],
  thresholds: {
    // http errors should be less than 1%, excluding expected 400s (quiz submitted), 409s (user exists), and 429s (rate limits)
    http_req_failed: [{ threshold: 'rate<0.01', abortOnFail: false,  }, {threshold: 'rate<0.01', targets: ['status != 200', 'status != 201', 'status != 400', 'status != 409', 'status != 429']}],
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
  },
};

// Helper function to generate unique user credentials
function generateUniqueUser(vuId, iter) {
  const timestamp = Date.now();
  const email = `user_${vuId}_${iter}_${timestamp}@example.com`;
  const password = `password_${vuId}_${iter}_${timestamp}`;
  return { email, password };
}

export default function () {
  const BASE_URL = 'http://localhost:5000/api';

  let authToken = '';

  const { email, password } = generateUniqueUser(__VU, __ITER);

  // 1. User Registration
  const registerRes = http.post(`${BASE_URL}/auth/register`,
    JSON.stringify({
      name: email.split('@')[0],
      email,
      password,
      college: `college_${__VU}`, // Placeholder for college
      mobile: `123456789${__VU % 100}`, // Placeholder for mobile, ensuring it's a number
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'Register' },
    }
  );

  check(registerRes, {
    'Register: status is 201': (r) => r.status === 201 || r.status === 409, // 409 if user already exists from a previous run
    'Register: success message': (r) => r.status === 201 && r.json() && r.json().message === 'User registered successfully',
  });

  if (registerRes.status !== 201 && registerRes.status !== 409) {
    console.error(`Registration failed for user ${email}: ${registerRes.body}`);
    return; // Stop scenario if registration fails unexpectedly
  }

  sleep(1); // Simulate user think time

  // 2. User Login (using the newly registered user)
  const loginRes = http.post(`${BASE_URL}/auth/login`,
    JSON.stringify({ email, password }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'Login' },
    }
  );

  check(loginRes, {
    [`Login for ${email}: status is 200`]: (r) => r.status === 200,
    [`Login for ${email}: has auth token`]: (r) => r.json() && r.json().token !== '',
  });

  if (loginRes.json() && loginRes.json().token) {
    authToken = loginRes.json().token;
  } else {
    console.error(`Login failed for user ${email}: ${loginRes.body}`);
    return; // Stop scenario if login fails
  }

  sleep(1); // Simulate user think time

  // 3. Fetch Quiz Questions
  const getQuizRes = http.get(`${BASE_URL}/quiz/${QUIZ_ACCESS_CODE}`, {
    headers: { Authorization: `Bearer ${authToken}` },
    tags: { name: 'Fetch Quiz' }, // Updated tag
  });

  check(getQuizRes, {
    'Fetch Quiz: status is 200': (r) => r.status === 200,
    'Fetch Quiz: has questions': (r) => r.json() && r.json().questions && r.json().questions.length > 0,
  });

  sleep(1); // Simulate user think time

  // 3. Submit Quiz Answers (assuming all answers are correct for simplicity)
  if (getQuizRes.json() && getQuizRes.json().questions) {
    const questions = getQuizRes.json().questions;
    const answers = questions.map(q => ({
      questionId: q._id,
      answer: q.correctAnswer, // Using correct answer for simplicity
    }));

    const submitQuizRes = http.post(`${BASE_URL}/quiz/submit`,
      JSON.stringify({ quizId: QUIZ_ACCESS_CODE, answers }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        tags: { name: 'Submit Quiz' }, // Updated tag
      }
    );

    check(submitQuizRes, {
      'Submit Quiz: status is 201': (r) => r.status === 201,
      'Submit Quiz: success message': (r) => r.json() && r.json().message === 'Quiz submitted successfully',
      'Submit Quiz: status is 400 (already submitted)': (r) => r.status === 400 && r.json() && r.json().message === 'You have already submitted this quiz',
    });
  }

  sleep(1); // Simulate user think time
}
