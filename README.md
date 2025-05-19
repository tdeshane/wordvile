# WordVile

A word game application featuring multiple word games including Hangman, Word Scramble, and Word Search.

## Project Structure

```
wordvile/
├── frontend/          # React frontend application
│   ├── public/        # Static files
│   └── src/           # React source code
│       ├── components/ # React components
│       └── styles/    # CSS files
│
├── backend/          # Node.js backend
│   ├── data/          # Data files
│   └── *.js           # Backend source files
│
└── scripts/          # Deployment and utility scripts
    ├── deploy-frontend.sh
    ├── deploy-backend.sh
    └── create_s3_and_cloudfront.sh
```

## Prerequisites

- Node.js (v14+)
- npm or yarn
- AWS CLI configured with appropriate credentials
- AWS SAM CLI (for backend deployment)

## Getting Started

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install  # or yarn install
   ```

2. Start the development server:
   ```bash
   npm start  # or yarn start
   ```

### Backend Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install  # or yarn install
   ```

2. Set up AWS SAM CLI (if not already installed):
   ```bash
   ./setup-sam.sh
   ```

## Deployment

### 1. Set up AWS Infrastructure

Run the following command to create the required S3 bucket and CloudFront distribution:

```bash
chmod +x scripts/create_s3_and_cloudfront.sh
./scripts/create_s3_and_cloudfront.sh
```

### 2. Deploy the Backend

```bash
chmod +x scripts/deploy-backend.sh
./scripts/deploy-backend.sh
```

### 3. Deploy the Frontend

```bash
chmod +x scripts/deploy-frontend.sh
./scripts/deploy-frontend.sh
```

## Environment Variables

### Frontend

Create a `.env` file in the `frontend` directory with the following variables:

```
REACT_APP_API_URL=your-api-gateway-url
```

### Backend

Create a `.env` file in the `backend` directory with the following variables:

```
ADMIN_TOKEN=your-secure-admin-token
S3_BUCKET=your-s3-bucket-name
```

## Available Scripts

### Frontend

- `npm start`: Start the development server
- `npm test`: Run tests
- `npm run build`: Build for production
- `npm run eject`: Eject from Create React App

### Backend

- `npm start`: Start the development server
- `npm test`: Run tests
- `npm run deploy`: Deploy to AWS

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
