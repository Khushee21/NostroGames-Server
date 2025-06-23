🎮 NostroGames-Server
This is the backend server for NostroGames, built with Node.js, Express, MongoDB, and JWT-based authentication.

🧾 .env Configuration
Create a .env file in the root directory and add the following variables:

# MongoDB connection URI (local or Atlas)
MONGO_URL = your mongo url

# CORS origin (frontend base URL)
CORS_ORIGIN= your cors origin

# Express server port
PORT= your server port || 5000

# JWT Secrets
JWT_SECRET= your jwt secret key
JWT_REFRESH_SECRET= your refresh secret key

# SMTP Configuration for email services (e.g. Gmail, Mailtrap, etc.)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
💡 Note: Never commit your .env file. Add it to .gitignore.

🚀 To Run the Server

npm install    # Install dependencies
npm run dev    # Start server in development mode
