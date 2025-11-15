// calculatorPOM.js - Simplified lunar phase calculation module
import { moonPhases } from './dataPOM.js';
import { LANGUAGE } from './constantesPOM.js';

const sortedMoonPhases = [...moonPhases].sort((a, b) => a.date - b.date);
const msPerDay = 1000 * 60 * 60 * 24;
const twelveHours = 12 * 60 * 60 * 1000;

export function calculateAge(date) {
    const newMoons = sortedMoonPhases.filter(p => p.name === 'New Moon' && p.date <= date);
    const lastNewMoon = newMoons.at(-1);
    return lastNewMoon ? (date - lastNewMoon.date) / msPerDay : null;
}

export function calculateNextMajorPhase(date) {
    for (const phase of sortedMoonPhases) {
        if (phase.date > date) {
            const diffMs = phase.date - date;
            return { 
                name: phase.name, 
                date: phase.date, 
                diffMs,
                formattedDate: formatDateForDisplay(phase.date)
            };
        }
    }
    const nextPhase = sortedMoonPhases[0];
    return { 
        name: nextPhase.name, 
        date: nextPhase.date, 
        diffMs: nextPhase.date - date,
        formattedDate: formatDateForDisplay(nextPhase.date)
    };
}

function formatDateForDisplay(date) {
    const locale = LANGUAGE || undefined;
    
    const day = date.getDate();
    const month = date.toLocaleDateString(locale, { month: 'short' });
    const cleanMonth = month.replace('.', '');
    const timeStr = formatTimeOnly(date);
    
    return `${day} ${cleanMonth} ${timeStr}`;
}

export function formatTimeOnly(date) {
    const locale = LANGUAGE || undefined;
    
    return date.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function calculateTimeToNextPhaseAdjusted(date) {
    const next = calculateNextMajorPhase(date);
    const next2 = sortedMoonPhases.find(p => p.date > next.date);

    if (next.diffMs >= twelveHours) {
        return {
            seconds: Math.round(next.diffMs / 1000),
            nextPhaseDate: next.formattedDate,
            nextPhaseExactDate: next.date
        };
    }

    if (next2) {
        const diffMs = next2.date - date;
        return {
            seconds: Math.round(diffMs / 1000),
            nextPhaseDate: formatDateForDisplay(next2.date),
            nextPhaseExactDate: next2.date
        };
    }

    return null;
}

function calculateTimeToNextPhaseRaw(date) {
    const next = calculateNextMajorPhase(date);
    return {
        seconds: Math.round(next.diffMs / 1000),
        nextPhaseDate: next.formattedDate,
        nextPhaseExactDate: next.date
    };
}

export function findLunarPhase(targetDate) {
    const target = new Date(targetDate);

    for (const phase of sortedMoonPhases)
        if (Math.abs(target - phase.date) <= twelveHours)
            return { type: 'exact', phase };

    if (target < sortedMoonPhases[0].date)
        return { type: 'before_range', message: `Date before first known phase (${sortedMoonPhases[0].date.toUTCString()})` };

    if (target > sortedMoonPhases.at(-1).date)
        return { type: 'after_range', message: `Date after last known phase (${sortedMoonPhases.at(-1).date.toUTCString()})` };

    const nextIndex = sortedMoonPhases.findIndex(p => p.date > target);
    const prev = sortedMoonPhases[nextIndex - 1];
    const next = sortedMoonPhases[nextIndex];
    const phaseName = getIntermediatePhaseName(prev.name, next.name);

    return { type: 'intermediate', phaseName, previous: prev, next };
}

export function getIntermediatePhaseName(previousPhase, nextPhase) {
    const map = {
        'New Moon->First Quarter': 'Waxing Crescent',
        'First Quarter->Full Moon': 'Waxing Gibbous',
        'Full Moon->Last Quarter': 'Waning Gibbous',
        'Last Quarter->New Moon': 'Waning Crescent'
    };
    return map[`${previousPhase}->${nextPhase}`] || `Between ${previousPhase} and ${nextPhase}`;
}

function calculateIntermediateIlluminationRealistic(previousPhase, nextPhase, date) {
    const total = nextPhase.date - previousPhase.date;
    const progress = (date - previousPhase.date) / total;

    const illuminationModels = {
        'New Moon->First Quarter': (p) => 50 * (1 - Math.cos(Math.PI * p)),
        'First Quarter->Full Moon': (p) => 50 + 50 * Math.sin(Math.PI * p / 2),
        'Full Moon->Last Quarter': (p) => 100 - 50 * (1 - Math.cos(Math.PI * p)),
        'Last Quarter->New Moon': (p) => 50 - 50 * Math.sin(Math.PI * p / 2)
    };

    const model = illuminationModels[`${previousPhase.name}->${nextPhase.name}`];
    const rawValue = model(progress);
    
    return rawValue;
}

function getCalculatedIllumination(date, result) {
    if (result.type === 'exact') {
        const phase = result.phase;
        const nextIndex = sortedMoonPhases.findIndex(p => p.date > phase.date);
        const next = nextIndex >= 0 ? sortedMoonPhases[nextIndex] : sortedMoonPhases[0];
        
        return calculateIntermediateIlluminationRealistic(phase, next, date);
    } else if (result.type === 'intermediate') {
        return calculateIntermediateIlluminationRealistic(result.previous, result.next, date);
    } else {
        return 50;
    }
}

export function getDetailedPhaseInfo(targetDate, useRawTime = false) {
    const date = new Date(targetDate);
    const result = findLunarPhase(date);
    const age = calculateAge(date);
    
    const timeToNextPhaseInfo = useRawTime
        ? calculateTimeToNextPhaseRaw(date)
        : calculateTimeToNextPhaseAdjusted(date);

    const illumination = getCalculatedIllumination(date, result);

    if (result.type === 'exact') {
        return {
            phase: result.phase.name,
            date: result.phase.date,
            illumination: illumination,
            age,
            timeToNextPhase: timeToNextPhaseInfo?.seconds || null,
            nextPhaseDate: timeToNextPhaseInfo?.nextPhaseDate || null,
            nextPhaseExactDate: timeToNextPhaseInfo?.nextPhaseExactDate || null,
            isExact: true
        };
    } else if (result.type === 'intermediate') {
        return {
            phase: result.phaseName,
            previousPhase: result.previous.name,
            nextPhase: result.next.name,
            previousDate: result.previous.date,
            nextDate: result.next.date,
            illumination: illumination,
            age,
            timeToNextPhase: timeToNextPhaseInfo?.seconds || null,
            nextPhaseDate: timeToNextPhaseInfo?.nextPhaseDate || null,
            nextPhaseExactDate: timeToNextPhaseInfo?.nextPhaseExactDate || null,
            isExact: false
        };
    } else {
        return { 
            error: result.message, 
            isExact: false,
            timeToNextPhase: null,
            nextPhaseDate: null,
            nextPhaseExactDate: null
        };
    }
}

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
            timeToNextPhase: info.timeToNextPhase,
            nextPhaseDate: info.nextPhaseDate,
            nextPhaseExactDate: info.nextPhaseExactDate
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
