import { createFileRoute } from '@tanstack/react-router'
import { Card, Title, Text, Button, Stack, SimpleGrid, Code, Table, Box } from '@mantine/core'
import { useState } from 'react'
import { useActiveBond } from '../store/sandboxStore'
import { motion } from 'framer-motion'

export const Route = createFileRoute('/inspector')({
    component: InspectorComponent,
})

function InspectorComponent() {
    const activeBond = useActiveBond()
    const icmaDataEngineAddress = activeBond?.icmaDataEngineAddress || null
    const icmaContract = activeBond?.icmaContract || null
    const [staticData, setStaticData] = useState<any>(null)
    const [termsData, setTermsData] = useState<any>(null)
    const [dltData, setDltData] = useState<any>(null)
    const [ratingsData, setRatingsData] = useState<any>(null)
    const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'error', message: string }>({ type: 'idle', message: '' })

    const readICMAData = async () => {
        if (!icmaContract) return;
        setStatus({ type: 'loading', message: 'Fetching on-chain ICMA data...' })

        try {
            // Read static data via ethers Contract (view call — no mining needed)
            const rawStatic = await icmaContract.bondStaticData()
            const decodedStatic = {
                isin: rawStatic.isin,
                issuerLei: rawStatic.issuerLei,
                issuerName: rawStatic.issuerName,
                issuanceType: rawStatic.issuanceType,
                currency: rawStatic.currency,
                paymentCurrency: rawStatic.paymentCurrency,
                settlementCurrency: rawStatic.settlementCurrency,
                denomination: rawStatic.denomination,
                integralMultiples: rawStatic.integralMultiples,
                calculationAmount: rawStatic.calculationAmount,
                pricingDate: rawStatic.pricingDate,
                issuanceDate: rawStatic.issuanceDate,
                settlementDate: rawStatic.settlementDate,
                issuePrice: rawStatic.issuePrice,
                methodOfDistribution: rawStatic.methodOfDistribution,
                governingLaw: rawStatic.governingLaw,
                formOfNote: rawStatic.formOfNote,
                statusOfNote: rawStatic.statusOfNote,
                aggregateNominalAmount: rawStatic.aggregateNominalAmount,
                maturityDate: rawStatic.maturityDate,
                dltBondIndicator: rawStatic.dltBondIndicator,
                listingMarket: rawStatic.listingMarket,
                listingMarketType: rawStatic.listingMarketType,
                clearingSettlementSystem: rawStatic.clearingSettlementSystem,
                sellingRestrictions: rawStatic.sellingRestrictions,
                manufacturerTargetMarket: rawStatic.manufacturerTargetMarket,
                flagNegativePledge: rawStatic.flagNegativePledge,
                flagGrossUp: rawStatic.flagGrossUp,
                flagCrossDefault: rawStatic.flagCrossDefault,
            }

            // Read terms data
            const rawTerms = await icmaContract.bondTerms()
            const decodedTerms = {
                interestType: rawTerms.interestType,
                interestRateBps: rawTerms.interestRateBps,
                paymentFrequency: rawTerms.paymentFrequency,
                dayCountFraction: rawTerms.dayCountFraction,
                businessDayConvention: rawTerms.businessDayConvention,
                businessDayCenter: rawTerms.businessDayCenter,
                interestPaymentDay: rawTerms.interestPaymentDay,
                interestPaymentMonth: rawTerms.interestPaymentMonth,
                firstPaymentDate: rawTerms.firstPaymentDate,
                lastPaymentDate: rawTerms.lastPaymentDate,
                interestCommencementDate: rawTerms.interestCommencementDate,
                finalRedemptionPct: rawTerms.finalRedemptionPct,
                earlyRedemptionPct: rawTerms.earlyRedemptionPct
            }

            // Read DLT Platform Data
            const rawDlt = await icmaContract.dltPlatformData()
            const decodedDlt = {
                platformType: rawDlt.platformType,
                accessibility: rawDlt.accessibility,
                role: rawDlt.role,
                operatorName: rawDlt.operatorName,
                platformName: rawDlt.platformName,
                tokenType: rawDlt.tokenType,
                smartContract: rawDlt.smartContract
            }

            // Read Bond Ratings
            const rawRatings = await icmaContract.bondRatings()
            const decodedRatings = {
                ratingAgency: rawRatings.ratingAgency,
                expectedProductRating: rawRatings.expectedProductRating,
                partyRating: rawRatings.partyRating
            }

            setStaticData(decodedStatic)
            setTermsData(decodedTerms)
            setDltData(decodedDlt)
            setRatingsData(decodedRatings)
            setStatus({ type: 'idle', message: '' })
        } catch (error: any) {
            console.error(error)
            setStatus({ type: 'error', message: 'Failed to read data from engine.' })
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Stack gap="xl" p="md">
                <Box>
                    <Title order={2} className="gradient-text" mb="xs">ICMA Data Inspector</Title>
                    <Text c="var(--text-muted)" mb="xl">
                        Query the immutable bond specification directly from the standalone ICMA smart contract engine.
                    </Text>
                </Box>

                {!icmaDataEngineAddress ? (
                    <Box mb="xl" p="md" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', border: '1px solid #EAB308' }}>
                        <Text fw={700} c="#EAB308">Sandbox Not Deployed</Text>
                        <Text size="sm" c="#EAB308">Please go to Step 1 and deploy the ICMA Data Engine and CMTAT Bond first.</Text>
                    </Box>
                ) : (
                    <Stack gap="lg">
                        <Button
                            variant="default"
                            onClick={readICMAData}
                            loading={status.type === 'loading'}
                        >
                            Query On-Chain ICMA Data
                        </Button>

                        {status.type === 'error' && <Text c="red">{status.message}</Text>}

                        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                            {staticData && (
                                <Card padding="lg" className="neobrutal-card">
                                    <Title order={4} mb="md">Bond Static Data</Title>
                                    <Box style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        <Table striped highlightOnHover withRowBorders={false} style={{ color: 'var(--text-main)' }}>
                                            <Table.Tbody>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>ISIN</Table.Th><Table.Td>{staticData.isin}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Issuer LEI</Table.Th><Table.Td>{staticData.issuerLei}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Issuer Name</Table.Th><Table.Td>{staticData.issuerName}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Issuance Type</Table.Th><Table.Td>{staticData.issuanceType}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Currency</Table.Th><Table.Td>{staticData.currency}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Denomination</Table.Th><Table.Td>{staticData.denomination?.toString()}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Aggregate Nominal</Table.Th><Table.Td>{staticData.aggregateNominalAmount?.toString()}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Issue Price</Table.Th><Table.Td>{staticData.issuePrice?.toString()} bps</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Pricing Date</Table.Th><Table.Td>{staticData.pricingDate}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Issuance Date</Table.Th><Table.Td>{staticData.issuanceDate}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Settlement Date</Table.Th><Table.Td>{staticData.settlementDate}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Maturity Date</Table.Th><Table.Td>{staticData.maturityDate}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Form of Note</Table.Th><Table.Td>{staticData.formOfNote}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Status of Note</Table.Th><Table.Td>{staticData.statusOfNote}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Governing Law</Table.Th><Table.Td>{staticData.governingLaw}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Listing Market</Table.Th><Table.Td>{staticData.listingMarket}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>DLT Bond</Table.Th><Table.Td>{staticData.dltBondIndicator ? 'Yes' : 'No'}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Negative Pledge</Table.Th><Table.Td>{staticData.flagNegativePledge ? 'Yes' : 'No'}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Gross-Up</Table.Th><Table.Td>{staticData.flagGrossUp ? 'Yes' : 'No'}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Cross Default</Table.Th><Table.Td>{staticData.flagCrossDefault ? 'Yes' : 'No'}</Table.Td></Table.Tr>
                                            </Table.Tbody>
                                        </Table>
                                    </Box>
                                </Card>
                            )}

                            <Stack gap="lg">
                                {termsData && (
                                    <Card padding="lg" className="neobrutal-card">
                                        <Title order={4} mb="md">Bond Terms Data</Title>
                                        <Table striped highlightOnHover withRowBorders={false} style={{ color: 'var(--text-main)' }}>
                                            <Table.Tbody>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Interest Type</Table.Th><Table.Td>{termsData.interestType}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Interest Rate (bps)</Table.Th><Table.Td>{termsData.interestRateBps?.toString()}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Payment Frequency</Table.Th><Table.Td>{termsData.paymentFrequency}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Day Count</Table.Th><Table.Td>{termsData.dayCountFraction}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Business Day Conv.</Table.Th><Table.Td>{termsData.businessDayConvention}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Interest Start</Table.Th><Table.Td>{termsData.interestCommencementDate}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Final Redemption %</Table.Th><Table.Td>{termsData.finalRedemptionPct?.toString()}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Early Redemption %</Table.Th><Table.Td>{termsData.earlyRedemptionPct?.toString()}</Table.Td></Table.Tr>
                                            </Table.Tbody>
                                        </Table>
                                    </Card>
                                )}

                                {dltData && (
                                    <Card padding="lg" className="neobrutal-card">
                                        <Title order={4} mb="md">DLT Platform</Title>
                                        <Table striped highlightOnHover withRowBorders={false} style={{ color: 'var(--text-main)' }}>
                                            <Table.Tbody>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Platform Type</Table.Th><Table.Td>{dltData.platformType}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Accessibility</Table.Th><Table.Td>{dltData.accessibility}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Operator Name</Table.Th><Table.Td>{dltData.operatorName}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Token Type</Table.Th><Table.Td>{dltData.tokenType}</Table.Td></Table.Tr>
                                            </Table.Tbody>
                                        </Table>
                                    </Card>
                                )}

                                {ratingsData && (
                                    <Card padding="lg" className="neobrutal-card">
                                        <Title order={4} mb="md">Bond Ratings</Title>
                                        <Table striped highlightOnHover withRowBorders={false} style={{ color: 'var(--text-main)' }}>
                                            <Table.Tbody>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Agency</Table.Th><Table.Td>{ratingsData.ratingAgency}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Product Rating</Table.Th><Table.Td>{ratingsData.expectedProductRating}</Table.Td></Table.Tr>
                                                <Table.Tr><Table.Th style={{ color: 'var(--text-muted)' }}>Party Rating</Table.Th><Table.Td>{ratingsData.partyRating}</Table.Td></Table.Tr>
                                            </Table.Tbody>
                                        </Table>
                                    </Card>
                                )}
                            </Stack>
                        </SimpleGrid>

                        {(staticData || termsData || dltData || ratingsData) && (
                            <Card padding="lg" className="neobrutal-card" mt="md">
                                <Title order={4} mb="md">Raw On-Chain Result</Title>
                                <Code block c="var(--text-muted)" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {JSON.stringify({
                                        staticData: staticData ? {
                                            ...staticData,
                                            denomination: staticData.denomination?.toString(),
                                            aggregateNominalAmount: staticData.aggregateNominalAmount?.toString(),
                                            integralMultiples: staticData.integralMultiples?.toString(),
                                            calculationAmount: staticData.calculationAmount?.toString(),
                                            issuePrice: staticData.issuePrice?.toString()
                                        } : null,
                                        termsData: termsData ? {
                                            ...termsData,
                                            interestRateBps: termsData.interestRateBps?.toString(),
                                            finalRedemptionPct: termsData.finalRedemptionPct?.toString(),
                                            earlyRedemptionPct: termsData.earlyRedemptionPct?.toString(),
                                            interestPaymentDay: termsData.interestPaymentDay?.toString(),
                                            interestPaymentMonth: termsData.interestPaymentMonth?.toString()
                                        } : null,
                                        dltData,
                                        ratingsData
                                    }, null, 2)}
                                </Code>
                            </Card>
                        )}
                    </Stack>
                )}
            </Stack>
        </motion.div>
    )
}
