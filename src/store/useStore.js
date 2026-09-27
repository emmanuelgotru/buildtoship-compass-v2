import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const simpleHash = (str) => btoa(str).split('').reverse().join('');

// Migrate old localStorage key to new simple URL key
try {
  const oldKey = 'buildtoship-compass-v2-simple';
  const newKey = 'build-to-ship-app';
  if (!localStorage.getItem(newKey) && localStorage.getItem(oldKey)) {
    localStorage.setItem(newKey, localStorage.getItem(oldKey));
    console.log('✅ Migrated progress from old key to', newKey);
  }
} catch {}

// Supabase helper - uses env vars or localStorage keys
const getSupabaseClient = async () => {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('btc_supabase_url') || 'https://gnrphhtndvihayqoeghn.supabase.co';
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('btc_supabase_anon') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImducnBoaHRuZHZpaGF5cW9lZ2huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMjU2NDUsImV4cCI6MjEwNTcwMTY0NX0.Gw0bYE_97nf9vwDrrwyu0sdxyOJjebL-iOw7f623lsk';
    if (!url || !anon) return null;
    const { createClient } = await import('@supabase/supabase-js');
    return createClient(url, anon);
  } catch {
    return null;
  }
};

export const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      isGuest: false,
      usersDB: {},
      authError: null,

      signup: async (email, password, name) => {
        const { usersDB } = get();
        const supabase = await getSupabaseClient();
        
        // Check local DB first
        if (usersDB[email]) {
          set({ authError: 'Email already registered. Try login.' });
          return false;
        }

        // Check Supabase cloud for existing account (cross-device)
        if (supabase) {
          try {
            const { data } = await supabase.from('compass_users').select('email, progress').eq('email', email).maybeSingle();
            if (data) {
              set({ authError: 'Email already registered in cloud. Try login on any device.' });
              return false;
            }
          } catch (e) {
            console.log('Supabase check failed, continuing with local signup', e.message);
          }
        }

        const newUser = {
          email,
          name: name || email.split('@')[0],
          passwordHash: simpleHash(password),
          createdAt: new Date().toISOString(),
        };
        const updatedDB = { ...usersDB, [email]: newUser };
        set({ 
          usersDB: updatedDB, 
          user: { email: newUser.email, name: newUser.name }, 
          isGuest: false,
          authError: null,
        });

        // Save to Supabase cloud - store passwordHash in progress JSON (since table has no password_hash column)
        if (supabase) {
          try {
            const { error } = await supabase.from('compass_users').upsert(
              { email: newUser.email, name: newUser.name, progress: { passwordHash: newUser.passwordHash } }, 
              { onConflict: 'email' }
            );
            if (error) throw error;
            console.log('✅ Supabase: user saved to cloud with passwordHash');
          } catch (e) {
            console.log('Supabase save failed:', e.message);
          }
        }
        return true;
      },

      login: async (email, password) => {
        const { usersDB } = get();
        const inputHash = simpleHash(password);
        const supabase = await getSupabaseClient();

        // 1. Check local DB first (fast path)
        const localUser = usersDB[email];
        if (localUser) {
          if (localUser.passwordHash !== inputHash) {
            set({ authError: 'Wrong password.' });
            return false;
          }
          // Local password OK, now load cloud progress
          await get()._loadProgress(email, supabase);
          set({ 
            user: { email: localUser.email, name: localUser.name }, 
            isGuest: false,
            authError: null,
          });
          return true;
        }

        // 2. Not in local DB, try Supabase cloud (cross-device login)
        if (supabase) {
          try {
            const { data: cloudUser, error } = await supabase.from('compass_users').select('*').eq('email', email).maybeSingle();
            if (error) throw error;
            
            if (cloudUser) {
              const storedHash = cloudUser.progress?.passwordHash;
              
              // Migration: old accounts without passwordHash - allow login and set hash
              if (!storedHash) {
                console.log('⚠️ Old account without passwordHash, setting new hash for', email);
                // Save new hash to cloud
                await supabase.from('compass_users').update({ progress: { passwordHash: inputHash } }).eq('email', email);
                // Create local entry
                const migratedUser = {
                  email: cloudUser.email,
                  name: cloudUser.name,
                  passwordHash: inputHash,
                  createdAt: cloudUser.created_at || new Date().toISOString(),
                };
                const updatedDB = { ...get().usersDB, [email]: migratedUser };
                set({ usersDB: updatedDB });
                await get()._loadProgress(email, supabase);
                set({
                  user: { email: cloudUser.email, name: cloudUser.name },
                  isGuest: false,
                  authError: null,
                });
                return true;
              }

              // Normal case: verify hash
              if (storedHash !== inputHash) {
                set({ authError: 'Wrong password.' });
                return false;
              }

              // Password OK, create local entry for future fast login
              const cloudLocalUser = {
                email: cloudUser.email,
                name: cloudUser.name,
                passwordHash: storedHash,
                createdAt: cloudUser.created_at || new Date().toISOString(),
              };
              const updatedDB = { ...get().usersDB, [email]: cloudLocalUser };
              set({ usersDB: updatedDB });
              
              await get()._loadProgress(email, supabase);
              set({
                user: { email: cloudUser.email, name: cloudUser.name },
                isGuest: false,
                authError: null,
              });
              console.log('✅ Cross-device login success from Supabase');
              return true;
            }
          } catch (e) {
            console.log('Supabase cloud login failed:', e.message);
          }
        }

        // 3. Not found anywhere
        set({ authError: 'No account found. Please sign up.' });
        return false;
      },

      _loadProgress: async (email, supabaseClient) => {
        const supabase = supabaseClient || await getSupabaseClient();
        let loadedFromCloud = false;
        
        if (supabase) {
          try {
            const { data, error } = await supabase.from('compass_progress').select('*').eq('user_id', email).maybeSingle();
            if (data && !error) {
              set({
                selectedPathway: data.pathway || null,
                currentStep: data.current_step || 1,
                completedSteps: data.completed_steps || [],
                checklist: data.checklist || {},
              });
              loadedFromCloud = true;
              console.log('✅ Loaded progress from Supabase cloud');
            }
          } catch (e) {
            console.log('Supabase progress load failed:', e.message);
          }
        }

        if (!loadedFromCloud) {
          const progressKey = `btc_progress_${email}`;
          try {
            const savedProgress = JSON.parse(localStorage.getItem(progressKey) || 'null');
            if (savedProgress) {
              set({
                selectedPathway: savedProgress.selectedPathway || null,
                currentStep: savedProgress.currentStep || 1,
                completedSteps: savedProgress.completedSteps || [],
                checklist: savedProgress.checklist || {},
              });
            }
          } catch {}
        }
      },

      setGuest: () => set({ 
        user: { email: 'guest@local', name: 'Classmate' }, 
        isGuest: true,
        authError: null,
      }),

      logout: () => {
        const { user } = get();
        if (user && !get().isGuest && user.email) {
          const progressKey = `btc_progress_${user.email}`;
          const { selectedPathway, currentStep, completedSteps, checklist } = get();
          localStorage.setItem(progressKey, JSON.stringify({
            selectedPathway, currentStep, completedSteps, checklist
          }));
        }
        set({ user: null, isGuest: false, selectedPathway: null, currentStep: 1, completedSteps: [], checklist: {}, authError: null });
      },

      clearAuthError: () => set({ authError: null }),

      selectedPathway: null,
      setPathway: (id) => {
        set({ selectedPathway: id, currentStep: 1, completedSteps: [] });
        get()._saveProgress();
      },
      
      currentStep: 1,
      completedSteps: [],
      setCurrentStep: (step) => {
        set({ currentStep: step });
        get()._saveProgress();
      },
      completeStep: (step) => {
        const { completedSteps, currentStep } = get();
        let newCompleted = completedSteps;
        if (!completedSteps.includes(step)) {
          newCompleted = [...completedSteps, step];
          set({ completedSteps: newCompleted });
        }
        if (step === currentStep && step < 6) {
          set({ currentStep: step + 1 });
        }
        get()._saveProgress();
      },
      goToStep: (step) => {
        set({ currentStep: step });
        get()._saveProgress();
      },

      _saveProgress: async () => {
        const { user, isGuest, selectedPathway, currentStep, completedSteps, checklist } = get();
        if (user && !isGuest && user.email) {
          const progressKey = `btc_progress_${user.email}`;
          const payload = { selectedPathway, currentStep, completedSteps, checklist };
          localStorage.setItem(progressKey, JSON.stringify(payload));

          // Cloud save
          try {
            const supabase = await getSupabaseClient();
            if (supabase) {
              const { error } = await supabase.from('compass_progress').upsert({
                user_id: user.email,
                email: user.email,
                pathway: selectedPathway,
                current_step: currentStep,
                completed_steps: completedSteps,
                checklist: checklist,
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id' });
              if (error) throw error;
              console.log('✅ Progress synced to Supabase');
            }
          } catch (e) {
            console.log('Supabase sync failed:', e.message);
          }
        }
      },

      checklist: {},
      toggleChecklist: (id) => {
        const { checklist } = get();
        const newCheck = { ...checklist, [id]: !checklist[id] };
        set({ checklist: newCheck });
        get()._saveProgress();
      },

      mentorOpen: false,
      mentorContext: null,
      setMentorOpen: (open, context = null) => set({ mentorOpen: open, mentorContext: context }),
      
      quickAuditInput: '',
      setQuickAuditInput: (val) => set({ quickAuditInput: val }),

      showConfetti: false,
      sidebarCollapsed: false,
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      triggerConfetti: () => {
        set({ showConfetti: true });
        setTimeout(() => set({ showConfetti: false }), 4000);
      },
    }),
    {
      name: 'build-to-ship-app',
      partialize: (state) => ({
        user: state.user,
        isGuest: state.isGuest,
        usersDB: state.usersDB,
        selectedPathway: state.selectedPathway,
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        checklist: state.checklist,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
