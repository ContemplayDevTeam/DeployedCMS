'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'





export default function Landing() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = async (action: 'login' | 'signup') => {
    if (!email.trim()) return
    
    setIsLoading(true)
    
    try {
      // Store email for the auth pages
      localStorage.setItem('uploader_email', email)
      
      // Redirect to appropriate auth page
      if (action === 'login') {
        router.push('/login')
      } else {
        router.push('/signup')
      }
    } catch (error) {
      console.error('Navigation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load saved email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('uploader_email')
    if (savedEmail) {
      setEmail(savedEmail)
    }
  }, [])



  const features = [
    {
      title: "Easy Upload",
      description: "Simply drag and drop your product images to our queue."
    },
    {
      title: "Quick Publishing",
      description: "We'll publish your content professionally and efficiently."
    },
    {
      title: "Queue Management",
      description: "Track the status of your uploads in our organized queue."
    }
  ]



  return (
    <div className="min-h-screen" style={{ backgroundColor: '#8FA8A8' }}>
      {/* Navbar */}
      <header className="backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b" style={{ backgroundColor: '#8FA8A8', borderColor: '#4A5555' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#4A5555' }}>
                <span className="font-bold text-sm" style={{ color: '#D0DADA' }}>C</span>
              </div>
              <h1 className="text-xl font-bold" style={{ color: '#D0DADA' }}>
                ContemPlay
              </h1>
            </div>
                     <div className="hidden md:flex items-center space-x-4 text-sm">
             <div className="flex items-center space-x-2">
                               <span className="italic" style={{ color: '#FFFFFF' }}>What will you create today?</span>
             </div>
           </div>
                                           <div className="flex items-center space-x-4">
              {email ? (
                <>
                  <Link 
                    href="/upload" 
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                    style={{ color: '#D0DADA', backgroundColor: '#4A5555' }}
                  >
                    Upload
                  </Link>
                </>
              ) : (
               <>
                 <Link 
                   href="/login" 
                   className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium transition-colors"
                   style={{ color: '#D0DADA' }}
                 >
                   Sign In
                 </Link>
                 <Link 
                   href="/signup" 
                   className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                   style={{ color: '#D0DADA', backgroundColor: '#4A5555' }}
                 >
                   Get Started
                 </Link>
               </>
             )}
           </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="text-center">
            
            
                                                                                                       <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-balance" style={{ color: '#4A5555' }}>
                 Upload, Queue, and
                 <span style={{ color: '#8FA8A8' }}> Create</span>
               </h1>
            
                                                   <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{ color: '#6B7280' }}>
                Upload your product images to our publishing queue. We&apos;ll handle the rest and get your content published quickly and professionally.
              </p>

                         <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
               <div className="w-full sm:w-auto max-w-md">
                                   <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full px-6 py-4 text-lg border rounded-xl focus:ring-2 focus:border-transparent transition-all mb-4"
                    style={{ borderColor: '#8FA8A8', backgroundColor: '#F9FAFB', color: '#4A5555' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                                   <div className="flex gap-4">
                                         <button
                       onClick={() => handleContinue('login')}
                       disabled={isLoading || !email.trim()}
                       className="flex-1 px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all btn-hover"
                       style={{ backgroundColor: '#8FA8A8', color: '#FFFFFF' }}
                     >
                       {isLoading ? (
                         <div className="w-5 h-5 border-2 border-transparent rounded-full spinner mx-auto" style={{ borderColor: '#FFFFFF', borderTopColor: 'transparent' }}></div>
                       ) : (
                         'Login'
                       )}
                     </button>
                     <button
                       onClick={() => handleContinue('signup')}
                       disabled={isLoading || !email.trim()}
                       className="flex-1 px-6 py-3 border-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all btn-hover"
                       style={{ borderColor: '#8FA8A8', color: '#8FA8A8', backgroundColor: '#FFFFFF' }}
                     >
                       Sign Up
                     </button>
                  </div>
               </div>
             </div>

            
          </div>
        </div>
      </section>

      

      {/* Features Section */}
      <section className="py-20" style={{ backgroundColor: '#8FA8A8' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="text-center mb-16">
             <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#D0DADA' }}>
               Simple and efficient publishing workflow
             </h2>
             <p className="text-xl max-w-2xl mx-auto" style={{ color: '#4A5555' }}>
               Upload your images and let us handle the publishing process for you
             </p>
           </div>

                     <div className="grid md:grid-cols-3 gap-8">
                         {features.map((feature, index) => (
               <div key={index} className="p-8 rounded-2xl shadow-sm card-hover" style={{ backgroundColor: '#D0DADA' }}>
                 <h3 className="text-xl font-semibold mb-3" style={{ color: '#4A5555' }}>{feature.title}</h3>
                 <p className="leading-relaxed" style={{ color: '#4A5555' }}>{feature.description}</p>
               </div>
             ))}
          </div>
        </div>
             </section>

       

       {/* CTA Section */}
      <section className="py-20" style={{ backgroundColor: '#4A5555' }}>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                     <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#D0DADA' }}>
             Ready to upload your images?
           </h2>
           <p className="text-xl mb-8" style={{ color: '#D0DADA' }}>
             Start uploading your product images to our publishing queue
           </p>
                     <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <button
               onClick={() => router.push('/signup')}
               className="px-8 py-4 font-semibold rounded-lg transition-colors btn-hover"
               style={{ backgroundColor: '#D0DADA', color: '#4A5555' }}
             >
               Start Uploading Now
             </button>
             <button 
               onClick={() => router.push('/signup')}
               className="px-8 py-4 border-2 font-semibold rounded-lg transition-colors btn-hover" 
               style={{ borderColor: '#D0DADA', color: '#D0DADA' }}
             >
               Sign Up
             </button>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-12" style={{ backgroundColor: '#4A5555' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8FA8A8' }}>
                  <span className="font-bold text-sm" style={{ color: '#D0DADA' }}>C</span>
                </div>
                <span className="text-xl font-bold" style={{ color: '#D0DADA' }}>ContemPlay</span>
              </div>
                             <p style={{ color: '#D0DADA' }}>
                 Upload your product images to our publishing queue and let us handle the rest.
               </p>
            </div>
            
            
            
            <div>
              <h3 className="font-semibold mb-4" style={{ color: '#D0DADA' }}>Company</h3>
              <ul className="space-y-2" style={{ color: '#D0DADA' }}>
                <li><Link href="#" className="transition-colors" style={{ color: '#D0DADA' }}>About</Link></li>
                <li><Link href="#" className="transition-colors" style={{ color: '#D0DADA' }}>Blog</Link></li>
                <li><Link href="#" className="transition-colors" style={{ color: '#D0DADA' }}>Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4" style={{ color: '#D0DADA' }}>Support</h3>
              <ul className="space-y-2" style={{ color: '#D0DADA' }}>
                <li><Link href="#" className="transition-colors" style={{ color: '#D0DADA' }}>Help Center</Link></li>
                <li><Link href="#" className="transition-colors" style={{ color: '#D0DADA' }}>Contact</Link></li>
                <li><Link href="#" className="transition-colors" style={{ color: '#D0DADA' }}>Status</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center" style={{ borderColor: '#8FA8A8', color: '#D0DADA' }}>
            <p>© {new Date().getFullYear()} ContemPlay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
