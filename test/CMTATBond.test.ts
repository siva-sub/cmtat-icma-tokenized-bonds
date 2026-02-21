import { expect } from "chai";
import hre from "hardhat";

describe("CMTATBond & ICMADataEngine Sandbox Tests", function () {
    let admin: any;
    let otherAccount: any;
    let icmaDataEngine: any;
    let cmtatBond: any;

    beforeEach(async function () {
        // Get signers
        const signers = await hre.ethers.getSigners();
        admin = signers[0];
        otherAccount = signers[1];

        // Deploy ICMADataEngine
        const ICMADataEngine = await hre.ethers.getContractFactory("ICMADataEngine");
        icmaDataEngine = await ICMADataEngine.deploy(admin.address);
        await icmaDataEngine.waitForDeployment();
        const icmaDataEngineAddress = await icmaDataEngine.getAddress();

        // Deploy CMTATBond
        const CMTATBond = await hre.ethers.getContractFactory("CMTATBond");

        const erc20Attrs = {
            name: "ICMA Tokenized Bond",
            symbol: "ICMA25",
            decimalsIrrevocable: 0
        };

        const extraAttrs = {
            tokenId: "FR0013510518",
            terms: { name: "Termsheet", uri: "ipfs://mock", documentHash: hre.ethers.ZeroHash },
            information: "Mock Bond for Sandbox"
        };

        const engines = {
            ruleEngine: hre.ethers.ZeroAddress
        };

        cmtatBond = await CMTATBond.deploy(
            admin.address, // forwarderIrrevocable
            admin.address, // admin
            erc20Attrs,
            extraAttrs,
            engines,
            icmaDataEngineAddress
        );
        await cmtatBond.waitForDeployment();
    });

    describe("Deployment and Initialization", function () {
        it("should link ICMADataEngine to CMTATBond", async function () {
            const engineAddress = await cmtatBond.icmaDataEngine();
            expect(engineAddress).to.equal(await icmaDataEngine.getAddress());
        });

        it("should correctly set name and symbol from standard CMTAT logic", async function () {
            expect(await cmtatBond.name()).to.equal("ICMA Tokenized Bond");
            expect(await cmtatBond.symbol()).to.equal("ICMA25");
            expect(await cmtatBond.decimals()).to.equal(0);
        });
    });

    describe("ICMA Bond Data Taxonomy operations", function () {
        const staticData = {
            isin: "FR123456789",
            issuerLei: "969500KN90DZLHUN3566",
            issuerName: "Societe Generale SFH",
            currency: "EUR",
            denomination: 100000n,
            aggregateNominalAmount: 40000000n,
            issuanceDate: "2020-05-14",
            maturityDate: "2025-05-14",
            formOfNote: "DEMATERIALISED",
            statusOfNote: "SENIOR_SECURED",
            governingLaw: "FRENCH_LAW",
            dltBondIndicator: true
        };

        it("should allow DATA_MANAGER to set static data", async function () {
            await expect(icmaDataEngine.connect(admin).setBondStaticData(staticData))
                .to.emit(icmaDataEngine, "BondStaticDataUpdated");

            const retrievedData = await icmaDataEngine.bondStaticData();
            expect(retrievedData.isin).to.equal("FR123456789");
            expect(retrievedData.issuerLei).to.equal("969500KN90DZLHUN3566");
            expect(retrievedData.aggregateNominalAmount).to.equal(40000000n);
            expect(retrievedData.dltBondIndicator).to.be.true;
        });

        it("should revert if non-admin tries to set static data", async function () {
            // AccessControl in v5 uses standard reverting logic
            const DATA_MANAGER_ROLE = await icmaDataEngine.DATA_MANAGER_ROLE();

            await expect(
                icmaDataEngine.connect(otherAccount).setBondStaticData(staticData)
            ).to.be.revertedWithCustomError(icmaDataEngine, "AccessControlUnauthorizedAccount")
                .withArgs(otherAccount.address, DATA_MANAGER_ROLE);
        });
    });
});
