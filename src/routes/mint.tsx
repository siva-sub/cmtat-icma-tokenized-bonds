import { createFileRoute } from '@tanstack/react-router'
import { Card, Title, Text, Button, Stack, Group, TextInput, Box, Grid } from '@mantine/core'
import { useState, useRef, useEffect } from 'react'
import { useSandboxStore, useActiveBond } from '../store/sandboxStore'
import { motion } from 'framer-motion'
import { tevmClient } from '../tevm/client'
import { screenEntity } from '../utils/screeningEngine'

export const Route = createFileRoute('/mint')({
    component: MintComponent,
})

function MintComponent() {
    const { issuerAddress, investorAAddress, completeStep } = useSandboxStore()
    const activeBond = useActiveBond()
    const cmtatBondAddress = activeBond?.cmtatBondAddress || null
    const bondContract = activeBond?.bondContract || null

    const [amount, setAmount] = useState('1000')
    const [isMinting, setIsMinting] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [logs, setLogs] = useState<string[]>([])
    const logsEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    const handleMint = async () => {
        if (!bondContract) {
            setErrorMsg("Please deploy the contracts from Step 1 first.")
            return
        }

        setIsMinting(true)
        setErrorMsg('')
        setLogs([`> Initiating issuance of ${amount} units...`, `> Target account: ${investorAAddress}`])

        try {
            // 1. Pre-Trade Compliance Screening
            setLogs(prev => [...prev, '> Performing compliance screening on recipient...'])
            const screeningResult = screenEntity(investorAAddress)

            if (screeningResult.isSanctioned) {
                setLogs(prev => [...prev, `> [ALERT] Recipient matched on sanctions list: ${screeningResult.match?.listType}`])
                throw new Error(`Compliance Block: ${screeningResult.message}`)
            }

            setLogs(prev => [...prev, '> [OK] Recipient cleared. Proceeding to mint...'])

            // 2. Mint tokens to Investor A using the admin-connected bond contract
            const tx = await bondContract['mint(address,uint256)'](investorAAddress, BigInt(amount), { gasLimit: 5_000_000 })
            setLogs(prev => [...prev, `> TX broadcasted: ${tx.hash}`, '> Waiting for block confirmation...'])

            await tevmClient.mine({ blocks: 1 })
            const receipt = await tx.wait()

            if (!receipt || receipt.status === 0) {
                throw new Error(`Mint reverted. Hash: ${tx.hash}`)
            }

            setLogs(prev => [...prev, `> [OK] Issuance successful across ${receipt.gasUsed} gas.`])

            // Advance lifecycle
            setTimeout(() => completeStep('mint'), 2000)
        } catch (e: any) {
            console.error(e)
            setErrorMsg(e.message || String(e))
            setLogs(prev => [...prev, `> [ERROR] ${e.message || String(e)}`])
        } finally {
            setIsMinting(false)
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Grid gutter="xl">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Card padding="xl" className="neobrutal-card" h="100%">
                        <Title order={2} className="gradient-text" mb="xs">3. Primary Issuance & Settlement</Title>
                        <Text c="var(--text-muted)" size="lg" mb="md">
                            Mint the tokenized bond to the primary investor wallet — simulating DvP settlement.
                        </Text>

                        <div className="instructions-card" style={{ marginBottom: '24px' }}>
                            <Text size="sm" fw={700} c="var(--accent-blue)" mb="xs">What Happens in This Step</Text>
                            <p>The issuer calls <strong>mint(address, amount)</strong> on the CMTAT bond contract, creating new ERC-20 tokens and crediting them directly to the investor's wallet. This simulates <em>Delivery versus Payment (DvP)</em> — the atomic exchange of securities for cash on a distributed ledger.</p>
                            <p style={{ marginTop: '8px' }}>In production, the investor would have completed KYC/AML checks. Here, we run a simulated pre-trade check against the UN Sanctions List before routing to CMTAT's compliance hooks.</p>
                        </div>

                        {!cmtatBondAddress && (
                            <Box mb="xl" p="md" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', border: '1px solid #EAB308' }}>
                                <Text fw={700} c="#EAB308">Steps 1-2 Required</Text>
                                <Text size="sm" c="#EAB308">Please complete Setup and ICMA Terms first.</Text>
                            </Box>
                        )}

                        {errorMsg && (
                            <Box mb="xl" p="md" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid #EF4444' }}>
                                <Text fw={700} c="#EF4444">Transaction Blocked</Text>
                                <Text size="sm" c="#EF4444">{errorMsg}</Text>
                            </Box>
                        )}

                        <Stack gap="xl">
                            <Box p="md" style={{ backgroundColor: '#0F172A', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                <Text size="xs" c="var(--text-muted)" tt="uppercase" fw={700} mb={4}>Issuer Address</Text>
                                <Text size="sm" ff="JetBrains Mono" c="var(--accent-blue)" style={{ wordBreak: 'break-all' }}>{issuerAddress}</Text>

                                <Text size="xs" c="var(--text-muted)" tt="uppercase" fw={700} mt="md" mb={4}>Investor A Address (Recipient)</Text>
                                <Text size="sm" ff="JetBrains Mono" c="var(--accent-blue)" style={{ wordBreak: 'break-all' }}>{investorAAddress}</Text>
                                <Text size="xs" c="dimmed" mt={4}>Try deploying with the address "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef" in store to trigger a sanction hit.</Text>
                            </Box>

                            <TextInput
                                label="Amount to Mint"
                                placeholder="e.g. 1000"
                                value={amount}
                                onChange={(e) => setAmount(e.currentTarget.value)}
                                size="md"
                            />

                            <Group justify="flex-start" mt="md">
                                <Button
                                    size="lg"
                                    color="accent"
                                    onClick={handleMint}
                                    loading={isMinting}
                                    disabled={!cmtatBondAddress}
                                >
                                    Mint Tokens
                                </Button>
                            </Group>
                        </Stack>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card padding="xl" className="neobrutal-card" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
                        <Group justify="space-between" mb="sm" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                            <Title order={4}>Network Activity</Title>
                            <Box style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isMinting ? '#EAB308' : '#10B981' }} className={isMinting ? 'pulse-badge' : ''} />
                        </Group>
                        <div className="terminal-log">
                            {logs.length === 0 && (
                                <Text c="dimmed" size="xs" style={{ fontStyle: 'italic' }}>Awaiting issuance triggers...</Text>
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

