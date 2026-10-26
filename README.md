# ClassEcho — Course Feedback Admin

ClassEcho is a small MERN application for collecting course reviews and giving an administrator one place to manage them. The dashboard groups responses by course, shows the average rating, and lets the admin search, filter, add, edit, or remove a response.

This project is intended as a learning and assessment project. Before submitting it, make sure you can explain the parts you used and make a few choices of your own (see **Make the project yours** below).

## What it does

- Displays a dashboard with course count, response count, average rating, and highly rated courses.
- Groups feedback by course name and calculates an average rating for each group.
- Supports searching courses and filtering by rating.
- Provides a form to create and update feedback, with validation for course name, duration, comments, and a 1–5 star rating.
- Allows an administrator to delete a response after confirmation.
- Stores records in MongoDB through an Express API.
- Uses a responsive layout so the dashboard can be used on a smaller screen.

## Stack

- **Frontend:** React, Vite, React Router, Axios, Lucide icons
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB Atlas

## Folder map

```text
feedback-admin-panel/
├── backend/
│   ├── models/Feedback.js          # feedback document shape
│   ├── routes/feedbackRoutes.js    # CRUD API and request validation
│   ├── server.js                  # Express setup and database connection
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/            # reusable UI pieces
│   │   ├── pages/                 # dashboard and feedback form
│   │   ├── api.js                 # shared Axios client
│   │   ├── App.jsx                 # navigation and page routes
│   │   └── styles.css
│   └── .env.example
└── README.md
```

## Run it locally

You need Node.js (18 or newer), npm, and a MongoDB Atlas database.

### 1. Set up the database

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free cluster if you do not already have one.
2. Create a database user and allow your current IP address under **Network Access**.
3. In the cluster, choose **Connect → Drivers** and copy the Node.js connection string.
4. Keep your database password private. If it contains reserved URL characters, URL-encode those characters before using it in the URI.

### 2. Start the backend

Open a terminal in VS Code and run:

```bash
cd backend
npm install
```

Copy `backend/.env.example` to a new file named `backend/.env`. On Windows Command Prompt, you can use:

```cmd
copy .env.example .env
```

Open `backend/.env` and set the values. Use the connection string from your own Atlas account:

```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER/feedback_admin?retryWrites=true&w=majority
CLIENT_ORIGIN=http://localhost:5173
```

Then start the API:

```bash
npm run dev
```

The health endpoint is `http://localhost:5000/api/health`. Leave this terminal running.

### 3. Start the frontend

Open a **second** terminal, return to the project root if needed, and run:

```bash
cd frontend
npm install
```

Copy `frontend/.env.example` to `frontend/.env` if your setup requires a custom API URL. Then run:

```bash
npm run dev
```

Open the local URL Vite prints, usually `http://localhost:5173`. Keep both terminals open while testing the app.

## API reference

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check the API and database status |
| GET | `/api/feedback` | List all feedback, newest first |
| GET | `/api/feedback/:id` | Read one feedback entry |
| POST | `/api/feedback` | Add a feedback entry |
| PUT | `/api/feedback/:id` | Update a feedback entry |
| DELETE | `/api/feedback/:id` | Delete a feedback entry |

Example request body:

```json
{
  "courseName": "Full Stack Development",
  "courseDuration": "12 weeks",
  "comments": "The project exercises helped me understand the topics.",
  "rating": 4
}
```

The backend creates the MongoDB document ID. The API also returns a display-style course ID derived from that record. The dashboard's overall rating is calculated from the saved responses; it is not a hard-coded value.

## Make the project yours

For an assessment, don't rely on changing names alone. Understand the code and make a few real decisions that reflect your own approach. For example:

- Adjust the color palette or spacing in `frontend/src/styles.css`.
- Change the dashboard's helper text to match the way you would describe the app.
- Add one feature you can explain confidently, such as sorting courses by average rating or displaying the most recent comment.
- Add your own test records and check how the average changes when you edit or delete a rating.
- Write a short project reflection in your submission notes explaining what you changed and why.

Only describe work you actually completed. No tool can guarantee a particular plagiarism or AI-detection score; the best protection is to follow your institution's rules, cite reused material where required, and be ready to explain and demonstrate your implementation.

## Before submitting

- [ ] Backend and frontend both start without errors.
- [ ] MongoDB Atlas connects successfully.
- [ ] Add, edit, and delete each work.
- [ ] Search and rating filters behave as expected.
- [ ] Test the layout at a narrow screen width.
- [ ] Keep real `.env` files and database credentials out of GitHub.
- [ ] Confirm your institution's rules about AI assistance and disclose it if required.

## GitHub

Create an empty repository on GitHub, then run these commands from the project root:

```bash
git init
git add .
git commit -m "Create ClassEcho course feedback dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Replace the example remote URL with your own repository URL.
