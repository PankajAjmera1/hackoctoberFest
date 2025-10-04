import { Github, Sparkles, Target, Rocket } from 'lucide-react';

const WelcomeScreen = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6">
            <Github className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Open Source Buddy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            AI-powered assistant to find and contribute to open-source projects
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
              Analyze Your Profile
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              We analyze your GitHub to understand your tech stack and expertise
            </p>
          </div>

          <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mb-4">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
              Find Perfect Projects
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              AI suggests active repos that match your skills and interests
            </p>
          </div>

          <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg mb-4">
              <Rocket className="w-6 h-6 text-pink-600 dark:text-pink-300" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
              Start Contributing
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Get guidance on which files, modules, and issues to tackle first
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            Get Started →
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Powered by DigitalOcean Gradient AI
          </p>
        </div>

        {/* Tech Stack */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-600">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
            Built with
          </p>
          <div className="flex justify-center items-center space-x-6 text-xs text-gray-600 dark:text-gray-300">
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">React</span>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">Vite</span>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">TailwindCSS</span>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">AI Agent</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
