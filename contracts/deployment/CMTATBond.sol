// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../../lib/cmtat/contracts/deployment/CMTATStandalone.sol";
import "../../lib/cmtat/contracts/interfaces/technical/ICMTATConstructor.sol";
import "../../lib/cmtat/contracts/interfaces/tokenization/draft-IERC1643CMTAT.sol";
import "../interfaces/IICMADataEngine.sol";

/**
 * @title CMTATBond
 * @author Siva
 * @notice CMTAT-compliant tokenized bond mapped to ICMA Bond Data Taxonomy
 */
contract CMTATBond is CMTATStandalone {
    /// @notice The external engine managing ICMA taxonomy data
    IICMADataEngine public icmaDataEngine;

    /**
     * @notice Emitted when the ICMA data engine is updated
     * @param oldEngine The address of the previous engine
     * @param newEngine The address of the new engine
     */
    event ICMADataEngineUpdated(
        address indexed oldEngine,
        address indexed newEngine
    );

    /**
     * @notice Deploys a new CMTAT Bond instance
     * @param forwarderIrrevocable address of the forwarder
     * @param admin address of the admin
     * @param ERC20Attributes_ ERC20 attributes
     * @param extraInformationAttributes_ extra info attributes
     * @param engines_ other engine attributes
     * @param initialICMADataEngine the address of the ICMADataEngine
     */
    constructor(
        address forwarderIrrevocable,
        address admin,
        ICMTATConstructor.ERC20Attributes memory ERC20Attributes_,
        ICMTATConstructor.ExtraInformationAttributes memory extraInformationAttributes_,
        ICMTATConstructor.Engine memory engines_,
        address initialICMADataEngine
    )
        CMTATStandalone(
            forwarderIrrevocable,
            admin,
            ERC20Attributes_,
            extraInformationAttributes_,
            engines_
        )
    {
        if (initialICMADataEngine != address(0)) {
            icmaDataEngine = IICMADataEngine(initialICMADataEngine);
            emit ICMADataEngineUpdated(address(0), initialICMADataEngine);
        }
    }

    /**
     * @notice Updates the ICMA Data Engine
     * @param newEngine The address of the new ICMADataEngine contract
     */
    function setICMADataEngine(
        address newEngine
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        address oldEngine = address(icmaDataEngine);
        icmaDataEngine = IICMADataEngine(newEngine);
        emit ICMADataEngineUpdated(oldEngine, newEngine);
    }
}
