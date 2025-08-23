import { api } from '../../../lib/api';
import type { Workflow, WorkflowCreate, Execution, WorkflowNode, WorkflowEdge } from '../../../types';

export const getWorkflows = (): Promise<Workflow[]> => {
    return api('/workflow/');
};

export const getWorkflowById = (workflowId: number): Promise<Workflow> => {
    return api(`/workflow/${workflowId}`);
};

export const createWorkflow = (workflowData: WorkflowCreate): Promise<Workflow> => {
    return api('/workflow/', {
        method: 'POST',
        body: workflowData,
    });
};

export const updateWorkflow = (
    workflowId: number, 
    workflowData: { name: string; nodes: WorkflowNode[]; edges: WorkflowEdge[] }
): Promise<Workflow> => {
    return api(`/workflow/${workflowId}`, {
        method: 'PUT',
        body: workflowData,
    });
};

export const executeWorkflow = (workflowId: number): Promise<{ message: string; execution_id: number }> => {
    return api(`/execution/workflow/${workflowId}`, {
        method: 'POST',
    });
};

export const getWorkflowExecutions = (workflowId: number): Promise<Execution[]> => {
    return api(`/execution/workflow/${workflowId}`);
};

export const getExecutionDetails = (executionId: number): Promise<Execution> => {
    return api(`/execution/${executionId}`);
};