// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "../libraries/ICMATypes.sol";

/**
 * @title IICMADataEngine
 * @author Siva
 * @notice Interface for the ICMA Data Engine managing bond taxonomy attributes
 */
interface IICMADataEngine is IERC165 {
    /**
     * @notice Retrieves the static data for the bond
     * @return The BondStaticData struct containing static attributes
     */
    function bondStaticData()
        external
        view
        returns (ICMATypes.BondStaticData memory);

    /**
     * @notice Retrieves the terms of the bond
     * @return The BondTerms struct containing interest and redemption terms
     */
    function bondTerms() external view returns (ICMATypes.BondTerms memory);

    /**
     * @notice Retrieves the credit events of the bond
     * @return The CreditEvents struct tracking lifecycle changes
     */
    function creditEvents()
        external
        view
        returns (ICMATypes.CreditEvents memory);

    /**
     * @notice Sets the static data for the bond
     * @param _data The updated BondStaticData struct
     */
    function setBondStaticData(
        ICMATypes.BondStaticData calldata _data
    ) external;

    /**
     * @notice Sets the terms of the bond
     * @param _data The updated BondTerms struct
     */
    function setBondTerms(ICMATypes.BondTerms calldata _data) external;

    /**
     * @notice Sets the credit events of the bond
     * @param _events The updated CreditEvents struct
     */
    function setCreditEvents(ICMATypes.CreditEvents calldata _events) external;

    /**
     * @notice Retrieves the DLT Platform data
     * @return The DltPlatformData struct containing platform specifics
     */
    function dltPlatformData()
        external
        view
        returns (ICMATypes.DltPlatformData memory);

    /**
     * @notice Sets the DLT Platform data
     * @param _data The updated DltPlatformData struct
     */
    function setDltPlatformData(
        ICMATypes.DltPlatformData calldata _data
    ) external;

    /**
     * @notice Retrieves the bond ratings data
     * @return The BondRatings struct containing agency and ratings
     */
    function bondRatings() external view returns (ICMATypes.BondRatings memory);

    /**
     * @notice Sets the ratings data for the bond
     * @param _data The updated BondRatings struct
     */
    function setBondRatings(ICMATypes.BondRatings calldata _data) external;
}
