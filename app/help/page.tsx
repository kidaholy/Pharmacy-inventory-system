'use client';

import { useState, useEffect } from 'react';
import { auth } from '../../lib/auth';
import { User } from '../../lib/database';
import Link from 'next/link';

export default function HelpPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('getting-started');

  useEffect(() => {
    const currentUser = auth.requireAuth();
    if (!currentUser) {
      return;
    }

    setUser(currentUser);
    setLoading(false);
  }, []);

  const helpSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Welcome to PharmaTrack</h3>
          <p className="text-gray-600">
            PharmaTrack is a comprehensive pharmacy management system designed to help you manage your pharmacy operations efficiently.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Quick Start Guide:</h4>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Navigate to Inventory to manage your medicine stock</li>
              <li>Use Prescriptions to handle patient orders</li>
              <li>Check Patients section for customer management</li>
              <li>View Reports for business analytics</li>
              <li>Configure Settings for your pharmacy details</li>
            </ol>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">📊 Dashboard</h4>
              <p className="text-sm text-gray-600">
                Your main hub showing key metrics, quick stats, and navigation to all system features.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">💊 Inventory</h4>
              <p className="text-sm text-gray-600">
                Manage medicine stock, track quantities, monitor expiry dates, and receive low stock alerts.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'inventory',
      title: 'Inventory Management',
      icon: '💊',
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Managing Your Inventory</h3>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900">Adding New Medicines</h4>
              <p className="text-gray-600">Click the "Add Medicine" button to add new items to your inventory. Fill in all required details including name, category, stock quantity, and supplier information.</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-900">Stock Monitoring</h4>
              <p className="text-gray-600">The system automatically tracks stock levels and alerts you when items fall below minimum thresholds. Low stock items are highlighted in red.</p>
            </div>
            
            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-semibold text-gray-900">Expiry Date Tracking</h4>
              <p className="text-gray-600">Monitor expiry dates to prevent dispensing expired medicines. The system shows expiry dates for all items in your inventory.</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">💡 Pro Tips:</h4>
            <ul className="list-disc list-inside space-y-1 text-yellow-800">
              <li>Use the search function to quickly find specific medicines</li>
              <li>Filter by category to organize your inventory view</li>
              <li>Regular stock audits help maintain accurate inventory levels</li>
              <li>Set appropriate minimum stock levels to avoid stockouts</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'prescriptions',
      title: 'Prescription Management',
      icon: '📋',
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Handling Prescriptions</h3>
          
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-900">Processing New Prescriptions</h4>
              <p className="text-gray-600">When a new prescription arrives, create a new entry with patient details, prescribed medicines, and doctor information. The system will calculate total costs automatically.</p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900">Status Management</h4>
              <p className="text-gray-600">Track prescription status through different stages: Pending → Partial → Dispensed. Update status as you fulfill orders.</p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-gray-900">Patient Safety</h4>
              <p className="text-gray-600">Always check patient allergies and medical history before dispensing. The system displays important patient information for safety.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">⏳</div>
              <h4 className="font-semibold text-green-900">Pending</h4>
              <p className="text-sm text-green-700">Awaiting fulfillment</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🔄</div>
              <h4 className="font-semibold text-blue-900">Partial</h4>
              <p className="text-sm text-blue-700">Partially dispensed</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">✅</div>
              <h4 className="font-semibold text-gray-900">Dispensed</h4>
              <p className="text-sm text-gray-700">Fully completed</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'patients',
      title: 'Patient Management',
      icon: '👥',
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Managing Patient Records</h3>
          
          <div className="space-y-4">
            <div className="border-l-4 border-indigo-500 pl-4">
              <h4 className="font-semibold text-gray-900">Patient Registration</h4>
              <p className="text-gray-600">Register new patients with complete contact information, emergency contacts, and medical history. This ensures proper patient care and safety.</p>
            </div>
            
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-gray-900">Allergy Management</h4>
              <p className="text-gray-600">Maintain accurate allergy records for each patient. The system highlights allergies to prevent adverse reactions when dispensing medicines.</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-900">Medical History</h4>
              <p className="text-gray-600">Keep track of patient medical conditions and history. This information helps in providing better pharmaceutical care and drug interaction checks.</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-2">⚠️ Important Safety Notes:</h4>
            <ul className="list-disc list-inside space-y-1 text-red-800">
              <li>Always verify patient identity before dispensing medicines</li>
              <li>Check allergy information before every prescription</li>
              <li>Keep emergency contact information up to date</li>
              <li>Maintain patient confidentiality at all times</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      icon: '📊',
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Understanding Your Reports</h3>
          
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-900">Sales Reports</h4>
              <p className="text-gray-600">Track daily, weekly, and monthly sales performance. Monitor revenue trends and identify peak business periods.</p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900">Inventory Reports</h4>
              <p className="text-gray-600">Analyze stock levels, identify fast-moving items, and plan inventory purchases based on usage patterns.</p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-gray-900">Financial Analytics</h4>
              <p className="text-gray-600">Review financial performance with detailed breakdowns of revenue, costs, and profit margins.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">📈 Key Metrics</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Daily revenue tracking</li>
                <li>• Prescription volume</li>
                <li>• Average transaction value</li>
                <li>• Growth rate analysis</li>
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📋 Export Options</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• PDF reports for printing</li>
                <li>• Excel exports for analysis</li>
                <li>• Custom date ranges</li>
                <li>• Automated scheduling</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: '🔧',
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Common Issues & Solutions</h3>
          
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Login Issues</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Problem:</strong> Cannot log in to the system</p>
                <p><strong>Solution:</strong> Check your email and password. Use the demo credentials provided on the login page for testing.</p>
                <div className="bg-gray-50 p-2 rounded">
                  <p><strong>Demo Credentials:</strong></p>
                  <p>Email: admin@pharmatrack.com | Password: password</p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Inventory Not Updating</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Problem:</strong> Stock levels not reflecting changes</p>
                <p><strong>Solution:</strong> Refresh the page or check if you have proper permissions to modify inventory.</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Prescription Status Not Changing</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Problem:</strong> Cannot update prescription status</p>
                <p><strong>Solution:</strong> Ensure you have the necessary permissions and the prescription is in the correct state for the desired change.</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Reports Not Loading</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Problem:</strong> Reports page shows no data</p>
                <p><strong>Solution:</strong> Check your date range selection and ensure there is data for the selected period.</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Need More Help?</h4>
            <p className="text-blue-800 mb-2">If you're still experiencing issues, try these steps:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Clear your browser cache and cookies</li>
              <li>Try using a different browser</li>
              <li>Check your internet connection</li>
              <li>Contact system administrator</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentSection = helpSections.find(section => section.id === activeSection);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">
                ← Back to Dashboard
              </Link>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">❓</span>
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">Help & Documentation</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.username}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Help Topics</h3>
              <nav className="space-y-2">
                {helpSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left flex items-center p-3 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg mr-3">{section.icon}</span>
                    <span className="font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow p-6">
              {currentSection && (
                <div>
                  <div className="flex items-center mb-6">
                    <span className="text-3xl mr-4">{currentSection.icon}</span>
                    <h2 className="text-2xl font-bold text-gray-900">{currentSection.title}</h2>
                  </div>
                  {currentSection.content}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}