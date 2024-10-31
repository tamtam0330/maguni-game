import {create} from 'zustand';

const useRoomStore = create((set)=>({
    roomcode:'',
    setRoomcode: (newRoomcode) =>set({roomcode: newRoomcode}),

}))

export default useRoomStore;