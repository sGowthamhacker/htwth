import re

with open('pages/LandingPage.tsx', 'r') as f:
    content = f.read()

start_pattern = r'        \{activeTab === \'home\' && \(\n        <div className="animate-fade-in relative">\n          <div className="max-w-7xl mx-auto px-4 pt-16 sm:pt-24 relative z-10">'
end_pattern = r'          </RevealOnScroll>\n        </div>\n        \)\}'

start_match = re.search(start_pattern, content)
end_match = re.search(end_pattern, content)

if start_match and end_match:
    start_idx = start_match.start()
    end_idx = end_match.end()
    
    new_hero = """        {activeTab === 'home' && (
        <div className="animate-fade-in relative">
          <div className="max-w-7xl mx-auto px-4 pt-12 sm:pt-20 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: SaaS Copy */}
              <div className="text-left space-y-8">
                <RevealOnScroll animation="fade-right" duration={800}>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-medium text-xs mb-4">
                    <Sparkles className="w-3.5 h-3.5" />
                    Interactive Workspace Edition
                  </div>
                </RevealOnScroll>
    
                <RevealOnScroll animation="fade-right" delay={100} duration={900}>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                    Streamline your security <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">reporting workflow.</span>
                  </h1>
                </RevealOnScroll>
      
                <RevealOnScroll animation="fade-right" delay={200} duration={800}>
                  <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
                    Build, track, and manage your vulnerability reports with a highly interactive dashboard. Collaborate seamlessly with your team in real-time.
                  </p>
                </RevealOnScroll>
                
                <RevealOnScroll animation="fade-up" delay={300} duration={800}>
                  <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                      <button 
                        onClick={onGetStarted}
                        className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        Start Interactive Demo
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setShowAdminProfile(true)}
                        className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-semibold text-sm transition-all duration-300 shadow-sm flex items-center justify-center gap-2 group"
                      >
                        <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Watch Product Video
                      </button>
                  </div>
                </RevealOnScroll>
              </div>

              {/* Right Column: Interactive Video & Cards */}
              <RevealOnScroll animation="fade-left" delay={200} duration={1000} className="relative z-20 mt-12 lg:mt-0">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/80 shadow-2xl bg-slate-50 dark:bg-[#0c0c0e] aspect-[4/3] group">
                  
                  {/* Interactive Play Button */}
                  <div className="absolute inset-0 bg-slate-900/10 dark:bg-black/30 group-hover:bg-slate-900/20 dark:group-hover:bg-black/50 transition-colors duration-500 z-30 flex items-center justify-center cursor-pointer">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 pl-1 relative"
                    >
                      <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30 animate-ping"></div>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </motion.div>
                  </div>

                  {/* Video Mockup Content */}
                  <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" alt="Dashboard Preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Floating Elements / UI Cards */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute top-6 left-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-lg z-40 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 flex items-center justify-center font-bold text-xs">
                      9.8
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Critical Issue</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">RCE Detected</div>
                    </div>
                  </motion.div>

                  <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-6 right-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-lg z-40 flex items-center gap-3"
                  >
                     <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                        <CheckIcon className="w-4 h-4" />
                     </div>
                     <div>
                       <div className="text-xs font-bold text-slate-900 dark:text-white">Patch Verified</div>
                       <div className="text-[10px] text-slate-500 dark:text-slate-400">Just now</div>
                     </div>
                  </motion.div>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
        )}"""
    
    new_content = content[:start_idx] + new_hero + content[end_idx:]
    with open('pages/LandingPage.tsx', 'w') as f:
        f.write(new_content)
    print("Updated successfully")
else:
    print("Could not find start or end pattern")
