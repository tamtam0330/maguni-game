import { create } from 'zustand';

export const useModalStore = create((set) => ({
    modals: {

        instructionModal: false,
        SettingForbiddenWordModal: false,
        FW: false,//ForbiddenWordList 모달
        gameResult: false,
        goongYeAnouncingEnd: false,
        goongYeAnnouncingResult: false,
        whoModal: false,

    },
    setModal: (modalName, isOpen) => 
        set((state) => ({
            modals: {
                ...state.modals,
                [modalName]: isOpen
            }
        })),
}));
