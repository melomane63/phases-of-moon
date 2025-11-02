/* calculatorPOM.js - Simplified lunar phase calculation module */
import { moonPhases } from './dataPOM.js';

// --- Data preparation ---
const sortedMoonPhases = [...moonPhases].sort((a, b) => a.date - b.date);
const msPerDay = 1000 * 60 * 60 * 24;
const twelveHours = 12 * 60 * 60 * 1000;

// --- Moon age (EXPORTED) ---
export function calculateAge(date) {
    const newMoons = sortedMoonPhases.filter(p => p.name === 'New Moon' && p.date <= date);
    const lastNewMoon = newMoons.at(-1);
    return lastNewMoon ? (date - lastNewMoon.date) / msPerDay : null;
}

// --- Next major phase (EXPORTED) ---
export function calculateNextMajorPhase(date) {
    for (const phase of sortedMoonPhases) {
        if (phase.date > date) {
            const diffMs = phase.date - date;
            return { name: phase.name, date: phase.date, diffMs };
        }
    }
    // If the date exceeds the last known phase, return the first one in the array
    const nextPhase = sortedMoonPhases[0];
    return { name: nextPhase.name, date: nextPhase.date, diffMs: nextPhase.date - date };
}

// --- Adjusted time until next phase (INTERNAL) ---
function calculateTimeToNextPhaseAdjusted(date) {
    const next = calculateNextMajorPhase(date);
    const next2 = sortedMoonPhases.find(p => p.date > next.date);

    if (next.diffMs >= twelveHours) {
        return Math.round(next.diffMs / 1000);
    }

    if (next2) {
        const diffMs = next2.date - date;
        return Math.round(diffMs / 1000);
    }

    return null;
}

// --- Unadjusted (raw) time until next phase (INTERNAL) ---
function calculateTimeToNextPhaseRaw(date) {
    const next = calculateNextMajorPhase(date);
    return Math.round(next.diffMs / 1000);
}

// --- Determine the lunar phase corresponding to a given date (EXPORTED) ---
export function findLunarPhase(targetDate) {
    const target = new Date(targetDate);

    // Exact phase (within ±12h)
    for (const phase of sortedMoonPhases)
        if (Math.abs(target - phase.date) <= twelveHours)
            return { type: 'exact', phase };

    // Before or after known dataset
    if (target < sortedMoonPhases[0].date)
        return { type: 'before_range', message: `Date before first known phase (${sortedMoonPhases[0].date.toUTCString()})` };

    if (target > sortedMoonPhases.at(-1).date)
        return { type: 'after_range', message: `Date after last known phase (${sortedMoonPhases.at(-1).date.toUTCString()})` };

    // Between two known phases
    const nextIndex = sortedMoonPhases.findIndex(p => p.date > target);
    const prev = sortedMoonPhases[nextIndex - 1];
    const next = sortedMoonPhases[nextIndex];
    const phaseName = getIntermediatePhaseName(prev.name, next.name);

    return { type: 'intermediate', phaseName, previous: prev, next };
}

// --- Intermediate phase naming (EXPORTED) ---
export function getIntermediatePhaseName(previousPhase, nextPhase) {
    const map = {
        'New Moon->First Quarter': 'Waxing Crescent',
        'First Quarter->Full Moon': 'Waxing Gibbous',
        'Full Moon->Last Quarter': 'Waning Gibbous',
        'Last Quarter->New Moon': 'Waning Crescent'
    };
    return map[`${previousPhase}->${nextPhase}`] || `Between ${previousPhase} and ${nextPhase}`;
}

// --- Realistic intermediate illumination ---
function calculateIntermediateIlluminationRealistic(previousPhase, nextPhase, date) {
    const total = nextPhase.date - previousPhase.date;
    const progress = (date - previousPhase.date) / total;

    const transitions = {
        'New Moon->First Quarter': [0, Math.PI / 2],
        'First Quarter->Full Moon': [Math.PI / 2, Math.PI],
        'Full Moon->Last Quarter': [Math.PI, 3 * Math.PI / 2],
        'Last Quarter->New Moon': [3 * Math.PI / 2, 2 * Math.PI]
    };

    const [start, end] = transitions[`${previousPhase.name}->${nextPhase.name}`] || [0, 2 * Math.PI];
    const angle = start + (end - start) * progress;
    return Number(((1 - Math.cos(angle)) / 2 * 100).toFixed(1));
}

// --- Detailed phase information (EXPORTED) ---
export function getDetailedPhaseInfo(targetDate, useRawTime = false) {
    const date = new Date(targetDate);
    const result = findLunarPhase(date);
    const age = calculateAge(date);
    const timeToNextPhase = useRawTime
        ? calculateTimeToNextPhaseRaw(date)
        : calculateTimeToNextPhaseAdjusted(date);

    if (result.type === 'exact') {
        return {
            phase: result.phase.name,
            date: result.phase.date,
            illumination: result.phase.illumination,
            age,
            timeToNextPhase,
            isExact: true
        };
    } else if (result.type === 'intermediate') {
        const illumination = calculateIntermediateIlluminationRealistic(result.previous, result.next, date);
        return {
            phase: result.phaseName,
            previousPhase: result.previous.name,
            nextPhase: result.next.name,
            previousDate: result.previous.date,
            nextDate: result.next.date,
            illumination,
            age,
            timeToNextPhase,
            isExact: false
        };
    } else {
        return { error: result.message, isExact: false };
    }
}

// --- Main class (EXPORTED) ---
export class MoonPhaseCalculator {
    constructor({ useRawTime = false } = {}) {
        this.moonPhases = [...sortedMoonPhases];
        this.useRawTime = useRawTime;
    }

    calculateMoonPhase(date = new Date()) {
        const info = getDetailedPhaseInfo(date, this.useRawTime);
        if (!info || info.error) return null;

        return {
            name: info.phase,
            illumination: info.illumination,
            age: info.age,
            timeToNextPhase: info.timeToNextPhase
        };
    }

    getDataRange() {
        return {
            start: this.moonPhases[0].date,
            end: this.moonPhases.at(-1).date
        };
    }

    getDetailedPhaseInfo(date = new Date()) {
        return getDetailedPhaseInfo(date, this.useRawTime);
    }
}

