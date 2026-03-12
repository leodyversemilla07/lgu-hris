import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGSVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M24 5.5L37 10.7V22C37 30.6 31.8 37.9 24 41.5C16.2 37.9 11 30.6 11 22V10.7L24 5.5Z"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinejoin="round"
            />
            <circle cx="24" cy="15" r="3.5" fill="currentColor" />
            <path
                d="M18 31V20.5M30 31V20.5M18 25.5H30"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M20.5 35H27.5"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
}
