# Hospital Feedback Backend API

A Node.js backend API for the hospital feedback system using Express.js and MongoDB.

## Features

- RESTful API endpoints for OPD and IPD feedback submission
- MongoDB integration with Mongoose ODM
- CORS configuration for frontend integration
- Rate limiting for API protection
- Security middleware with Helmet
- Comprehensive error handling
- Health check endpoints

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp env.example .env
   ```

4. Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/hospital-feedback
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your .env file).

## API Endpoints

### Health Check
- `GET /api/health` - Check if the API is running

### Feedback Endpoints
- `POST /api/feedback/opd` - Submit OPD feedback
- `POST /api/feedback/ipd` - Submit IPD feedback
- `GET /api/feedback/all` - Get all feedback (OPD + IPD)
- `GET /api/feedback/opd` - Get OPD feedback only
- `GET /api/feedback/ipd` - Get IPD feedback only
- `GET /api/feedback/stats` - Get feedback statistics

## Database Schema

### OPD Feedback
- Patient information (name, UHID, date, mobile)
- Overall experience rating
- Service-specific ratings (appointment booking, reception, billing, etc.)
- Employee nomination and comments

### IPD Feedback
- Patient information (name, UHID, date, mobile)
- Overall experience rating
- Service-specific ratings (registration, room readiness, doctor consultation, etc.)
- Employee nomination and comments

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/hospital-feedback` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

## MongoDB Setup

### Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use the default connection string: `mongodb://localhost:27017/hospital-feedback`

### MongoDB Atlas (Cloud)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

## Security Features

- **Helmet**: Security headers
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend domain
- **Input Validation**: Mongoose schema validation
- **Error Handling**: Comprehensive error responses

## Development

The application uses nodemon for development, which automatically restarts the server when files change.

## Production Deployment

### For Local MongoDB Setup:
See `DEPLOYMENT_GUIDE.md` for detailed instructions on setting up MongoDB locally on your server.

### General Steps:
1. Set `NODE_ENV=production` in your environment
2. Install and configure MongoDB (local or Atlas)
3. Update `.env` file with production MongoDB URI
4. Use a process manager like PM2
5. Configure reverse proxy (nginx)
6. Set up SSL certificates
7. Configure automatic backups

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string format
- Verify network connectivity (for Atlas)

### CORS Issues
- Update `FRONTEND_URL` in `.env`
- Check frontend URL matches exactly

### Port Issues
- Change `PORT` in `.env` if 5000 is occupied
- Update frontend API base URL accordingly
