"use client";

import { useState, useEffect } from 'react';

export type PerformanceProfile = 'low' | 'standard' | 'high';

export function usePerformanceProfile(): PerformanceProfile {
    const [profile, setProfile] = useState<PerformanceProfile>('standard');

    useEffect(() => {
        const memory = (navigator as any).deviceMemory || 8;
        const cores = navigator.hardwareConcurrency || 4;

        if (memory <= 4 || cores <= 4) {
            setProfile('low');
        } else if (memory <= 8) {
            setProfile('standard');
        } else {
            setProfile('high');
        }
        
        console.log(`Detected Frontend Performance Profile: ${profile} (RAM: ${memory}GB, Cores: ${cores})`);
    }, [profile]);

    return profile;
}
