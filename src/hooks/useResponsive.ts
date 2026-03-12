import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

export type DeviceSize = 'mobile' | 'tablet' | 'desktop';

const BREAKPOINTS = {
    tablet: 768,
    desktop: 1024,
};

function getDeviceSize(width: number): DeviceSize {
    if (Platform.OS !== 'web') return 'mobile';
    if (width >= BREAKPOINTS.desktop) return 'desktop';
    if (width >= BREAKPOINTS.tablet) return 'tablet';
    return 'mobile';
}

function getWebWidth(size: DeviceSize): '100%' | '85%' | '100%' {
    switch (size) {
        case 'desktop': return '100%';
        case 'tablet': return '85%';
        default: return '100%';
    }
}

function getWebMaxWidth(size: DeviceSize): number | undefined {
    switch (size) {
        case 'desktop': return undefined;
        case 'tablet': return 900;
        default: return undefined;
    }
}

export function useResponsive() {
    const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
    const size = getDeviceSize(windowWidth);

    useEffect(() => {
        if (Platform.OS !== 'web') return;

        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setWindowWidth(window.width);
        });

        return () => subscription.remove();
    }, []);

    return {
        size,
        isWeb: Platform.OS === 'web',
        isMobile: size === 'mobile',
        isTablet: size === 'tablet',
        isDesktop: size === 'desktop',
        windowWidth,
        webWidth: getWebWidth(size),
        webMaxWidth: getWebMaxWidth(size),
        containerStyle: Platform.OS === 'web' ? {
            width: getWebWidth(size),
            maxWidth: getWebMaxWidth(size),
            alignSelf: 'center' as const,
        } : {},
    };
}
