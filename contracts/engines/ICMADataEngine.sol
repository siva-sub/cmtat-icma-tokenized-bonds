// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "../interfaces/IICMADataEngine.sol";

contract ICMADataEngine is IICMADataEngine, ERC165, AccessControl {
    bytes32 public constant DATA_MANAGER_ROLE = keccak256("DATA_MANAGER_ROLE");

    ICMATypes.BondStaticData private _bondStaticData;
    ICMATypes.BondTerms private _bondTerms;
    ICMATypes.CreditEvents private _creditEvents;
    ICMATypes.DltPlatformData private _dltPlatformData;
    ICMATypes.BondRatings private _bondRatings;

    event BondStaticDataUpdated();
    event BondTermsUpdated();
    event CreditEventsUpdated();
    event DltPlatformDataUpdated();
    event BondRatingsUpdated();

    constructor(address initialAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(DATA_MANAGER_ROLE, initialAdmin);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC165, AccessControl, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IICMADataEngine).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function bondStaticData()
        external
        view
        override
        returns (ICMATypes.BondStaticData memory)
    {
        return _bondStaticData;
    }

    function bondTerms()
        external
        view
        override
        returns (ICMATypes.BondTerms memory)
    {
        return _bondTerms;
    }

    function creditEvents()
        external
        view
        override
        returns (ICMATypes.CreditEvents memory)
    {
        return _creditEvents;
    }

    function setBondStaticData(
        ICMATypes.BondStaticData calldata _data
    ) external override onlyRole(DATA_MANAGER_ROLE) {
        _bondStaticData = _data;
        emit BondStaticDataUpdated();
    }

    function setBondTerms(
        ICMATypes.BondTerms calldata _data
    ) external override onlyRole(DATA_MANAGER_ROLE) {
        _bondTerms = _data;
        emit BondTermsUpdated();
    }

    function setCreditEvents(
        ICMATypes.CreditEvents calldata _events
    ) external override onlyRole(DATA_MANAGER_ROLE) {
        _creditEvents = _events;
        emit CreditEventsUpdated();
    }

    function dltPlatformData()
        external
        view
        override
        returns (ICMATypes.DltPlatformData memory)
    {
        return _dltPlatformData;
    }

    function setDltPlatformData(
        ICMATypes.DltPlatformData calldata _data
    ) external override onlyRole(DATA_MANAGER_ROLE) {
        _dltPlatformData = _data;
        emit DltPlatformDataUpdated();
    }

    function bondRatings()
        external
        view
        override
        returns (ICMATypes.BondRatings memory)
    {
        return _bondRatings;
    }

    function setBondRatings(
        ICMATypes.BondRatings calldata _data
    ) external override onlyRole(DATA_MANAGER_ROLE) {
        _bondRatings = _data;
        emit BondRatingsUpdated();
    }
}
