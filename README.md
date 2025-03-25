# 📝 NoteMate

A modern, feature-rich note-taking application that allows users to create, manage, and organize their notes with a clean and intuitive interface.\*

## 📌 Table of Contents

- [🌟 Overview](#-overview)
- [✨ Features](#-features)
- [🛠️ Technologies Used](#️-technologies-used)
- [📥 Installation](#-installation)
- [📝 Usage](#-usage)
- [📁 Project Structure](#-project-structure)
- [📡 API Documentation](#-api-documentation)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [💙 Acknowledgments](#-acknowledgments)

## 🌟 Overview

NoteMate is a full-stack note-taking application that enables users to create, edit, delete, and organize their notes. The application offers:  
✅ A list view for traditional note management  
✅ A dashboard view with insightful statistics about your notes  
✅ Color-coding for better note organization  
✅ A clean and intuitive interface for seamless experience

## ✨ Features

🔐 User Authentication – Secure login system with JWT authentication  
📝 Note Management – Create, read, update, and delete notes easily  
🎨 Color-Coding – Assign different colors to notes for better organization  
🔍 Search Functionality – Quickly find notes using the search bar  
📊 Dual View Modes:

- List View – A traditional list of all notes
- Dashboard View – Visual insights and statistics  
  📈 Note Statistics – View total notes count, average note length, and color distribution  
  📱 Responsive Design – Works seamlessly across desktop & mobile devices  
  🌍 Data Synchronization – Sync notes between local storage and server  
  🌙 Theme Support – Switch between light & dark modes

## 🛠️ Technologies Used

### Frontend

- ⚛ React – Modern UI framework
- 🛤 React Router – Client-side routing
- 🎨 SCSS Modules – Styled components
- 🔔 React-Toastify – Notifications
- 🏆 Iconify – Icons

### Backend

- 🟢 Node.js – Backend runtime
- ⚡ Express.js – Web framework
- 🗄 MongoDB – Database
- 🔑 JWT (JSON Web Tokens) – Secure authentication

## 📥 Installation

### Prerequisites

Ensure you have the following installed:  
✅ Node.js (v18.0.0 or higher) – [Download](https://nodejs.org/)  
✅ MongoDB – [Installation Guide](https://www.mongodb.com/docs/manual/installation/)

### Setup Instructions

1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/NoteMate.git
cd NoteMate
```

2️⃣ Install dependencies

```bash
npm install
```

3️⃣ Setup Environment Variables

- Create a `.env` file inside the server directory:

```plaintext
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

- Create a `.env` file inside the client directory:

```plaintext
REACT_APP_API_URL=http://localhost:5000
```

4️⃣ Start the Application

```bash
npm run dev
```

This will start both the server and client simultaneously.

## 📝 Usage

### Creating Notes

➕ Click the "+" icon in the sidebar  
✍ Type your note content  
🎨 Select a color (optional)  
✅ Click "Save"

### Editing Notes

🖊 Click on a note to expand it  
📝 Edit the content  
✅ Click "Save" to update

### Deleting Notes

🗑 Open a note  
⚠ Click the trash icon  
✅ Confirm deletion

### Viewing Dashboard

📊 Click on the dashboard icon in the sidebar  
👀 View statistics about your notes:

- Total notes count
- Average note length
- Color distribution
- Recent notes

### Searching Notes

🔍 Use the search bar at the top to filter notes by content

## 📁 Project Structure

```
NoteMate/
├── client/                # Frontend React application
│   ├── public/            # Static files
│   └── src/
│       ├── apis/          # API integration
│       ├── app/           # App container
│       ├── components/    # React components
│       ├── context/       # React context providers
│       ├── data/          # Static data
│       ├── layouts/       # Page layouts
│       ├── pages/         # Page components
│       └── utils/         # Utility functions
│
├── server/                # Backend Node.js/Express application
│   └── src/
│       ├── controllers/   # Route controllers
│       ├── models/        # Database models
│       └── routers/       # API routes
│
└── package.json           # Root package.json
```

## 📡 API Documentation

📢 Base URL: `http://localhost:5000/api/notes`

### Notes API

✅ Get All Notes – `GET /`  
✅ Get Single Note – `GET /:id`  
✅ Create Note – `POST /`  
✅ Update Note – `PUT /:id`  
✅ Delete Note – `DELETE /:id`

## 🤝 Contributing

Contributions are welcome! Follow these steps to contribute:

1. Fork the repository
2. Create a new branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Make your changes & commit
   ```bash
   git commit -m "Add amazing feature"
   ```
4. Push to your branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request 🚀

## 📄 License

This project is licensed under the ISC License.

## 💙 Acknowledgments

🙏 Special thanks to:

- Open-source contributors
- Developers worldwide working on productivity tools

Made with ❤️ by Piyush Kumar Agarwal 🚀
