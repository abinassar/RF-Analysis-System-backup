import { linkSetting } from "src/app/models/linkSetting";
import { AntennaSelected } from "./antenna";

export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    emailVerified: boolean;
}