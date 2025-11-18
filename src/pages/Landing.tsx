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
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Personal Finance Tracker
              </span>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={openLoginModal}
                className="hidden sm:inline-flex"
              >
                Login
              </Button>
              <Button
                onClick={openSignupModal}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Track, analyze, and manage your complete{' '}
                <span className="text-blue-600">financial picture</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
                See all your expenses, budgets, recurring payments, and savings in one clean dashboard.
                Take control of your money with powerful insights and smart reminders.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={openSignupModal}
                  className="bg-blue-600 hover:bg-blue-700 text-base px-8 py-6 h-auto"
                >
                  Get Started — Sign Up
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={openLoginModal}
                  className="text-base px-8 py-6 h-auto"
                >
                  Already have an account? Log in
                </Button>
              </div>

              {/* Key Benefits */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>100% Free</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Secure & private</span>
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Preview */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
                {/* Mock Dashboard */}
                <div className="space-y-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                      <div className="text-xs text-blue-600 font-medium">Total</div>
                      <div className="text-lg font-bold text-blue-900 mt-1">$2,450</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                      <div className="text-xs text-green-600 font-medium">Budget</div>
                      <div className="text-lg font-bold text-green-900 mt-1">$3,000</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3">
                      <div className="text-xs text-amber-600 font-medium">Saved</div>
                      <div className="text-lg font-bold text-amber-900 mt-1">18%</div>
                    </div>
                  </div>

                  {/* Chart Area - Increased height and added padding */}
                  <div className="bg-gray-50 rounded-lg h-32">
                    <ExpenseCategoryChart expenses={mockExpenses} isCompact={true} />
                  </div>

                  {/* Category List */}
                  <div className="space-y-2">
                    {['Food', 'Transport', 'Bills'].map((cat, idx) => (
                      <div key={cat} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">{cat}</span>
                        <span className="text-sm font-semibold text-gray-900">
                          ${[450, 320, 180][idx]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-purple-200 rounded-full opacity-20 blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything you need to manage your money
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Powerful features to help you stay in control of your finances
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
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
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              How it works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
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
      <section className="py-16 sm:py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to take control of your finances?
          </h2>
          <Button
            size="lg"
            onClick={openSignupModal}
            className="bg-white text-blue-600 hover:bg-gray-100 text-base px-8 py-6 h-auto"
          >
            Get Started for Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm">
              © {new Date().getFullYear()} Personal Finance Tracker. All rights reserved.
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