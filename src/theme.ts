import { createTheme, MantineColorsTuple } from '@mantine/core';

const electricBlue: MantineColorsTuple = [
    '#e1f0ff',
    '#ccdeee',
    '#9fbcd6',
    '#6e99c0',
    '#447aab',
    '#29659e',
    '#185a97',
    '#0d7ff2', // The core electric blue
    '#004278',
    '#00386b'
];

export const theme = createTheme({
    primaryColor: 'accent',
    colors: {
        accent: electricBlue,
    },
    fontFamily: 'Inter, sans-serif',
    headings: {
        fontFamily: 'Inter, sans-serif',
        sizes: {
            h1: { fontSize: '48px', fontWeight: '800', lineHeight: '1.1' },
            h2: { fontSize: '36px', fontWeight: '800', lineHeight: '1.2' },
            h3: { fontSize: '28px', fontWeight: '700', lineHeight: '1.3' },
            h4: { fontSize: '20px', fontWeight: '700', lineHeight: '1.4' }
        }
    },
    components: {
        Card: {
            defaultProps: {
                radius: 'sm',
            },
            styles: {
                root: {
                    backgroundColor: '#1E293B', /* Slate 800 */
                    border: '2px solid #334155', /* Slate 700 */
                    boxShadow: '4px 4px 0px 0px #000000',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }
            }
        },
        Button: {
            defaultProps: {
                radius: 'sm',
                size: 'md',
                fw: 700,
            },
            styles: {
                root: {
                    fontFamily: 'Inter, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    border: '2px solid #000000',
                    boxShadow: '3px 3px 0px 0px #000000',
                    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                    '&:active': {
                        transform: 'translate(2px, 2px)',
                        boxShadow: '1px 1px 0px 0px #000000',
                    }
                }
            }
        },
        TextInput: {
            defaultProps: {
                radius: 'sm',
            },
            styles: {
                input: {
                    backgroundColor: '#0F172A', // Slate 900
                    border: '2px solid #334155',
                    padding: '24px 12px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 500,
                    color: '#F8FAFC',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    '&:focus': {
                        borderColor: '#0d7ff2',
                        boxShadow: '4px 4px 0px 0px #0d7ff2',
                    }
                },
                label: {
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    letterSpacing: '0.05em',
                    color: '#94A3B8', // Slate 400
                    marginBottom: '8px'
                }
            }
        },
        NumberInput: {
            defaultProps: {
                radius: 'sm',
            },
            styles: {
                input: {
                    backgroundColor: '#0F172A',
                    border: '2px solid #334155',
                    padding: '24px 12px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 500,
                    color: '#F8FAFC',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    '&:focus': {
                        borderColor: '#0d7ff2',
                        boxShadow: '4px 4px 0px 0px #0d7ff2',
                    }
                },
                label: {
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    letterSpacing: '0.05em',
                    color: '#94A3B8',
                    marginBottom: '8px'
                }
            }
        },
        Select: {
            defaultProps: {
                radius: 'sm',
            },
            styles: {
                input: {
                    backgroundColor: '#0F172A',
                    border: '2px solid #334155',
                    padding: '24px 12px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    color: '#F8FAFC',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    '&:focus': {
                        borderColor: '#0d7ff2',
                        boxShadow: '4px 4px 0px 0px #0d7ff2',
                    }
                },
                label: {
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    letterSpacing: '0.05em',
                    color: '#94A3B8',
                    marginBottom: '8px'
                }
            }
        },
        Badge: {
            defaultProps: {
                radius: 'xs',
                fw: 800,
            },
            styles: {
                root: {
                    fontFamily: 'JetBrains Mono, monospace',
                    letterSpacing: '0.5px',
                    border: '1px solid currentColor',
                }
            }
        },
        Accordion: {
            styles: {
                item: {
                    backgroundColor: '#1E293B',
                    border: '2px solid #334155',
                    marginBottom: '16px',
                    boxShadow: '4px 4px 0px 0px #000000',
                    '&[data-active]': {
                        borderColor: '#0d7ff2',
                    }
                },
                control: {
                    '&:hover': {
                        backgroundColor: '#0F172A',
                    }
                },
                label: {
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '14px',
                    letterSpacing: '0.05em',
                }
            }
        },
        Tabs: {
            styles: {
                tab: {
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '12px',
                    '&[data-active]': {
                        borderColor: '#0d7ff2',
                        color: '#0d7ff2',
                        backgroundColor: 'rgba(13, 127, 242, 0.1)'
                    }
                }
            }
        },
        Table: {
            styles: {
                th: {
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    letterSpacing: '0.05em',
                    color: '#94A3B8',
                    borderBottom: '2px solid #334155',
                },
                td: {
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '13px',
                    borderBottom: '1px solid #334155',
                }
            }
        }
    }
});
