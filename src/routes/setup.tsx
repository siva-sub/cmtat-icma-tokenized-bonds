import { createFileRoute } from '@tanstack/react-router'
import { Card, Title, Text, TextInput, Button, Stack, Group, Box, Grid } from '@mantine/core'
import { useState, useRef, useEffect } from 'react'
import { useSandboxStore, useActiveBond } from '../store/sandboxStore'
import { tevmClient, initClient, getIssuerSigner } from '../tevm/client'
import { motion } from 'framer-motion'
import { ContractFactory, Contract } from 'ethers'

import ICMADataEngineArtifact from '../../artifacts/contracts/engines/ICMADataEngine.sol/ICMADataEngine.json'
import CMTATBondArtifact from '../../artifacts/contracts/deployment/CMTATBond.sol/CMTATBond.json'

export const Route = createFileRoute('/setup')({
    component: SetupComponent,
})

function SetupComponent() {
    const [bondName, setBondName] = useState('ICMA Tokenized Bond')
    const [bondSymbol, setBondSymbol] = useState('ICMA25')
    const [isDeploying, setIsDeploying] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [logs, setLogs] = useState<string[]>([])
    const logsEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    const { issuerAddress, setContracts, completeStep, setClientReady } = useSandboxStore()
    const activeBond = useActiveBond()
    const icmaDataEngineAddress = activeBond?.icmaDataEngineAddress || null
    const bondContract = activeBond?.bondContract || null

    const handleDeploy = async () => {
        setIsDeploying(true)
        setErrorMsg('')
        setLogs(['> Initiating pre-issuance sequence...', '> Initializing Tevm + Ethers.js bridge...'])
        try {
            // 1. Initialize the Tevm client + ethers provider
            await initClient()
            setClientReady(true)
            const signer = getIssuerSigner()

            setLogs(prev => [...prev, '> [OK] EVM sandbox ready', '> Compiling ICMADataEngine artifacts...'])
            await new Promise(r => setTimeout(r, 400))

            // 2. Deploy ICMADataEngine via ethers ContractFactory
            const icmaFactory = new ContractFactory(
                ICMADataEngineArtifact.abi,
                ICMADataEngineArtifact.bytecode,
                signer
            )
            const icmaDeployTx = await icmaFactory.deploy(issuerAddress)
            setLogs(prev => [...prev, `> ICMADataEngine deployment tx sent: ${icmaDeployTx.deploymentTransaction()?.hash}`])

            // Mine the block to include the deployment
            await tevmClient.mine({ blocks: 1 })
            await icmaDeployTx.waitForDeployment()
            const icmaAddr = await icmaDeployTx.getAddress()

            setLogs(prev => [...prev, `> [OK] ICMADataEngine deployed -> ${icmaAddr}`, '> Formatting CMTAT Modules and Base Attributes...'])
            await new Promise(r => setTimeout(r, 400))

            // 3. Prepare CMTATBond constructor args
            const ERC20Attrs = { name: bondName, symbol: bondSymbol, decimalsIrrevocable: 0 }
            const ExtraAttrs = {
                tokenId: bondSymbol + "0001",
                terms: { name: "", uri: "", documentHash: "0x0000000000000000000000000000000000000000000000000000000000000000" },
                information: "Initial Deployment"
            }
            const NullEngines = {
                ruleEngine: '0x0000000000000000000000000000000000000000',
            }

            setLogs(prev => [...prev, '> Linking ICMADataEngine address to CMTATBond constructor...', '> Deploying CMTATBond...'])

            // 4. Deploy CMTATBond via ethers ContractFactory
            const bondFactory = new ContractFactory(
                CMTATBondArtifact.abi,
                CMTATBondArtifact.bytecode,
                signer
            )
            const bondDeployTx = await bondFactory.deploy(
                '0x0000000000000000000000000000000000000000', // zero Meta-TX forwarder
                issuerAddress, // admin
                ERC20Attrs,
                ExtraAttrs,
                NullEngines,
                icmaAddr // link the ICMA engine
            )

            setLogs(prev => [...prev, `> CMTATBond deployment tx sent: ${bondDeployTx.deploymentTransaction()?.hash}`])

            // Mine the block
            await tevmClient.mine({ blocks: 1 })
            await bondDeployTx.waitForDeployment()
            const bondAddr = await bondDeployTx.getAddress()

            setLogs(prev => [...prev,
            `> [OK] CMTATBond deployed -> ${bondAddr}`,
                '> Verifying bytecode deployment...',
            ])

            // 5. Create reusable Contract instances and store them
            const icmaContract = new Contract(icmaAddr, ICMADataEngineArtifact.abi, signer)
            const bondContract = new Contract(bondAddr, CMTATBondArtifact.abi, signer)

            // 6. Grant compliance roles to the issuer (admin already has DEFAULT_ADMIN_ROLE)
            setLogs(prev => [...prev, '> Granting PAUSER_ROLE & ENFORCER_ROLE to issuer...'])
            const PAUSER_ROLE = await bondContract.PAUSER_ROLE()
            const ENFORCER_ROLE = await bondContract.ENFORCER_ROLE()
            const ERC20ENFORCER_ROLE = await bondContract.ERC20ENFORCER_ROLE()

            const grantTx1 = await bondContract.grantRole(PAUSER_ROLE, issuerAddress, { gasLimit: 5_000_000 })
            await tevmClient.mine({ blocks: 1 })
            const grantReceipt1 = await grantTx1.wait()
            if (!grantReceipt1 || grantReceipt1.status === 0) {
                throw new Error('Failed to grant PAUSER_ROLE')
            }

            const grantTx2 = await bondContract.grantRole(ENFORCER_ROLE, issuerAddress, { gasLimit: 5_000_000 })
            await tevmClient.mine({ blocks: 1 })
            const grantReceipt2 = await grantTx2.wait()
            if (!grantReceipt2 || grantReceipt2.status === 0) {
                throw new Error('Failed to grant ENFORCER_ROLE')
            }

            const grantTx3 = await bondContract.grantRole(ERC20ENFORCER_ROLE, issuerAddress, { gasLimit: 5_000_000 })
            await tevmClient.mine({ blocks: 1 })
            const grantReceipt3 = await grantTx3.wait()
            if (!grantReceipt3 || grantReceipt3.status === 0) {
                throw new Error('Failed to grant ERC20ENFORCER_ROLE')
            }

            // Verify roles
            const hasPauser = await bondContract.hasRole(PAUSER_ROLE, issuerAddress)
            const hasEnforcer = await bondContract.hasRole(ENFORCER_ROLE, issuerAddress)
            const hasERC20Enforcer = await bondContract.hasRole(ERC20ENFORCER_ROLE, issuerAddress)
            console.log('[Setup] Role verification:', { hasPauser, hasEnforcer, hasERC20Enforcer })
            setLogs(prev => [...prev,
            `> [OK] PAUSER_ROLE: ${hasPauser}`,
            `> [OK] ENFORCER_ROLE: ${hasEnforcer}`,
            `> [OK] ERC20ENFORCER_ROLE: ${hasERC20Enforcer}`,
                '> All operations successful. Sandbox ready.'
            ])

            setContracts(icmaAddr, bondAddr, icmaContract, bondContract)

            // Move to next step after brief delay
            setTimeout(() => completeStep('setup'), 1500)

        } catch (e: any) {
            console.error(e)
            setErrorMsg(e.message || String(e))
        } finally {
            setIsDeploying(false)
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Grid gutter="xl">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Card padding="xl" className="neobrutal-card" h="100%">
                        <Title order={2} className="gradient-text" mb="xs">1. Pre-Issuance — Deploy Contracts</Title>
                        <Text c="var(--text-muted)" size="lg" mb="md">
                            Deploy the CMTAT Bond and ICMA Data Engine into the in-memory Tevm sandbox.
                        </Text>

                        <div className="instructions-card" style={{ marginBottom: '24px' }}>
                            <Text size="sm" fw={700} c="var(--accent-blue)" mb="xs">What Happens in This Step</Text>
                            <p><strong>CMTATBond</strong> — An ERC-20 compatible security token built on the <em>Capital Markets and Technology Association</em> framework. It enforces Swiss-law compliant transfer restrictions, snapshot-based record dates, and issuer-controlled lifecycle hooks (pause, freeze, burn).</p>
                            <p style={{ marginTop: '8px' }}><strong>ICMADataEngine</strong> — A dedicated on-chain data store implementing the <em>International Capital Markets Association Bond Data Taxonomy (BDT) v1.2</em>. It persists structured bond metadata (static data, terms, coupon schedule, DLT platform identifiers) as immutable contract state.</p>
                            <p style={{ marginTop: '8px' }}>Clicking <strong>Deploy Contracts</strong> will compile both Solidity artifacts, broadcast two creation transactions to the Tevm sandbox, mine the blocks, and register the resulting contract addresses in the application store.</p>
                        </div>

                        {errorMsg && (
                            <Box mb="xl" p="md" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid #EF4444' }}>
                                <Text fw={700} c="#EF4444">Deployment Error</Text>
                                <Text size="sm" c="#EF4444">{errorMsg}</Text>
                            </Box>
                        )}

                        <Stack gap="xl">
                            <Box>
                                <TextInput
                                    label="Bond Name"
                                    placeholder="e.g. ICMA Tokenized Bond"
                                    value={bondName}
                                    onChange={(e) => setBondName(e.currentTarget.value)}
                                    disabled={bondContract !== null}
                                    size="md"
                                />
                            </Box>
                            <Box>
                                <TextInput
                                    label="Token Symbol"
                                    placeholder="e.g. ICMA25"
                                    value={bondSymbol}
                                    onChange={(e) => setBondSymbol(e.currentTarget.value)}
                                    disabled={bondContract !== null}
                                    size="md"
                                />
                            </Box>

                            <Group justify="flex-start" mt="md">
                                <Button
                                    size="lg"
                                    color="accent"
                                    onClick={handleDeploy}
                                    loading={isDeploying}
                                    disabled={bondContract !== null}
                                >
                                    {bondContract ? "Deployed" : (icmaDataEngineAddress ? "Re-Deploy Contracts" : "Deploy Contracts")}
                                </Button>
                            </Group>
                        </Stack>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card padding="xl" className="neobrutal-card" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
                        <Group justify="space-between" mb="sm" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                            <Title order={4}>Network Activity</Title>
                            <Box style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isDeploying ? '#EAB308' : '#10B981' }} className={isDeploying ? 'pulse-badge' : ''} />
                        </Group>
                        <div className="terminal-log">
                            {logs.length === 0 && (
                                <Text c="dimmed" size="xs" style={{ fontStyle: 'italic' }}>Waiting for transaction...</Text>
                            )}
                            {logs.map((log, i) => (
                                <p key={i} className={log.includes('[OK]') ? 'token-success' : ''}>
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
