# Worker App

## Overview
The Worker App is designed to provide a seamless experience for workers to manage their job requests, earnings, and profile information. The application features a user-friendly interface with easy navigation and real-time updates from the backend.

## Features
- **Home Screen**: Displays the worker's availability status, today's earnings, jobs scheduled for the day, and job requests.
- **Jobs Screen**: Shows the current status of active jobs and allows workers to start or complete jobs.
- **Earnings Screen**: Provides an overview of today's earnings, weekly earnings, total jobs completed, and welfare information.
- **Profile Screen**: Displays the worker's personal information, including photo, name, rating, cooperative badge, skills, certificates, and experience.
- **SOS Button**: Easily accessible button for emergencies.

## Project Structure
```
worker-app
├── src
│   ├── app.ts
│   ├── navigation
│   │   └── bottom-navigation.ts
│   ├── screens
│   │   ├── home
│   │   │   ├── home-screen.ts
│   │   │   └── components
│   │   │       ├── availability-toggle.ts
│   │   │       ├── earnings-summary.ts
│   │   │       └── job-request-card.ts
│   │   ├── jobs
│   │   │   ├── jobs-screen.ts
│   │   │   └── components
│   │   │       ├── job-status.ts
│   │   │       └── job-action-button.ts
│   │   ├── earnings
│   │   │   └── earnings-screen.ts
│   │   └── profile
│   │       ├── profile-screen.ts
│   │       └── components
│   │           ├── skills-list.ts
│   │           └── certificates-list.ts
│   ├── components
│   │   └── sos-button.ts
│   ├── services
│   │   ├── api-client.ts
│   │   ├── worker-api.ts
│   │   ├── jobs-api.ts
│   │   └── earnings-api.ts
│   ├── state
│   │   └── worker-store.ts
│   ├── types
│   │   └── index.ts
│   └── config
│       └── api-config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Installation
To install the project, clone the repository and run the following commands:

```bash
npm install
```

## Usage
To start the application, run:

```bash
npm start
```

## API Integration
The application connects to real backend APIs for fetching and updating data. Ensure that the backend services are running and accessible.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.