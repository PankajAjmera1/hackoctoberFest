# Contributing to Open Source Buddy

First off, thank you for considering contributing to Open Source Buddy! 🎉

It's people like you that make Open Source Buddy such a great tool for the community.

## 🌟 How Can I Contribute?

### Reporting Bugs 🐛

Before creating bug reports, please check the existing issues to avoid duplicates.

**When creating a bug report, include:**
- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior** vs **actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, Node version, browser)

**Example:**
```markdown
**Bug:** Dark mode toggle not working on mobile

**Steps to Reproduce:**
1. Open app on mobile device
2. Toggle dark mode switch
3. Nothing happens

**Expected:** Dark mode should activate
**Actual:** Stays in light mode

**Environment:** iPhone 12, iOS 17, Safari
```

### Suggesting Features 💡

Feature suggestions are welcome! Please:
- **Check existing feature requests** first
- **Explain the use case** clearly
- **Describe the proposed solution**
- **List alternatives** you've considered

### Pull Requests 🔧

We actively welcome your pull requests!

**Process:**
1. Fork the repo and create your branch from `main`
2. Make your changes
3. Test your changes thoroughly
4. Update documentation if needed
5. Ensure your code follows the style guidelines
6. Submit a pull request!

## 🛠️ Development Setup

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm 9+ or yarn
- Git

### Setup Steps

```bash
# 1. Fork and clone
git clone https://github.com/your-username/open-source-buddy.git
cd open-source-buddy

# 2. Install dependencies
npm install

# 3. Create .env file (optional - works in demo mode)
cp .env.example .env

# 4. Start development server
npm run dev

# 5. Open browser
# Navigate to http://localhost:5173/
```

### Project Structure
```
src/
├── components/         # React components
├── services/          # API services and business logic
├── App.jsx           # Root component
├── App.css          # Custom styles
└── main.jsx         # Entry point
```

## 🧪 Testing Your Changes

### Manual Testing Checklist

Before submitting a PR, test these scenarios:

**Basic Functionality:**
- [ ] App loads without errors
- [ ] Development server starts successfully
- [ ] All buttons are clickable
- [ ] Input field accepts text

**GitHub Analysis:**
- [ ] Click "Analyze My GitHub" button
- [ ] Enter username → Bot asks for username
- [ ] Enter full URL → Bot analyzes directly
- [ ] Type just username (e.g., "torvalds") → Bot recognizes it
- [ ] Bot shows formatted response with markdown

**Project Recommendations:**
- [ ] Click "Find Projects" button
- [ ] Bot shows 3-5 project recommendations
- [ ] Project links are clickable
- [ ] Markdown formatting is correct

**Contribution Guidance:**
- [ ] Ask about contributing to a specific repo
- [ ] Bot provides specific guidance
- [ ] Code blocks are properly formatted

**Suggested Prompts:**
- [ ] Suggestions appear after bot responses
- [ ] Suggestions change based on context
- [ ] Clicking suggestion sends query or populates input
- [ ] Only last message shows suggestions

**UI/UX:**
- [ ] Dark mode works (toggle system settings)
- [ ] Mobile responsive (resize browser to < 640px)
- [ ] Animations are smooth
- [ ] No visual glitches or layout issues

**Edge Cases:**
- [ ] Empty input doesn't send
- [ ] Long messages don't break layout
- [ ] API errors show graceful fallback
- [ ] Works without API key (mock mode)

### Running Tests

```bash
# Lint code
npm run lint

# Build for production (check for errors)
npm run build

# Preview production build
npm run preview
```

## 🎨 Code Style Guidelines

### JavaScript/JSX
- Use **functional components** with hooks
- Use **arrow functions** for consistency
- Use **async/await** instead of promises
- Add **JSDoc comments** for complex functions

**Good:**
```javascript
/**
 * Detects the intent of the user's message
 * @param {string} message - User's input message
 * @returns {string} Intent type (ANALYZE_GITHUB, SUGGEST_PROJECTS, etc.)
 */
const detectIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('github.com/')) {
    return 'ANALYZE_GITHUB';
  }
  
  return 'GENERAL';
};
```

### CSS/Styling
- Use **TailwindCSS classes** primarily
- Custom CSS only when Tailwind isn't sufficient
- Follow **mobile-first** approach
- Support **dark mode** with `dark:` variants

**Good:**
```jsx
<button className="
  px-4 py-2 
  bg-blue-500 hover:bg-blue-600 
  dark:bg-blue-600 dark:hover:bg-blue-700
  rounded-lg 
  transition-colors
">
  Click Me
</button>
```

### File Organization
- One component per file
- Name files with PascalCase for components (`ChatInterface.jsx`)
- Name files with camelCase for utilities (`agentService.js`)
- Keep files under 300 lines (split if larger)

### Commit Messages
Use clear, descriptive commit messages:

**Good:**
```
feat: Add context-aware suggested prompts
fix: Resolve dark mode toggle issue on mobile
docs: Update README with deployment instructions
style: Format code with Prettier
refactor: Extract username validation to helper function
```

**Format:**
```
<type>: <short description>

<optional longer description>

<optional footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## 🔀 Pull Request Process

### Before Submitting
1. ✅ Test all functionality manually
2. ✅ Run `npm run build` successfully
3. ✅ Update documentation if needed
4. ✅ Add screenshots/GIFs for UI changes
5. ✅ Write clear commit messages

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Works in demo mode (no API)
- [ ] Works with DigitalOcean API
- [ ] Mobile responsive
- [ ] Dark mode compatible

## Screenshots
[Add screenshots if UI changes]

## Related Issues
Closes #123
```

### After Submitting
- Respond to review comments promptly
- Make requested changes
- Keep PR scope focused (one feature/fix per PR)
- Be patient and respectful

## 🚀 Feature Development Workflow

### 1. Plan
- Discuss in GitHub Issues first
- Get feedback on approach
- Break down into smaller tasks

### 2. Develop
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
# Commit frequently with clear messages

# Keep branch updated
git fetch origin
git rebase origin/main
```

### 3. Test
- Test all user flows
- Test edge cases
- Test on different screen sizes
- Test in dark mode

### 4. Document
- Update README if needed
- Add JSDoc comments
- Update CHANGELOG (if exists)

### 5. Submit
- Push branch
- Create pull request
- Add detailed description
- Link related issues

## 📝 Documentation Guidelines

### Code Comments
- Explain **why**, not **what**
- Add comments for complex logic
- Use JSDoc for functions

**Good:**
```javascript
// Extract GitHub URL or construct from username
// This supports both "torvalds" and "https://github.com/torvalds" formats
const githubUrl = this.extractGithubUrl(message) || 
                  `https://github.com/${message.trim()}`;
```

### README Updates
- Keep setup instructions current
- Add new features to feature list
- Update screenshots/GIFs when UI changes
- Maintain consistent formatting

## 🤝 Community Guidelines

### Be Respectful
- Use welcoming and inclusive language
- Respect differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community

### Be Collaborative
- Help others with issues
- Review pull requests
- Share knowledge
- Celebrate successes

### Be Professional
- Keep discussions on-topic
- Avoid personal attacks
- Assume good intentions
- Be patient with newcomers

## ❓ Questions?

- **General questions:** Use [GitHub Discussions](https://github.com/yourusername/open-source-buddy/discussions)
- **Bug reports:** Use [GitHub Issues](https://github.com/yourusername/open-source-buddy/issues)
- **Feature requests:** Use [GitHub Issues](https://github.com/yourusername/open-source-buddy/issues) with "enhancement" label
- **Security issues:** Email directly (see README)

## 🎉 Recognition

Contributors will be:
- Listed in README acknowledgments
- Thanked in release notes
- Celebrated in project updates

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for making Open Source Buddy better! 🚀**

Every contribution, no matter how small, makes a difference!
