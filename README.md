# SilentAudit Dashboard

A comprehensive monitoring and auditing dashboard for tracking device activity, system health, and security alerts.

## Features

### Core Features
- **Authentication**: Secure login with magic link authentication
- **Real-time Monitoring**: Live updates of device activity and system metrics
- **Device Tracking**: Monitor device locations on an interactive map
- **Activity Logs**: Detailed logs of user activities and application usage
- **Security Alerts**: Advanced security monitoring with severity levels

### Enhanced Features
- **Device Management**: Add, edit, and remove devices from the system
- **System Health Monitoring**: Track CPU, memory, disk, and network metrics
- **Notifications System**: Real-time notifications with read/unread status
- **Data Export**: Export reports and logs in various formats
- **Dark/Light Mode**: Toggle between dark and light themes

## Technology Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Supabase (Authentication, Database, Real-time subscriptions)
- **Data Visualization**: Recharts, React Simple Maps
- **State Management**: React Context API
- **Error Handling**: Comprehensive error handling and notifications

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/silent-audit-dashboard.git
   cd silent-audit-dashboard
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

### Building for Production

To create a production build:

```
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

- `src/components/`: UI components
- `src/context/`: Context providers for state management
- `src/App.jsx`: Main application component
- `src/Login.jsx`: Authentication component
- `src/LogTable.jsx`: Log display component

## Key Components

- **AuthContext**: Manages authentication state and operations
- **DataContext**: Handles data fetching and real-time subscriptions
- **NotificationContext**: Manages toast notifications and alerts
- **SecurityAlerts**: Advanced security monitoring component
- **DeviceManagement**: Device tracking and management
- **SystemHealth**: System metrics monitoring

## Error Handling

The application implements comprehensive error handling:

- API request error handling with user-friendly messages
- Form validation with error feedback
- Fallback UI for failed component rendering
- Network error detection and recovery

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Tarka Labs for the original concept
- Supabase for the backend infrastructure
- All open-source contributors