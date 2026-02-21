import { createFileRoute } from '@tanstack/react-router'
import { Card, Title, Text, Button, Stack, Group, Timeline, Badge, Grid, Progress } from '@mantine/core'
import { IconCircleDashed, IconCoin, IconArrowsRightLeft, IconFlame, IconSettingsSpark, IconFileDescription, IconCashBanknote, IconShieldLock } from '@tabler/icons-react'
import { useSandboxStore, LIFECYCLE_ORDER, STEP_LABELS } from '../store/sandboxStore'
import { Link } from '@tanstack/react-router'
import { motion, Variants } from 'framer-motion'

export const Route = createFileRoute('/')({
    component: DashboardComponent,
})

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

const STEP_ICONS = [
    <IconSettingsSpark size={18} />,
    <IconFileDescription size={18} />,
    <IconCoin size={18} />,
    <IconArrowsRightLeft size={18} />,
    <IconCashBanknote size={18} />,
    <IconShieldLock size={18} />,
    <IconFlame size={18} />,
]

function DashboardComponent() {
    const { bonds, activeBondId, setActiveBond } = useSandboxStore()
    const activeBond = activeBondId ? bonds[activeBondId] : null

    const currentStep = activeBond?.currentStep || 'setup'
    const completedSteps = activeBond?.completedSteps || new Set()

    const currentIndex = LIFECYCLE_ORDER.indexOf(currentStep)

    const getStatus = (targetIndex: number) => {
        const step = LIFECYCLE_ORDER[targetIndex]
        if (completedSteps.has(step)) return 'completed'
        if (currentIndex === targetIndex) return 'active'
        return 'pending'
    }

    const bondList = Object.values(bonds)

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <Stack gap="xl" p="md">
                <motion.div variants={itemVariants}>
                    <Title order={1} mb="xs" className="gradient-text">Bond Lifecycle Dashboard</Title>
                    <Text c="var(--text-muted)" size="lg" style={{ maxWidth: '700px' }}>
                        Comprehensive tokenized fixed income lifecycle sandbox — deploy CMTAT-compliant bond tokens, set ICMA BDT structured data, and execute the full issuance-to-redemption workflow on an in-memory EVM.
                    </Text>
                    <Group mt="sm" gap="xs">
                        <Badge variant="light" color="blue" size="sm">CMTAT</Badge>
                        <Badge variant="light" color="grape" size="sm">ICMA BDT</Badge>
                        <Badge variant="light" color="cyan" size="sm">Ethers.js v6</Badge>
                        <Badge variant="light" color="teal" size="sm">Tevm EVM</Badge>
                        <Badge variant="light" color="orange" size="sm">ERC-20</Badge>
                    </Group>
                </motion.div>

                <Grid gutter="xl">
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <motion.div variants={itemVariants} style={{ height: '100%' }}>
                            <Card padding="xl" h="100%" className="neobrutal-card">
                                <Title order={3} mb="xl">Bond Lifecycle Timeline</Title>

                                <Timeline active={currentIndex} bulletSize={32} lineWidth={4} color="blue">
                                    {LIFECYCLE_ORDER.map((step, i) => {
                                        const meta = STEP_LABELS[step]
                                        const status = getStatus(i)
                                        return (
                                            <Timeline.Item
                                                key={step}
                                                bullet={STEP_ICONS[i]}
                                                title={<Text fw={700}>{meta.number}. {meta.label}</Text>}
                                                lineVariant={status === 'completed' ? "solid" : "dashed"}
                                            >
                                                <Text c="var(--text-muted)" size="sm" mt={4}>
                                                    {meta.description}
                                                </Text>
                                                <Badge mt="xs" color={status === 'completed' ? 'green' : (status === 'active' ? 'blue' : 'gray')} variant="light">
                                                    {status.toUpperCase()}
                                                </Badge>
                                            </Timeline.Item>
                                        )
                                    })}
                                </Timeline>

                                <Group justify="flex-end" mt="xl">
                                    {currentStep === 'setup' && (
                                        <Button component={Link} to="/setup" color="blue" variant="filled">Begin Lifecycle</Button>
                                    )}
                                    {currentStep !== 'setup' && (
                                        <Button component={Link} to={`/${currentStep}`} color="blue" variant="filled">Go to Current Step</Button>
                                    )}
                                </Group>
                            </Card>
                        </motion.div>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <motion.div variants={itemVariants} style={{ height: '100%' }}>
                            <Stack gap="lg" h="100%">
                                <Card padding="lg" h="100%" className="neobrutal-card" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                    <Title order={4} mb="md">Bond Portfolios</Title>

                                    {bondList.length === 0 ? (
                                        <Group align="center" style={{ flex: 1 }} justify="center">
                                            <Stack align="center" gap="xs">
                                                <IconCircleDashed color="var(--text-muted)" size={48} stroke={1.5} />
                                                <Text c="var(--text-muted)" size="sm" ta="center">No active bonds detected in the sandbox.</Text>
                                            </Stack>
                                        </Group>
                                    ) : (
                                        <Stack gap="md" style={{ flex: 1, overflowY: 'auto' }}>
                                            {bondList.map(bond => {
                                                const isActive = bond.id === activeBondId;
                                                const bondProgress = (bond.completedSteps.size / LIFECYCLE_ORDER.length) * 100;
                                                return (
                                                    <Card key={bond.id} withBorder p="sm"
                                                        onClick={() => setActiveBond(bond.id)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            borderColor: isActive ? 'var(--accent-blue)' : 'var(--border-color)',
                                                            backgroundColor: isActive ? 'rgba(56, 189, 248, 0.05)' : 'transparent',
                                                        }}
                                                    >
                                                        <Group justify="space-between" mb="xs">
                                                            <Group gap="xs">
                                                                <Text fw={700} c={isActive ? 'var(--text-main)' : 'var(--text-muted)'}>{bond.name}</Text>
                                                                {bond.rating && (
                                                                    <Badge variant="outline" color="yellow" size="xs" radius="sm">{bond.ratingAgency}: {bond.rating}</Badge>
                                                                )}
                                                            </Group>
                                                            <Badge color={bond.cmtatBondAddress ? 'green' : 'gray'} variant="light" className={isActive && bond.cmtatBondAddress ? 'pulse-badge' : ''}>
                                                                {bond.cmtatBondAddress ? 'LIVE' : 'DRAFT'}
                                                            </Badge>
                                                        </Group>
                                                        <Progress value={bondProgress} size="sm" color={isActive ? 'blue' : 'gray'} radius="xl" mb="xs" />
                                                        <Group justify="space-between">
                                                            <Text size="xs" c="var(--text-muted)">{bond.completedSteps.size} / {LIFECYCLE_ORDER.length} steps</Text>
                                                            <Text size="xs" c="var(--text-muted)" tt="uppercase">{bond.currentStep}</Text>
                                                        </Group>
                                                    </Card>
                                                )
                                            })}
                                        </Stack>
                                    )}

                                    {activeBond && activeBond.cmtatBondAddress && (
                                        <Button component={Link} to="/inspector" variant="outline" color="blue" size="sm" mt="lg" fullWidth>
                                            Inspect {activeBond.name} On-Chain
                                        </Button>
                                    )}
                                </Card>
                            </Stack>
                        </motion.div>
                    </Grid.Col>
                </Grid>
            </Stack>
        </motion.div>
    )
}
