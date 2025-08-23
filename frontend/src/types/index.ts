export interface WorkflowNode {
    id: string;
    type: string;
    data: any;
    position: { x: number; y: number };
}

export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
}

export interface Workflow {
    id: number;
    name: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    owner_id: number;
}

export type WorkflowCreate = Omit<Workflow, 'id' | 'owner_id'>;

export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface Execution {
    id: number;
    workflow_id: number;
    status: ExecutionStatus;
    results: Record<string, any> | null;
    created_at: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupCredentials extends LoginCredentials {}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}