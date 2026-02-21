import { createFileRoute } from '@tanstack/react-router'
import { Card, Title, Text, Button, Stack, Group, TextInput, Box, Grid } from '@mantine/core'
import { useState, useRef, useEffect } from 'react'
import { useSandboxStore, useActiveBond } from '../store/sandboxStore'
import { getInvestorASigner, tevmClient } from '../tevm/client'
import { Contract } from 'ethers'
import { motion, AnimatePresence } from 'framer-motion'
import { IconArrowRight } from '@tabler/icons-react'

import CMTATBondArtifact from '../../artifacts/contracts/deployment/CMTATBond.sol/CMTATBond.json'
import { screenEntity } from '../utils/screeningEngine'

export const Route = createFileRoute('/transfer')({
    component: TransferComponent,
})

function TransferComponent() {
    const { investorAAddress, investorBAddress, completeStep } = useSandboxStore()
    const activeBond = useActiveBond()
    const cmtatBondAddress = activeBond?.cmtatBondAddress || null

    const [amount, setAmount] = useState('500')
    const [isTransferring, setIsTransferring] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [logs, setLogs] = useState<string[]>([])
    const logsEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    const handleTransfer = async () => {
        if (!cmtatBondAddress) {
            setErrorMsg("Please deploy the contracts from Step 1 first.")
            return
        }

        setIsTransferring(true)
        setErrorMsg('')
        setLogs([`> Initiating transfer of ${amount} units...`, `> From (Inv A): ${investorAAddress}`, `> To (Inv B): ${investorBAddress}`])

        try {
            // 1. Pre-Trade Compliance Check
            setLogs(prev => [...prev, '> Performing compliance screening on counterparty...'])
            const screeningResult = screenEntity(investorBAddress)

            if (screeningResult.isSanctioned) {
                setLogs(prev => [...prev, `> [ALERT] Recipient matched on sanctions list: ${screeningResult.match?.listType}`])
                throw new Error(`Compliance Block: ${screeningResult.message}`)
            }

            setLogs(prev => [...prev, '> [OK] Counterparties cleared. Initiating on-chain transfer...'])

            // 2. Connect the bond contract as Investor A (the sender)
            const investorASigner = getInvestorASigner()
            const bondAsInvestorA = new Contract(cmtatBondAddress, CMTATBondArtifact.abi, investorASigner)

            // Execute the ERC-20 transfer
            const tx = await bondAsInvestorA.transfer(investorBAddress, BigInt(amount), { gasLimit: 5_000_000 })
            setLogs(prev => [...prev, `> TX broadcasted: ${tx.hash}`, '> Waiting for settlement...'])

            await tevmClient.mine({ blocks: 1 })
            const receipt = await tx.wait()

            if (!receipt || receipt.status === 0) {
                throw new Error(`Transfer reverted. Hash: ${tx.hash}`)
            }

            setLogs(prev => [...prev, `> [OK] Transfer successful. Validated in block ${receipt.blockNumber}.`])

            setTimeout(() => completeStep('transfer'), 2000)
        } catch (e: any) {
            console.error(e)
            setErrorMsg(e.message || String(e))
            setLogs(prev => [...prev, `> [ERROR] ${e.message || String(e)}`])
        } finally {
            setIsTransferring(false)
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Grid gutter="xl">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Card padding="xl" className="neobrutal-card" h="100%">
                        <Title order={2} className="gradient-text" mb="xs">4. Secondary Market Trading</Title>
                        <Text c="var(--text-muted)" size="lg" mb="md">
                            Transfer the tokenized bond between investors. Watch peer-to-peer settlement occur instantly on-chain.
                        </Text>

                        <div className="instructions-card" style={{ marginBottom: '24px' }}>
                            <Text size="sm" fw={700} c="var(--accent-blue)" mb="xs">What Happens in This Step</Text>
                            <p>Investor A calls <strong>transfer(to, amount)</strong> — the standard ERC-20 transfer function. CMTAT intercepts this via its <em>TransferModule</em> hooks, which can enforce transfer restrictions (paused contract, frozen sender/receiver, regulatory checks) before allowing the settlement.</p>
                            <p style={{ marginTop: '8px' }}>We execute a simulated pre-trade check against the offline sanctions database first, which would normally exist at the broker-dealer level.</p>
                        </div>

                        {!cmtatBondAddress && (
                            <Box mb="xl" p="md" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', border: '1px solid #EAB308' }}>
                                <Text fw={700} c="#EAB308">Sandbox Not Deployed</Text>
                                <Text size="sm" c="#EAB308">Please go to Step 1 and deploy the contracts first.</Text>
                            </Box>
                        )}

                        {errorMsg && (
                            <Box mb="xl" p="md" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid #EF4444' }}>
                                <Text fw={700} c="#EF4444">Transaction Blocked</Text>
                                <Text size="sm" c="#EF4444">{errorMsg}</Text>
                            </Box>
                        )}

                        <Stack gap="xl">
                            <Group grow align="center" gap="xl">
                                <Box p="md" style={{ backgroundColor: '#0F172A', border: '1px solid var(--border-color)', borderRadius: '8px', position: 'relative' }}>
                                    <Text size="xs" c="var(--text-muted)" tt="uppercase" fw={700} mb={4}>Sender (Investor A)</Text>
                                    <Text ff="JetBrains Mono" size="xs" c="var(--accent-blue)" style={{ wordBreak: 'break-all' }}>{investorAAddress}</Text>
                                </Box>

                                <Box style={{ display: 'flex', justifyContent: 'center', position: 'relative', height: '100%', alignItems: 'center' }}>
                                    <AnimatePresence>
                                        {isTransferring && (
                                            <motion.div
                                                initial={{ x: -40, opacity: 0 }}
                                                animate={{ x: 40, opacity: 1 }}
                                                exit={{ x: 80, opacity: 0 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                style={{ position: 'absolute' }}
                                            >
                                                <IconArrowRight color="#10B981" size={32} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    {!isTransferring && <IconArrowRight color="var(--border-color)" size={32} />}
                                </Box>

                                <Box p="md" style={{ backgroundColor: '#0F172A', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                    <Text size="xs" c="var(--text-muted)" tt="uppercase" fw={700} mb={4}>Recipient (Investor B)</Text>
                                    <Text ff="JetBrains Mono" size="xs" c="var(--accent-blue)" style={{ wordBreak: 'break-all' }}>{investorBAddress}</Text>
                                </Box>
                            </Group>

                            <Group align="flex-end" gap="md">
                                <TextInput
                                    flex={1}
                                    label="Amount to Transfer (Tokens)"
                                    placeholder="e.g. 500"
                                    value={amount}
                                    onChange={(e) => setAmount(e.currentTarget.value)}
                                    size="md"
                                    disabled={isTransferring}
                                />
                                <Button
                                    size="md"
                                    color="blue"
                                    onClick={handleTransfer}
                                    loading={isTransferring}
                                    disabled={!cmtatBondAddress}
                                    style={{ height: '42px' }}
                                >
                                    Execute Transfer
                                </Button>
                            </Group>
                        </Stack>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card padding="xl" className="neobrutal-card" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
                        <Group justify="space-between" mb="sm" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                            <Title order={4}>Network Activity</Title>
                            <Box style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isTransferring ? '#EAB308' : '#10B981' }} className={isTransferring ? 'pulse-badge' : ''} />
                        </Group>
                        <div className="terminal-log">
                            {logs.length === 0 && (
                                <Text c="dimmed" size="xs" style={{ fontStyle: 'italic' }}>Awaiting transfer triggers...</Text>
                            )}
                            {logs.map((log, i) => (
                                <p key={i} className={log.includes('[OK]') ? 'token-success' : log.includes('[ERROR]') || log.includes('[ALERT]') ? 'token-error' : ''}>
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
