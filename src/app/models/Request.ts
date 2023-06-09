import { certType } from "./Certificate";

export interface Request{
    id: number,
    issuer: string,
    validTo: Date,
    certificateType: certType,
    state: RequestStatus,
    subjectUsername: string,
    reason: string | null,
    issuerUsername: string
}

export interface MakeRequest{
    issuerSN: string,
    date: Date,
    certificateType: certType,   
}


export interface RejectinReason{
    reason : string
}

export enum RequestStatus{
    PENDING,
    ACCEPTED,
    REJECTED
}