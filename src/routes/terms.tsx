import { createFileRoute } from '@tanstack/react-router'
import { Card, Title, Text, Button, Stack, Group, SimpleGrid, TextInput, Box, Accordion, Checkbox, NumberInput, Grid } from '@mantine/core'
import { useState, useRef, useEffect } from 'react'
import { useSandboxStore, useActiveBond } from '../store/sandboxStore'
import { motion } from 'framer-motion'
import { tevmClient } from '../tevm/client'

export const Route = createFileRoute('/terms')({
    component: TermsComponent,
})

function TermsComponent() {
    const { completeStep, setBondRating } = useSandboxStore()
    const activeBond = useActiveBond()
    const icmaDataEngineAddress = activeBond?.icmaDataEngineAddress || null
    const icmaContract = activeBond?.icmaContract || null

    // Section 1: Security Identification
    const [isin, setIsin] = useState('FR0013510518')

    // Section 2: Issuer & Parties
    const [issuerLei, setIssuerLei] = useState('969500KN90DZLHUN3566')
    const [issuerName, setIssuerName] = useState('Societe Generale SFH')
    const [issuanceType, setIssuanceType] = useState('STANDALONE')

    // Section 3: Issuance Details
    const [currency, setCurrency] = useState('EUR')
    const [paymentCurrency, setPaymentCurrency] = useState('EUR')
    const [settlementCurrency, setSettlementCurrency] = useState('EUR')
    const [denomination, setDenomination] = useState<number | string>(100000)
    const [integralMultiples, setIntegralMultiples] = useState<number | string>(100000)
    const [calculationAmount, setCalculationAmount] = useState<number | string>(100000)
    const [pricingDate, setPricingDate] = useState('2024-05-10')
    const [issuanceDate, setIssuanceDate] = useState('2024-05-14')
    const [settlementDate, setSettlementDate] = useState('2024-05-14')
    const [issuePrice, setIssuePrice] = useState<number | string>(10000) // 100.00%
    const [methodOfDistribution, setMethodOfDistribution] = useState('SYNDICATED')
    const [governingLaw, setGoverningLaw] = useState('FRENCH_LAW')

    // Section 4: Product Details
    const [formOfNote, setFormOfNote] = useState('DEMATERIALISED')
    const [statusOfNote, setStatusOfNote] = useState('SENIOR_SECURED')
    const [nominal, setNominal] = useState<number | string>(40000000)
    const [maturity, setMaturity] = useState('2025-05-14')
    const [dltBondIndicator, setDltBondIndicator] = useState(true)

    // Section 5: Interest Payment termsData
    const [interestType, setInterestType] = useState('Fixed')
    const [interestRateBps, setInterestRateBps] = useState<number | string>(350)
    const [paymentFrequency, setPaymentFrequency] = useState('ANNUALLY')
    const [dayCountFraction, setDayCountFraction] = useState('ACT/ACT')
    const [businessDayConvention, setBusinessDayConvention] = useState('FOLLOWING')
    const [businessDayCenter, setBusinessDayCenter] = useState('TARGET')
    const [interestPaymentDay, setInterestPaymentDay] = useState<number | string>(14)
    const [interestPaymentMonth, setInterestPaymentMonth] = useState<number | string>(5)
    const [firstPaymentDate, setFirstPaymentDate] = useState('2025-05-14')
    const [lastPaymentDate, setLastPaymentDate] = useState('2025-05-14')
    const [interestCommencementDate, setInterestCommencementDate] = useState('2024-05-14')
    const [finalRedemptionPct, setFinalRedemptionPct] = useState<number | string>(100)
    const [earlyRedemptionPct, setEarlyRedemptionPct] = useState<number | string>(100)

    // Section 6: Listing & Clearing
    const [listingMarket, setListingMarket] = useState('Euronext Paris')
    const [listingMarketType, setListingMarketType] = useState('REGULATED_MARKET')
    const [clearingSettlementSystem, setClearingSettlementSystem] = useState('Euroclear France')
    const [sellingRestrictions, setSellingRestrictions] = useState('Reg S Compliance Category 2')
    const [manufacturerTargetMarket, setManufacturerTargetMarket] = useState('Eligible Counterparties and Professional Clients')

    // Section 7: DLT Platform
    const [platformType, setPlatformType] = useState('Tevm (Ethereum Local)')
    const [accessibility, setAccessibility] = useState('PUBLIC_PERMISSIONLESS')
    const [role, setRole] = useState('Registrar')
    const [operatorName, setOperatorName] = useState('CMTAT Test Operator')
    const [platformName, setPlatformName] = useState('Learn with Siva Sandbox')
    const [tokenType, setTokenType] = useState('CMTAT 3.0')
    const [smartContract, setSmartContract] = useState('0x...') // User can set

    // Section 8: Provisions
    const [flagNegativePledge, setFlagNegativePledge] = useState(true)
    const [flagGrossUp, setFlagGrossUp] = useState(true)
    const [flagCrossDefault, setFlagCrossDefault] = useState(false)

    // Section 9: Bond Ratings
    const [ratingAgency, setRatingAgency] = useState('FITCH')
    const [expectedProductRating, setExpectedProductRating] = useState('AAA')
    const [partyRating, setPartyRating] = useState('AA+')

    const [isSetting, setIsSetting] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const [logs, setLogs] = useState<string[]>([])
    const logsEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    const handleSetTerms = async () => {
        if (!icmaContract) {
            setErrorMsg("Please deploy the contracts from Step 1 first.")
            return
        }

        setIsSetting(true)
        setErrorMsg('')
        setLogs(['> Initiating ICMA Bond Terms submission...'])

        try {
            const staticData = {
                isin: isin,
                issuerLei: issuerLei,
                issuerName: issuerName,
                issuanceType: issuanceType,
                currency: currency,
                paymentCurrency: paymentCurrency,
                settlementCurrency: settlementCurrency,
                denomination: BigInt(denomination),
                integralMultiples: BigInt(integralMultiples),
                calculationAmount: BigInt(calculationAmount),
                pricingDate: pricingDate,
                issuanceDate: issuanceDate,
                settlementDate: settlementDate,
                issuePrice: BigInt(issuePrice),
                methodOfDistribution: methodOfDistribution,
                governingLaw: governingLaw,
                formOfNote: formOfNote,
                statusOfNote: statusOfNote,
                aggregateNominalAmount: BigInt(nominal),
                maturityDate: maturity,
                dltBondIndicator: dltBondIndicator,
                listingMarket: listingMarket,
                listingMarketType: listingMarketType,
                clearingSettlementSystem: clearingSettlementSystem,
                sellingRestrictions: sellingRestrictions,
                manufacturerTargetMarket: manufacturerTargetMarket,
                flagNegativePledge: flagNegativePledge,
                flagGrossUp: flagGrossUp,
                flagCrossDefault: flagCrossDefault,
            }

            setLogs(prev => [...prev, '> Building Static Data payload... [1/4]'])
            const tx1 = await icmaContract.setBondStaticData(staticData, { gasLimit: 5_000_000 })
            await tevmClient.mine({ blocks: 1 })
            const receipt1 = await tx1.wait()
            if (!receipt1 || receipt1.status === 0) {
                throw new Error(`setBondStaticData reverted. Hash: ${tx1.hash}`)
            }
            setLogs(prev => [...prev, `> [OK] Static Data confirmed in block ${receipt1.blockNumber}.`])

            const termsData = {
                interestType: interestType,
                interestRateBps: BigInt(interestRateBps),
                paymentFrequency: paymentFrequency,
                dayCountFraction: dayCountFraction,
                businessDayConvention: businessDayConvention,
                businessDayCenter: businessDayCenter,
                interestPaymentDay: Number(interestPaymentDay),
                interestPaymentMonth: Number(interestPaymentMonth),
                firstPaymentDate: firstPaymentDate,
                lastPaymentDate: lastPaymentDate,
                interestCommencementDate: interestCommencementDate,
                finalRedemptionPct: BigInt(finalRedemptionPct),
                earlyRedemptionPct: BigInt(earlyRedemptionPct)
            }

            setLogs(prev => [...prev, '> Building Interest Terms payload... [2/4]'])
            const tx2 = await icmaContract.setBondTerms(termsData, { gasLimit: 5_000_000 })
            await tevmClient.mine({ blocks: 1 })
            const receipt2 = await tx2.wait()
            if (!receipt2 || receipt2.status === 0) {
                throw new Error(`setBondTerms reverted. Hash: ${tx2.hash}`)
            }
            setLogs(prev => [...prev, `> [OK] Interest Terms confirmed in block ${receipt2.blockNumber}.`])

            const dltData = {
                platformType: platformType,
                accessibility: accessibility,
                role: role,
                operatorName: operatorName,
                platformName: platformName,
                tokenType: tokenType,
                smartContract: smartContract
            }

            setLogs(prev => [...prev, '> Building DLT Platform payload... [3/4]'])
            const tx3 = await icmaContract.setDltPlatformData(dltData, { gasLimit: 5_000_000 })
            await tevmClient.mine({ blocks: 1 })
            const receipt3 = await tx3.wait()
            if (!receipt3 || receipt3.status === 0) {
                throw new Error(`setDltPlatformData reverted. Hash: ${tx3.hash}`)
            }
            setLogs(prev => [...prev, `> [OK] DLT Data confirmed in block ${receipt3.blockNumber}.`])

            const ratingsData = {
                ratingAgency: ratingAgency,
                expectedProductRating: expectedProductRating,
                partyRating: partyRating
            }

            setLogs(prev => [...prev, '> Building Bond Ratings payload... [4/4]'])
            const tx4 = await icmaContract.setBondRatings(ratingsData, { gasLimit: 5_000_000 })
            await tevmClient.mine({ blocks: 1 })
            const receipt4 = await tx4.wait()
            if (!receipt4 || receipt4.status === 0) {
                throw new Error(`setBondRatings reverted. Hash: ${tx4.hash}`)
            }

            setLogs(prev => [...prev, `> [OK] Bond Ratings confirmed in block ${receipt4.blockNumber}.`, `> All ICMA Bond Data Taxonomy committed on-chain.`])

            setBondRating(ratingAgency, expectedProductRating)

            // Advance lifecycle
            setTimeout(() => completeStep('terms'), 1500)

        } catch (e: any) {
            console.error(e)
            setErrorMsg(e.message || String(e))
            setLogs(prev => [...prev, `> [ERROR] ${e.message || String(e)}`])
        } finally {
            setIsSetting(false)
        }
    }

    const inputStyles = { label: { color: 'var(--text-muted)' }, input: { fontFamily: 'JetBrains Mono', fontSize: '15px' } }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Grid gutter="xl">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Card padding="xl" className="neobrutal-card" h="100%">
                        <Title order={2} className="gradient-text" mb="xs">2. ICMA Bond Data Taxonomy</Title>
                        <Text c="var(--text-muted)" size="lg" mb="md">
                            Populate the Bond Data Taxonomy engine following the ICMA BDT specification. Data is written to the ICMADataEngine contract on-chain.
                        </Text>

                        <div className="instructions-card" style={{ marginBottom: '16px' }}>
                            <Text size="sm" fw={700} c="var(--accent-blue)" mb="xs">What Happens in This Step</Text>
                            <p>You fill out three structured data categories — <strong>Static Data</strong> (issuer, ISIN, currency, classification), <strong>Bond Terms</strong> (coupon rate, maturity, day count, frequency), and <strong>DLT Platform Data</strong> (smart contract chain, token standard). Each category maps to a dedicated setter function on the ICMADataEngine contract.</p>
                            <p style={{ marginTop: '8px' }}>All data follows the <em>International Capital Markets Association Bond Data Taxonomy</em> — the industry standard for bond data classification and harmonization across global fixed income markets.</p>
                        </div>

                        <Text size="xs" fw={800} tt="uppercase" c="var(--text-muted)" mb="xs" style={{ letterSpacing: '1px' }}>ICMA BDT Implementation Coverage</Text>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '4px', marginBottom: '24px' }}>
                            <div className="feature-check"><span className="check-icon">✓</span><div><span className="check-label">Data Classification</span><br /><span className="check-desc">Standardized bond categorization</span></div></div>
                            <div className="feature-check"><span className="check-icon">✓</span><div><span className="check-label">Market Transparency</span><br /><span className="check-desc">Enhanced data visibility</span></div></div>
                            <div className="feature-check"><span className="check-icon">✓</span><div><span className="check-label">Cross-Market Harmonization</span><br /><span className="check-desc">Consistent formats across markets</span></div></div>
                            <div className="feature-check"><span className="check-icon">✓</span><div><span className="check-label">Best Practice Implementation</span><br /><span className="check-desc">Industry-standard data mgmt</span></div></div>
                            <div className="feature-check"><span className="check-icon">✓</span><div><span className="check-label">Regulatory Reporting</span><br /><span className="check-desc">Automated compliance data</span></div></div>
                            <div className="feature-check"><span className="check-icon">✓</span><div><span className="check-label">International Standards</span><br /><span className="check-desc">Global regulatory compliance</span></div></div>
                        </div>

                        {!icmaDataEngineAddress && (
                            <Box mb="xl" p="md" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', border: '1px solid #EAB308' }}>
                                <Text fw={700} c="#EAB308">Step 1 Required</Text>
                                <Text size="sm" c="#EAB308">Please complete Step 1 (Deploy) first.</Text>
                            </Box>
                        )}

                        {errorMsg && (
                            <Box mb="xl" p="md" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid #EF4444' }}>
                                <Text fw={700} c="#EF4444">Error</Text>
                                <Text size="sm" c="#EF4444">{errorMsg}</Text>
                            </Box>
                        )}

                        <Accordion variant="separated" radius="md" defaultValue="sec1" styles={{ item: { backgroundColor: 'rgba(30,30,30,0.5)', borderColor: 'var(--border-color)' }, label: { color: 'var(--text-main)', fontWeight: 600 } }}>
                            <Accordion.Item value="sec1">
                                <Accordion.Control>1. Security Identification</Accordion.Control>
                                <Accordion.Panel>
                                    <SimpleGrid cols={{ base: 1, sm: 2 }}>
                                        <TextInput label="ISIN" value={isin} onChange={(e) => setIsin(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                    </SimpleGrid>
                                </Accordion.Panel>
                            </Accordion.Item>

                            <Accordion.Item value="sec2">
                                <Accordion.Control>2. Issuer & Parties</Accordion.Control>
                                <Accordion.Panel>
                                    <SimpleGrid cols={{ base: 1, sm: 2 }}>
                                        <TextInput label="Issuer Name" value={issuerName} onChange={(e) => setIssuerName(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Issuer LEI" value={issuerLei} onChange={(e) => setIssuerLei(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Issuance Type" value={issuanceType} onChange={(e) => setIssuanceType(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                    </SimpleGrid>
                                </Accordion.Panel>
                            </Accordion.Item>

                            <Accordion.Item value="sec3">
                                <Accordion.Control>3. Issuance Details</Accordion.Control>
                                <Accordion.Panel>
                                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                                        <TextInput label="Currency" value={currency} onChange={(e) => setCurrency(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Payment Currency" value={paymentCurrency} onChange={(e) => setPaymentCurrency(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Settlement Currency" value={settlementCurrency} onChange={(e) => setSettlementCurrency(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />

                                        <NumberInput label="Denomination" value={denomination} onChange={setDenomination} styles={inputStyles} disabled={isSetting} />
                                        <NumberInput label="Integral Multiples" value={integralMultiples} onChange={setIntegralMultiples} styles={inputStyles} disabled={isSetting} />
                                        <NumberInput label="Calculation Amount" value={calculationAmount} onChange={setCalculationAmount} styles={inputStyles} disabled={isSetting} />

                                        <TextInput label="Pricing Date" value={pricingDate} onChange={(e) => setPricingDate(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Issue Date" value={issuanceDate} onChange={(e) => setIssuanceDate(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Settlement Date" value={settlementDate} onChange={(e) => setSettlementDate(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />

                                        <NumberInput label="Issue Price (bps)" value={issuePrice} onChange={setIssuePrice} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Distribution Method" value={methodOfDistribution} onChange={(e) => setMethodOfDistribution(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Governing Law" value={governingLaw} onChange={(e) => setGoverningLaw(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                    </SimpleGrid>
                                </Accordion.Panel>
                            </Accordion.Item>

                            <Accordion.Item value="sec4">
                                <Accordion.Control>4. Product Details</Accordion.Control>
                                <Accordion.Panel>
                                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                                        <TextInput label="Form of Note" value={formOfNote} onChange={(e) => setFormOfNote(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Status of Note" value={statusOfNote} onChange={(e) => setStatusOfNote(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <NumberInput label="Aggregate Nominal Amount" value={nominal} onChange={setNominal} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Maturity Date" value={maturity} onChange={(e) => setMaturity(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <Checkbox mt="lg" label="DLT Bond Indicator" checked={dltBondIndicator} onChange={(e) => setDltBondIndicator(e.currentTarget.checked)} styles={{ label: { color: 'var(--text-main)', fontWeight: 600 } }} disabled={isSetting} />
                                    </SimpleGrid>
                                </Accordion.Panel>
                            </Accordion.Item>

                            <Accordion.Item value="sec5">
                                <Accordion.Control>5. Interest Payment Terms</Accordion.Control>
                                <Accordion.Panel>
                                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                                        <TextInput label="Interest Type" value={interestType} onChange={(e) => setInterestType(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <NumberInput label="Interest Rate (bps)" value={interestRateBps} onChange={setInterestRateBps} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Payment Frequency" value={paymentFrequency} onChange={(e) => setPaymentFrequency(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />

                                        <TextInput label="Day Count Fraction" value={dayCountFraction} onChange={(e) => setDayCountFraction(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Business Day Conv." value={businessDayConvention} onChange={(e) => setBusinessDayConvention(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Business Day Center" value={businessDayCenter} onChange={(e) => setBusinessDayCenter(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />

                                        <NumberInput label="Interest Payment Day" value={interestPaymentDay} onChange={setInterestPaymentDay} styles={inputStyles} disabled={isSetting} />
                                        <NumberInput label="Interest Payment Month" value={interestPaymentMonth} onChange={setInterestPaymentMonth} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="First Payment Date" value={firstPaymentDate} onChange={(e) => setFirstPaymentDate(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Last Payment Date" value={lastPaymentDate} onChange={(e) => setLastPaymentDate(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Interest Commencement" value={interestCommencementDate} onChange={(e) => setInterestCommencementDate(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />

                                        <NumberInput label="Final Redemption %" value={finalRedemptionPct} onChange={setFinalRedemptionPct} styles={inputStyles} disabled={isSetting} />
                                        <NumberInput label="Early Redemption %" value={earlyRedemptionPct} onChange={setEarlyRedemptionPct} styles={inputStyles} disabled={isSetting} />
                                    </SimpleGrid>
                                </Accordion.Panel>
                            </Accordion.Item>

                            <Accordion.Item value="sec6">
                                <Accordion.Control>6. Listing & Clearing</Accordion.Control>
                                <Accordion.Panel>
                                    <SimpleGrid cols={{ base: 1, sm: 2 }}>
                                        <TextInput label="Listing Market" value={listingMarket} onChange={(e) => setListingMarket(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Listing Market Type" value={listingMarketType} onChange={(e) => setListingMarketType(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Clearing & Settlement System" value={clearingSettlementSystem} onChange={(e) => setClearingSettlementSystem(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Selling Restrictions" value={sellingRestrictions} onChange={(e) => setSellingRestrictions(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Manufacturer Target Market" value={manufacturerTargetMarket} onChange={(e) => setManufacturerTargetMarket(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                    </SimpleGrid>
                                </Accordion.Panel>
                            </Accordion.Item>

                            <Accordion.Item value="sec7">
                                <Accordion.Control>7. DLT Platform Attributes</Accordion.Control>
                                <Accordion.Panel>
                                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                                        <TextInput label="Platform Type" value={platformType} onChange={(e) => setPlatformType(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Accessibility" value={accessibility} onChange={(e) => setAccessibility(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Role" value={role} onChange={(e) => setRole(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Operator Name" value={operatorName} onChange={(e) => setOperatorName(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Platform Name" value={platformName} onChange={(e) => setPlatformName(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Token Type" value={tokenType} onChange={(e) => setTokenType(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Smart Contract" value={smartContract} onChange={(e) => setSmartContract(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                    </SimpleGrid>
                                </Accordion.Panel>
                            </Accordion.Item>

                            <Accordion.Item value="sec8">
                                <Accordion.Control>8. Provisions</Accordion.Control>
                                <Accordion.Panel>
                                    <Stack gap="sm">
                                        <Checkbox label="Negative Pledge" checked={flagNegativePledge} onChange={(e) => setFlagNegativePledge(e.currentTarget.checked)} styles={{ label: { color: 'var(--text-main)', fontWeight: 600 } }} disabled={isSetting} />
                                        <Checkbox label="Gross-Up" checked={flagGrossUp} onChange={(e) => setFlagGrossUp(e.currentTarget.checked)} styles={{ label: { color: 'var(--text-main)', fontWeight: 600 } }} disabled={isSetting} />
                                        <Checkbox label="Cross Default" checked={flagCrossDefault} onChange={(e) => setFlagCrossDefault(e.currentTarget.checked)} styles={{ label: { color: 'var(--text-main)', fontWeight: 600 } }} disabled={isSetting} />
                                    </Stack>
                                </Accordion.Panel>
                            </Accordion.Item>

                            <Accordion.Item value="sec9">
                                <Accordion.Control>9. Bond Ratings</Accordion.Control>
                                <Accordion.Panel>
                                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                                        <TextInput label="Rating Agency" value={ratingAgency} onChange={(e) => setRatingAgency(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Expected Product Rating" value={expectedProductRating} onChange={(e) => setExpectedProductRating(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                        <TextInput label="Party Rating" value={partyRating} onChange={(e) => setPartyRating(e.currentTarget.value)} styles={inputStyles} disabled={isSetting} />
                                    </SimpleGrid>
                                </Accordion.Panel>
                            </Accordion.Item>
                        </Accordion>

                        <Group justify="flex-start" mt="xl">
                            <Button
                                size="lg"
                                color="accent"
                                onClick={handleSetTerms}
                                loading={isSetting}
                                disabled={!icmaDataEngineAddress}
                            >
                                Save ICMA Terms On-Chain
                            </Button>
                        </Group>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card padding="xl" className="neobrutal-card" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
                        <Group justify="space-between" mb="sm" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                            <Title order={4}>Network Activity</Title>
                            <Box style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isSetting ? '#EAB308' : '#10B981' }} className={isSetting ? 'pulse-badge' : ''} />
                        </Group>
                        <div className="terminal-log">
                            {logs.length === 0 && (
                                <Text c="dimmed" size="xs" style={{ fontStyle: 'italic' }}>Awaiting terms transactions...</Text>
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
