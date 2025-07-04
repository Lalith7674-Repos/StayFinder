Stay-Finder:
A complete-stack vacation rental website like Airbnb, developed using React, Node.js, and MongoDB. Users can post properties, search for places to stay, and reserve stays with a full booking and payment process.

Project Overview:
Stay-Finder is a complete vacation rental website where hosts can post their properties and travelers can find, book, and rate accommodations. The website has powerful search features, interactive maps, secure payment processes, and a solid review system.

Features:
For Guests
- Property Discovery: Browse properties with advanced search and filtering
- Interactive Search: Location-based search with autocomplete suggestions
- Property Details: View comprehensive property information with image galleries
- Booking System: Secure booking with date selection and payment processing
- Favorites: Save and manage favorite properties
- Reviews: Read and write detailed reviews with star ratings
- User Authentication: Secure login and registration system
- Profile Management: Update personal information and view booking history

For Hosts:
- Property Management: Create, edit, and manage listings of properties
- Host Dashboard: Full dashboard for managing bookings and properties
- Image Upload: Uploading multiple images with cover photo selection
- Pricing Management: Apply unique prices for short-term and long-term bookings
- Booking Management: Manage booking requests and payments
- Analytics: See property performance and guest reviews

Technical Features:
- Responsive Design: Functions perfectly on desktop, tablet, and mobile
- Real-time Updates: Live tracking of availability and booking status
- Payment Integration: Secure payment processing with Stripe
- Image Management: Automatic image upload, optimization, and serving
- Advanced Search: Location, price, and amenity-based filtering
- Maps Integration: Interactive maps with property markers
- Review System: Comprehensive rating system with category breakdowns
- Security: JWT authentication, password hashing, and input validation

Tech Stack:
Frontend:
- React 19 - Modern React with hooks and functional components
- Vite - Fast build tool and development server
- React Router - Client routing for smooth navigation
- Tailwind CSS - Utility-first CSS framework for responsive design
- Axios - HTTP client for API calls
- React DatePicker - Date picker components
- Leaflet - Interactive maps integration

Backend
- Node.js - JavaScript runtime environment
- Express.js - Web application framework
- MongoDB - NoSQL database for flexible data storage
- Mongoose - MongoDB object modeling for Node.js
- JWT - JSON Web Tokens for secure authentication
- Multer- Middleware for uploading files for image processing
- bcryptjs - Security hashing for passwords
- CORS - Cross Origin Resource Sharing configuration

Database:
- MongoDB - Flexible schema document-based database
- Mongoose ODM - Object Document Mapping for MongoDB
- Geospatial Indexing - Queries and searches based on location

Project Structure:

Stay-Finder/
├── src/                    # Frontend application built with React
│   ├── components/         # Reusable React components
│   │   ├── Header.jsx     # Navigation header
│   │   ├── PropertyCard.jsx # Property display cards
│   │   ├── StarRating.jsx # Interactive star rating component
│   │   ├── ReviewCard.jsx # Review display component
│   │   ├── ReviewSlider.jsx # Sliding review carousel
│   │   ├── ReviewForm.jsx # Review submission form
│   │   └── HeroSection.jsx # Homepage hero with search
│   ├── pages/             # Page components
│   │   ├── HomePage.jsx   # Main landing page
│   │   ├── PropertyDetail.jsx # Property details page
│   │   ├── ReviewsPage.jsx # Separate page for reviews
│   │   ├── LoginPage.jsx  # User login
│   │   ├── RegisterPage.jsx # User registration
│   │   ├── HostDashboard.jsx # Host management dashboard
│   │   ├── NewListing.jsx # Form to create property
│   │   ├── EditListing.jsx # Editing form for a property
│   │   ├── Profile.jsx    # User profile management
│   │   ├── FavoritesPage.jsx # User favorites
│   │   ├── MyBookings.jsx # Booking management
│   │   └── BookingConfirmation.jsx # Booking confirmation
│   ├── context/           # State management React context
│   │   └── AuthContext.jsx # User and authentication state
│   └── utils/             # Utility functions
├── server/                # Backend Node.js application
│   ├── controllers/       # Route controllers
│   │   ├── authController.js # Authentication logic
│   │   ├── propertyController.js # Property management
│   │   ├── bookingController.js # Booking operations
│   │   ├── reviewController.js # Review system
│   │   ├── favoriteController.js # Favorites management
│   │   └── paymentController.js # Payment processing
│   ├── models/           # MongoDB/Mongoose models
│   │   ├── User.js       # User schema
│   │   ├── Property.js   # Properties schema
│   │   ├── Booking.js    # Bookings schema
│   │   ├── Review.js     # Reviews schema
│   │   ├── Favorite.js   # Favorites schema
│   │   └── Payment.js    # Payments schema
│   ├── routes/         # API routes
│   │   ├── auth.js     # Authentication routes
│   │   ├── properties.js # Property routes
│   │   ├── bookings.js   # Booking routes
│   │   ├── reviews.js    # Review routes
│   │   ├── favorites.js  # Favorite routes
│   │   └── payments.js   # Payment routes
│   ├── middleware/       # Custom middleware
│   │   ├── auth.js       # Authentication middleware
│   │   └── errorHandler.js # Error handling middleware
│   ├── config/           # Config files
│   │   └── db.js         # Database connection configuration
│   ├── utils/            # Utility functions
│   │   └── helpers.js    # Helper functions
│   └── public/uploads/   # directory for image uploads
├── public/               # static assets
└── package.json          # frontend dependencies

Installation & Setup:

Prerequisites:
- Node.js (version 16 or above)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

1. Clone the Repository

git clone <repository-url>
cd Stay-Finder

2. Install Dependencies

Frontend Dependencies
bash
npm install


Backend Dependencies
```bash
cd server
npm install
cd .

3. Environment Setup

Generate a `.env` file in the server directory:
env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5001

4. Database Setup
- Run MongoDB locally or MongoDB Atlas
- Application auto-create required collections
- Sample data for testing

5. Start the Application
npm run dev
cd server
npm run dev
```

Production Mode:
# Build frontend
npm run build

# Start backend
cd server
npm start
```

API Documentation:

Authentication:
- POST /api/auth/register` - Register User
- POST /api/auth/login` - Login User
- GET /api/auth/me` - Get current user

Properties:
- GET /api/properties` - Get all properties with filtering
- GET /api/properties/:id` - Get single property
- POST /api/properties` - Create new property (Host only)
- PUT /api/properties/:id` - Update property (Host only)
- DELETE /api/properties/:id` - Delete property (Host only)
- GET /api/properties/my` - Get user's properties (Host only)

Bookings:
- POST /api/bookings` - Create booking
- GET /api/bookings` - Get user's bookings
- GET /api/bookings/host` - Get host's bookings
- PUT /api/bookings/:id/status` - Change booking status

Reviews:
- POST /api/reviews` - Create review (Booked users only)
- GET /api/reviews/property/:propertyId` - Retrieve property reviews
- GET /api/reviews/stats/:propertyId` - Retrieve review statistics
- GET /api/reviews/can-review/:propertyId` - Review eligibility check

Favorites:
- POST /api/favorites` - Add to favorites
- GET /api/favorites` - Retrieve user's favorites
- DELETE /api/favorites/:id` - Remove from favorites

Payments:
- POST /api/payments` - Process payment
- GET /api/payments/success` - Payment success callback

UI/UX Design

The app has a clean, modern design similar to top vacation rental sites:

- Responsive Layout: Mobile-first design that is compatible with all devices
- Intuitive Navigation: Breadcrumbs and search with clear navigation
- Interactive Elements: Smooth transitions, animations, and hover effects
- Accessibility: Keyboard navigation, screen reader support, and correct ARIA labels
- Loading States: Skeleton loaders and progress indicators
- Error Handling: Recovery options and user-friendly error messages

Security Features:

- JWT Authentication: Secure token-based authentication
- Password Hashing: bcrypt for password protection
- Input Validation: Server-side validation of all inputs
- CORS Configuration: Correct cross-origin request management
- File Upload Security: Image validation and safe storage
- Rate Limiting: API rate limiting for abuse prevention
- Environment Variables: Secure configuration management

Database Schema:

User Model:
- Name, email, password, basic info
- User-, host-, admin-based access
- Profile data and preferences

Property Model:
- Property information (title, description, location)
- Prices (per night, weekly prices, GST)
- Amenities and features
- Images and media
- Geospatial coordinates for mapping

Booking Model:
- Host and guest data
- Pricing and date ranges
- Status tracking (pending, confirmed, completed)
- Payment details

Review Model:
- Rating and feedback
- Category-based ratings (cleanliness, communication, etc.)
- Verification status
- Booking association

Deployment:
Frontend Deployment (Vercel/Netlify)

1. Build the Project
   npm run build

2. Deploy to Vercel
   # Install Vercel CLI
npm i -g vercel
   
# Deploy
Using Render tried to deploy but partially suceeded due to technical errors i couldnt deploy

Database Deployment (MongoDB Atlas)

1. Create MongoDB Atlas Cluster
   - Register on mongodb.com/atlas
   - Create a new cluster
   - Configure database access and network access

2. Get Connection String
   - Copy connection string
   - Replace `<password>` with your database password
- Append to environment variables

3. Import Sample Data
   - Utilize MongoDB Compass or Atlas interface
   - Import sample users and properties

Testing:

Manual Testing Checklist

- User registration and login
- Property creation and editing
- Property search and filter
- Creation and management of bookings
- Submission and display of reviews
- Favorites feature
- Payment processing
- Responsive design across various devices
-  Image upload and display
-  Map integration and location selection

API Testing:

Use Postman or Thunder Client to test all endpoints:

1. Authentication Flow
   - Register new user
   - Login and receive JWT token
   - Access protected routes

2. Property Management
   - Create property with images
   - Update property details
   - Delete property

3. Booking System
- Create booking
- Update booking status
- View booking history

Performance Optimization:

- Image Optimization: Compress images automatically and resize
- Lazy Loading: Images and components load lazily
- Caching: Browser caching for static assets
- Database Indexing: Indexed queries for proper optimization
- Code Splitting: Dynamically loaded React components
- CDN Integration: Serving static assets through CDN

Development Workflow:

1. Feature Development
- Create feature branch
   - Implement functionality
   - Add tests
   - Create pull request

2. Code Quality
   - ESLint for code linting
   - Prettier for code formatting
   - Consistent naming conventions
   - Comprehensive documentation

3. Version Control
   - Semantic commit messages
   - Feature branch workflow
- Code reviews on pull requests
- Automated tests

Contributing:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Support

For support and questions:
- Open an issue in the repository
- Verify the documentation
- Inspect the API endpoints

---

Project Submission Answers

What technology stack did you select and why?

Frontend: React 19 + Vite + Tailwind CSS
- React 19: New version with enhanced performance, concurrent features, and enhanced developer experience
- Vite: Blazingly fast build tool with hot module replacement, ideal for development
- Tailwind CSS: Utility-first approach for fast UI development and uniform design

Backend: Node.js + Express + MongoDB
- Node.js: Full-stack JavaScript runtime
- Express: Light-weight, flexible web framework with great middleware ecosystem
- MongoDB: NoSQL database ideal for flexible property data and geospatial queries

Why this stack?
- Full-stack JavaScript: One language for frontend and backend
- Modern & Fast: New technologies for maximum performance
- Scalable: Architecture to accommodate growth
- Developer Experience: Great tooling and community support

Do you feel okay with developing both frontend and backend if UI is given?

Yes, I totally do! This project showcases full-stack ability:

Frontend Skills Highlighted:
- Latest React with hooks and context
- Responsive web design with Tailwind CSS
- Interactive elements (maps, sliders, forms)
- State management and API interaction
- Performance optimization

Backend Skills Highlighted:
- RESTful API design and implementation
- Database modeling and relationships
- Authentication and authorization
- File upload and processing
- Error handling and validation

Full-Stack Integration:
- Smooth frontend-backend integration
- Efficient data flow and state management
- Security deployment at all layers
- Configuration for deployment on either side

Recommend 2 innovative features you'd introduce to enhance Airbnb

1. AI-Driven Property Matching
- Machine learning algorithm that adapts to user preferences
- Customized property suggestions based on past booking
- Intelligent pricing recommendations for hosts from market data
- Automated amenity matching for guest needs

2. Community-Based Local Experiences
- Host-curated local experience bundles (tours, activities, restaurants)
- Guest-host meetup coordination for cross-cultural exchange
- Integration of local events and suggestion
- Neighborhood and area reviews by the community

Quickly describe how you'd acquire and scale the app

Security Measures:
- Authentication: JWT tokens with refresh token rotation
- Data Protection: Encryption in transit and at rest
- Input Validation**: Sanitization and validation on the server side
- **Rate Limiting:** API rate limiting to avoid abuse
- CORS: Proper handling of cross-origin requests
- HTTPS: SSL/TLS encryption on all communication

Scaling Strategy:
- Horizontal Scaling: Load balancers and more than one server instance
- Database: MongoDB Atlas with read replicas and sharding
- Caching: Redis for session storage and API response caching
- CDN: CloudFront for static assets and image serving
- Microservices: Split down to smaller, single-purpose services
- Monitoring: Application performance monitoring and logging
- Auto-scaling: Cloud-based auto-scaling on demand

Stay-Finder - Where every stay is an experience!
