# GovTech Test API

A student-teacher management system built with NodeJS and Express with MySQL as backend.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application Locally](#running-the-application-locally)
- [Accessing the Application on Cloud](#accessing-the-application-on-cloud)
- [Running Tests](#running-tests)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

*The database is already hosted on AWS - no local database setup required!*

## Installation

1. **Clone the repository**

```bash
   git clone 
   cd govtech-test
```

2. **Install dependencies**

```bash
   npm install
```

## Configuration

The `.env` file is already configured with AWS MySQL database credentials. You can verify the configuration:

```env
# Server Configuration
PORT=3000

# AWS MySQL Database (Already Configured)
DB_HOST=<aws-host>
DB_PORT=3306
DB_NAME=govtech_test
DB_USER=<username>
DB_PASSWORD=<password>
```

*No additional database setup is required - the application will connect to the AWS-hosted MySQL database
automatically.*

## Running the Application Locally

Start the server:

```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file)

You should see:

```
Server is running on port 3000
Database connected successfully
```

*Application logs should be logged under a file called `govtech-test.log` as well as in the console.*

### Using Docker

If wished to use Docker, please download below tools:

- **Docker** (for containerization) - [Download here](https://www.docker.com/products/docker-desktop)

Then run below commands:

```bash
# Build Docker image
docker build -t govtech-test .

# Run container
docker run -p 3000:3000 govtech-test
```

## Accessing the Application on Cloud

The application is deployed on AWS ECS using Docker containers.

### Live API URL

```
http://13.214.216.240:3000/api
```

## Running Tests

### Run all tests

```bash
npm test
```

### Run tests with coverage

```bash
npm run test:coverage
```

**Test Information:**

```
Test Suites: 1
Tests: 25
```

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Endpoints

#### 1. Register Students

Register one or more students to a specified teacher.

**Endpoint:** `POST /register`

**Request Body:**

```json
{
  "teacher": "teacherken@gmail.com",
  "students": [
    "studentjon@gmail.com",
    "studenthon@gmail.com"
  ]
}
```

**Success Response:** `204 No Content`

---

#### 2. Get Common Students

Retrieve students common to a given list of teachers.

**Endpoint:** `GET /commonstudents`

**Query Parameters:**

- `teacher` (required): One or more teacher email addresses

**Success Response:** `200 OK`

```json
{
  "students": [
    "commonstudent1@gmail.com",
    "commonstudent2@gmail.com"
  ]
}
```

---

#### 3. Suspend Student

Suspend a specified student.

**Endpoint:** `POST /suspend`

**Request Body:**

```json
{
  "student": "studentmary@gmail.com"
}
```

**Success Response:** `204 No Content`

---

#### 4. Retrieve Students for Notifications

Retrieve a list of students who can receive notifications.

**Endpoint:** `POST /retrievefornotifications`

**Request Body:**

```json
{
  "teacher": "teacherken@gmail.com",
  "notification": "Hello students! @studentagnes@gmail.com @studentmiche@gmail.com"
}
```

**Success Response:** `200 OK`

```json
{
  "recipients": [
    "studentbob@gmail.com",
    "studentagnes@gmail.com",
    "studentmiche@gmail.com"
  ]
}
```

### Error Responses

All endpoints return appropriate HTTP status codes:

- `400 Bad Request` - Invalid input or validation error
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

**Error Response Format:**

```json
{
  "message": "Error description here"
}
```

### Postman Collection

You can use Postman to import the collection in this repo to test all 4 endpoints.
The `json` file is located as "postman-collection.json"

## Troubleshooting

### Database Connection Issues

- The database is hosted on AWS and should be accessible
- Check if `.env` file exists and contains correct credentials
- Verify network connectivity to AWS

### Port Already in Use

- Change `PORT` in `.env` file
- Or kill the process using port 3000:

```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID  /F
  
  # Mac/Linux
  lsof -ti:3000 | xargs kill
```

### Module Not Found Errors

```bash
rm -rf node_modules package-lock.json
npm install
```
