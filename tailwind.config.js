import tailwindAnimate from 'tailwindcss-animate';
import containerQuery from '@tailwindcss/container-queries';

export default {
    darkMode: ['class'],
    content: [
        './index.html',
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
        './node_modules/streamdown/dist/**/*.js'
    ],
    safelist: ['border', 'border-border'],
    prefix: '',
    theme: {
                container: {
                        center: true,
                        padding: '2rem',
                        screens: {
                                '2xl': '1400px'
                        }
                },
                extend: {
                        colors: {
                                border: 'hsl(var(--border))',
                                input: 'hsl(var(--input))',
                                ring: 'hsl(var(--ring))',
                                background: 'hsl(var(--background))',
                                foreground: 'hsl(var(--foreground))',
                                primary: {
                                        DEFAULT: 'hsl(var(--primary))',
                                        foreground: 'hsl(var(--primary-foreground))',
                                        light: 'hsl(var(--primary-light))',
                                        dark: 'hsl(var(--primary-dark))'
                                },
                                secondary: {
                                        DEFAULT: 'hsl(var(--secondary))',
                                        foreground: 'hsl(var(--secondary-foreground))'
                                },
                                destructive: {
                                        DEFAULT: 'hsl(var(--destructive))',
                                        foreground: 'hsl(var(--destructive-foreground))'
                                },
                                muted: {
                                        DEFAULT: 'hsl(var(--muted))',
                                        foreground: 'hsl(var(--muted-foreground))'
                                },
                                accent: {
                                        DEFAULT: 'hsl(var(--accent))',
                                        foreground: 'hsl(var(--accent-foreground))',
                                        light: 'hsl(var(--accent-light))',
                                        dark: 'hsl(var(--accent-dark))'
                                },
                                popover: {
                                        DEFAULT: 'hsl(var(--popover))',
                                        foreground: 'hsl(var(--popover-foreground))'
                                },
                                card: {
                                        DEFAULT: 'hsl(var(--card))',
                                        foreground: 'hsl(var(--card-foreground))'
                                },
                                success: {
                                        DEFAULT: 'hsl(var(--success))',
                                        foreground: 'hsl(var(--success-foreground))',
                                        light: 'hsl(var(--success-light))',
                                        dark: 'hsl(var(--success-dark))'
                                },
                                warning: {
                                        DEFAULT: 'hsl(var(--warning))',
                                        foreground: 'hsl(var(--warning-foreground))',
                                        light: 'hsl(var(--warning-light))',
                                        dark: 'hsl(var(--warning-dark))'
                                },
                                info: {
                                        DEFAULT: 'hsl(var(--info))',
                                        foreground: 'hsl(var(--info-foreground))',
                                        light: 'hsl(var(--info-light))',
                                        dark: 'hsl(var(--info-dark))'
                                },
                                purple: {
                                        DEFAULT: 'hsl(var(--purple))',
                                        foreground: 'hsl(var(--purple-foreground))',
                                        light: 'hsl(var(--purple-light))',
                                        dark: 'hsl(var(--purple-dark))'
                                },
                                cyan: {
                                        DEFAULT: 'hsl(var(--cyan))',
                                        foreground: 'hsl(var(--cyan-foreground))',
                                        light: 'hsl(var(--cyan-light))',
                                        dark: 'hsl(var(--cyan-dark))'
                                },
                                pink: {
                                        DEFAULT: 'hsl(var(--pink))',
                                        foreground: 'hsl(var(--pink-foreground))',
                                        light: 'hsl(var(--pink-light))',
                                        dark: 'hsl(var(--pink-dark))'
                                },
                                indigo: {
                                        DEFAULT: 'hsl(var(--indigo))',
                                        foreground: 'hsl(var(--indigo-foreground))',
                                        light: 'hsl(var(--indigo-light))',
                                        dark: 'hsl(var(--indigo-dark))'
                                },
                                sidebar: {
                                        DEFAULT: 'hsl(var(--sidebar-background))',
                                        foreground: 'hsl(var(--sidebar-foreground))',
                                        primary: 'hsl(var(--sidebar-primary))',
                                        'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                                        accent: 'hsl(var(--sidebar-accent))',
                                        'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                                        border: 'hsl(var(--sidebar-border))',
                                        ring: 'hsl(var(--sidebar-ring))'
                                },
                                chart: {
                                        '1': 'hsl(var(--chart-1))',
                                        '2': 'hsl(var(--chart-2))',
                                        '3': 'hsl(var(--chart-3))',
                                        '4': 'hsl(var(--chart-4))',
                                        '5': 'hsl(var(--chart-5))',
                                        '6': 'hsl(var(--chart-6))',
                                        '7': 'hsl(var(--chart-7))',
                                        '8': 'hsl(var(--chart-8))'
                                }
                        },
                        borderRadius: {
                                lg: 'var(--radius)',
                                md: 'calc(var(--radius) - 2px)',
                                sm: 'calc(var(--radius) - 4px)'
                        },
                        keyframes: {
                                'accordion-down': {
                                        from: {
                                                height: '0'
                                        },
                                        to: {
                                                height: 'var(--radix-accordion-content-height)'
                                        }
                                },
                                'accordion-up': {
                                        from: {
                                                height: 'var(--radix-accordion-content-height)'
                                        },
                                        to: {
                                                height: '0'
                                        }
                                }
                        },
                        animation: {
                                'accordion-down': 'accordion-down 0.2s ease-out',
                                'accordion-up': 'accordion-up 0.2s ease-out'
                        }
                }
        },
    plugins: [
        tailwindAnimate,
        containerQuery,
        function ({addUtilities}) {
            addUtilities(
                {
                    '.border-t-solid': {'border-top-style': 'solid'},
                    '.border-r-solid': {'border-right-style': 'solid'},
                    '.border-b-solid': {'border-bottom-style': 'solid'},
                    '.border-l-solid': {'border-left-style': 'solid'},
                    '.border-t-dashed': {'border-top-style': 'dashed'},
                    '.border-r-dashed': {'border-right-style': 'dashed'},
                    '.border-b-dashed': {'border-bottom-style': 'dashed'},
                    '.border-l-dashed': {'border-left-style': 'dashed'},
                    '.border-t-dotted': {'border-top-style': 'dotted'},
                    '.border-r-dotted': {'border-right-style': 'dotted'},
                    '.border-b-dotted': {'border-bottom-style': 'dotted'},
                    '.border-l-dotted': {'border-left-style': 'dotted'},
                },
                ['responsive']
            );
        },
    ],
};
