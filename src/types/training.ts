
export interface TrainingRequest {
    id: number;
    eventId: number;
    employeeName: string;
    epfNumber: string;
    age: number;
    department: string;
    designation: string;
    workEmail: string;
    avatar?: string;
    initials?: string;
    dateSubmitted: string;
    status: string;
    justification: string;
    attachments: { name: string; url: string }[];
}