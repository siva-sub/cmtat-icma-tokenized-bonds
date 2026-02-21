// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

library ICMATypes {
    struct BondStaticData {
        // Section 1: Security Identification
        string isin; // ISIN
        // Section 2: Issuer & Parties
        string issuerLei; // LEIIdentifier
        string issuerName; // PartyName
        string issuanceType; // PROGRAMME or STANDALONE
        // Section 3: Issuance Details
        string currency; // SpecifiedCurrency
        string paymentCurrency; // PaymentCurrency (Optional)
        string settlementCurrency; // SettlementCurrency (Optional)
        uint256 denomination; // SpecifiedDenomination
        uint256 integralMultiples; // IntegralMultiples
        uint256 calculationAmount; // CalculationAmount
        string pricingDate; // PricingDate
        string issuanceDate; // IssueDate
        string settlementDate; // SettlementDate
        uint256 issuePrice; // IssuePrice
        string methodOfDistribution; // SYNDICATED / NON_SYNDICATED / AUCTION / PRIVATE_PLACEMENT
        string governingLaw; // GoverningLaw
        // Section 4: Product Details
        string formOfNote; // BEARER / REGISTERED / DEMATERIALISED
        string statusOfNote; // SENIOR_SECURED / SENIOR_UNSECURED etc.
        uint256 aggregateNominalAmount; // AggregateNominalAmount
        string maturityDate; // MaturityDate
        bool dltBondIndicator; // DLTBondIndicator
        // Section 6: Listing & Clearing (Simplified arrays to strings/flags for contract storage)
        string listingMarket; // Market
        string listingMarketType; // MarketType
        string clearingSettlementSystem; // ClearingSettlementSystem
        string sellingRestrictions; // Category of investors
        string manufacturerTargetMarket; // Target Market EU_MIFIDII_PROF_AND_ECPS
        // Section 8: Provisions
        bool flagNegativePledge;
        bool flagGrossUp;
        bool flagCrossDefault;
    }

    struct BondTerms {
        string interestType; // Fixed, Floating, Zero
        uint256 interestRateBps; // basis points (e.g., 350 = 3.50%)
        string paymentFrequency; // ANNUALLY, SEMI_ANNUALLY, QUARTERLY
        string dayCountFraction; // ACT/ACT, 30/360, ACT/365
        string businessDayConvention; // FOLLOWING, MODIFIED_FOLLOWING
        string businessDayCenter; // TARGET, FRANKFURT, NEW_YORK
        uint8 interestPaymentDay;
        uint8 interestPaymentMonth;
        string firstPaymentDate;
        string lastPaymentDate; // Optional
        string interestCommencementDate;
        uint256 finalRedemptionPct; // 100 = par
        uint256 earlyRedemptionPct; // Optional
    }

    struct DltPlatformData {
        string platformType; // Ethereum, Hyperledger Fabric, Tevm
        string accessibility; // PERMISSIONED, PUBLIC, PRIVATE
        string role; // Registrar, Settlement Agent etc.
        string operatorName; // Operator Name
        string platformName; // Public Name
        string tokenType; // ERC20, ERC1155, CMTAT 3.0
        string smartContract; // Contract address or reference as string
    }

    struct CreditEvents {
        bool flagDefault;
        bool flagRedeemed;
        string rating;
        string ratingAgency;
    }

    struct BondRatings {
        string ratingAgency;
        string expectedProductRating;
        string partyRating;
    }
}
