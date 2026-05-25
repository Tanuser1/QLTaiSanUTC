export type SupportRequestStatus = 'pending' | 'assigned' | 'inspecting' | 'awaitingApproval' | 'approved' | 'completed' | 'rejected';
export type SupportRequestType = 'BaoHong' | 'YeuCauMuaMoi' | 'YeuCauMuon';

export interface SupportRequest {
  id: number;
  assetId: number;
  reportedBy: number;
  type: SupportRequestType;
  description: string;
  image: string | null;
  priority: number;
  status: SupportRequestStatus;
  assignedTo: number | null;
  processedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  // joined
  assetCode: string | null;
  assetName: string | null;
  reporterName: string | null;
  assignedName: string | null;
}
