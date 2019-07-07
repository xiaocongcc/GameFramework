import IDataModel from "../IDataModel";

export default class SystemModel extends IDataModel {
    is_open_music: boolean = false;
    is_open_sound: boolean = false;

    constructor() {
        super('system');

        // this.Set('music_state', 1);
        // this.Set('sound_state', 1);
        // this.Save();
    }

    getMessageListeners() {
        return {
        }
    }
}