import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const simpleHash = (str) => btoa(str).split('').reverse().join('');

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
        if (usersDB[email]) {
          set({ authError: 'Email already registered. Try login.' });
          return false;
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

        // Try Supabase cloud save
        try {
          const supabase = await getSupabaseClient();
          if (supabase) {
            await supabase.from('compass_users').upsert({ email: newUser.email, name: newUser.name, progress: {} }, { onConflict: 'email' });
            console.log('✅ Supabase: user saved to cloud');
          }
        } catch (e) {
          console.log('Supabase save failed (table may not exist yet):', e.message);
        }
        return true;
      },

      login: async (email, password) => {
        const { usersDB } = get();
        const existing = usersDB[email];
        if (!existing) {
          set({ authError: 'No account found. Please sign up.' });
          return false;
        }
        if (existing.passwordHash !== simpleHash(password)) {
          set({ authError: 'Wrong password.' });
          return false;
        }

        // Try load from Supabase first, then local
        let loadedFromCloud = false;
        try {
          const supabase = await getSupabaseClient();
          if (supabase) {
            const { data, error } = await supabase.from('compass_progress').select('*').eq('user_id', email).single();
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
          }
        } catch (e) {
          console.log('Supabase load failed, fallback to local:', e.message);
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
        
        set({ 
          user: { email: existing.email, name: existing.name }, 
          isGuest: false,
          authError: null,
        });
        return true;
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
              await supabase.from('compass_progress').upsert({
                user_id: user.email,
                email: user.email,
                pathway: selectedPathway,
                current_step: currentStep,
                completed_steps: completedSteps,
                checklist: checklist,
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id' });
              console.log('✅ Progress synced to Supabase');
            }
          } catch (e) {
            console.log('Supabase sync failed (table may not exist):', e.message);
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
      name: 'buildtoship-compass-v2-simple',
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
