import { createFileRoute } from '@tanstack/react-router'
import { Card, Title, Text, Button, Stack, Group, TextInput, Box, Grid } from '@mantine/core'
import { useState, useRef, useEffect } from 'react'
import { useSandboxStore, useActiveBond } from '../store/sandboxStore'
import { motion } from 'framer-motion'
import { tevmClient } from '../tevm/client'

export const Route = createFileRoute('/redemption')({
    component: RedemptionComponent,
})

function RedemptionComponent() {
    const { investorAAddress, completeStep } = useSandboxStore()
    const activeBond = useActiveBond()
    const cmtatBondAddress = activeBond?.cmtatBondAddress || null
    const bondContract = activeBond?.bondContract || null

    const [amount, setAmount] = useState('500')
    const [isRedeeming, setIsRedeeming] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [logs, setLogs] = useState<string[]>([])
    const logsEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    const handleRedeem = async () => {
        if (!bondContract) {
            setErrorMsg("Please deploy the contracts from Step 1 first.")
            return
        }

        setIsRedeeming(true)
        setErrorMsg('')
        setLogs([`> Initiating redemption of ${amount} units...`, `> Target account (to burn): ${investorAAddress}`])

        try {
            // CMTAT burn is admin-only: burn(address account, uint256 amount)
            // The bondContract is connected as issuer (admin) from setup
            const tx = await bondContract['burn(address,uint256)'](investorAAddress, BigInt(amount), { gasLimit: 5_000_000 })
            setLogs(prev => [...prev, `> TX broadcasted: ${tx.hash}`, '> Waiting for maturity confirmation...'])

            await tevmClient.mine({ blocks: 1 })
            const receipt = await tx.wait()

            if (!receipt || receipt.status === 0) {
                throw new Error(`Redemption reverted. Hash: ${tx.hash}`)
            }

            setLogs(prev => [...prev, `> [OK] Tokens burned and redeemed successfully (block ${receipt.blockNumber}).`])

            // Complete the full lifecycle!
            setTimeout(() => completeStep('redemption'), 1500)

        } catch (e: any) {
            console.error(e)
            setErrorMsg(e.message || String(e))
            setLogs(prev => [...prev, `> [ERROR] ${e.message || String(e)}`])
        } finally {
            setIsRedeeming(false)
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Grid gutter="xl">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Card padding="xl" className="neobrutal-card" h="100%">
                        <Title order={2} className="gradient-text" mb="xs">7. Maturity & Redemption</Title>
                        <Text c="var(--text-muted)" size="lg" mb="md">
                            Burn tokens to simulate bond redemption at maturity — the final step in the bond lifecycle.
                        </Text>

                        <div className="instructions-card" style={{ marginBottom: '24px' }}>
                            <Text size="sm" fw={700} c="var(--accent-blue)" mb="xs">What Happens in This Step</Text>
                            <p>At maturity, the issuer calls <strong>burn(address, amount)</strong> on the CMTAT contract, permanently destroying the ERC-20 tokens. In production, this would be paired with a final cash settlement — the investor receives the bond's face value (principal) via the payment agent.</p>
                            <p style={{ marginTop: '8px' }}>After burning, the token supply decreases and the bond lifecycle is complete. The ICMA data stored on-chain remains immutable and can be audited at any time via the Data Inspector.</p>
                        </div>

                        {!cmtatBondAddress && (
                            <Box mb="xl" p="md" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', border: '1px solid #EAB308' }}>
                                <Text fw={700} c="#EAB308">Sandbox Not Deployed</Text>
                                <Text size="sm" c="#EAB308">Please go to Step 1 and deploy the contracts first.</Text>
                            </Box>
                        )}

                        {errorMsg && (
                            <Box mb="xl" p="md" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid #EF4444' }}>
                                <Text fw={700} c="#EF4444">Error</Text>
                                <Text size="sm" c="#EF4444">{errorMsg}</Text>
                            </Box>
                        )}

                        <Stack gap="xl">
                            <Box p="md" style={{ backgroundColor: '#0F172A', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                <Text size="xs" c="var(--text-muted)" tt="uppercase" fw={700} mb={4}>Redeemer (Investor A)</Text>
                                <Text ff="JetBrains Mono" size="sm" c="var(--accent-blue)" style={{ wordBreak: 'break-all' }}>{investorAAddress}</Text>
                            </Box>

                            <TextInput
                                label="Amount to Redeem"
                                placeholder="e.g. 500"
                                value={amount}
                                onChange={(e) => setAmount(e.currentTarget.value)}
                                size="md"
                            />

                            <Group justify="flex-start" mt="md">
                                <Button
                                    size="lg"
                                    color="accent"
                                    onClick={handleRedeem}
                                    loading={isRedeeming}
                                    disabled={!cmtatBondAddress}
                                >
                                    Redeem Tokens
                                </Button>
                            </Group>
                        </Stack>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card padding="xl" className="neobrutal-card" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
                        <Group justify="space-between" mb="sm" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                            <Title order={4}>Network Activity</Title>
                            <Box style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isRedeeming ? '#EAB308' : '#10B981' }} className={isRedeeming ? 'pulse-badge' : ''} />
                        </Group>
                        <div className="terminal-log">
                            {logs.length === 0 && (
                                <Text c="dimmed" size="xs" style={{ fontStyle: 'italic' }}>Awaiting redemption triggers...</Text>
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
