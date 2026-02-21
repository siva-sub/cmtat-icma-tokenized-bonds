import { createFileRoute } from '@tanstack/react-router'
import { Card, Title, Text, Button, Stack, Group, SimpleGrid, TextInput, Box, Badge, Grid, Alert } from '@mantine/core'
import { useState, useRef, useEffect } from 'react'
import { useSandboxStore, useActiveBond } from '../store/sandboxStore'
import { motion } from 'framer-motion'
import { tevmClient } from '../tevm/client'
import { screenEntity, ScreeningResult } from '../utils/screeningEngine'

export const Route = createFileRoute('/compliance')({
    component: ComplianceComponent,
})

function ComplianceComponent() {
    const { completeStep, issuerAddress, investorAAddress } = useSandboxStore()
    const activeBond = useActiveBond()
    const cmtatBondAddress = activeBond?.cmtatBondAddress || null
    const bondContract = activeBond?.bondContract || null

    const [freezeAccount, setFreezeAccount] = useState('')
    const [freezeAmount, setFreezeAmount] = useState('100')
    const [isProcessing, setIsProcessing] = useState(false)
    const [paused, setPaused] = useState(false)
    const [targetBalance, setTargetBalance] = useState<string | null>(null)
    const [frozenTokens, setFrozenTokens] = useState<string | null>(null)

    // Screening State
    const [searchQuery, setSearchQuery] = useState('')
    const [screeningResult, setScreeningResult] = useState<ScreeningResult | null>(null)

    const [errorMsg, setErrorMsg] = useState('')
    const [logs, setLogs] = useState<string[]>([])
    const logsEndRef = useRef<HTMLDivElement>(null)

    // Pre-populate freeze address with investor A and fetch balance
    useEffect(() => {
        if (investorAAddress && !freezeAccount) {
            setFreezeAccount(investorAAddress)
        }
    }, [investorAAddress])

    // Fetch balance when freeze account changes
    useEffect(() => {
        const fetchBalance = async () => {
            if (bondContract && freezeAccount && freezeAccount.startsWith('0x') && freezeAccount.length === 42) {
                try {
                    const bal = await bondContract.balanceOf(freezeAccount)
                    setTargetBalance(bal.toString())
                    const frozen = await bondContract.getFrozenTokens(freezeAccount)
                    setFrozenTokens(frozen.toString())
                } catch {
                    setTargetBalance(null)
                    setFrozenTokens(null)
                }
            } else {
                setTargetBalance(null)
                setFrozenTokens(null)
            }
        }
        fetchBalance()
    }, [bondContract, freezeAccount, isProcessing])

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    const handleScreening = () => {
        if (!searchQuery) {
            setErrorMsg("Please enter a name or address to screen.")
            return;
        }
        setErrorMsg('')
        setLogs(prev => [...prev, `> Querying multi-agency sanctions lists for: "${searchQuery}"...`])

        const result = screenEntity(searchQuery);
        setScreeningResult(result)

        if (result.isSanctioned) {
            setLogs(prev => [...prev, `> [ALERT] MATCH FOUND on ${result.match?.listType}. ID: ${result.match?.id}`])
            // Auto-populate the freeze address field if it resembles an address, otherwise leave as requires manual input
            if (searchQuery.startsWith('0x')) {
                setFreezeAccount(searchQuery)
            }
        } else {
            setLogs(prev => [...prev, `> [OK] Entity "${searchQuery}" is clear. No matching sanctions.`])
        }
    }

    const handleSimulation = async (action: 'pause' | 'unpause' | 'freeze' | 'unfreeze') => {
        if (!bondContract) {
            setErrorMsg('No bond deployed. Deploy one in Step 1.')
            return
        }

        try {
            setIsProcessing(true)
            setErrorMsg('')
            setLogs([`> Initiating ${action.toUpperCase()} operation...`])

            let tx: any;

            // Pre-flight: check roles before attempting operations
            if (action === 'pause' || action === 'unpause') {
                const PAUSER_ROLE = await bondContract.PAUSER_ROLE()
                const hasPauserRole = await bondContract.hasRole(PAUSER_ROLE, issuerAddress)
                console.log('[Compliance] Has PAUSER_ROLE:', hasPauserRole)
                if (!hasPauserRole) {
                    throw new Error('Caller does not have PAUSER_ROLE. Please re-deploy contracts from Step 1.')
                }
            }

            if (action === 'freeze' || action === 'unfreeze') {
                const ERC20ENFORCER_ROLE = await bondContract.ERC20ENFORCER_ROLE()
                const hasERC20EnforcerRole = await bondContract.hasRole(ERC20ENFORCER_ROLE, issuerAddress)
                console.log('[Compliance] Has ERC20ENFORCER_ROLE:', hasERC20EnforcerRole)
                if (!hasERC20EnforcerRole) {
                    throw new Error('Caller does not have ERC20ENFORCER_ROLE. Please re-deploy contracts from Step 1.')
                }
            }

            if (action === 'pause') {
                tx = await bondContract.pause({ gasLimit: 5_000_000 })
            } else if (action === 'unpause') {
                tx = await bondContract.unpause({ gasLimit: 5_000_000 })
            } else if (action === 'freeze') {
                if (!freezeAccount || !freezeAmount) throw new Error("Account and amount required to freeze")
                // Pre-check: target must have sufficient token balance
                const balance = await bondContract.balanceOf(freezeAccount)
                const currentFrozen = await bondContract.getFrozenTokens(freezeAccount)
                const newFrozenTotal = currentFrozen + BigInt(freezeAmount)
                if (balance < newFrozenTotal) {
                    throw new Error(`Cannot freeze ${freezeAmount} tokens. Account balance: ${balance.toString()}, already frozen: ${currentFrozen.toString()}`)
                }
                setLogs(prev => [...prev, `> Target: ${freezeAccount}`, `> Amount: ${freezeAmount}`, `> Account balance: ${balance.toString()}`])
                tx = await bondContract["freezePartialTokens(address,uint256)"](freezeAccount, BigInt(freezeAmount), { gasLimit: 5_000_000 })
            } else {
                if (!freezeAccount || !freezeAmount) throw new Error("Account and amount required to unfreeze")
                const currentFrozen = await bondContract.getFrozenTokens(freezeAccount)
                if (currentFrozen < BigInt(freezeAmount)) {
                    throw new Error(`Cannot unfreeze ${freezeAmount} tokens. Only ${currentFrozen.toString()} currently frozen.`)
                }
                setLogs(prev => [...prev, `> Target: ${freezeAccount}`, `> Amount: ${freezeAmount}`, `> Currently frozen: ${currentFrozen.toString()}`])
                tx = await bondContract["unfreezePartialTokens(address,uint256)"](freezeAccount, BigInt(freezeAmount), { gasLimit: 5_000_000 })
            }

            setLogs(prev => [...prev, `> TX broadcasted: ${tx.hash}`, '> Waiting for compliance validation...'])

            await tevmClient.mine({ blocks: 1 })
            const receipt = await tx.wait()

            if (!receipt || receipt.status === 0) {
                throw new Error(`Transaction reverted. Hash: ${tx.hash}`)
            }

            if (action === 'pause') setPaused(true)
            if (action === 'unpause') setPaused(false)

            setLogs(prev => [...prev, `> [OK] ${action.toUpperCase()} completed successfully (block ${receipt.blockNumber}).`])

            // Advance lifecycle (completeStep is idempotent — safe to call multiple times)
            setTimeout(() => completeStep('compliance'), 1500)

        } catch (error: any) {
            console.error('Action failed', error)
            setErrorMsg(error.message || 'Simulation failed')
            setLogs(prev => [...prev, `> [ERROR] ${error.message || 'Simulation failed'}`])
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Grid gutter="xl">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Card padding="xl" className="neobrutal-card" h="100%">
                        <Title order={2} className="gradient-text" mb="xs">6. Compliance & Regulatory Actions</Title>
                        <Text c="var(--text-muted)" mb="md">
                            Simulate regulatory actions at the smart contract level using the CMTAT compliance modules.
                        </Text>

                        <div className="instructions-card" style={{ marginBottom: '16px' }}>
                            <Text size="sm" fw={700} c="var(--accent-blue)" mb="xs">What Happens in This Step</Text>
                            <p>This module combines off-chain intelligence with on-chain enforcement. Entities are screened against open-source datasets (e.g., UN Security Council Data). If a threat is detected, the DLT Admin can utilize CMTAT's compliance primitives: <strong>Pause</strong> (halts all transfers globally) or <strong>Freeze</strong> (restricts a specific account), enforcing compliance without relying on off-chain intermediaries.</p>
                        </div>

                        <Text size="xs" fw={800} tt="uppercase" c="var(--text-muted)" mb="xs" style={{ letterSpacing: '1px' }}>Regulatory Frameworks Supported</Text>
                        <div className="regulatory-grid" style={{ marginBottom: '24px' }}>
                            <div className="regulatory-item"><span className="reg-dot" /><div><span className="reg-name">MiFID II</span><br /><span className="reg-desc">EU Investment Services</span></div></div>
                            <div className="regulatory-item"><span className="reg-dot" /><div><span className="reg-name">EMIR</span><br /><span className="reg-desc">EU Market Infrastructure</span></div></div>
                            <div className="regulatory-item"><span className="reg-dot" /><div><span className="reg-name">GDPR</span><br /><span className="reg-desc">Data Protection</span></div></div>
                            <div className="regulatory-item"><span className="reg-dot" /><div><span className="reg-name">UN SANCTIONS</span><br /><span className="reg-desc">Security Council Lists</span></div></div>
                        </div>

                        {!cmtatBondAddress ? (
                            <Box mb="xl" p="md" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', border: '1px solid #EAB308' }}>
                                <Text fw={700} c="#EAB308">Sandbox Not Deployed</Text>
                                <Text size="sm" c="#EAB308">Please go to Step 1 and deploy the ICMA Data Engine and CMTAT Bond first.</Text>
                            </Box>
                        ) : (
                            <Stack gap="xl">
                                {errorMsg && (
                                    <Box mb="sm" p="md" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid #EF4444' }}>
                                        <Text fw={700} c="#EF4444">Error</Text>
                                        <Text size="sm" c="#EF4444">{errorMsg}</Text>
                                    </Box>
                                )}

                                {/* Sanctions Screening Engine Panel */}
                                <Box p="md" style={{ backgroundColor: '#0F172A', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                    <Title order={4} mb="md" c="white">Identity & Sanctions Screening</Title>
                                    <Text size="sm" c="var(--text-muted)" mb="md">
                                        Cross-reference names or wallet addresses against real-world integrated sanctions lists (UN Security Council). Try searching for "Yun Ho-Jin" or "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef".
                                    </Text>
                                    <Group align="flex-end" mb="md">
                                        <TextInput
                                            label="Entity Name or Address"
                                            placeholder="Enter name or 0x..."
                                            value={searchQuery}
                                            style={{ flex: 1 }}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            styles={{ label: { color: 'var(--text-main)', fontWeight: 600 } }}
                                        />
                                        <Button onClick={handleScreening} variant="light" color="indigo">Screen Entity</Button>
                                    </Group>

                                    {screeningResult && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                            <Alert
                                                title={screeningResult.isSanctioned ? "SANCTIONS MATCH DETECTED" : "ENTITY CLEARED"}
                                                color={screeningResult.isSanctioned ? "red" : "green"}
                                                variant="filled"
                                                mb="sm"
                                                style={{ backgroundColor: screeningResult.isSanctioned ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', border: `1px solid ${screeningResult.isSanctioned ? '#EF4444' : '#10B981'}` }}
                                                styles={{ label: { color: screeningResult.isSanctioned ? '#EF4444' : '#10B981' } }}
                                            >
                                                <Text size="sm" c={screeningResult.isSanctioned ? '#FCA5A5' : '#6EE7B7'}>{screeningResult.message}</Text>
                                                {screeningResult.match && (
                                                    <Box mt="xs" p="xs" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
                                                        <Text size="xs" c="white" fw={700}>List: {screeningResult.match.listType} (ID: {screeningResult.match.id})</Text>
                                                        <Text size="xs" c="var(--text-main)">Name: {screeningResult.match.name}</Text>
                                                        <Text size="xs" c="var(--text-main)">Designation: {screeningResult.match.designation}</Text>
                                                        <Text size="xs" c="var(--text-muted)">{screeningResult.match.comments}</Text>
                                                    </Box>
                                                )}
                                            </Alert>
                                        </motion.div>
                                    )}
                                </Box>

                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                                    <Box p="md" style={{ backgroundColor: '#0F172A', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                        <Title order={4} mb="md">Targeted Freeze</Title>
                                        <Text size="sm" c="var(--text-muted)" mb="md">
                                            Freeze specific token amounts in a wallet due to AML/KYC violations or legal orders.
                                        </Text>
                                        <Stack gap="sm">
                                            <TextInput
                                                label="Target Account Address"
                                                description={<>Suggested: <Text span size="xs" ff="JetBrains Mono" c="var(--accent-blue)" style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setFreezeAccount(investorAAddress)}>Investor A ({investorAAddress.slice(0, 6)}...{investorAAddress.slice(-4)})</Text> — funded wallet from Step 3</>}
                                                placeholder="0x..."
                                                value={freezeAccount}
                                                onChange={(e) => setFreezeAccount(e.target.value)}
                                                styles={{ label: { color: 'var(--text-main)', fontWeight: 600 } }}
                                                disabled={isProcessing}
                                            />
                                            {targetBalance !== null && (
                                                <Box p="xs" style={{ backgroundColor: targetBalance === '0' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)', borderRadius: '6px', border: `1px solid ${targetBalance === '0' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(99, 102, 241, 0.3)'}` }}>
                                                    <Text size="xs" c={targetBalance === '0' ? '#EF4444' : 'var(--text-muted)'}>
                                                        {targetBalance === '0' ? (
                                                            <>This wallet has no tokens. Mint tokens in Step 3 first, or select a funded wallet.</>
                                                        ) : (
                                                            <>
                                                                Balance: <Text span fw={700} c="var(--accent-blue)">{targetBalance}</Text>
                                                                {frozenTokens && frozenTokens !== '0' && (
                                                                    <> | Frozen: <Text span fw={700} c="#EF4444">{frozenTokens}</Text></>
                                                                )}
                                                                {' '}| Available: <Text span fw={700} c="#10B981">{(BigInt(targetBalance) - BigInt(frozenTokens || '0')).toString()}</Text>
                                                            </>
                                                        )}
                                                    </Text>
                                                </Box>
                                            )}
                                            <TextInput
                                                label="Freeze Amount"
                                                description={targetBalance !== null ? `Max freezable: ${BigInt(targetBalance) - BigInt(frozenTokens || '0')}` : 'Amount of tokens to lock'}
                                                value={freezeAmount}
                                                onChange={(e) => setFreezeAmount(e.target.value)}
                                                styles={{ label: { color: 'var(--text-main)', fontWeight: 600 } }}
                                                disabled={isProcessing}
                                            />
                                            <Group mt="md">
                                                <Button
                                                    variant="filled"
                                                    color="blue"
                                                    style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)' }}
                                                    onClick={() => handleSimulation('freeze')}
                                                    disabled={isProcessing || !freezeAccount}
                                                >
                                                    Freeze Tokens
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    color="gray"
                                                    onClick={() => handleSimulation('unfreeze')}
                                                    disabled={isProcessing || !freezeAccount}
                                                >
                                                    Unfreeze Tokens
                                                </Button>
                                            </Group>
                                        </Stack>
                                    </Box>

                                    <Box p="md" style={{ backgroundColor: '#0F172A', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                        <Group justify="space-between" mb="md">
                                            <Title order={4}>Contract Pause</Title>
                                            <Badge color={paused ? "red" : "green"} variant="filled" className={!paused ? "" : "pulse-badge"}>
                                                {paused ? 'PAUSED' : 'ACTIVE'}
                                            </Badge>
                                        </Group>
                                        <Text size="sm" c="var(--text-muted)" mb="md">
                                            A global freeze to halt all token transfers in case of a critical regulatory event or exploit.
                                        </Text>
                                        <Group mt="xl">
                                            <Button
                                                variant="filled"
                                                color="red"
                                                onClick={() => handleSimulation('pause')}
                                                disabled={isProcessing || paused}
                                            >
                                                Pause Contract
                                            </Button>
                                            <Button
                                                variant="light"
                                                color="green"
                                                onClick={() => handleSimulation('unpause')}
                                                disabled={isProcessing || !paused}
                                            >
                                                Unpause
                                            </Button>
                                        </Group>
                                    </Box>
                                </SimpleGrid>
                            </Stack>
                        )}
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card padding="xl" className="neobrutal-card" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
                        <Group justify="space-between" mb="sm" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                            <Title order={4}>Network Activity</Title>
                            <Box style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isProcessing ? '#EAB308' : '#10B981' }} className={isProcessing ? 'pulse-badge' : ''} />
                        </Group>
                        <div className="terminal-log">
                            {logs.length === 0 && (
                                <Text c="dimmed" size="xs" style={{ fontStyle: 'italic' }}>Awaiting compliance triggers...</Text>
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

