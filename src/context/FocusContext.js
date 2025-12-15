import React, { createContext, useContext, useReducer, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

// Initial state
const initialState = {
    // Session data
    sessions: [],
    currentSession: null,

    // Stats
    totalFocusTime: 0,
    totalDistractions: 0,
    streak: 0,
    lastActiveDate: null,

    // Settings
    dailyGoal: 7200, // 2 hours in seconds
    pomodoroFocusTime: 25 * 60, // 25 minutes
    pomodoroBreakTime: 5 * 60, // 5 minutes
    soundEnabled: true,
    theme: 'dark',

    // Timer mode
    timerMode: 'stopwatch', // 'stopwatch' or 'pomodoro'
    pomodoroPhase: 'focus', // 'focus' or 'break'
    pomodoroCount: 0,
};

// Action types
const ACTIONS = {
    START_SESSION: 'START_SESSION',
    END_SESSION: 'END_SESSION',
    UPDATE_SESSION: 'UPDATE_SESSION',
    ADD_DISTRACTION: 'ADD_DISTRACTION',
    UPDATE_FOCUS_TIME: 'UPDATE_FOCUS_TIME',
    SET_TIMER_MODE: 'SET_TIMER_MODE',
    SET_POMODORO_PHASE: 'SET_POMODORO_PHASE',
    INCREMENT_POMODORO: 'INCREMENT_POMODORO',
    SET_DAILY_GOAL: 'SET_DAILY_GOAL',
    TOGGLE_SOUND: 'TOGGLE_SOUND',
    TOGGLE_THEME: 'TOGGLE_THEME',
    UPDATE_STREAK: 'UPDATE_STREAK',
    LOAD_STATE: 'LOAD_STATE',
    RESET_DAILY: 'RESET_DAILY',
};

// Reducer
function focusReducer(state, action) {
    switch (action.type) {
        case ACTIONS.START_SESSION:
            return {
                ...state,
                currentSession: {
                    id: Date.now(),
                    startTime: new Date().toISOString(),
                    focusTime: 0,
                    distractions: 0,
                },
            };

        case ACTIONS.END_SESSION:
            if (!state.currentSession) return state;
            const completedSession = {
                ...state.currentSession,
                endTime: new Date().toISOString(),
            };
            return {
                ...state,
                sessions: [...state.sessions.slice(-49), completedSession], // Keep last 50
                currentSession: null,
            };

        case ACTIONS.UPDATE_SESSION:
            if (!state.currentSession) return state;
            return {
                ...state,
                currentSession: {
                    ...state.currentSession,
                    ...action.payload,
                },
            };

        case ACTIONS.ADD_DISTRACTION:
            return {
                ...state,
                totalDistractions: state.totalDistractions + 1,
                currentSession: state.currentSession ? {
                    ...state.currentSession,
                    distractions: state.currentSession.distractions + 1,
                } : null,
            };

        case ACTIONS.UPDATE_FOCUS_TIME:
            return {
                ...state,
                totalFocusTime: state.totalFocusTime + action.payload,
                currentSession: state.currentSession ? {
                    ...state.currentSession,
                    focusTime: state.currentSession.focusTime + action.payload,
                } : null,
            };

        case ACTIONS.SET_TIMER_MODE:
            return {
                ...state,
                timerMode: action.payload,
                pomodoroPhase: 'focus',
                pomodoroCount: 0,
            };

        case ACTIONS.SET_POMODORO_PHASE:
            return {
                ...state,
                pomodoroPhase: action.payload,
            };

        case ACTIONS.INCREMENT_POMODORO:
            return {
                ...state,
                pomodoroCount: state.pomodoroCount + 1,
            };

        case ACTIONS.SET_DAILY_GOAL:
            return {
                ...state,
                dailyGoal: action.payload,
            };

        case ACTIONS.TOGGLE_SOUND:
            return {
                ...state,
                soundEnabled: !state.soundEnabled,
            };

        case ACTIONS.TOGGLE_THEME:
            return {
                ...state,
                theme: state.theme === 'dark' ? 'light' : 'dark',
            };

        case ACTIONS.UPDATE_STREAK:
            const today = new Date().toDateString();
            const lastDate = state.lastActiveDate;
            const yesterday = new Date(Date.now() - 86400000).toDateString();

            let newStreak = state.streak;
            if (lastDate === today) {
                // Same day, keep streak
            } else if (lastDate === yesterday) {
                // Consecutive day, increment streak
                newStreak = state.streak + 1;
            } else if (lastDate !== today) {
                // Streak broken or first day
                newStreak = 1;
            }

            return {
                ...state,
                streak: newStreak,
                lastActiveDate: today,
            };

        case ACTIONS.LOAD_STATE:
            return {
                ...state,
                ...action.payload,
            };

        case ACTIONS.RESET_DAILY:
            return {
                ...state,
                currentSession: null,
            };

        default:
            return state;
    }
}

// Context
const FocusContext = createContext(null);

// Provider component
export function FocusProvider({ children }) {
    const [savedState, setSavedState] = useLocalStorage('focusGuard', null);
    const [state, dispatch] = useReducer(focusReducer, savedState || initialState);

    // Save state to localStorage on changes
    useEffect(() => {
        setSavedState(state);
    }, [state, setSavedState]);

    // Update streak on mount
    useEffect(() => {
        dispatch({ type: ACTIONS.UPDATE_STREAK });
    }, []);

    // Calculate today's focus time
    const getTodaysFocusTime = () => {
        const today = new Date().toDateString();
        const todaySessions = state.sessions.filter(
            s => new Date(s.startTime).toDateString() === today
        );
        const sessionTime = todaySessions.reduce((acc, s) => acc + s.focusTime, 0);
        const currentTime = state.currentSession?.focusTime || 0;
        return sessionTime + currentTime;
    };

    // Calculate productivity score (0-100)
    const getProductivityScore = () => {
        if (state.sessions.length === 0) return 0;
        const recentSessions = state.sessions.slice(-10);
        const totalFocus = recentSessions.reduce((acc, s) => acc + s.focusTime, 0);
        const totalDistractions = recentSessions.reduce((acc, s) => acc + s.distractions, 0);
        if (totalFocus === 0) return 0;
        // Score based on focus time per distraction
        const score = Math.min(100, Math.round((totalFocus / Math.max(1, totalDistractions)) / 60 * 10));
        return score;
    };

    const value = {
        state,
        dispatch,
        actions: ACTIONS,
        getTodaysFocusTime,
        getProductivityScore,
    };

    return (
        <FocusContext.Provider value={value}>
            {children}
        </FocusContext.Provider>
    );
}

// Custom hook to use context
export function useFocusContext() {
    const context = useContext(FocusContext);
    if (!context) {
        throw new Error('useFocusContext must be used within FocusProvider');
    }
    return context;
}

export default FocusContext;
