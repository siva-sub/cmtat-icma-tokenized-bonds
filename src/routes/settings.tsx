import { createFileRoute } from '@tanstack/react-router'
import { Card, Title, Text, Stack, Switch, Box } from '@mantine/core'
import { motion } from 'framer-motion'

export const Route = createFileRoute('/settings')({
    component: SettingsComponent,
})

function SettingsComponent() {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card padding="xl" className="neobrutal-card">
                <Title order={2} className="gradient-text" mb="xs">Settings</Title>
                <Text c="var(--text-muted)" size="lg" mb="xl">
                    Configure the CMTAT-ICMA sandbox environment.
                </Text>

                <Stack gap="lg">
                    <Box p="md" style={{ backgroundColor: '#0F172A', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <Switch
                            label="Live Mode"
                            description="Switch from in-memory Tevm sandbox to a live Hardhat or testnet node."
                            disabled
                            color="accent"
                        />
                    </Box>

                    <Box p="md" style={{ backgroundColor: '#0F172A', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <Text size="sm" c="var(--text-muted)" fw={700} mb="xs">Runtime Architecture</Text>
                        <Text size="sm" c="var(--text-muted)">
                            This sandbox runs a Tevm in-memory EVM, bridged to ethers.js v6 via EIP-1193.
                            All contract interactions use ethers ContractFactory/Contract objects,
                            while Tevm provides the blockchain simulation (mining, state control).
                        </Text>
                    </Box>
                </Stack>
            </Card>
        </motion.div>
    )
}
