import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AuthModal from '@/components/AuthModal';
import { ExpenseCategoryChart } from '@/components/charts/ExpenseCategoryChart';
import { Expense } from '@/types/expense';
import {
  BarChart3,
  Target,
  Bell,
  PieChart,
  Wallet,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const Landing = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const openLoginModal = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const openSignupModal = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  // Mock expense data for the demo chart
  const mockExpenses: Expense[] = useMemo(() => [
    {
      id: '1',
      amount: 450,
      category: 'Food',
      description: 'Groceries and dining',
      date: new Date(),
      currency: 'USD',
      user_id: 'demo'
    },
    {
      id: '2',
      amount: 320,
      category: 'Travel',
      description: 'Transportation',
      date: new Date(),
      currency: 'USD',
      user_id: 'demo'
    },
    {
      id: '3',
      amount: 180,
      category: 'Bills',
      description: 'Utilities',
      date: new Date(),
      currency: 'USD',
      user_id: 'demo'
    },
    {
      id: '4',
      amount: 280,
      category: 'Groceries',
      description: 'Weekly shopping',
      date: new Date(),
      currency: 'USD',
      user_id: 'demo'
    },
    {
      id: '5',
      amount: 120,
      category: 'Others',
      description: 'Miscellaneous',
      date: new Date(),
      currency: 'USD',
      user_id: 'demo'
    }
  ], []);

  const features = [
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Track Expenses',
      description: 'Monitor all your spending by category and date with intuitive charts and reports.'
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Budget Management',
      description: 'Create monthly budgets for each category and stay on track with real-time alerts.'
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: 'Recurring Payments',
      description: 'Never miss a bill with automatic reminders for subscriptions and recurring expenses.'
    },
    {
      icon: <PieChart className="h-6 w-6" />,
      title: 'Visual Insights',
      description: 'Understand your spending patterns with beautiful charts and analytics.'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Create Your Account',
      description: 'Sign up in seconds and start tracking your finances immediately.'
    },
    {
      number: '2',
      title: 'Add Your Transactions',
      description: 'Manually add expenses or set up recurring transactions for regular bills.'
    },
    {
      number: '3',
      title: 'Get Insights & Stay on Track',
      description: 'View detailed reports, set budgets, and receive notifications to reach your financial goals.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Wallet className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                <span className="hidden sm:inline">FinGo</span>
                <span className="sm:hidden">FinGo</span>
              </span>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                onClick={openLoginModal}
                className="hidden sm:inline-flex"
              >
                Login
              </Button>
              <Button
                onClick={openSignupModal}
                className="bg-blue-600 hover:bg-blue-700 text-base sm:text-base px-4 sm:px-4"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-8 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Track, analyze, and manage your{' '}
                <span className="text-blue-600">finances</span>
              </h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
                See expenses, budgets, and payments in one clean dashboard. Take control with powerful insights.
              </p>

              {/* CTA Buttons */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={openSignupModal}
                  className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base px-6 py-5 sm:px-8 sm:py-6 h-auto font-medium"
                >
                  <span className="hidden sm:inline">Get Started — Sign Up</span>
                  <span className="sm:hidden">Get Started Free</span>
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={openLoginModal}
                  className="text-sm sm:text-base px-6 py-5 sm:px-8 sm:py-6 h-auto font-medium"
                >
                  <span className="hidden sm:inline">Already have an account? Log in</span>
                  <span className="sm:hidden">Log in</span>
                </Button>
              </div>

              {/* Key Benefits */}
              <div className="mt-6 sm:mt-8 flex flex-row gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                  <span>100% Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                  <span>Secure & private</span>
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Preview */}
            <div className="relative mt-8 lg:mt-0">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 border border-gray-200">
                {/* Mock Dashboard */}
                <div className="space-y-3 sm:space-y-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 sm:p-3">
                      <div className="text-[10px] sm:text-xs text-blue-600 font-medium">Total</div>
                      <div className="text-sm sm:text-lg font-bold text-blue-900 mt-0.5 sm:mt-1">$2,450</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 sm:p-3">
                      <div className="text-[10px] sm:text-xs text-green-600 font-medium">Budget</div>
                      <div className="text-sm sm:text-lg font-bold text-green-900 mt-0.5 sm:mt-1">$3,000</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-2 sm:p-3">
                      <div className="text-[10px] sm:text-xs text-amber-600 font-medium">Saved</div>
                      <div className="text-sm sm:text-lg font-bold text-amber-900 mt-0.5 sm:mt-1">18%</div>
                    </div>
                  </div>

                  {/* Chart Area */}
                  <div className="bg-gray-50 rounded-lg h-40 sm:h-32">
                    <ExpenseCategoryChart expenses={mockExpenses} isCompact={true} />
                  </div>

                  {/* Category List */}
                  <div className="space-y-1.5 sm:space-y-2">
                    {['Food', 'Transport', 'Bills'].map((cat, idx) => (
                      <div key={cat} className="flex items-center justify-between p-2 sm:p-2.5 bg-gray-50 rounded">
                        <span className="text-xs sm:text-sm text-gray-700">{cat}</span>
                        <span className="text-xs sm:text-sm font-semibold text-gray-900">
                          ${[450, 320, 180][idx]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Decorative elements - hidden on mobile */}
              <div className="hidden sm:block absolute -bottom-6 -right-6 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-2xl"></div>
              <div className="hidden sm:block absolute -top-6 -left-6 w-32 h-32 bg-purple-200 rounded-full opacity-20 blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 px-4">
              Everything you need to manage your money
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 px-4">
              Powerful features to help you stay in control
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-3 sm:mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              How it works
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold mb-3 sm:mb-4 shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 px-4">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-4">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gray-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 px-4">
            Ready to take control of your finances?
          </h2>
          <Button
            size="lg"
            onClick={openSignupModal}
            className="bg-white text-blue-600 hover:bg-gray-100 text-sm sm:text-base px-6 py-5 sm:px-8 sm:py-6 h-auto font-medium"
          >
            Get Started for Free
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs sm:text-sm">
              © {new Date().getFullYear()} FinGo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </div>
  );
};

export default Landing;