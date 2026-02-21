import { sanctionsList } from '../data/sanctionsList';

export interface ScreeningResult {
    isSanctioned: boolean;
    match?: {
        id: string;
        name: string;
        designation: string;
        listType: string;
        comments: string;
    };
    message: string;
}

export function screenEntity(query: string): ScreeningResult {
    if (!query) return { isSanctioned: false, message: 'No query provided' };

    const lowerQuery = query.toLowerCase().trim();

    // Loop through the list to find a match by name or wallet address
    for (const entity of sanctionsList) {
        const fullName = `${entity.firstName} ${entity.lastName}`.toLowerCase();
        const first = entity.firstName.toLowerCase();
        const last = entity.lastName.toLowerCase();

        // Check explicit wallet addresses if they exist
        if (entity.walletAddresses && entity.walletAddresses.some((addr: string) => addr.toLowerCase() === lowerQuery)) {
            return generateMatchResponse(entity);
        }

        // Fuzzy name match
        if (fullName.includes(lowerQuery) || first.includes(lowerQuery) || last.includes(lowerQuery) || lowerQuery.includes(fullName)) {
            return generateMatchResponse(entity);
        }
    }

    return {
        isSanctioned: false,
        message: 'No sanctions match found. Entity is clear to transact.'
    };
}

function generateMatchResponse(entity: any): ScreeningResult {
    return {
        isSanctioned: true,
        match: {
            id: entity.id,
            name: `${entity.firstName} ${entity.lastName}`,
            designation: entity.designation,
            listType: entity.listType,
            comments: entity.comments
        },
        message: `WARNING: Entity matched against ${entity.listType}. Designation: ${entity.designation}. Transaction must be blocked and reported.`
    };
}
