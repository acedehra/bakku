# Bakku

A powerful, modern desktop HTTP client built with Tauri and React, designed for developers who need a fast, efficient alternative to web-based API clients.

## Features

### Core Functionality
- **Full HTTP Method Support**: GET, POST, PUT, DELETE, PATCH, HEAD requests
- **Dynamic Request Builder**: Intuitive interface for building complex HTTP requests
- **Query Parameters**: Easy management of URL query parameters
- **Custom Headers**: Add, edit, and remove request headers
- **Request Body**: Support for JSON request bodies with auto-formatting
- **Multiple Authentication Methods**:
  - Basic Auth with secure encoding
  - Bearer Token authentication
  - Custom header-based authentication

### Advanced Features
- **Environment Management**: Create and manage multiple environments (Development, Staging, Production, etc.)
- **Variable Substitution**: Use `{{variable}}` syntax to inject environment variables into requests
- **Request History**: Automatically saved history with ability to replay requests
- **Response Formatting**: Automatic JSON formatting and syntax highlighting
- **Performance Metrics**: View request timing and response size
- **Dark Mode**: Built-in dark theme for comfortable usage in low-light environments

### Security & Quality
- **Content Security Policy**: CSP enabled for secure HTTP requests
- **Input Validation**: Comprehensive validation for URLs, headers, and authentication
- **Error Handling**: User-friendly error messages with detailed diagnostics
- **Request Caching**: Optional caching for GET requests to improve performance
- **Performance Monitoring**: Built-in performance tracking for optimization insights

## Installation

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **Bun**: 1.0.0 or higher (recommended package manager)
- **Rust**: 1.70.0 or higher (for Tauri)
- **System Dependencies**:
  - **Linux**: `libwebkit2gtk-4.0-dev`, `build-essential`, `curl`, `wget`, `file`, `libssl-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`
  - **Windows**: Microsoft Visual C++ Redistributable
  - **macOS**: Xcode Command Line Tools

### From Source

```bash
# Clone the repository
git clone https://github.com/acedehra/bakku.git
cd bakku

# Install dependencies
bun install

# Run in development mode
bun run dev

# Build for production
bun run build
```

On Linux

```
__NV_DISABLE_EXPLICIT_SYNC=1 bun run tauri dev
```

### Pre-built Binaries

Download the latest release from the [GitHub Releases](https://github.com/acedehra/bakku/releases) page for your platform:

- **macOS**: `.dmg` file for Intel and Apple Silicon
- **Windows**: `.msi` or `.exe` installer
- **Linux**: `.deb` or `.AppImage` package

## Configuration

### Environment Variables

Create a `.env` file in the root directory (see `.env.example` for reference):

```env
# API Configuration (if using backend API)
VITE_API_URL=http://localhost:3000

# Feature Flags
VITE_ENABLE_REQUEST_CACHING=true
VITE_CACHE_TTL_MS=300000
VITE_ENABLE_PERFORMANCE_MONITORING=true

# Storage Limits
VITE_MAX_HISTORY_ITEMS=100
VITE_MAX_ENVIRONMENTS=50
VITE_MAX_VARIABLES_PER_ENV=100

# Development Settings
VITE_DEV_MODE=true
VITE_LOG_LEVEL=debug
```

### Application Settings

The application supports various settings that can be configured through the UI:

- **Theme**: Dark mode (default) with potential light mode support
- **Panel Layout**: Adjustable panel widths with drag handles
- **History Management**: Control history persistence and size limits
- **Environment Defaults**: Set default environment for new requests

## Usage

### Making a Request

1. **Enter URL**: Type your API endpoint URL in the URL input field
2. **Select Method**: Choose the HTTP method (GET, POST, PUT, etc.)
3. **Add Parameters**: Use the Query Parameters tab to add URL parameters
4. **Add Headers**: Use the Headers tab to add custom headers
5. **Configure Body**: For POST/PUT requests, add JSON body in the Body tab
6. **Set Authentication**: Configure authentication in the Auth tab
7. **Send Request**: Click the Send button or press `Ctrl/Cmd + Enter`

### Working with Environments

1. **Open Environment Manager**: Click the environment dropdown and select "Manage"
2. **Create Environment**: Click "Add Environment" and give it a name
3. **Add Variables**: Add key-value pairs for your environment variables
4. **Use Variables**: Reference variables in your requests using `{{variable_name}}` syntax
5. **Switch Environments**: Select the active environment from the dropdown

### Request History

- **View History**: All requests are automatically saved in the History sidebar
- **Replay Requests**: Click any history item to load it into the request builder
- **Search History**: Use the search box to filter by URL or method
- **Clear History**: Delete individual items or clear all history

## Development

### Project Structure

```
bakku/
├── src/                    # Frontend React source
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── config/            # Configuration files
│   └── test/              # Test setup and mocks
├── src-tauri/            # Tauri backend (Rust)
├── public/                # Static assets
├── vitest.config.ts       # Vitest testing configuration
├── eslint.config.js       # ESLint configuration
├── .prettierrc           # Prettier configuration
└── package.json          # Node.js dependencies
```

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run tests with UI
bun run test:ui

# Generate coverage report
bun run test:coverage
```

### Code Quality

```bash
# Run ESLint
bun run lint

# Fix ESLint errors automatically
bun run lint:fix

# Check formatting with Prettier
bun run format:check

# Format code with Prettier
bun run format
```

### Building for Production

```bash
# Build for current platform
bun run tauri build

# Build for specific platforms
bun run tauri build --target dmg    # macOS
bun run tauri build --target msi     # Windows
bun run tauri build --target deb     # Linux

# Build for development (debug)
bun run tauri build --debug
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report bugs, and suggest features.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`bun test && bun run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- **TypeScript**: Strict TypeScript enabled
- **React**: Functional components with hooks
- **Formatting**: Prettier with project configuration
- **Linting**: ESLint with React and TypeScript rules
- **Testing**: Vitest with @testing-library/react

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and changes.

## Support

- **GitHub Issues**: [Report bugs and request features](https://github.com/acedehra/bakku/issues)
- **Discussions**: [Ask questions and share ideas](https://github.com/acedehra/bakku/discussions)
- **Documentation**: [Full documentation](https://github.com/acedehra/bakku/wiki)

## Roadmap

### Upcoming Features

- [ ] Import/Export functionality for environments and history
- [ ] Collection management for organizing requests
- [ ] Response validation and assertions
- [ ] WebSocket support
- [ ] GraphQL query builder
- [ ] Custom themes
- [ ] Request chaining
- [ ] Test runner for multiple requests
- [ ] Code generation for cURL, fetch, etc.
- [ ] Proxy configuration
- [ ] Certificate management

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Tauri](https://tauri.app/) for desktop app framework
- [React](https://react.dev/) for UI framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Radix UI](https://www.radix-ui.com/) for UI components
- [Lucide Icons](https://lucide.dev/) for iconography

## Links

- **Website**: [https://bakku.app](https://bakku.app)
- **Repository**: [https://github.com/acedehra/bakku](https://github.com/acedehra/bakku)
- **Documentation**: [https://docs.bakku.app](https://docs.bakku.app)
- **Twitter**: [@bakku_app](https://twitter.com/bakku_app)

---

**Note**: This is an actively developed project. Features and APIs may change as we approach the 1.0 release.
