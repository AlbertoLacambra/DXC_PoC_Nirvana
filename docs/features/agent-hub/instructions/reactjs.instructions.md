---
description: 'ReactJS development standards and best practices'
applyTo: '**/*.jsx, **/*.tsx, **/*.js, **/*.ts, **/*.css, **/*.scss'
---

# ReactJS Development Standards

## Project Context

- Latest React version (React 19+)
- TypeScript for type safety (when applicable)
- Functional components with hooks as default
- Follow React's official style guide and best practices
- Modern build tools (Vite, Create React App, or custom Webpack)
- Proper component composition and reusability patterns

## Architecture

- Use functional components with hooks as primary pattern
- Implement component composition over inheritance
- Organize components by feature or domain for scalability
- Separate presentational and container components clearly
- Use custom hooks for reusable stateful logic
- Implement proper component hierarchies with clear data flow

## TypeScript Integration

- Use TypeScript interfaces for props, state, and component definitions
- Define proper types for event handlers and refs
- Implement generic components where appropriate
- Use strict mode in `tsconfig.json` for type safety
- Leverage React's built-in types (`React.FC`, `React.ComponentProps`, etc.)
- Create union types for component variants and states

## Component Design

- Follow single responsibility principle for components
- Use descriptive and consistent naming conventions
- Implement proper prop validation with TypeScript or PropTypes
- Design components to be testable and reusable
- Keep components small and focused on single concern
- Use composition patterns (render props, children as functions)

**Example**:
```tsx
interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  onEdit?: (userId: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {onEdit && (
        <button onClick={() => onEdit(user.id)}>Edit</button>
      )}
    </div>
  );
};
```

## State Management

- Use `useState` for local component state
- Implement `useReducer` for complex state logic
- Leverage `useContext` for sharing state across component trees
- Consider external state management (Redux Toolkit, Zustand) for complex apps
- Implement proper state normalization and data structures
- Use React Query or SWR for server state management

## Hooks and Effects

- Use `useEffect` with proper dependency arrays to avoid infinite loops
- Implement cleanup functions in effects to prevent memory leaks
- Use `useMemo` and `useCallback` for performance optimization when needed
- Create custom hooks for reusable stateful logic
- Follow rules of hooks (only call at top level)
- Use `useRef` for accessing DOM elements and storing mutable values

**Example**:
```tsx
function useUserData(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      try {
        const data = await fetch(`/api/users/${userId}`).then(r => r.json());
        if (!cancelled) {
          setUser(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { user, loading, error };
}
```

## Styling

- Use CSS Modules, Styled Components, or modern CSS-in-JS solutions
- Implement responsive design with mobile-first approach
- Follow BEM methodology or similar naming conventions for CSS classes
- Use CSS custom properties (variables) for theming
- Implement consistent spacing, typography, and color systems
- Ensure accessibility with proper ARIA attributes and semantic HTML

## Performance Optimization

- Use `React.memo` for component memoization when appropriate
- Implement code splitting with `React.lazy` and `Suspense`
- Optimize bundle size with tree shaking and dynamic imports
- Use `useMemo` and `useCallback` judiciously to prevent unnecessary re-renders
- Implement virtual scrolling for large lists
- Profile components with React DevTools to identify bottlenecks

## Data Fetching

- Use modern data fetching libraries (React Query, SWR, Apollo Client)
- Implement proper loading, error, and success states
- Handle race conditions and request cancellation
- Use optimistic updates for better UX
- Implement proper caching strategies
- Handle offline scenarios and network errors gracefully

## Error Handling

- Implement Error Boundaries for component-level error handling
- Use proper error states in data fetching
- Implement fallback UI for error scenarios
- Log errors appropriately for debugging
- Handle async errors in effects and event handlers
- Provide meaningful error messages to users

**Example**:
```tsx
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please try again.</div>;
    }

    return this.props.children;
  }
}
```

## Forms and Validation

- Use controlled components for form inputs
- Implement proper form validation with libraries (Formik, React Hook Form)
- Handle form submission and error states appropriately
- Implement accessibility features for forms (labels, ARIA attributes)
- Use debounced validation for better UX
- Handle file uploads and complex form scenarios

## Routing

- Use React Router for client-side routing
- Implement nested routes and route protection
- Handle route parameters and query strings properly
- Implement lazy loading for route-based code splitting
- Use proper navigation patterns and back button handling
- Implement breadcrumbs and navigation state management

## Testing

- Write unit tests for components using React Testing Library
- Test component behavior, not implementation details
- Use Jest for test runner and assertion library
- Implement integration tests for complex component interactions
- Mock external dependencies and API calls appropriately
- Test accessibility features and keyboard navigation

## Security

- Sanitize user inputs to prevent XSS attacks
- Validate and escape data before rendering
- Use HTTPS for all external API calls
- Implement proper authentication and authorization patterns
- Avoid storing sensitive data in localStorage or sessionStorage
- Use Content Security Policy (CSP) headers

## Accessibility

- Use semantic HTML elements appropriately
- Implement proper ARIA attributes and roles
- Ensure keyboard navigation works for all interactive elements
- Provide alt text for images and descriptive text for icons
- Implement proper color contrast ratios
- Test with screen readers and accessibility tools

## Common Patterns

- Higher-Order Components (HOCs) for cross-cutting concerns
- Render props pattern for component composition
- Compound components for related functionality
- Provider pattern for context-based state sharing
- Container/Presentational component separation
- Custom hooks for reusable logic extraction

---

**Source**: [ReactJS Instructions - awesome-copilot](https://github.com/github/awesome-copilot/blob/main/instructions/reactjs.instructions.md)
