export type RepairReportStatus = 'pending' | 'approved' | 'rejected';
export type RepairProposal = 'SuaChua' | 'ThayMoi' | 'ThanhLy';

export interface RepairApproval {
  id: number;
  approvedBy: number;
  approverName: string;
  approverRole: string;
  decision: 'DongY' | 'TuChoi';
  approvedCost: number | null;
  note: string | null;
  approvedAt: string;
}

export interface RepairReport {
  id: number;
  requestId: number;
  technicianId: number;
  damageDetail: string;
  proposal: RepairProposal;
  estimatedCost: number;
  image: string | null;
  status: RepairReportStatus;
  note: string | null;
  createdAt: string;
  // joined
  technicianName: string | null;
  approvals?: RepairApproval[]; // when viewing details
}
