# Pinnacle Portal - Backend

## Scalability and Performance for 5,000+ Concurrent Users

This backend is designed to handle a large number of concurrent users by implementing several key strategies:

### 1. Caching with Redis

- **Quiz Questions:** Quiz questions are cached in Redis after the first fetch. Subsequent requests for the same quiz will be served from the in-memory Redis cache, which is significantly faster than querying the MongoDB database. This drastically reduces the load on the database, especially when thousands of users request the same quiz data simultaneously.
- **Cache Invalidation:** The cache has a Time-To-Live (TTL) of 1 hour, after which it will be refreshed from the database. This ensures that any updates to the quiz are eventually reflected, while still providing the performance benefits of caching.

### 2. Efficient Database Design and Indexing

- **Targeted Indexing:** Mongoose schemas include indexing on frequently queried fields like `email` in the `Users` collection, and `userId` and `quizId` in the `Results` collection. This allows MongoDB to perform fast lookups without scanning the entire collection, which is crucial for performance at scale.
- **Relationships:** The database schema is designed with clear relationships between `Users`, `Quizzes`, `Questions`, and `Results`. This allows for efficient queries and population of related data.

### 3. Asynchronous and Non-Blocking I/O

- **Node.js Event Loop:** The entire application is built on Node.js, which uses an event-driven, non-blocking I/O model. This means that the server can handle many concurrent connections without getting blocked by database queries or other I/O operations. This is fundamental to the scalability of the application.
- **`async/await`:** The code consistently uses `async/await` to handle asynchronous operations in a clean and efficient way, preventing callback hell and making the code easier to maintain.

### 4. Stateless Authentication with JWT

- **JSON Web Tokens (JWT):** The authentication system is stateless. Once a user logs in, they are issued a JWT. For subsequent requests, the server only needs to validate the JWT signature, without needing to look up the user in the database for every request. This reduces the overhead of session management and is ideal for distributed systems.

### 5. Horizontal Scaling with PM2 Cluster Mode

- **Ready for Clustering:** The application is designed to be stateless, which makes it easy to scale horizontally. You can use a process manager like PM2 to run the application in cluster mode. This will create multiple instances of the application across all available CPU cores, allowing the system to handle a much larger number of concurrent requests.
- **Load Balancing:** When running in cluster mode, a load balancer (like the one built into PM2, or a dedicated one like Nginx) can distribute incoming traffic across the different instances of the application, further improving performance and reliability.

### 6. Rate Limiting

- **Preventing Abuse:** The application uses `express-rate-limit` to limit the number of requests an IP address can make to the API. This helps to prevent brute-force attacks and other forms of abuse, ensuring the server remains available for legitimate users.

### 7. Graceful Error Handling

- **Robustness:** The application includes a global error handler and `try/catch` blocks in all asynchronous operations. This ensures that the server will not crash due to unhandled exceptions, and that meaningful error messages are sent back to the client.

By combining these strategies, this backend is well-equipped to handle the demands of a large-scale online quiz event with 5,000 or more concurrent users.
