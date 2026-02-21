import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Contract } from 'ethers';

export type LifecycleStep = 'setup' | 'terms' | 'mint' | 'transfer' | 'coupon' | 'compliance' | 'redemption';

export const LIFECYCLE_ORDER: LifecycleStep[] = [
    'setup', 'terms', 'mint', 'transfer', 'coupon', 'compliance', 'redemption'
];

export const STEP_LABELS: Record<LifecycleStep, { number: number; label: string; description: string }> = {
    setup: { number: 1, label: 'Deploy Contracts', description: 'CMTAT Bond + ICMA Data Engine' },
    terms: { number: 2, label: 'Bond Data Taxonomy', description: 'ICMA BDT structured data' },
    mint: { number: 3, label: 'Primary Issuance', description: 'DvP settlement to investors' },
    transfer: { number: 4, label: 'Secondary Trading', description: 'P2P token transfer' },
    coupon: { number: 5, label: 'Coupon Distribution', description: 'Interest payment to holders' },
    compliance: { number: 6, label: 'Compliance Actions', description: 'Pause, freeze, snapshot' },
    redemption: { number: 7, label: 'Maturity & Burn', description: 'Redeem at par value' },
};

export interface BondState {
    id: string;
    name: string;
    currentStep: LifecycleStep;
    completedSteps: Set<LifecycleStep>;
    icmaDataEngineAddress: string | null;
    cmtatBondAddress: string | null;
    // Non-serializable — excluded from persistence
    icmaContract: Contract | null;
    bondContract: Contract | null;
    rating: string | null;
    ratingAgency: string | null;
}

export interface SandboxState {
    bonds: Record<string, BondState>;
    activeBondId: string | null;
    isClientReady: boolean;

    // Role addresses (deterministic from Hardhat mnemonic)
    issuerAddress: string;
    investorAAddress: string;
    investorBAddress: string;

    // Actions
    setActiveBond: (id: string) => void;
    createBond: (name: string) => string; // returns new bond ID

    // Actions that apply to the active bond
    setStep: (step: LifecycleStep) => void;
    completeStep: (step: LifecycleStep) => void;
    setClientReady: (ready: boolean) => void;
    setContracts: (icmaAddr: string, bondAddr: string, icma: Contract, bond: Contract) => void;
    setBondRating: (agency: string, rating: string) => void;
    resetActiveBond: () => void;
    resetAll: () => void;

    // Selectors
    getStepIndex: (step: LifecycleStep) => number;
    isStepAccessible: (step: LifecycleStep) => boolean;
}

const createNewBond = (id: string, name: string): BondState => ({
    id,
    name,
    currentStep: 'setup',
    completedSteps: new Set<LifecycleStep>(),
    icmaDataEngineAddress: null,
    cmtatBondAddress: null,
    icmaContract: null,
    bondContract: null,
    rating: null,
    ratingAgency: null,
});

const DEFAULT_BOND_ID = 'bond-1';

const getInitialState = () => ({
    bonds: { [DEFAULT_BOND_ID]: createNewBond(DEFAULT_BOND_ID, 'Corporate Bond Series A') },
    activeBondId: DEFAULT_BOND_ID,
    isClientReady: false,
    issuerAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    investorAAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    investorBAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
});

export const useSandboxStore = create<SandboxState>()(
    persist(
        (set, get) => ({
            ...getInitialState(),

            setActiveBond: (id) => set({ activeBondId: id }),

            createBond: (name) => {
                const id = `bond-${Date.now()}`;
                set((state) => ({
                    bonds: {
                        ...state.bonds,
                        [id]: createNewBond(id, name)
                    },
                    activeBondId: id
                }));
                return id;
            },

            setStep: (step) => set((state) => {
                if (!state.activeBondId) return state;
                const updatedBond = { ...state.bonds[state.activeBondId], currentStep: step };
                return { bonds: { ...state.bonds, [state.activeBondId]: updatedBond } };
            }),

            completeStep: (step) => {
                const state = get();
                if (!state.activeBondId) return;
                const bond = state.bonds[state.activeBondId];

                const newSet = new Set(bond.completedSteps);
                newSet.add(step);

                const idx = LIFECYCLE_ORDER.indexOf(step);
                const nextStep = idx < LIFECYCLE_ORDER.length - 1 ? LIFECYCLE_ORDER[idx + 1] : step;

                const updatedBond = { ...bond, completedSteps: newSet, currentStep: nextStep };
                set({ bonds: { ...state.bonds, [state.activeBondId]: updatedBond } });
            },

            setClientReady: (ready) => set({ isClientReady: ready }),

            setContracts: (icmaAddr, bondAddr, icma, bondContract) => set((state) => {
                if (!state.activeBondId) return state;
                const updatedBond = {
                    ...state.bonds[state.activeBondId],
                    icmaDataEngineAddress: icmaAddr,
                    cmtatBondAddress: bondAddr,
                    icmaContract: icma,
                    bondContract: bondContract
                };
                return { bonds: { ...state.bonds, [state.activeBondId]: updatedBond } };
            }),

            setBondRating: (agency, rating) => set((state) => {
                if (!state.activeBondId) return state;
                const updatedBond = {
                    ...state.bonds[state.activeBondId],
                    ratingAgency: agency,
                    rating: rating
                };
                return { bonds: { ...state.bonds, [state.activeBondId]: updatedBond } };
            }),

            resetActiveBond: () => set((state) => {
                if (!state.activeBondId) return state;
                const bond = state.bonds[state.activeBondId];
                return {
                    bonds: {
                        ...state.bonds,
                        [state.activeBondId]: createNewBond(bond.id, bond.name)
                    },
                    isClientReady: false,
                };
            }),

            resetAll: () => {
                set({ ...getInitialState() });
            },

            getStepIndex: (step) => LIFECYCLE_ORDER.indexOf(step),

            isStepAccessible: (step) => {
                const state = get();
                if (!state.activeBondId) return false;
                const bond = state.bonds[state.activeBondId];

                const idx = LIFECYCLE_ORDER.indexOf(step);
                if (idx === 0) return true; // setup is always accessible

                const prevStep = LIFECYCLE_ORDER[idx - 1];
                return bond.completedSteps.has(prevStep);
            },
        }),
        {
            name: 'cmtat-sandbox-state',
            // Custom serialization: persist only serializable fields
            storage: {
                getItem: (name) => {
                    const str = localStorage.getItem(name);
                    if (!str) return null;
                    try {
                        const parsed = JSON.parse(str);
                        // Rehydrate: convert completedSteps arrays back to Sets
                        if (parsed?.state?.bonds) {
                            for (const bondId of Object.keys(parsed.state.bonds)) {
                                const bond = parsed.state.bonds[bondId];
                                bond.completedSteps = new Set(bond.completedSteps || []);
                                // Contract objects cannot be persisted — null them out
                                bond.icmaContract = null;
                                bond.bondContract = null;
                            }
                        }
                        return parsed;
                    } catch {
                        return null;
                    }
                },
                setItem: (name, value) => {
                    // Serialize: convert Sets to arrays, strip non-serializable Contract objects
                    const serializable = JSON.parse(JSON.stringify(value, (key, val) => {
                        if (val instanceof Set) return Array.from(val);
                        // Strip ethers Contract objects (they have a 'target' property)
                        if (key === 'icmaContract' || key === 'bondContract') return null;
                        return val;
                    }));
                    localStorage.setItem(name, JSON.stringify(serializable));
                },
                removeItem: (name) => localStorage.removeItem(name),
            },
            // Only persist data fields, not actions
            partialize: (state) => ({
                bonds: state.bonds,
                activeBondId: state.activeBondId,
                isClientReady: state.isClientReady,
                issuerAddress: state.issuerAddress,
                investorAAddress: state.investorAAddress,
                investorBAddress: state.investorBAddress,
            } as unknown as SandboxState),
        }
    )
);

// Helper hook to access the currently active bond in a reactive way
export const useActiveBond = () => {
    return useSandboxStore(state => state.activeBondId ? state.bonds[state.activeBondId] : null);
};
