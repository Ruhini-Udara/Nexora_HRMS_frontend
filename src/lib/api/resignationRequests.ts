import api from '../axiosInstance';

export interface ResignationDocument {
    key: string;
    label: string;
    filename: string;
}

export type ResignationStatus = 
    | 'NEW' 
    | 'SUBMITTED' 
    | 'VERIFIED_BY_HR' 
    | 'PENDING_ADMIN' 
    | 'REJECTED'
    | 'SUBMITTED_FOR_ADMIN_APPROVAL'
    | 'Pending Director'
    | 'Board Approved'
    | 'Board Rejected';

export interface ResignationRequest {
    id: string;
    employeeName: string;
    epfNumber: string;
    designation: string;
    branch: string;
    resignationDate: string;
    lastWorkingDate: string;
    obligationDetails: string;
    reason: string;
    specialRemark: string;
    status: ResignationStatus;
    documents: {
        resignationLetter?: string;
        clearanceLetter?: string;
        handoverChecklist?: string;
    };
    hrRemark?: string;
    directorRemark?: string;
    boardMeetingDate?: string;
    createdAt?: string;
}

// Internal mapping function to map DTO from backend to frontend interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDtoToFrontend = (dto: any): ResignationRequest => {
    return {
        id: `RES-${dto.id}`,
        employeeName: dto.employeeName || '',
        epfNumber: dto.epfNumber || '',
        designation: dto.designation || '',
        branch: dto.branch || '',
        resignationDate: dto.resignationDate || '',
        lastWorkingDate: dto.lastWorkingDate || '',
        obligationDetails: dto.obligationDetails || '',
        reason: dto.reason || '',
        specialRemark: dto.specialRemark || '',
        status: dto.status || 'NEW',
        documents: {
            resignationLetter: dto.resignationLetterDoc,
            clearanceLetter: dto.clearanceLetterDoc,
            handoverChecklist: dto.handoverChecklistDoc,
        },
        hrRemark: dto.hrRemark || '',
        directorRemark: dto.directorRemark || '',
        boardMeetingDate: dto.boardMeetingDate || '',
        createdAt: dto.createdAt || '',
    };
};

export const getAllResignationRequests = async (): Promise<ResignationRequest[]> => {
    const response = await api.get('/api/resignations');
    return response.data.map(mapDtoToFrontend);
};

export const getResignationRequestsByEmployee = async (employeeId: number): Promise<ResignationRequest[]> => {
    const response = await api.get(`/api/resignations/employee/${employeeId}`);
    return response.data.map(mapDtoToFrontend);
};

export const createResignationRequest = async (request: Partial<ResignationRequest>, employeeId: number): Promise<ResignationRequest> => {
    const payload = {
        employeeId,
        employeeName: request.employeeName,
        epfNumber: request.epfNumber,
        designation: request.designation,
        branch: request.branch,
        resignationDate: request.resignationDate,
        lastWorkingDate: request.lastWorkingDate,
        obligationDetails: request.obligationDetails,
        reason: request.reason,
        specialRemark: request.specialRemark,
        status: request.status || 'SUBMITTED',
        resignationLetterDoc: request.documents?.resignationLetter,
        clearanceLetterDoc: request.documents?.clearanceLetter,
        handoverChecklistDoc: request.documents?.handoverChecklist,
    };
    
    const response = await api.post('/api/resignations', payload);
    return mapDtoToFrontend(response.data);
};

export const updateResignationStatus = async (idStr: string, status: string, remarks?: string, boardMeetingDate?: string): Promise<ResignationRequest> => {
    const numericId = parseInt(idStr.replace('RES-', ''), 10);
    const response = await api.put(`/api/resignations/${numericId}/status`, null, {
        params: { status, remarks, boardMeetingDate }
    });
    return mapDtoToFrontend(response.data);
};
