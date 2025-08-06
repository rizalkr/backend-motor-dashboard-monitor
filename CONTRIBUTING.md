# Contributing to Vehicle Maintenance API

Thank you for considering contributing to the Vehicle Maintenance API! We welcome contributions from the community.

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/dashboard-motor.git
   cd dashboard-motor
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up the database** (see README.md for detailed instructions)
5. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🔧 Development Setup

### Environment Setup
1. Copy `.env` and configure your database settings
2. Run database setup: `./setup-database.sh`
3. Test database connection: `npm run test-db`
4. Start development server: `npm run dev`

### Code Standards
- Follow existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Ensure proper error handling
- Write parameterized database queries

## 📝 Submitting Changes

1. **Make your changes** in your feature branch
2. **Test thoroughly**:
   ```bash
   npm run test-db    # Test database connection
   npm run check-db   # Quick database status
   ```
3. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add descriptive commit message"
   ```
4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Create a Pull Request** on GitHub

## 🐛 Reporting Issues

When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node.js version, PostgreSQL version, OS)
- Relevant error messages or logs

## 💡 Feature Requests

We welcome feature requests! Please:
- Check if the feature already exists or is planned
- Provide a clear use case and rationale
- Consider backward compatibility
- Be willing to help implement if possible

## 🔒 Security

If you discover a security vulnerability, please:
- **Do not** create a public issue
- Email the maintainers privately
- Include detailed steps to reproduce
- Allow time for the issue to be addressed before public disclosure

## 📋 Development Guidelines

### API Design
- Follow RESTful conventions
- Use consistent response formats
- Implement proper HTTP status codes
- Include comprehensive input validation
- Maintain backward compatibility

### Database
- Use parameterized queries only
- Follow existing naming conventions
- Include appropriate indexes
- Test with realistic data volumes

### Authentication & Security
- Never log sensitive information
- Use environment variables for secrets
- Implement proper access controls
- Follow security best practices

## 🎯 Areas for Contribution

- **Documentation**: Improve README, API docs, code comments
- **Testing**: Add unit tests, integration tests
- **Features**: Vehicle types, maintenance schedules, reporting
- **Security**: Security audits, vulnerability fixes
- **Performance**: Query optimization, caching
- **DevOps**: Docker support, CI/CD improvements

## ❓ Questions?

Feel free to:
- Open an issue for discussion
- Check existing issues and pull requests
- Contact the maintainers

Thank you for contributing! 🙏
