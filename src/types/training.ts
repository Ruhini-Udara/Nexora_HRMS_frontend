
export interface TrainingRequest {
    id: number;
    eventId: number;
    employeeName: string;
    epfNumber: string;
    age: number;
    department: string;
    designation: string;
    workEmail: string;
    personalEmail?: string;
    avatar?: string;
    initials?: string;
    dateSubmitted: string;
    status: string;
    eventStatus?: string;
    justification: string;
    attachmentPath?: string;
    attachments?: { name: string; url: string }[];
    rejectionReason?: string;
}