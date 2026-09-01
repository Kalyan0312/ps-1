export interface JobRequest {
    id: string;
    type: string;
    distance: number; // in kilometers
    payment: number; // in currency
}

export interface EarningsSummary {
    today: number; // today's earnings
    thisWeek: number; // earnings for the current week
    totalJobs: number; // total jobs completed
    welfare: number; // welfare information
}

export interface WorkerProfile {
    photoUrl: string;
    name: string;
    rating: number; // worker's rating
    cooperativeBadge: boolean; // indicates if the worker has a cooperative badge
    skills: string[]; // list of skills
    certificates: string[]; // list of certificates
    experience: string; // description of experience
}

export interface JobStatus {
    id: string;
    status: 'Assigned' | 'On the way' | 'Working' | 'Done';
}

export interface WorkerState {
    isAvailable: boolean; // worker's availability status
    currentJob: JobStatus | null; // current job status
    profile: WorkerProfile; // worker's profile information
    earnings: EarningsSummary; // earnings summary
}