import { createRootRoute, Outlet, useLocation, Link } from '@tanstack/react-router';
import { AppShell, Burger, Group, Title, NavLink, Text, Avatar, Badge, Select, Button, Modal, TextInput, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { IconSettingsSpark, IconFileDescription, IconCoin, IconArrowsRightLeft, IconFlame, IconShieldLock, IconCashBanknote, IconDatabaseSearch, IconDashboard, IconCheck, IconLock, IconTrash } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSandboxStore, useActiveBond, LIFECYCLE_ORDER, STEP_LABELS, type LifecycleStep } from '../store/sandboxStore';

export const Route = createRootRoute({
    component: RootComponent,
    notFoundComponent: () => (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <Title order={2} c="var(--text-main)">Page Not Found</Title>
            <Text c="var(--text-muted)" mt="md">The page you're looking for doesn't exist.</Text>
            <Link to="/" style={{ color: 'var(--accent-blue)', marginTop: '1rem', display: 'inline-block' }}>
                Back to Dashboard
            </Link>
        </div>
    ),
});

const STEP_ICONS: Record<LifecycleStep, React.ReactNode> = {
    setup: <IconSettingsSpark size="1.1rem" stroke={1.5} />,
    terms: <IconFileDescription size="1.1rem" stroke={1.5} />,
    mint: <IconCoin size="1.1rem" stroke={1.5} />,
    transfer: <IconArrowsRightLeft size="1.1rem" stroke={1.5} />,
    coupon: <IconCashBanknote size="1.1rem" stroke={1.5} />,
    compliance: <IconShieldLock size="1.1rem" stroke={1.5} />,
    redemption: <IconFlame size="1.1rem" stroke={1.5} />,
};

const STEP_ROUTES: Record<LifecycleStep, string> = {
    setup: '/setup',
    terms: '/terms',
    mint: '/mint',
    transfer: '/transfer',
    coupon: '/coupon',
    compliance: '/compliance',
    redemption: '/redemption',
};

function StepLink({ step, currentPath }: { step: LifecycleStep; currentPath: string }) {
    const { isStepAccessible } = useSandboxStore();
    const activeBond = useActiveBond();

    if (!activeBond) return null;

    const route = STEP_ROUTES[step];
    const meta = STEP_LABELS[step];
    const isActive = currentPath === route;
    const isCompleted = activeBond.completedSteps.has(step);
    const isCurrent = activeBond.currentStep === step;
    const accessible = isStepAccessible(step);

    const icon = isCompleted
        ? <IconCheck size="1.1rem" stroke={2} color="#10B981" />
        : (!accessible ? <IconLock size="1.1rem" stroke={1.5} color="var(--text-muted)" style={{ opacity: 0.4 }} /> : STEP_ICONS[step]);

    const rightSection = isCompleted
        ? <Badge size="xs" color="green" variant="filled" style={{ minWidth: 'auto', padding: '0 6px' }}>Done</Badge>
        : (isCurrent ? <Badge size="xs" color="blue" variant="light" style={{ minWidth: 'auto', padding: '0 6px' }}>Active</Badge> : null);

    if (!accessible && !isCompleted) {
        return (
            <NavLink
                component="div"
                label={`${meta.number}. ${meta.label}`}
                description={meta.description}
                leftSection={icon}
                rightSection={rightSection}
                fw={600}
                c="var(--text-muted)"
                style={{ opacity: 0.45, cursor: 'not-allowed' }}
                disabled
            />
        );
    }

    return (
        <Link to={route} style={{ textDecoration: 'none' }}>
            <NavLink
                component="div"
                label={`${meta.number}. ${meta.label}`}
                description={meta.description}
                leftSection={icon}
                rightSection={rightSection}
                fw={600}
                c={isActive ? 'var(--text-main)' : (isCompleted ? '#10B981' : 'var(--text-muted)')}
                active={isActive}
                variant="light"
            />
        </Link>
    );
}

function UtilityLink({ to, label, icon, currentPath }: { to: string; label: string; icon: React.ReactNode; currentPath: string }) {
    const isActive = currentPath === to;
    return (
        <Link to={to} style={{ textDecoration: 'none' }}>
            <NavLink
                component="div"
                label={label}
                leftSection={icon}
                fw={600}
                c={isActive ? 'var(--text-main)' : 'var(--text-muted)'}
                active={isActive}
                variant="light"
            />
        </Link>
    );
}

function RootComponent() {
    const [opened, { toggle }] = useDisclosure();
    const location = useLocation();
    const currentPath = location.pathname;

    const { bonds, activeBondId, setActiveBond, createBond, resetAll } = useSandboxStore();
    const activeBond = useActiveBond();
    const bondOptions = Object.values(bonds).map(b => ({ value: b.id, label: b.name }));

    const [createModalOpen, { open: openCreate, close: closeCreate }] = useDisclosure(false);
    const [resetModalOpen, { open: openReset, close: closeReset }] = useDisclosure(false);
    const [newBondName, setNewBondName] = useState('');

    // Detect stale contracts (addresses saved but contract objects lost after refresh)
    const hasStaleContracts = activeBond && activeBond.cmtatBondAddress && !activeBond.bondContract;

    const handleCreateBond = () => {
        if (newBondName.trim()) {
            createBond(newBondName.trim());
            setNewBondName('');
            closeCreate();
        }
    };

    return (
        <AppShell
            header={{ height: 80 }}
            navbar={{
                width: 300,
                breakpoint: 'sm',
                collapsed: { mobile: !opened },
            }}
            padding="md"
            styles={{
                root: {
                    backgroundColor: 'transparent',
                },
                header: {
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: 'var(--panel-bg)',
                    backdropFilter: 'blur(12px)',
                },
                navbar: {
                    borderRight: '1px solid var(--border-color)',
                    backgroundColor: 'var(--panel-bg)',
                    backdropFilter: 'blur(12px)',
                    padding: '16px 12px',
                }
            }}
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Group>
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color="var(--text-main)" />
                        <Title order={3} c="var(--text-main)" style={{ fontFamily: 'Space Grotesk', fontWeight: 900, letterSpacing: '-0.5px' }}>
                            CMTAT + ICMA Sandbox
                        </Title>
                    </Group>
                    <Group>
                        <Text c="var(--accent-blue)" fw={700} ff="JetBrains Mono" size="sm" visibleFrom="xs">
                            Tokenized Fixed Income Lifecycle
                        </Text>
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar>
                <Modal opened={createModalOpen} onClose={closeCreate} title="Create New Bond" centered>
                    <TextInput
                        label="Bond Name"
                        placeholder="e.g. Green Bond 2026"
                        value={newBondName}
                        onChange={(e) => setNewBondName(e.currentTarget.value)}
                        mb="lg"
                    />
                    <Button fullWidth color="blue" onClick={handleCreateBond}>Create & Switch Context</Button>
                </Modal>

                <Box mb="sm" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <Select
                        label="Active Bond Context"
                        data={bondOptions}
                        value={activeBondId}
                        onChange={(val) => { if (val) setActiveBond(val); }}
                        variant="filled"
                        size="sm"
                        mb="sm"
                        styles={{ label: { color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, marginBottom: '8px' } }}
                    />
                    <Button fullWidth variant="light" color="blue" size="xs" onClick={openCreate}>
                        + Track New Bond
                    </Button>
                </Box>

                {/* Dashboard */}
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <NavLink
                        component="div"
                        label="Overview Dashboard"
                        leftSection={<IconDashboard size="1.2rem" stroke={1.5} />}
                        fw={700}
                        c={currentPath === '/' ? 'var(--text-main)' : 'var(--text-muted)'}
                        active={currentPath === '/'}
                        variant="light"
                        mb="xs"
                    />
                </Link>

                {/* Bond Lifecycle Steps */}
                <Text size="xs" tt="uppercase" fw={800} mb="sm" mt="md" c="var(--text-muted)" ff="JetBrains Mono" style={{ letterSpacing: '1px', paddingLeft: '12px' }}>
                    Bond Lifecycle
                </Text>

                {LIFECYCLE_ORDER.map((step) => (
                    <StepLink key={step} step={step} currentPath={currentPath} />
                ))}

                {/* Utility Section */}
                <Text size="xs" tt="uppercase" fw={800} mb="sm" mt="lg" c="var(--text-muted)" ff="JetBrains Mono" style={{ letterSpacing: '1px', paddingLeft: '12px' }}>
                    Tools
                </Text>

                <UtilityLink to="/inspector" label="ICMA Data Inspector" icon={<IconDatabaseSearch size="1.2rem" stroke={1.5} />} currentPath={currentPath} />
                <UtilityLink to="/settings" label="Settings" icon={<IconSettingsSpark size="1.2rem" stroke={1.5} />} currentPath={currentPath} />

                {/* Reset / Purge Demo */}
                <Modal opened={resetModalOpen} onClose={closeReset} title="Reset Demo" centered size="sm">
                    <Text size="sm" c="var(--text-muted)" mb="lg">
                        This will clear all deployed contracts, step progress, and bond data. The in-memory EVM will be reset. You'll need to re-deploy from Step 1.
                    </Text>
                    <Group justify="flex-end">
                        <Button variant="default" onClick={closeReset}>Cancel</Button>
                        <Button color="red" leftSection={<IconTrash size="1rem" />} onClick={() => { resetAll(); closeReset(); window.location.href = '/'; }}>Purge & Reset</Button>
                    </Group>
                </Modal>

                <Button
                    fullWidth
                    variant="subtle"
                    color="red"
                    size="xs"
                    mt="md"
                    leftSection={<IconTrash size="1rem" />}
                    onClick={openReset}
                >
                    Reset Demo
                </Button>

                {/* Stale contracts warning */}
                {hasStaleContracts && (
                    <Box mt="sm" p="xs" style={{ backgroundColor: 'rgba(234,179,8,0.1)', borderRadius: '6px', border: '1px solid rgba(234,179,8,0.3)' }}>
                        <Text size="xs" c="#EAB308" fw={600}>Contracts stale after refresh</Text>
                        <Text size="xs" c="#EAB308" mt={2}>Re-deploy from <Link to="/setup" style={{ color: '#60A5FA', textDecoration: 'underline' }}>Step 1</Link> or <Text span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={openReset}>reset demo</Text>.</Text>
                    </Box>
                )}

                {/* User info at bottom */}
                <Group style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }} wrap="nowrap">
                    <Avatar color="accent" radius="xl">SO</Avatar>
                    <div>
                        <Text size="sm" fw={700} c="var(--text-main)">Sandbox Operator</Text>
                        <Text size="xs" c="var(--accent-blue)" ff="JetBrains Mono">DLT Admin</Text>
                    </div>
                </Group>
            </AppShell.Navbar>

            <AppShell.Main>
                <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '24px', paddingBottom: '64px' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPath}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </AppShell.Main>
        </AppShell>
    );
}
