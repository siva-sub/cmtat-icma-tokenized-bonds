import { createFileRoute } from '@tanstack/react-router'
import { Card, Title, Text, Button, Stack, Group, SimpleGrid, ThemeIcon, Progress, Box, Grid } from '@mantine/core'
import { IconCashBanknote, IconCalendarEvent, IconPercentage } from '@tabler/icons-react'
import { useState, useRef, useEffect } from 'react'
import { useSandboxStore, useActiveBond } from '../store/sandboxStore'
import { motion, AnimatePresence } from 'framer-motion'

export const Route = createFileRoute('/coupon')({
    component: CouponComponent,
})

function CouponComponent() {
    const { completeStep } = useSandboxStore()
    const activeBond = useActiveBond()
    const cmtatBondAddress = activeBond?.cmtatBondAddress || null
    const icmaDataEngineAddress = activeBond?.icmaDataEngineAddress || null

    const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success', message: string }>({ type: 'idle', message: '' })
    const [progress, setProgress] = useState(0)

    const [logs, setLogs] = useState<string[]>([])
    const logsEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    const mockSchedule = [
        { date: '14 May 2025', amount: '€ 1,000,000', status: 'pending' },
        { date: '14 May 2026', amount: '€ 1,000,000', status: 'pending' }
    ]

    const handleSimulation = async () => {
        setStatus({ type: 'loading', message: 'Simulating coupon distribution across token holders...' })
        setLogs(['> Initiating coupon distribution simulation...'])

        let p = 0;
        const interval = setInterval(() => {
            p += 20;
            setProgress(p);

            if (p === 20) setLogs(prev => [...prev, '> Snapshotting token holder balances on Record Date...'])
            if (p === 40) setLogs(prev => [...prev, '> Calculating pro-rata € 1,000,000 distribution...'])
            if (p === 60) setLogs(prev => [...prev, '> Preparing CMTAT compliance hooks...'])
            if (p === 80) setLogs(prev => [...prev, '> Executing atomic stablecoin pushes...'])

            if (p >= 100) {
                clearInterval(interval);
                setStatus({ type: 'success', message: 'Coupon payment of € 1,000,000 successfully distributed pro-rata to all current bond holders on-chain!' })
                setLogs(prev => [...prev, '> [OK] Distribution complete. Events emitted.'])
                // Advance lifecycle
                setTimeout(() => completeStep('coupon'), 1500)
            }
        }, 800)
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Grid gutter="xl">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Stack gap="xl">
                        <Box>
                            <Title order={2} className="gradient-text" mb="xs">5. Coupon Payment Distribution</Title>
                            <Text c="var(--text-muted)" mb="md">
                                View the interest payment schedule and simulate the tokenized distribution of coupons to bond holders.
                            </Text>

                            <div className="instructions-card" style={{ marginBottom: '24px' }}>
                                <Text size="sm" fw={700} c="var(--accent-blue)" mb="xs">What Happens in This Step</Text>
                                <p>On each <em>Record Date</em>, the CMTAT contract takes a <strong>snapshot</strong> of all token holder balances. The coupon engine then calculates each holder's pro-rata share of the interest payment and distributes stablecoins (or fiat-pegged tokens) atomically via the contract's compliance hooks.</p>
                                <p style={{ marginTop: '8px' }}>This sandbox simulates the distribution flow — in production, the process would integrate with a payment agent or a stablecoin smart contract for true DvP coupon settlement.</p>
                            </div>
                        </Box>

                        {!cmtatBondAddress || !icmaDataEngineAddress ? (
                            <Box p="md" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', border: '1px solid #EAB308' }}>
                                <Text fw={700} c="#EAB308">Previous Steps Required</Text>
                                <Text size="sm" c="#EAB308">Please complete the prior lifecycle steps first.</Text>
                            </Box>
                        ) : (
                            <>
                                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                                    <Card padding="lg" className="neobrutal-card">
                                        <Group>
                                            <ThemeIcon variant="light" size="xl" color="blue"><IconPercentage /></ThemeIcon>
                                            <div>
                                                <Text c="var(--text-muted)" size="xs" fw={700} tt="uppercase">Interest Rate</Text>
                                                <Text fw={700} size="xl">2.50% Fix</Text>
                                            </div>
                                        </Group>
                                    </Card>
                                    <Card padding="lg" className="neobrutal-card">
                                        <Group>
                                            <ThemeIcon variant="light" size="xl" color="orange"><IconCalendarEvent /></ThemeIcon>
                                            <div>
                                                <Text c="var(--text-muted)" size="xs" fw={700} tt="uppercase">Frequency</Text>
                                                <Text fw={700} size="xl">Annually</Text>
                                            </div>
                                        </Group>
                                    </Card>
                                    <Card padding="lg" className="neobrutal-card">
                                        <Group>
                                            <ThemeIcon variant="light" size="xl" color="green"><IconCashBanknote /></ThemeIcon>
                                            <div>
                                                <Text c="var(--text-muted)" size="xs" fw={700} tt="uppercase">Next Payment</Text>
                                                <Text fw={700} size="xl">{mockSchedule[0].date}</Text>
                                            </div>
                                        </Group>
                                    </Card>
                                </SimpleGrid>

                                <Card padding="xl" className="neobrutal-card">
                                    <Title order={4} mb="md">Coupon Distribution Simulation</Title>
                                    <Text size="sm" c="var(--text-muted)" mb="xl">
                                        In production, the Coupon Engine will snapshot token holder balances on the Record Date and atomically push stablecoins via the CMTAT compliance hooks.
                                    </Text>

                                    <AnimatePresence>
                                        {status.type === 'loading' && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                <Box mb="md">
                                                    <Progress value={progress} size="xl" radius="xl" striped animated color="blue" />
                                                    <Text size="sm" c="var(--text-muted)" mt="xs" ta="center">{status.message}</Text>
                                                </Box>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <Button
                                        fullWidth
                                        variant="filled"
                                        color="accent"
                                        size="lg"
                                        onClick={handleSimulation}
                                        disabled={status.type === 'loading' || status.type === 'success'}
                                    >
                                        {status.type === 'success' ? 'Distribution Complete' : 'Execute Coupon Distribution'}
                                    </Button>
                                </Card>

                                <AnimatePresence>
                                    {status.message && status.type === 'success' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }}>
                                            <Box p="md" style={{
                                                border: '1px solid #10B981',
                                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                borderRadius: '8px'
                                            }}>
                                                <Text c="#10B981" fw={600}>{status.message}</Text>
                                            </Box>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card padding="xl" className="neobrutal-card" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
                        <Group justify="space-between" mb="sm" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                            <Title order={4}>Network Activity</Title>
                            <Box style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: status.type === 'loading' ? '#EAB308' : '#10B981' }} className={status.type === 'loading' ? 'pulse-badge' : ''} />
                        </Group>
                        <div className="terminal-log">
                            {logs.length === 0 && (
                                <Text c="dimmed" size="xs" style={{ fontStyle: 'italic' }}>Awaiting coupon execution...</Text>
                            )}
                            {logs.map((log, i) => (
                                <p key={i} className={log.includes('[OK]') ? 'token-success' : log.includes('[ERROR]') ? 'token-error' : ''}>
                                    {log}
                                </p>
                            ))}
                            <div ref={logsEndRef} />
                        </div>
                    </Card>
                </Grid.Col>
            </Grid>
        </motion.div>
    )
}
