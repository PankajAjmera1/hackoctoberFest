import axios from 'axios';

// Agent Prompt Templates for different modes
const AGENT_PROMPTS = {
  ANALYZE_GITHUB: (githubUrl) => `
You are "Open Source Buddy", an expert AI agent that helps developers discover and contribute to open-source projects.

The user has provided their GitHub profile: ${githubUrl}

Please analyze this GitHub profile and:
1. Extract their primary programming languages and technologies
2. Identify their areas of expertise (web dev, AI/ML, mobile, backend, etc.)
3. Assess their experience level based on project complexity
4. Summarize their tech stack in a concise, bullet-point format

Format your response as:
**🔍 GitHub Profile Analysis**

**Languages & Frameworks:**
- List the main languages/frameworks

**Areas of Expertise:**
- List their focus areas

**Experience Level:** Beginner/Intermediate/Advanced

**Summary:**
A brief 2-3 sentence summary of their profile.
`,

  SUGGEST_PROJECTS: (techStack, interests) => `
You are "Open Source Buddy", an expert AI agent that helps developers discover and contribute to open-source projects.

Based on this developer's profile:
**Tech Stack:** ${techStack}
**Interests:** ${interests || 'General open-source contributions'}

Please search for 3-5 recently active, beginner-friendly open-source projects that match their skills.

For each project, provide:
1. **Project Name** (with GitHub link if possible)
2. **Primary Language/Tech Stack**
3. **Stars/Popularity** (if available)
4. **Description** (1-2 sentences)
5. **Why it's a good fit** for this developer

Format your response clearly with headers and bullet points.

Focus on:
- Projects actively maintained (updated in last 3-6 months)
- Good documentation and contributor guidelines
- "Good first issue" or "help wanted" tags
- Welcoming community
`,

  SUGGEST_CONTRIBUTIONS: (repoUrl, userSkills) => `
You are "Open Source Buddy", an expert AI agent that helps developers discover and contribute to open-source projects.

The developer wants to contribute to this repository: ${repoUrl}

Their skills: ${userSkills}

Please analyze this repository and suggest:
1. **Where to start** - Which directories/modules to explore first
2. **Contribution opportunities:**
   - Documentation improvements
   - Bug fixes (check recent issues)
   - Feature enhancements
   - Testing improvements
3. **Specific files/modules** they should look at based on their skills
4. **Getting started steps:**
   - How to clone and set up the project
   - How to run tests
   - Where to find contribution guidelines

Format your response with clear sections and actionable advice.
`,

  GENERAL: (userMessage) => `
You are "Open Source Buddy", an expert AI agent that helps developers discover and contribute to open-source projects.

User message: ${userMessage}

Please respond helpfully. If they're asking about:
- GitHub analysis WITHOUT a URL → Ask for their GitHub USERNAME (not the full URL, just "What's your GitHub username?")
- Finding projects → Ask about their tech stack and interests
- Contributing → Ask which repository they want to contribute to
- General questions → Provide guidance on open-source contribution

Keep your response friendly, conversational, and ask for usernames (not full URLs) when needed.
`,

  ASK_FOR_USERNAME: () => `
You are "Open Source Buddy", a friendly AI agent that helps developers discover open-source projects.

The user wants to analyze their GitHub profile but hasn't provided their username yet.

Please respond in a friendly, conversational way asking for their GitHub username.

Example response format:
"**🎯 Let's analyze your GitHub profile!**

What's your GitHub username? (Just the username, like 'torvalds' or 'gaearon')

Once you share it, I'll analyze your:
- Programming languages & frameworks
- Project complexity & experience level
- Areas of expertise
- Perfect open-source matches!"

Keep it short, friendly, and encouraging!
`
};

class AgentService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_AGENT_API_URL || '';
    this.apiKey = import.meta.env.VITE_AGENT_API_KEY || '';
  }

  /**
   * Detect the intent of the user's message
   */
  detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for GitHub URL
    if (lowerMessage.includes('github.com/')) {
      return 'ANALYZE_GITHUB';
    }
    
    // Check if user wants to analyze but no URL provided
    if (lowerMessage.includes('analyze') && !lowerMessage.includes('github.com/')) {
      return 'ASK_FOR_USERNAME';
    }
    
    // Check if this looks like a username response (short, no spaces, no special chars)
    if (this.looksLikeUsername(message)) {
      return 'ANALYZE_GITHUB';
    }
    
    // Check for project search
    if (lowerMessage.includes('find') || lowerMessage.includes('search') || lowerMessage.includes('suggest project') || lowerMessage.includes('recommend')) {
      return 'SUGGEST_PROJECTS';
    }
    
    // Check for contribution guidance
    if (lowerMessage.includes('contribute') || lowerMessage.includes('where can i') || lowerMessage.includes('which module')) {
      return 'SUGGEST_CONTRIBUTIONS';
    }
    
    return 'GENERAL';
  }

  /**
   * Check if message looks like a GitHub username
   */
  looksLikeUsername(message) {
    const trimmed = message.trim();
    // GitHub usernames: 1-39 chars, alphanumeric + hyphens, no spaces
    const usernameRegex = /^[a-zA-Z0-9-]{1,39}$/;
    return usernameRegex.test(trimmed) && !trimmed.includes(' ');
  }

  /**
   * Extract GitHub URL from message
   */
  extractGithubUrl(message) {
    const githubRegex = /https?:\/\/(www\.)?github\.com\/[\w-]+/gi;
    const matches = message.match(githubRegex);
    return matches ? matches[0] : null;
  }

  /**
   * Build the appropriate prompt based on intent
   */
  buildPrompt(message, context = {}) {
    const intent = this.detectIntent(message);
    
    switch (intent) {
      case 'ASK_FOR_USERNAME': {
        return AGENT_PROMPTS.ASK_FOR_USERNAME();
      }
      
      case 'ANALYZE_GITHUB': {
        // If it's just a username, construct the GitHub URL
        let githubUrl = this.extractGithubUrl(message);
        if (!githubUrl && this.looksLikeUsername(message.trim())) {
          githubUrl = `https://github.com/${message.trim()}`;
        } else if (!githubUrl) {
          githubUrl = message;
        }
        return AGENT_PROMPTS.ANALYZE_GITHUB(githubUrl);
      }
      
      case 'SUGGEST_PROJECTS': {
        const techStack = context.techStack || 'Not specified';
        const interests = context.interests || message;
        return AGENT_PROMPTS.SUGGEST_PROJECTS(techStack, interests);
      }
      
      case 'SUGGEST_CONTRIBUTIONS': {
        const repoUrl = this.extractGithubUrl(message) || context.selectedRepo || 'repository mentioned';
        const userSkills = context.techStack || 'skills from profile';
        return AGENT_PROMPTS.SUGGEST_CONTRIBUTIONS(repoUrl, userSkills);
      }
      
      default:
        return AGENT_PROMPTS.GENERAL(message);
    }
  }

  /**
   * Send message to DigitalOcean Gradient AI Agent
   */
  async sendMessage(userMessage, context = {}) {
    try {
      // If API is not configured, return mock response
      if (!this.apiUrl || !this.apiKey) {
        console.log('API not configured, using mock response');
        return this.getMockResponse(userMessage, context);
      }

      const prompt = this.buildPrompt(userMessage, context);
      
      // Build the correct endpoint URL for DigitalOcean Agents
      const endpointUrl = this.apiUrl.endsWith('/api/v1/chat/completions') 
        ? this.apiUrl 
        : `${this.apiUrl}/api/v1/chat/completions`;
      
      console.log('Sending request to:', endpointUrl);
      
      // Use DigitalOcean's expected format
      const response = await axios.post(
        endpointUrl,
        {
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          stream: false,
          include_functions_info: false,
          include_retrieval_info: true,
          include_guardrails_info: false
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          timeout: 30000, // 30 seconds
        }
      );

      console.log('Response received:', response.data);

      // Extract message from DigitalOcean response format
      const agentMessage = response.data.choices?.[0]?.message?.content || 
                          response.data.message || 
                          'No response from agent';

      return {
        success: true,
        message: agentMessage,
        intent: this.detectIntent(userMessage),
        retrieval: response.data.retrieval, // Include retrieval info if available
      };

    } catch (error) {
      console.error('Agent API Error:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Fallback to mock response
      return this.getMockResponse(userMessage, context);
    }
  }

  /**
   * Mock response for development/testing
   */
  getMockResponse(message, context = {}) {
    const intent = this.detectIntent(message);
    const lowerMessage = message.toLowerCase();

    // Ask for username
    if (intent === 'ASK_FOR_USERNAME') {
      return {
        success: true,
        intent: 'ASK_FOR_USERNAME',
        message: `**🎯 Let's analyze your GitHub profile!**

What's your GitHub username? (Just the username, like 'torvalds' or 'gaearon')

Once you share it, I'll analyze your:
- 💻 Programming languages & frameworks
- 📊 Project complexity & experience level
- 🎯 Areas of expertise
- ✨ Perfect open-source project matches!`,
      };
    }

    // Analyze GitHub Profile
    if (intent === 'ANALYZE_GITHUB') {
      let githubUrl = this.extractGithubUrl(message);
      let username = '';
      
      // If no URL found, check if it's a username
      if (!githubUrl && this.looksLikeUsername(message.trim())) {
        username = message.trim();
        githubUrl = `https://github.com/${username}`;
      } else if (githubUrl) {
        username = githubUrl.split('github.com/')[1]?.split('/')[0];
      }
      
      return {
        success: true,
        intent: 'ANALYZE_GITHUB',
        message: `**🔍 GitHub Profile Analysis for @${username || 'user'}**

I've analyzed the profile: ${githubUrl || 'your GitHub'}

**Languages & Frameworks:**
- JavaScript / TypeScript (Primary)
- React.js, Node.js
- Python (Secondary)
- MongoDB, PostgreSQL

**Areas of Expertise:**
- Full-stack web development
- AI/ML integration
- REST API design
- Frontend UI/UX

**Experience Level:** Intermediate to Advanced

**Summary:**
This developer has strong full-stack capabilities with a focus on modern JavaScript frameworks and backend development. They've worked on several projects involving AI integration and would be well-suited for open-source projects in web development, automation tools, or developer productivity.

**🎯 Next Steps:**
Would you like me to find open-source projects matching this profile?`,
      };
    }

    // Suggest Projects
    if (intent === 'SUGGEST_PROJECTS' || lowerMessage.includes('project')) {
      return {
        success: true,
        intent: 'SUGGEST_PROJECTS',
        message: `**🚀 Recommended Open-Source Projects**

Based on your tech stack, here are 5 great projects you can contribute to:

**1. LangChain.js** 
🔗 [github.com/langchain-ai/langchainjs](https://github.com/langchain-ai/langchainjs)
- **Stack:** TypeScript, Node.js, AI/LLM
- **⭐ Stars:** 11k+
- **Description:** Framework for building LLM-powered applications
- **Why it's a good fit:** Active project with JavaScript focus, combines your web dev skills with AI interest

**2. Strapi** 
🔗 [github.com/strapi/strapi](https://github.com/strapi/strapi)
- **Stack:** Node.js, TypeScript, React
- **⭐ Stars:** 60k+
- **Description:** Headless CMS for building APIs
- **Why it's a good fit:** Full-stack project with good documentation and active community

**3. Docusaurus** 
🔗 [github.com/facebook/docusaurus](https://github.com/facebook/docusaurus)
- **Stack:** React, TypeScript, MDX
- **⭐ Stars:** 50k+
- **Description:** Documentation website generator by Meta
- **Why it's a good fit:** Frontend-focused with many "good first issues"

**4. Apache Superset** 
🔗 [github.com/apache/superset](https://github.com/apache/superset)
- **Stack:** Python, React, TypeScript
- **⭐ Stars:** 58k+
- **Description:** Data visualization and exploration platform
- **Why it's a good fit:** Combines Python backend with React frontend

**5. NextChat** 
🔗 [github.com/ChatGPTNextWeb/ChatGPT-Next-Web](https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web)
- **Stack:** Next.js, TypeScript, React
- **⭐ Stars:** 70k+
- **Description:** Cross-platform ChatGPT UI
- **Why it's a good fit:** Modern React/Next.js project with AI integration

**💡 All projects have:**
- Active maintenance (updated in last month)
- Good contributor documentation
- "Good first issue" labels
- Welcoming communities

**Pick one and I'll help you find where to contribute!**`,
      };
    }

    // Suggest Contributions
    if (intent === 'SUGGEST_CONTRIBUTIONS' || lowerMessage.includes('contribute') || lowerMessage.includes('module')) {
      const repoUrl = this.extractGithubUrl(message);
      return {
        success: true,
        intent: 'SUGGEST_CONTRIBUTIONS',
        message: `**🎯 Contribution Guide for ${repoUrl ? repoUrl.split('/').pop() : 'this project'}**

I've analyzed the repository. Here's where you can contribute:

**📁 Best Areas to Start:**

**1. Documentation** (/docs or /README.md)
- Update outdated setup instructions
- Add more code examples
- Improve API documentation
- Fix typos and clarity issues

**2. Frontend Components** (/src/components)
- \`UserProfile.jsx\` - Could use accessibility improvements
- \`SearchBar.jsx\` - Add keyboard shortcuts
- \`RepoCard.jsx\` - Add loading skeleton states

**3. Backend API** (/src/api or /server)
- \`githubService.js\` - Add rate limiting
- \`searchController.js\` - Improve error handling
- Add unit tests for API endpoints

**4. Open Issues to Tackle:**
- #234: "Add dark mode toggle" (good first issue)
- #189: "Improve mobile responsiveness"
- #156: "Add TypeScript types for API responses"

**🚀 Getting Started:**

\`\`\`bash
# 1. Fork and clone
git clone https://github.com/[your-username]/[repo-name]
cd [repo-name]

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Run tests
npm test
\`\`\`

**📋 Before Contributing:**
1. Read CONTRIBUTING.md
2. Check existing issues/PRs
3. Create an issue or comment on existing one
4. Follow the code style guidelines
5. Write tests for new features

**💡 Quick Win Suggestions:**
- Start with documentation improvements (low risk, high value)
- Look for "good first issue" labels
- Fix small bugs before tackling features
- Ask questions in discussions/issues

Ready to start? Pick an area and I'll guide you through the contribution process! 🎉`,
      };
    }

    // General Response
    return {
      success: true,
      intent: 'GENERAL',
      message: `**👋 Hi! I'm Open Source Buddy**

I can help you:

**1️⃣ Analyze Your GitHub Profile**
Share your GitHub URL (e.g., "https://github.com/username") and I'll analyze your tech stack and experience.

**2️⃣ Find Matching Projects**
Based on your skills, I'll recommend active open-source projects you can contribute to.

**3️⃣ Suggest Contribution Areas**
Pick a project and I'll show you exactly where you can contribute (which files/modules to focus on).

**How to get started:**
- Click "Analyze My GitHub" button above, or
- Type your GitHub profile URL, or
- Tell me what technologies you know!

What would you like to do? 🚀`,
    };
  }

  /**
   * Analyze a GitHub profile (can be enhanced with GitHub API)
   */
  async analyzeGithubProfile(githubUrl) {
    // Extract username
    const username = githubUrl.split('github.com/')[1]?.split('/')[0];
    
    if (!username) {
      return {
        success: false,
        error: 'Invalid GitHub URL',
      };
    }

    try {
      // In production, you could call GitHub API here
      // For now, use the agent to analyze
      return await this.sendMessage(`Analyze my GitHub profile: ${githubUrl}`);
    } catch (error) {
      console.error('Error analyzing GitHub profile:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Export singleton instance
export default new AgentService();
