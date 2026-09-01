# ChatSphere

ChatSphere is a full-stack real-time chat application built with React and Django.  
The project provides real-time communication, user authentication, file and media sharing, voice messages, and user profile management.

## Features

- User registration and login
- JWT-based authentication
- Real-time messaging using WebSockets
- Chat channels and message history
- File and media attachments
- Document and image previews
- Voice message recording and playback
- User profile and avatar management
- Account settings and theme preferences
- Message replies
- Message reactions

## Tech Stack

### Backend
- Python
- Django
- Django REST Framework
- Django Channels
- PostgreSQL
- JWT authentication
- WebSockets

### Frontend
- React
- Vite
- JavaScript
- React Router
- Axios

## Project Structure

```text
ChatSphere/
├── backend/
│   ├── accounts/
│   ├── chat/
│   ├── config/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── .env.example
└── README.md
```

## Local Setup

### Backend

Create and activate a Python virtual environment:

```bash
cd backend
python -m venv venv
source venv/bin/activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the project root based on `.env.example` and configure the required environment variables.

Run the database migrations:

```bash
python manage.py migrate
```

Start the Django development server:

```bash
python manage.py runserver
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend development server runs by default at:

```text
http://localhost:5173
```

## Development Status

ChatSphere is under active development. Core chat functionality is implemented, while additional features and improvements are planned.

### Planned

- Direct messaging between users
- Further UI/UX improvements
- Additional testing and code cleanup

## Author

**Kollárik Richárd**

GitHub: krichard07